"""Tests for sanitization and safe rendering.

Run from the repo root:
    pip install -r requirements-dev.txt
    pytest
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest

import app as flaskapp
from sanitize import clean_text


def test_strips_control_characters():
    assert clean_text("a\x00b\x07c") == "abc"


def test_trims_and_caps():
    assert clean_text("  hi  ") == "hi"
    assert len(clean_text("x" * 50, max_len=10)) == 10


def test_handles_none():
    assert clean_text(None) == ""


@pytest.fixture
def client(tmp_path):
    # Use a throwaway database so tests never touch real data.
    flaskapp.DB_PATH = tmp_path / "test.db"
    flaskapp.init_db()
    flaskapp.app.config.update(TESTING=True)
    return flaskapp.app.test_client()


def test_script_payload_is_neutralized(client):
    client.post("/", data={"name": "<b>x</b>", "body": "<script>alert(1)</script>"})
    body = client.get("/").get_data(as_text=True)
    # Raw dangerous markup must NOT be present...
    assert "<script>alert(1)</script>" not in body
    # ...it must be stored and shown escaped.
    assert "&lt;script&gt;" in body


def test_message_is_persisted(client):
    client.post("/", data={"name": "Ada", "body": "hello wall"})
    body = client.get("/").get_data(as_text=True)
    assert "hello wall" in body
    assert "Ada" in body
