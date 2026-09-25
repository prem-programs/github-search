import sys
from pathlib import Path

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from main import app, get_db
from models import Base

client = TestClient(app)


@pytest.fixture
def override_db(monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def _override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.clear()


def test_root():
    res = client.get('/')
    assert res.status_code == 200
    assert res.json() == {'message': 'Hello, World!'}


def test_github_user_route(override_db, monkeypatch):
    class DummyResponse:
        def __init__(self, payload, status_code=200):
            self._payload = payload
            self.status_code = status_code

        def json(self):
            return self._payload

        def raise_for_status(self):
            return None

    async def fake_get(self, url):
        assert url == "https://api.github.com/users/octocat"
        return DummyResponse({
            "login": "octocat",
            "name": "The Octocat",
            "bio": "GitHub mascot",
            "avatar_url": "https://example.com/octocat.png",
            "location": "San Francisco",
            "public_repos": 2,
            "html_url": "https://github.com/octocat",
            "updated_at": "2024-01-01T00:00:00Z",
        })

    monkeypatch.setattr(httpx.AsyncClient, "get", fake_get)

    res = client.get('/github/octocat')

    assert res.status_code == 200
    assert res.json()["username"] == "octocat"
    assert res.json()["name"] == "The Octocat"
    assert res.json()["bio"] == "GitHub mascot"