from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import get_current_user
from app.database.mongodb import get_database
from app.schemas.schemas import NotificationCreate
from app.utils.helpers import success_response, serialize_docs
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
async def get_notifications(
    is_read: bool = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    query = {"user_id": ObjectId(current_user["_id"])}
    if is_read is not None:
        query["is_read"] = is_read
    skip = (page - 1) * limit
    cursor = db.notifications.find(query).sort("created_at", -1).skip(skip).limit(limit)
    notifications = await cursor.to_list(length=limit)
    total = await db.notifications.count_documents(query)
    unread = await db.notifications.count_documents({"user_id": ObjectId(current_user["_id"]), "is_read": False})
    return success_response(
        data={"notifications": serialize_docs(notifications), "total": total, "unread": unread, "page": page},
    )


@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db.notifications.update_one(
        {"_id": ObjectId(notification_id), "user_id": ObjectId(current_user["_id"])},
        {"$set": {"is_read": True}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return success_response(message="Notification marked as read")


@router.put("/read-all")
async def mark_all_as_read(current_user: dict = Depends(get_current_user)):
    db = get_database()
    await db.notifications.update_many(
        {"user_id": ObjectId(current_user["_id"]), "is_read": False},
        {"$set": {"is_read": True}},
    )
    return success_response(message="All notifications marked as read")


@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db.notifications.delete_one(
        {"_id": ObjectId(notification_id), "user_id": ObjectId(current_user["_id"])},
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return success_response(message="Notification deleted")
