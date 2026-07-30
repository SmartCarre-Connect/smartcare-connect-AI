from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from app.core.heygen_client import create_video_job, get_video_status

router = APIRouter()


class HeygenCreateRequest(BaseModel):
    avatar_id: str
    script: str
    language: Optional[str] = 'en'
    voice: Optional[str] = 'female'
    title: Optional[str] = 'smartcare-onboarding'


@router.post('/heygen/generate')
async def heygen_generate(req: HeygenCreateRequest):
    # Build payload for HeyGen API — keep this minimal; callers can extend as needed.
    payload = {
        "title": req.title,
        "avatar_id": req.avatar_id,
        "script": req.script,
        "language": req.language,
        "voice": req.voice,
    }
    result = await create_video_job(payload)
    if result.get('error'):
        raise HTTPException(status_code=502, detail=result)
    return result


@router.get('/heygen/status/{job_id}')
async def heygen_status(job_id: str):
    result = await get_video_status(job_id)
    if result.get('error'):
        raise HTTPException(status_code=502, detail=result)
    return result
