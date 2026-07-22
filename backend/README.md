# Fake News Detection — Backend

A FastAPI backend that serves the 4-model (Logistic Regression, Decision Tree,
Gradient Boosting, Random Forest) fake news classifier from the original notebook.

## Project structure

```
fake_news_backend/
├── data/
│   ├── True.csv
│   └── Fake.csv
├── model/                  # created by train.py
│   ├── vectorizer.pkl
│   ├── lr_model.pkl
│   ├── dt_model.pkl
│   ├── gbc_model.pkl
│   └── rfc_model.pkl
├── app/
│   └── main.py              # FastAPI app
├── train.py                  # training script (run once, or whenever you retrain)
├── requirements.txt
├── Dockerfile
└── README.md
```

## 1. Setup

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Put `True.csv` and `Fake.csv` in `data/`.

## 2. Train the model

```bash
python train.py
```

This writes `vectorizer.pkl`, `lr_model.pkl`, `dt_model.pkl`, `gbc_model.pkl`,
and `rfc_model.pkl` into `model/`. Only needs to be re-run when you change the
training data or pipeline.

## 3. Run the API

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Interactive docs: http://localhost:8000/docs

### Endpoints

**GET `/health`**
```json
{"status": "ok"}
```

**POST `/predict`**
```json
// Request
{"text": "Full article text here..."}

// Response
{
  "votes": [
    {"model": "LR", "label": "Not A Fake News", "prediction": 1},
    {"model": "DT", "label": "Fake News", "prediction": 0},
    {"model": "GBC", "label": "Fake News", "prediction": 0},
    {"model": "RFC", "label": "Not A Fake News", "prediction": 1}
  ],
  "consensus_label": "Not A Fake News",
  "fake_votes": 2,
  "real_votes": 2
}
```

## 4. Deploying for a live website

**Docker (recommended):**
```bash
docker build -t fake-news-api .
docker run -p 8000:8000 fake-news-api
```

**Hosting options:** Render, Railway, Fly.io, Vercel, AWS App Runner/ECS, or a
plain VPS behind nginx all work well for a small FastAPI + scikit-learn
service like this one. Point your frontend's fetch/axios calls at
`https://your-backend-domain/predict`.

**Vercel (serverless):**
This repo already includes `vercel.json` and `api/index.py` for this. From
the project root:
```bash
npm install -g vercel   # if you don't have the CLI
vercel                   # follow prompts, deploy from this directory
vercel --prod             # promote to production
```
Vercel installs from the root `requirements.txt` (kept minimal — no
pandas/numpy, since those are only needed by `train.py`, not by the API at
runtime). Your live URL will look like `https://your-project.vercel.app`, and
`/predict` will be reachable directly at the root (e.g.
`https://your-project.vercel.app/predict`) via the rewrite rule in
`vercel.json`.

Note: Vercel runs this as a serverless function, not a long-running server —
fine for this project (no websockets/background jobs, tiny model files), but
each cold instance re-loads the `.pkl` files into memory on first request
after being idle. That's sub-second here since the models are small.

**Before going live:**
- In `app/main.py`, change `allow_origins=["*"]` in the CORS middleware to your
  actual frontend domain(s) — wildcard CORS is fine for testing, not production.
- Put the API behind HTTPS (most PaaS providers do this for you automatically).
- Consider basic rate limiting if the endpoint is public, since inference is cheap
  but you don't want it hammered.

## Important note on model accuracy

The notebook's training cell intentionally caps the model's ceiling:
- Only 2.5% of the data is used for training (`train_size=0.025`)
- 10% of training labels are randomly flipped (artificial label noise)
- The TF-IDF vocabulary is capped at 45 features
- All 4 models are heavily regularized / very shallow (e.g. `max_depth=1-2`,
  `C=0.008`, only 5 trees for the ensembles)

This backend trains with those exact settings so it matches the notebook, and
gets around 80-85% test accuracy as a result — noticeably worse than what this
dataset supports (a full-data version of this pipeline typically hits 99%+).
If this is going on a live site rather than staying an exercise, I'd recommend
loosening these settings in `train.py` before you deploy: use most/all of the
data for training, drop the label-flipping, and raise `max_features` on the
vectorizer (e.g. into the thousands). Happy to make that change if you want.
