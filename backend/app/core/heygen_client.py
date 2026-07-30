import httpx
from app.core.config import settings
import asyncio

HEADERS = {
    "Authorization": f"Bearer {settings.HEYGEN_API_KEY}",
    "Content-Type": "application/json",
}


async def create_video_job(payload: dict) -> dict:
    """Create a HeyGen video job using the configured API key.

    Uses the v3 endpoint (current as of 2026) — v1 returned 404 for some accounts.
    """
    # prefer v3 per HeyGen warnings; fall back to v2 if needed
    base = settings.HEYGEN_API_URL.rstrip('/')
    urls_to_try = [f"{base}/v3/videos", f"{base}/v2/videos", f"{base}/v1/videos"]
    async with httpx.AsyncClient(timeout=60) as client:
        last_err = None
        for url in urls_to_try:
            try:
                resp = await client.post(url, json=payload, headers=HEADERS)
                # return JSON for 2xx and also non-2xx bodies (so caller can inspect)
                try:
                    data = resp.json()
                except Exception:
                    data = {"raw": resp.text}
                if resp.status_code >= 200 and resp.status_code < 300:
                    return data
                # if not success, include status and body
                last_err = {"error": True, "status_code": resp.status_code, "body": data}
                # for some status codes we may stop early (e.g., 402 insufficient_credit)
                if resp.status_code in (402, 401, 403):
                    break
            except Exception as e:
                last_err = {"error": True, "exception": str(e)}
        return last_err or {"error": True, "exception": "unknown"}


async def get_video_status(job_id: str) -> dict:
    base = settings.HEYGEN_API_URL.rstrip('/')
    urls_to_try = [f"{base}/v3/videos/{job_id}", f"{base}/v2/videos/{job_id}", f"{base}/v1/videos/{job_id}"]
    async with httpx.AsyncClient(timeout=30) as client:
        last_err = None
        for url in urls_to_try:
            try:
                resp = await client.get(url, headers=HEADERS)
                try:
                    data = resp.json()
                except Exception:
                    data = {"raw": resp.text}
                if resp.status_code >= 200 and resp.status_code < 300:
                    return data
                last_err = {"error": True, "status_code": resp.status_code, "body": data}
            except Exception as e:
                last_err = {"error": True, "exception": str(e)}
        return last_err or {"error": True, "exception": "unknown"}
