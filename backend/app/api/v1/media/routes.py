from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from bson import ObjectId
from app.database.mongodb import get_database
from datetime import datetime
from app.core.dependencies import get_current_user, require_roles

router = APIRouter()


class MediaCreate(BaseModel):
    role: str
    language: Optional[str] = 'en'
    url: str
    type: Optional[str] = 'audio'
    title: Optional[str]


class MediaUpdate(BaseModel):
    url: Optional[str]
    type: Optional[str]
    title: Optional[str]


class PublishCreate(BaseModel):
    role: str
    version_name: str
    payload: dict


def _doc_to_dict(d):
    d['id'] = str(d['_id'])
    d.pop('_id', None)
    return d


@router.post('/media')
async def create_media(item: MediaCreate):
    db = get_database()
    doc = item.dict()
    doc['createdAt'] = datetime.utcnow()
    # createdBy set by authenticated user elsewhere; default to None
    doc['createdBy'] = None
    res = await db.media.insert_one(doc)
    doc = await db.media.find_one({'_id': res.inserted_id})
    return _doc_to_dict(doc)


@router.get('/media', response_model=List[dict])
async def list_media(role: Optional[str] = None):
    db = get_database()
    q = {} if not role else {'role': role}
    docs = []
    cursor = db.media.find(q)
    async for d in cursor:
        docs.append(_doc_to_dict(d))
    return docs


@router.get('/media/{media_id}')
async def get_media(media_id: str):
    db = get_database()
    doc = await db.media.find_one({'_id': ObjectId(media_id)})
    if not doc:
        raise HTTPException(status_code=404, detail='not found')
    return _doc_to_dict(doc)


@router.put('/media/{media_id}')
async def update_media(media_id: str, upd: MediaUpdate):
    db = get_database()
    await db.media.update_one({'_id': ObjectId(media_id)}, {'$set': {k: v for k, v in upd.dict().items() if v is not None}})
    doc = await db.media.find_one({'_id': ObjectId(media_id)})
    return _doc_to_dict(doc)


@router.post('/media/publish')
async def publish_version(payload: PublishCreate, current_user: dict = Depends(require_roles('admin', 'super_admin'))):
    db = get_database()
    doc = payload.dict()
    doc['publishedBy'] = current_user.get('_id')
    doc['publishedAt'] = datetime.utcnow()
    res = await db.presentations.insert_one(doc)
    saved = await db.presentations.find_one({'_id': res.inserted_id})
    return {'id': str(saved['_id']), 'role': saved['role'], 'version_name': saved['version_name']}


@router.post('/media/migrate')
async def migrate_local_storage(payload: dict, current_user: dict = Depends(require_roles('admin', 'super_admin'))):
    """Admin-only helper: ingest a localStorage payload (mapping keys->entries) into the media collection."""
    db = get_database()
    inserted = []
    for k, v in payload.items():
        try:
            doc = {
                'role': v.get('role') or k,
                'language': v.get('language') or v.get('lang') or 'en',
                'url': v.get('url') or v.get('mediaUrl') or None,
                'type': v.get('type') or 'audio',
                'title': v.get('title') or k,
                'script': v.get('script') if isinstance(v.get('script'), str) else None,
                'createdAt': datetime.utcnow(),
                'createdBy': current_user.get('_id')
            }
            res = await db.media.insert_one(doc)
            inserted.append(str(res.inserted_id))
        except Exception:
            continue
    return {'inserted': inserted, 'count': len(inserted)}
