"""
Vercel Python entrypoint.
Vercel looks for a variable named `app` in this file and runs it as an
ASGI app via the Python runtime.
"""
from app.main import app  # noqa: F401
