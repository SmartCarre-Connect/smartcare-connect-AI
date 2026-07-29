from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import get_current_user, require_roles
from app.database.mongodb import get_database
from app.schemas.schemas import ProfileUpdateRequest
from app.utils.helpers import success_response, serialize_doc, serialize_docs
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current logged-in user profile."""
    user = current_user.copy()
    user.pop("password", None)
    return success_response(data=user, message="User profile retrieved")


@router.put("/me")
async def update_me(data: ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    db = get_database()
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": update_data},
    )
    return success_response(message="Profile updated successfully")


@router.get("/")
async def list_users(
    role: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_roles("admin", "super_admin")),
):
    db = get_database()
    query = {}
    if role:
        query["role"] = role
    skip = (page - 1) * limit
    cursor = db.users.find(query, {"password": 0}).skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    total = await db.users.count_documents(query)
    return success_response(data={"users": serialize_docs(users), "total": total, "page": page})


@router.put("/{user_id}/deactivate")
async def deactivate_user(user_id: str, current_user: dict = Depends(require_roles("admin", "super_admin"))):
    db = get_database()
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return success_response(message="User deactivated")


@router.put("/{user_id}/activate")
async def activate_user(user_id: str, current_user: dict = Depends(require_roles("admin", "super_admin"))):
    db = get_database()
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": True, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return success_response(message="User activated")


@router.put("/{user_id}/role")
async def change_role(
    user_id: str,
    role: str = Query(...),
    current_user: dict = Depends(require_roles("super_admin")),
):
    db = get_database()
    valid_roles = ["patient", "doctor", "admin", "hr", "receptionist", "trainee", "super_admin"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}")
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": role, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return success_response(message=f"User role updated to {role}")
