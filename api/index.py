import sys
import os

# Append backend directory to path for Vercel Serverless Function execution
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app as fastapi_app
from starlette.types import ASGIApp, Scope, Receive, Send

class VercelPathMiddleware:
    """
    Ensures routes match regardless of whether Vercel strips the /api prefix
    when routing to this serverless function.
    """
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] == "http":
            path = scope.get("path", "")
            # If path comes in as /bins instead of /api/bins, prepend /api
            if not path.startswith("/api") and not path.startswith("/docs") and not path.startswith("/openapi.json"):
                scope["path"] = "/api" + path
        await self.app(scope, receive, send)

app = VercelPathMiddleware(fastapi_app)
