from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core.tts_client import synthesize_text_to_mp3

router = APIRouter()


class TTSCreateRequest(BaseModel):
    text: str
    language: Optional[str] = 'en'


@router.post('/tts/generate')
async def create_tts(req: TTSCreateRequest):
    try:
        path = synthesize_text_to_mp3(req.text, req.language)
        return {"url": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": True, "exception": str(e)})
