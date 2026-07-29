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


# =============== AI Report Analysis ===============

@router.post("/analyze-report/{report_id}")
async def analyze_report(report_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    report = await db.medical_reports.find_one({"_id": ObjectId(report_id)})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    file_path = report.get("file_url", "")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report file not found on server")

    # Extract text from file
    text_content = ""
    if file_path.lower().endswith(".pdf"):
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(file_path)
            for page in doc:
                text_content += page.get_text()
            doc.close()
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            text_content = "[Could not extract PDF text]"
    else:
        # Image – use Gemini vision directly
        text_content = "[Image report – analyzed visually]"

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
        if file_path.lower().endswith((".png", ".jpg", ".jpeg")):
            from PIL import Image
            img = Image.open(file_path)
            response = model.generate_content([prompt, img])
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
        {"$set": {"status": "Analyzed"}},
    )

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
    patient_context = ""
    if patient:
        patient_context = f"""
Patient Info:
- Blood Group: {patient.get('blood_group', 'Unknown')}
- Allergies: {', '.join(patient.get('allergies', [])) or 'None'}
- Chronic Diseases: {', '.join(patient.get('chronic_diseases', [])) or 'None'}
"""

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
        {"$set": {"last_updated": datetime.now(timezone.utc).isoformat()}},
    )

    return success_response(
        data={"message": ai_message, "session_id": str(session_id)},
        message="Response generated",
    )


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
