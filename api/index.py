"""Vercel Python entrypoint for the SatQueryAI API."""

from fastapi import FastAPI

from backend.main import app as backend_app

# Keep the FastAPI constructor in Vercel's entrypoint so its framework detector
# maps every /api/* request to this function. The implementation remains shared
# with the standalone local backend.
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
app.mount("/", backend_app)
