from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import require_roles
from app.database.mongodb import get_database
from app.utils.helpers import success_response, serialize_doc

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/")
async def get_settings():
    db = get_database()
    config = await db.settings.find_one()
    if not config:
        # Return defaults
        return success_response(data={
            "hospital_name": "SmartCare Connect Hospital",
            "logo": "",
            "theme": "dark",
            "timezone": "UTC",
            "email_notifications": True,
            "sms_notifications": False,
        })
    return success_response(data=serialize_doc(config))


@router.put("/")
async def update_settings(
    hospital_name: str = None,
    theme: str = None,
    timezone: str = None,
    email_notifications: bool = None,
    sms_notifications: bool = None,
    current_user: dict = Depends(require_roles("admin", "super_admin")),
):
    db = get_database()
    update_data = {}
    if hospital_name is not None:
        update_data["hospital_name"] = hospital_name
    if theme is not None:
        update_data["theme"] = theme
    if timezone is not None:
        update_data["timezone"] = timezone
    if email_notifications is not None:
        update_data["email_notifications"] = email_notifications
    if sms_notifications is not None:
        update_data["sms_notifications"] = sms_notifications

    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")

    existing = await db.settings.find_one()
    if existing:
        await db.settings.update_one({"_id": existing["_id"]}, {"$set": update_data})
    else:
        defaults = {
            "hospital_name": "SmartCare Connect Hospital",
            "logo": "",
            "theme": "dark",
            "timezone": "UTC",
            "email_notifications": True,
            "sms_notifications": False,
        }
        defaults.update(update_data)
        await db.settings.insert_one(defaults)

    return success_response(message="Settings updated")
