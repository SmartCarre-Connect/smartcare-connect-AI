HeyGen Integration (server-side proxy)
====================================

This folder contains a lightweight HeyGen proxy that lets the frontend request avatar video generation
without exposing your HeyGen API key to the browser.

Setup
-----

1. Add your HeyGen API key to the backend `.env` file at the project root (create if missing):

   HEYGEN_API_KEY=sk_live_...
   HEYGEN_API_URL=https://api.heygen.com

2. Install backend dependencies (from repository root):

```bash
cd backend
python -m pip install -r requirements.txt
```

3. Run the backend locally:

```bash
# from repository root
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API Endpoints
-------------

- `POST /api/v1/heygen/generate` — create a HeyGen video job. JSON body fields:
  - `avatar_id` (string)
  - `script` (string)
  - `language` (optional)
  - `voice` (optional)

- `GET /api/v1/heygen/status/{job_id}` — fetch job status and resulting media URLs (HeyGen response).

Security
--------

- Keep `HEYGEN_API_KEY` out of your git history. Use environment variables or secret managers in production.
- The proxy accepts requests from authenticated clients; you should enforce authentication/authorization
  for production usage (e.g., only admin users can generate or publish onboarding videos).

Notes
-----

The `heygen_client` in `app/core/heygen_client.py` is a thin wrapper around HeyGen's API. Adjust the
payload structure to match the exact contract in HeyGen's developer docs when you finalize generation options.
