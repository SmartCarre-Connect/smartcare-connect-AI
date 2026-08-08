from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.core.dependencies import get_current_user
from app.database.mongodb import get_database
from app.core.config import settings
from app.utils.helpers import success_response, serialize_doc
from app.schemas.schemas import ChatMessageCreate
from bson import ObjectId
from datetime import datetime, timezone
from loguru import logger
import json
import os
from typing import Optional

router = APIRouter(prefix="/ai", tags=["AI Services"])

# Lazy-load Gemini
_gemini_model = None


def get_gemini_model():
    global _gemini_model
    if _gemini_model is None:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            _gemini_model = genai.GenerativeModel("gemini-2.0-flash")
            logger.info("Gemini AI model initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            raise HTTPException(status_code=503, detail="AI service unavailable")
    return _gemini_model


async def build_patient_context(db, current_user: dict) -> str:
    """Collect patient profile, recent appointments, reports, and prescriptions into a text context."""
    try:
        patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    except Exception:
        patient = None

    parts = []
    # Profile
    if patient:
        parts.append(f"Patient Name: {patient.get('full_name', current_user.get('full_name',''))}")
        parts.append(f"DOB: {patient.get('dob', 'Unknown')}")
        parts.append(f"Gender: {patient.get('gender', 'Unknown')}")
        parts.append(f"Blood Group: {patient.get('blood_group', 'Unknown')}")
        allergies = ', '.join(patient.get('allergies', []) or []) or 'None'
        parts.append(f"Allergies: {allergies}")
        chronic = ', '.join(patient.get('chronic_diseases', []) or []) or 'None'
        parts.append(f"Chronic Diseases: {chronic}")

    # Recent appointments
    try:
        appt_cursor = db.appointments.find({"patient_id": patient["_id"] if patient else ObjectId(current_user["_id"]) }).sort("appointment_date", -1).limit(5)
        appts = await appt_cursor.to_list(length=5)
        if appts:
            appt_lines = [f"{a.get('appointment_date')} {a.get('time_slot')} with {a.get('doctor_name') or a.get('doctor_id')} (status: {a.get('status')})" for a in appts]
            parts.append("Recent Appointments:")
            parts.extend(appt_lines)
    except Exception:
        pass

    # Recent reports with AI summaries
    try:
        rep_cursor = db.medical_reports.find({"patient_id": patient["_id"] if patient else ObjectId(current_user["_id"]) }).sort("report_date", -1).limit(5)
        reps = await rep_cursor.to_list(length=5)
        if reps:
            parts.append("Recent Reports:")
            for r in reps:
                rid = r.get('_id')
                ai = await db.ai_reports.find_one({"medical_report_id": ObjectId(rid)}) if rid else None
                summary = ai.get('summary') if ai else ''
                parts.append(f"{r.get('report_date','')}: {r.get('title') or r.get('original_filename','Report')} - Summary: {summary[:300] if summary else 'No AI summary available.'}")
    except Exception:
        pass

    # Recent prescriptions
    try:
        pres_cursor = db.prescriptions.find({"patient_id": patient["_id"] if patient else ObjectId(current_user["_id"]) }).sort("uploaded_at", -1).limit(5)
        pres = await pres_cursor.to_list(length=5)
        if pres:
            parts.append("Recent Prescriptions:")
            for p in pres:
                meds = p.get('medicines') or []
                if meds:
                    meds_str = ", ".join([m.get('medicine_name') or m.get('name') or str(m) for m in meds])
                else:
                    meds_str = p.get('filename') or 'Prescription file'
                parts.append(f"{p.get('uploaded_at','')}: {meds_str}")
    except Exception:
        pass

    return "\n".join(parts)




@router.post("/analyze-report/{report_id}")
async def analyze_report(report_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    report = await db.medical_reports.find_one({"_id": ObjectId(report_id)})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    file_path = report.get("file_path") or report.get("file_url", "")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report file not found on server")

    # Extract text from file (PDF or image). Use OCR when needed.
    text_content = ""
    try:
        if file_path.lower().endswith(".pdf"):
            try:
                import fitz  # PyMuPDF
                doc = fitz.open(file_path)
                for page in doc:
                    text_content += page.get_text() or ""
                doc.close()
            except Exception as e:
                logger.debug(f"PDF text extraction error: {e}")
                text_content = ""

            # If no text extracted, attempt OCR on PDF pages
            if not text_content.strip():
                try:
                    from PIL import Image
                    import fitz
                    try:
                        import pytesseract
                        use_ocr = True
                    except Exception:
                        use_ocr = False
                    if use_ocr:
                        doc = fitz.open(file_path)
                        for page in doc:
                            pix = page.get_pixmap(dpi=200)
                            mode = "RGBA" if pix.alpha else "RGB"
                            img = Image.frombytes(mode, [pix.width, pix.height], pix.samples)
                            text_content += pytesseract.image_to_string(img) or ""
                        doc.close()
                except Exception as e:
                    logger.debug(f"PDF OCR attempt failed: {e}")

        else:
            # Image file: try OCR first, fallback to visual analysis by Gemini
            try:
                from PIL import Image
                try:
                    import pytesseract
                    img = Image.open(file_path)
                    text_content = pytesseract.image_to_string(img) or ""
                except Exception:
                    # pytesseract not available or OCR failed
                    text_content = ""
            except Exception:
                text_content = ""
    except Exception as e:
        logger.error(f"Error during extraction: {e}")
        text_content = ""

    # AI Analysis
    model = get_gemini_model()
    prompt = f"""You are an expert medical report analyzer for SmartCare Connect hospital management system.

Analyze the following medical report and return a JSON object with these fields:
- "summary": A clear, patient-friendly summary of the report findings
- "detected_diseases": An array of detected or suspected conditions
- "risk_level": One of "Low", "Medium", "High", "Critical"
- "recommendations": An array of actionable medical recommendations
- "confidence_score": A number between 0-100 indicating analysis confidence
- "prescription_explanation": If any prescriptions are mentioned, explain them simply
- "lifestyle_suggestions": An array of lifestyle changes that could help
- "doctor_recommendation": Specialist recommendation if needed

Medical Report Content:
{text_content[:8000]}

Report Type: {report.get('report_type', 'General')}

Return ONLY valid JSON. No markdown, no code blocks."""

    try:
        if file_path.lower().endswith((".png", ".jpg", ".jpeg")) and not text_content.strip():
            # If OCR did not produce text, use Gemini vision with image
            try:
                from PIL import Image
                img = Image.open(file_path)
                response = model.generate_content([prompt, img])
            except Exception:
                response = model.generate_content(prompt)
        else:
            response = model.generate_content(prompt)

        # Parse AI response
        response_text = response.text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        ai_data = json.loads(response_text)
    except json.JSONDecodeError:
        ai_data = {
            "summary": response.text if response else "Analysis could not be completed",
            "detected_diseases": [],
            "risk_level": "Medium",
            "recommendations": ["Please consult with your doctor for detailed analysis"],
            "confidence_score": 50,
            "prescription_explanation": None,
            "lifestyle_suggestions": [],
            "doctor_recommendation": "General physician consultation recommended",
        }
    except Exception as e:
        logger.error(f"AI analysis failed: {e}")
        raise HTTPException(status_code=503, detail=f"AI analysis failed: {str(e)}")

    # Save AI report
    ai_report_doc = {
        "medical_report_id": ObjectId(report_id),
        "summary": ai_data.get("summary", ""),
        "detected_diseases": ai_data.get("detected_diseases", []),
        "risk_level": ai_data.get("risk_level", "Medium"),
        "recommendations": ai_data.get("recommendations", []),
        "confidence_score": ai_data.get("confidence_score", 0),
        "prescription_explanation": ai_data.get("prescription_explanation"),
        "lifestyle_suggestions": ai_data.get("lifestyle_suggestions", []),
        "doctor_recommendation": ai_data.get("doctor_recommendation"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.ai_reports.insert_one(ai_report_doc)

    # Update report status
    await db.medical_reports.update_one(
        {"_id": ObjectId(report_id)},
        {"$set": {"status": "Analyzed", "ai_analysis_status": "completed"}},
    )

    # Notify patient that AI summary is ready
    try:
        # find patient by report.patient_id
        patient = await db.patients.find_one({"_id": report.get("patient_id")}) if report.get("patient_id") else None
        user_oid = None
        if patient:
            user_oid = patient.get("user_id")
        if user_oid:
            await db.notifications.insert_one({
                "user_id": ObjectId(str(user_oid)),
                "title": "AI summary ready",
                "message": f"AI analysis for your report '{report.get('title', '')}' is ready.",
                "type": "ai_summary",
                "is_read": False,
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
    except Exception:
        logger.exception("Failed to create notification for AI summary")

    logger.info(f"AI analysis completed for report {report_id}")
    return success_response(data=ai_data, message="AI analysis complete")


# =============== AI Chatbot ===============

@router.post("/chat")
async def ai_chat(data: ChatMessageCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})

    # Get or create session
    session_id = None
    if data.session_id:
        session_id = ObjectId(data.session_id)
    else:
        session_doc = {
            "patient_id": patient["_id"] if patient else ObjectId(current_user["_id"]),
            "session_title": data.message[:50],
            "started_at": datetime.now(timezone.utc).isoformat(),
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }
        result = await db.chat_sessions.insert_one(session_doc)
        session_id = result.inserted_id

    # Save user message
    await db.chat_messages.insert_one({
        "session_id": session_id,
        "sender": "user",
        "message": data.message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    # Get conversation history (last 10 messages)
    history_cursor = db.chat_messages.find({"session_id": session_id}).sort("timestamp", -1).limit(10)
    history = await history_cursor.to_list(length=10)
    history.reverse()
    context = "\n".join([f"{'User' if m['sender'] == 'user' else 'AI'}: {m['message']}" for m in history])

    # Build patient context
    # Build richer patient context (reports, prescriptions, appointments, profile)
    patient_context = await build_patient_context(db, current_user)

    model = get_gemini_model()
    prompt = f"""You are SmartCare AI, an intelligent medical assistant for SmartCare Connect hospital.

IMPORTANT RULES:
1. You provide helpful, accurate medical information but ALWAYS recommend consulting a doctor for diagnosis
2. Be empathetic, clear, and professional
3. Never diagnose – only suggest possibilities and recommend professional consultation
4. If the user describes an emergency, immediately advise calling emergency services
5. You can help with: symptom checking, medication info, health tips, appointment guidance

{patient_context}

Conversation History:
{context}

User: {data.message}

Respond helpfully and concisely as SmartCare AI:"""

    try:
        response = model.generate_content(prompt)
        ai_message = response.text.strip()
    except Exception as e:
        logger.error(f"Chat AI error: {e}")
        ai_message = "I'm sorry, I'm having trouble processing your request right now. Please try again or contact our support team."

    # Save AI response
    await db.chat_messages.insert_one({
        "session_id": session_id,
        "sender": "ai",
        "message": ai_message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    # Update session
    await db.chat_sessions.update_one(
        {"_id": session_id},
        {"$set": {
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "session_title": (await db.chat_sessions.find_one({"_id": session_id}) or {}).get("session_title") or data.message[:50],
        }},
    )

    return success_response(
        data={"message": ai_message, "session_id": str(session_id)},
        message="Response generated",
    )


@router.post("/chat/start")
async def start_chat(current_user: dict = Depends(get_current_user)):
    """Create a new chat session and generate a context-aware welcome message."""
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    session_doc = {
        "patient_id": patient["_id"] if patient else ObjectId(current_user["_id"]),
        "session_title": "New Chat",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.chat_sessions.insert_one(session_doc)
    session_id = result.inserted_id

    # Build patient context and create a welcoming assistant message
    patient_context = await build_patient_context(db, current_user)
    welcome_prompt = f"You are SmartCare AI, a helpful medical assistant. Use the following patient context to craft a concise, empathetic greeting and summary of available data for the patient.\n\n{patient_context}\n\nRespond with a short welcome message and offer help topics."
    try:
        model = get_gemini_model()
        response = model.generate_content(welcome_prompt)
        ai_message = response.text.strip()
    except Exception as e:
        logger.error(f"Start chat AI error: {e}")
        ai_message = "Hello, I'm SmartCare AI. How can I help you today?"

    await db.chat_messages.insert_one({
        "session_id": session_id,
        "sender": "ai",
        "message": ai_message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    return success_response(data={"message": ai_message, "session_id": str(session_id)}, message="Session started")


@router.post("/help-center")
async def help_center(data: ChatMessageCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    # Build context (profile, appointments, reports, prescriptions)
    patient_context = await build_patient_context(db, current_user)

    # Compose Gemini prompt
    prompt = f"""You are SmartCare Connect AI Help Agent.
You answer hospital questions, facility guidance, appointment help, medical record questions, emergency support, and how to use the SmartCare Connect app.
Be concise, friendly, and practical.
If the user asks about an emergency, tell them to contact hospital staff or emergency services immediately.

Patient Context:\n{patient_context}\n
User Question: {data.message}

Answer clearly for the hospital visitor and app user. Provide steps, links (if applicable), and contact actions when relevant."""

    # Try using Gemini; if unavailable, fall back to a rule-based helper.
    ai_message = None
    try:
        try:
            model = get_gemini_model()
        except Exception as e:
            model = None
            logger.debug(f"Gemini not initialized for help center: {e}")

        if model:
            response = model.generate_content(prompt)
            ai_message = response.text.strip()
        else:
            raise RuntimeError("Gemini unavailable")
    except Exception as e:
        logger.info(f"Falling back to rule-based help center answer: {e}")
        # Simple domain-aware fallback answers
        q = (data.message or "").lower()
        # Emergency
        if any(k in q for k in ["emergency", "ambulance", "help now", "life", "chest pain", "bleed"]):
            ai_message = (
                "If this is an emergency please call your local emergency number immediately or contact the hospital emergency desk. "
                "If you are at the hospital, go to the Emergency Department on the Ground Floor (Emergency)."
            )
        # Appointments
        elif any(k in q for k in ["book", "appointment", "schedule", "reschedule", "cancel"]):
            ai_message = (
                "To manage appointments open the Appointments page in SmartCare Connect. "
                "There you can book a new appointment by selecting a doctor, date and available time slot. "
                "To reschedule or cancel, open the appointment and choose Reschedule or Cancel. "
                "If you need immediate assistance, contact reception or call the hospital number."
            )
        # Reports
        elif any(k in q for k in ["report", "lab", "results", "blood", "x-ray", "ct", "mri", "hb", "hba1c"]):
            ai_message = (
                "You can upload and view your medical reports on the Medical Reports page. "
                "After upload we run an AI analysis; once completed you'll see an 'Analyzed' badge and a short summary. "
                "If you want an explanation about a specific value, upload the report and ask 'Explain my <test name>'."
            )
        # Prescriptions
        elif any(k in q for k in ["prescription", "medicine", "drug", "dose", "side effect", "medicines"]):
            ai_message = (
                "Upload prescriptions via the Prescriptions page. Our assistant can extract medicine names and dosing instructions. "
                "For safety, always verify medication changes with your prescribing doctor or pharmacist before making any changes."
            )
        # Navigation / departments
        elif any(k in q for k in ["map", "navigation", "where is", "department", "cardiology", "radiology", "pharmacy"]):
            ai_message = (
                "Use the Hospital Map page to search departments and generate walking routes. Select a floor and search for the department (e.g., Cardiology). "
                "Tap a room pin to see details and estimated walking time."
            )
        # Insurance
        elif any(k in q for k in ["insurance", "claim", "coverage", "payment", "scheme"]):
            ai_message = (
                "Insurance and billing policies vary by plan. For insurance claims and coverage details contact the Billing department with your UHID and policy documents. "
                "You can also check your appointment billing status on the Appointments page."
            )
        else:
            # Generic fallback guided answer using patient context
            summary_lines = []
            if patient_context:
                summary_lines.append("I can help with app navigation, appointments, reports, prescriptions and more. I have access to your recent reports and appointments which I can use to give tailored guidance.")
            else:
                summary_lines.append("I can help with app navigation, appointments, reports, prescriptions and hospital information. Please provide a short question and I will answer.")
            ai_message = "\n\n".join(summary_lines)

    return success_response(data={"answer": ai_message}, message="Help answer generated")


@router.get("/chat/sessions")
async def get_chat_sessions(current_user: dict = Depends(get_current_user)):
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    pid = patient["_id"] if patient else ObjectId(current_user["_id"])
    cursor = db.chat_sessions.find({"patient_id": pid}).sort("last_updated", -1).limit(50)
    sessions = await cursor.to_list(length=50)
    from app.utils.helpers import serialize_docs
    return success_response(data=serialize_docs(sessions))


@router.get("/chat/sessions/{session_id}/messages")
async def get_chat_messages(session_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db.chat_messages.find({"session_id": ObjectId(session_id)}).sort("timestamp", 1)
    messages = await cursor.to_list(length=500)
    from app.utils.helpers import serialize_docs
    return success_response(data=serialize_docs(messages))


@router.put("/chat/sessions/{session_id}/rename")
async def rename_chat_session(session_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    owner_id = patient["_id"] if patient else ObjectId(current_user["_id"])
    new_title = (data or {}).get("session_title") or "New Chat"
    result = await db.chat_sessions.update_one(
        {"_id": ObjectId(session_id), "patient_id": owner_id},
        {"$set": {"session_title": new_title, "last_updated": datetime.now(timezone.utc).isoformat()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return success_response(message="Chat session renamed")


@router.delete("/chat/sessions/{session_id}")
async def delete_chat_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a chat session owned by the current user and its messages."""
    db = get_database()
    patient = await db.patients.find_one({"user_id": ObjectId(current_user["_id"])})
    owner_id = patient["_id"] if patient else ObjectId(current_user["_id"])
    result = await db.chat_sessions.delete_one({"_id": ObjectId(session_id), "patient_id": owner_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chat session not found")
    await db.chat_messages.delete_many({"session_id": ObjectId(session_id)})
    return success_response(message="Chat session deleted")
