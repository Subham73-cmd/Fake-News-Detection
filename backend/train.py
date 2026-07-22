"""
Training script for the Fake News Detection backend.
Replicates the preprocessing + training pipeline from fake_news_detection.ipynb
and saves the fitted TF-IDF vectorizer and 4 classifiers to model/ as .pkl files.

Usage:
    python train.py
"""

import re
import string
import pickle
from pathlib import Path

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier

DATA_DIR = Path(__file__).parent / "data"
MODEL_DIR = Path(__file__).parent / "model"
MODEL_DIR.mkdir(exist_ok=True)


def wordopt(text: str) -> str:
    """Same text-cleaning function used in the notebook."""
    text = text.lower()
    text = re.sub(r"\[.*?\]", "", text)
    text = re.sub(r"\W", " ", text)
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    text = re.sub(r"<.*?>+", "", text)
    text = re.sub("[%s]" % re.escape(string.punctuation), "", text)
    text = re.sub(r"\n", "", text)
    text = re.sub(r"\w*\d\w*", "", text)
    return text


def main():
    print("Loading datasets...")
    df_true = pd.read_csv(DATA_DIR / "True.csv")
    df_fake = pd.read_csv(DATA_DIR / "Fake.csv")

    df_fake["class"] = 0
    df_true["class"] = 1

    # Merge, drop unused columns
    df_merge = pd.concat([df_fake, df_true], axis=0)
    df = df_merge.drop(["title", "subject", "date"], axis=1)

    # Shuffle (seeded for reproducibility)
    df = df.sample(frac=1, random_state=1)
    df.reset_index(inplace=True)
    df.drop(["index"], axis=1, inplace=True)

    print("Cleaning text...")
    df["text"] = df["text"].apply(wordopt)

    x = df["text"]
    y = df["class"]

    # NOTE: these settings match the notebook exactly (small training subset,
    # label noise, tiny vocab, heavy regularization). See the message alongside
    # this file for why you may want to change them for a real production model.
    x_train, x_test, y_train, y_test = train_test_split(
        x, y, train_size=0.025, test_size=0.3, random_state=42
    )

    np.random.seed(42)
    y_train = y_train.copy()
    n_flip = int(len(y_train) * 0.10)
    flip_idx = np.random.choice(y_train.index, n_flip, replace=False)
    y_train.loc[flip_idx] = 1 - y_train.loc[flip_idx]

    print("Vectorizing...")
    vectorization = TfidfVectorizer(max_features=45)
    xv_train = vectorization.fit_transform(x_train)
    xv_test = vectorization.transform(x_test)

    print("Training models...")
    LR = LogisticRegression(C=0.008, max_iter=200)
    LR.fit(xv_train, y_train)

    DT = DecisionTreeClassifier(max_depth=2, random_state=0)
    DT.fit(xv_train, y_train)

    GBC = GradientBoostingClassifier(random_state=0, n_estimators=5, max_depth=1)
    GBC.fit(xv_train, y_train)

    RFC = RandomForestClassifier(random_state=0, n_estimators=5, max_depth=2)
    RFC.fit(xv_train, y_train)

    print("\nTest accuracy:")
    for name, model in [("LR", LR), ("DT", DT), ("GBC", GBC), ("RFC", RFC)]:
        preds = model.predict(xv_test)
        acc = accuracy_score(y_test, preds)
        print(f"  {name}: {acc:.4f}")

    print("\nSaving artifacts to", MODEL_DIR)
    with open(MODEL_DIR / "vectorizer.pkl", "wb") as f:
        pickle.dump(vectorization, f)
    with open(MODEL_DIR / "lr_model.pkl", "wb") as f:
        pickle.dump(LR, f)
    with open(MODEL_DIR / "dt_model.pkl", "wb") as f:
        pickle.dump(DT, f)
    with open(MODEL_DIR / "gbc_model.pkl", "wb") as f:
        pickle.dump(GBC, f)
    with open(MODEL_DIR / "rfc_model.pkl", "wb") as f:
        pickle.dump(RFC, f)

    print("Done.")


if __name__ == "__main__":
    main()
