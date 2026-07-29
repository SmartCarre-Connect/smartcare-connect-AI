from datetime import datetime, timezone
from typing import Any, Optional


def success_response(
    data: Any = None,
    message: str = "Operation successful",
    status: int = 200,
) -> dict:
    return {
        "success": True,
        "message": message,
        "data": data,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": status,
    }


def error_response(
    message: str = "An error occurred",
    status: int = 400,
    data: Any = None,
) -> dict:
    return {
        "success": False,
        "message": message,
        "data": data,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": status,
    }


def serialize_doc(doc: Optional[dict]) -> Optional[dict]:
    """Convert MongoDB document ObjectId to string for JSON serialization."""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    # Convert any ObjectId fields
    for key, value in doc.items():
        if hasattr(value, "__str__") and type(value).__name__ == "ObjectId":
            doc[key] = str(value)
    return doc


def serialize_docs(docs: list) -> list:
    return [serialize_doc(doc) for doc in docs]
