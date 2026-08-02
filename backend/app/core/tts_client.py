import os
import uuid

try:
    from gtts import gTTS
except ImportError:  # pragma: no cover - optional dependency
    gTTS = None

from app.core.config import settings


def synthesize_text_to_mp3(text: str, lang: str = 'en') -> str:
    """Synthesize text to an MP3 file using gTTS and return the public path.

    Returns a relative URL path under the uploads directory (e.g. `/uploads/tts-<uuid>.mp3`).
    """
    if gTTS is None:
        raise RuntimeError("gTTS is not installed")

    filename = f"tts-{uuid.uuid4().hex}.mp3"
    out_dir = settings.UPLOAD_DIR
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, filename)
    tts = gTTS(text=text, lang=(lang if lang else 'en'))
    tts.save(out_path)
    # return web-accessible path
    return f"/uploads/{filename}"
