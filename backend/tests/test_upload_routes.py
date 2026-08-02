import io
import pytest
from fastapi import UploadFile
from bson import ObjectId

from app.api.v1.prescriptions.routes import upload_prescription
from app.api.v1.medical_images.routes import upload_medical_image
from app.api.v1.reports.routes import upload_report


class DummyCollection:
    def __init__(self, items=None):
        self.items = items or []
        self.inserted = []

    async def insert_one(self, doc):
        self.inserted.append(doc)
        return type('Result', (), {'inserted_id': 'id-1'})()

    async def find(self, *args, **kwargs):
        return self

    async def find_one(self, *args, **kwargs):
        return self.items[0] if self.items else None

    async def to_list(self, length=100):
        return list(self.items)

    async def count_documents(self, *args, **kwargs):
        return len(self.items)

    async def delete_one(self, *args, **kwargs):
        return None

    async def delete_many(self, *args, **kwargs):
        return None


class DummyDB:
    def __init__(self):
        self.prescriptions = DummyCollection()
        self.medical_images = DummyCollection()
        self.medical_reports = DummyCollection()
        self.patients = DummyCollection(items=[{'_id': ObjectId('507f1f77bcf86cd799439011'), 'user_id': ObjectId('507f1f77bcf86cd799439011')}])
        self.ai_reports = DummyCollection()


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


@pytest.mark.asyncio
async def test_upload_report_returns_public_url(monkeypatch):
    db = DummyDB()

    monkeypatch.setattr('app.api.v1.reports.routes.get_database', lambda: db)

    file = UploadFile(filename='report.pdf', file=io.BytesIO(b'abc'), headers={'content-type': 'application/pdf'})
    result = await upload_report(file=file, report_type='Lab Results', current_user={'_id': '507f1f77bcf86cd799439011'})

    assert result['success'] is True
    assert result['data']['file_url'].startswith('/uploads/reports/')
    assert result['data']['title'] == 'report.pdf'
