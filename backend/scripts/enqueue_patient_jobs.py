import httpx
import os

URL = 'http://127.0.0.1:8000/api/v1/heygen/generate'
jobs = [
    {"avatar_id": "Daphne_public_1", "script": "Welcome to SmartCare Connect. I am your concierge and will guide you through the app.", "language": "en", "voice": "female", "title": "patient-tour-en"},
    {"avatar_id": "Daphne_public_1", "script": "SmartCare Connect में आपका स्वागत है। मैं आपका कंसर्ज हूँ और मैं आपको ऐप के माध्यम से मार्गदर्शन करूँगा।", "language": "hi", "voice": "female", "title": "patient-tour-hi"},
    {"avatar_id": "Daphne_public_1", "script": "SmartCare Connect मध्ये तुमचे स्वागत आहे. मी तुमचा कन्सर्ज आहे आणि मी तुम्हाला अॅपद्वारे मार्गदर्शन करीन.", "language": "mr", "voice": "female", "title": "patient-tour-mr"},
]

with httpx.Client(timeout=60) as client:
    for j in jobs:
        try:
            r = client.post(URL, json=j)
            print('LANG:', j['language'], 'STATUS:', r.status_code)
            try:
                print(r.json())
            except Exception:
                print(r.text[:1000])
        except Exception as e:
            print('ERROR for', j['language'], e)
