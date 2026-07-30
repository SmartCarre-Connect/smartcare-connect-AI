import os
import json
import httpx
from dotenv import load_dotenv


load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))
HEYGEN_API_KEY = os.environ.get('HEYGEN_API_KEY')
HEYGEN_API_URL = os.environ.get('HEYGEN_API_URL', 'https://api.heygen.com')

if not HEYGEN_API_KEY:
    print('HEYGEN_API_KEY not set in backend/.env')
    raise SystemExit(1)

HEADERS = {'Authorization': f'Bearer {HEYGEN_API_KEY}', 'Content-Type': 'application/json'}

endpoints = ['/v1/videos', '/v1/video', '/v2/videos', '/v1/creations', '/v1/creations/videos', '/v1/outputs']
payloads = [
    {"title": "probe", "avatar_id": "Daphne_public_1", "script": "Hello from probe", "language": "en", "voice": "female"},
    {"avatar_id": "Daphne_public_1", "script": {"text": "Hello from probe"}, "language": "en"},
]

print('Probing HeyGen API URL:', HEYGEN_API_URL)

with httpx.Client(timeout=30) as client:
    for ep in endpoints:
        url = HEYGEN_API_URL.rstrip('/') + ep
        for p in payloads:
            try:
                r = client.post(url, headers=HEADERS, json=p)
                print('\nREQUEST ->', url)
                print('PAYLOAD ->', json.dumps(p))
                print('STATUS ->', r.status_code)
                try:
                    print('BODY ->', r.json())
                except Exception:
                    print('BODY (text) ->', r.text[:1000])
            except Exception as e:
                print('ERROR calling', url, e)
