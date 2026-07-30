import io
import pytest
from fastapi import UploadFile

from app.api.v1.prescriptions.routes import upload_prescription
from app.api.v1.medical_images.routes import upload_medical_image


class DummyCollection:
    def __init__(self, items=None):
        self.items = items or []
        self.inserted = []

    async def insert_one(self, doc):
        self.inserted.append(doc)
        return type('Result', (), {'inserted_id': 'id-1'})()

    async def find(self, *args, **kwargs):
        return self

    async def to_list(self, length=100):
        return list(self.items)


class DummyDB:
    def __init__(self):
        self.prescriptions = DummyCollection()
        self.medical_images = DummyCollection()


@pytest.mark.asyncio
async def test_upload_prescription_returns_data(monkeypatch):
    db = DummyDB()

    monkeypatch.setattr('app.api.v1.prescriptions.routes.get_database', lambda: db)

    file = UploadFile(filename='rx.png', file=io.BytesIO(b'abc'), headers={'content-type': 'image/png'})
    result = await upload_prescription(file=file, current_user={'_id': 'user-1'})

    assert result['success'] is True
    assert result['data']['filename'] == 'rx.png'
    assert result['data']['status'] == 'Uploaded'


@pytest.mark.asyncio
async def test_upload_medical_image_returns_data(monkeypatch):
    db = DummyDB()

    monkeypatch.setattr('app.api.v1.medical_images.routes.get_database', lambda: db)

    file = UploadFile(filename='scan.jpg', file=io.BytesIO(b'abc'), headers={'content-type': 'image/jpeg'})
    result = await upload_medical_image(file=file, current_user={'_id': 'user-1'})

    assert result['success'] is True
    assert result['data']['filename'] == 'scan.jpg'
    assert result['data']['image_type'] == 'Radiology Scan'
