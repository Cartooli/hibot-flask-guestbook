"""Input sanitization helpers.

One small, well-tested place for cleaning anything a user types.
HTML-escaping happens automatically at render time (Jinja2 autoescape, which
Flask enables for .html templates), so this module normalizes and bounds the
raw input rather than escaping it.
"""
import re

# Control characters except tab (\x09), newline (\x0a), carriage return (\x0d).
_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def clean_text(raw, max_len: int = 500) -> str:
    """Return a safe, bounded version of user-supplied text.

    - Coerces to str (never crashes on None / non-strings).
    - Removes control characters that have no business in a text field.
    - Trims surrounding whitespace.
    - Truncates to ``max_len`` characters.

    Escaping is intentionally NOT done here — the template engine escapes at
    output time, which is the correct, context-aware place. Never disable
    Jinja autoescape or mark this text ``| safe``.
    """
    if raw is None:
        return ""
    text = str(raw)
    text = _CONTROL_CHARS.sub("", text)
    text = text.strip()
    if len(text) > max_len:
        text = text[:max_len]
    return text
