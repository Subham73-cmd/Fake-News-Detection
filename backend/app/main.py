"""
FastAPI backend for the Fake News Detection model.

Endpoints:
    GET  /health            -> health check
    POST /predict            -> predict on a single piece of news text

Run locally:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Then visit http://localhost:8000/docs for interactive API docs.
"""

import re
import pickle
import string
from pathlib import Path
from functools import lru_cache

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

MODEL_DIR = Path(__file__).resolve().parent.parent / "model"

app = FastAPI(
    title="Fake News Detection API",
    description="Predicts whether a news article is Fake or Real using 4 ML models.",
    version="1.0.0",
)

# Allow the frontend (running on a different origin) to call this API.
# Replace "*" with your actual frontend domain(s) before going to production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Text preprocessing (must exactly match what was used at training time)
# ---------------------------------------------------------------------------
def wordopt(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\[.*?\]", "", text)
    text = re.sub(r"\W", " ", text)
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    text = re.sub(r"<.*?>+", "", text)
    text = re.sub("[%s]" % re.escape(string.punctuation), "", text)
    text = re.sub(r"\n", "", text)
    text = re.sub(r"\w*\d\w*", "", text)
    return text


# ---------------------------------------------------------------------------
# Load model artifacts once at startup
# ---------------------------------------------------------------------------
def _load(name: str):
    path = MODEL_DIR / name
    if not path.exists():
        raise FileNotFoundError(
            f"Missing model artifact: {path}. Run `python train.py` first."
        )
    with open(path, "rb") as f:
        return pickle.load(f)


@lru_cache(maxsize=1)
def get_artifacts():
    return {
        "vectorizer": _load("vectorizer.pkl"),
        "LR": _load("lr_model.pkl"),
        "DT": _load("dt_model.pkl"),
        "GBC": _load("gbc_model.pkl"),
        "RFC": _load("rfc_model.pkl"),
    }


@app.on_event("startup")
def load_models_on_startup():
    # Force-load at startup so the first real request isn't slow,
    # and so a missing-model error surfaces immediately in the logs.
    get_artifacts()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Full news article text to classify.")


class ModelVote(BaseModel):
    model: str
    label: str
    prediction: int  # 0 = Fake, 1 = Real


class PredictResponse(BaseModel):
    votes: list[ModelVote]
    consensus_label: str
    fake_votes: int
    real_votes: int


def output_label(n: int) -> str:
    return "Fake News" if n == 0 else "Not A Fake News"


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="`text` must not be empty.")

    artifacts = get_artifacts()
    cleaned = wordopt(text)
    vec = artifacts["vectorizer"].transform([cleaned])

    votes = []
    for key in ("LR", "DT", "GBC", "RFC"):
        pred = int(artifacts[key].predict(vec)[0])
        votes.append(ModelVote(model=key, label=output_label(pred), prediction=pred))

    fake_votes = sum(1 for v in votes if v.prediction == 0)
    real_votes = sum(1 for v in votes if v.prediction == 1)
    consensus_label = "Fake News" if fake_votes > real_votes else "Not A Fake News"

    return PredictResponse(
        votes=votes,
        consensus_label=consensus_label,
        fake_votes=fake_votes,
        real_votes=real_votes,
    )
