"""hibot-flask-guestbook — a message wall with storage.

Visitors leave a name and a message; the app saves them to a small SQLite
file and lists them. Built with Flask. No API keys, no accounts.

Run:
    pip install -r requirements.txt
    python app.py
"""
import os
import sqlite3
from pathlib import Path

from flask import Flask, g, redirect, render_template, request, url_for

from sanitize import clean_text

BASE_DIR = Path(__file__).resolve().parent
# Database location is overridable (handy for tests / deployment).
DB_PATH = Path(os.environ.get("GUESTBOOK_DB", BASE_DIR / "guestbook.db"))
NAME_MAX = 80
MESSAGE_MAX = 500

app = Flask(__name__)


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        _ensure_schema(g.db)  # create the table on first use if needed
    return g.db


def _ensure_schema(db: sqlite3.Connection) -> None:
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS messages (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT NOT NULL,
            body       TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
        """
    )
    db.commit()


@app.teardown_appcontext
def close_db(_exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db() -> None:
    """Create the database file and table up front (used by tests / setup)."""
    db = sqlite3.connect(DB_PATH)
    _ensure_schema(db)
    db.close()


@app.get("/")
def index():
    rows = get_db().execute(
        "SELECT name, body, created_at FROM messages ORDER BY id DESC LIMIT 100"
    ).fetchall()
    return render_template(
        "index.html", messages=rows, name_max=NAME_MAX, message_max=MESSAGE_MAX
    )


@app.post("/")
def post_message():
    # Clean BEFORE we store. The name and body length caps are enforced here.
    name = clean_text(request.form.get("name"), max_len=NAME_MAX) or "Anonymous"
    body = clean_text(request.form.get("body"), max_len=MESSAGE_MAX)
    if body:  # silently ignore empty submissions
        db = get_db()
        # Parameterized query — values are bound, never concatenated into SQL.
        db.execute("INSERT INTO messages (name, body) VALUES (?, ?)", (name, body))
        db.commit()
    return redirect(url_for("index"))


def _render_doc(title: str, filename: str):
    content = (BASE_DIR / filename).read_text(encoding="utf-8")
    return render_template("doc.html", title=title, content=content)


@app.get("/terms")
def terms():
    return _render_doc("Terms of Service", "TERMS_OF_SERVICE.md")


@app.get("/privacy")
def privacy():
    return _render_doc("Privacy Policy", "PRIVACY_POLICY.md")


if __name__ == "__main__":
    init_db()  # ensure the database exists before serving
    # debug=False and bound to localhost — safe defaults for a starter app.
    app.run(host="127.0.0.1", port=5000, debug=False)
