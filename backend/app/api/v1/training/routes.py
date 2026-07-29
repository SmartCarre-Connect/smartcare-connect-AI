from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import get_current_user, require_roles
from app.database.mongodb import get_database
from app.utils.helpers import success_response, serialize_doc, serialize_docs
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/training", tags=["Training Modules"])


@router.get("/modules")
async def list_modules():
    db = get_database()
    cursor = db.training_modules.find().sort("created_at", -1)
    modules = await cursor.to_list(length=100)
    return success_response(data=serialize_docs(modules))


@router.post("/modules")
async def create_module(
    title: str = Query(...),
    description: str = Query(""),
    duration: str = Query(""),
    current_user: dict = Depends(require_roles("admin", "hr", "super_admin")),
):
    db = get_database()
    doc = {
        "title": title,
        "description": description,
        "duration": duration,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.training_modules.insert_one(doc)
    return success_response(data={"id": str(result.inserted_id)}, message="Module created", status=201)


@router.get("/progress/my")
async def get_my_progress(current_user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db.trainee_progress.find({"trainee_id": ObjectId(current_user["_id"])})
    progress = await cursor.to_list(length=100)
    # Enrich with module info
    enriched = []
    for p in progress:
        d = serialize_doc(p)
        module = await db.training_modules.find_one({"_id": ObjectId(d.get("module_id", ""))}) if d.get("module_id") else None
        if module:
            d["module_title"] = module.get("title", "")
            d["module_duration"] = module.get("duration", "")
        enriched.append(d)
    return success_response(data=enriched)


@router.put("/progress/{module_id}")
async def update_progress(
    module_id: str,
    progress: int = Query(..., ge=0, le=100),
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    existing = await db.trainee_progress.find_one({
        "trainee_id": ObjectId(current_user["_id"]),
        "module_id": ObjectId(module_id),
    })
    completed = progress >= 100
    if existing:
        await db.trainee_progress.update_one(
            {"_id": existing["_id"]},
            {"$set": {"progress": min(progress, 100), "completed": completed}},
        )
    else:
        await db.trainee_progress.insert_one({
            "trainee_id": ObjectId(current_user["_id"]),
            "module_id": ObjectId(module_id),
            "progress": min(progress, 100),
            "completed": completed,
        })
    return success_response(message="Progress updated")
