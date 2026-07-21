# Fake News Detection

A machine learning project that classifies news articles as **fake** or **real** using natural language processing and multiple supervised learning models. The notebook loads separate fake and true news datasets, cleans the text, trains several classifiers, and compares their performance on the same processed dataset.

## Project Overview

This project focuses on detecting misinformation from news text by converting article content into numerical features and applying classification algorithms. The workflow includes:

- Loading `Fake.csv` and `True.csv` datasets.
- Assigning class labels to fake and real news.
- Merging and shuffling the data.
- Cleaning the article text using regex and punctuation removal.
- Splitting the dataset into training and testing sets.
- Transforming text into vectors using TF-IDF.
- Training multiple machine learning models.
- Evaluating predictions with accuracy and classification metrics.
- Testing custom input news text manually.

## Features

- Text preprocessing pipeline for news content.
- Binary classification for fake vs real news.
- TF-IDF based feature extraction.
- Multiple model training in one notebook.
- Performance comparison across classifiers.
- Manual testing function for checking user-provided news text.

## Models Used

The notebook includes the following machine learning models:

- Logistic Regression
- Decision Tree Classifier
- Gradient Boosting Classifier
- Random Forest Classifier

## Tech Stack

- Python
- Pandas
- NumPy
- Matplotlib
- Seaborn
- Scikit-learn
- Regex (`re`)
- String processing utilities

## Dataset

The project uses two CSV files:

- `Fake.csv` — contains fake news articles.
- `True.csv` — contains real news articles.

Common dataset columns visible in the notebook include:

- `title`
- `text`
- `subject`
- `date`

After labeling, the data is combined into a binary classification dataset where:

- `0` represents fake news
- `1` represents real news

## Workflow

### 1. Data Loading
The notebook imports the fake and true news datasets into Pandas DataFrames.

### 2. Data Preparation
A class column is added to each dataset, and both datasets are concatenated into a single DataFrame. Unnecessary columns are removed before training.

### 3. Text Cleaning
The text is normalized by:

- Converting to lowercase
- Removing content inside brackets
- Removing URLs
- Removing HTML tags
- Removing punctuation
- Removing digits
- Removing newline characters

### 4. Train-Test Split
The cleaned text data is split into training and testing sets using Scikit-learn.

### 5. Feature Extraction
TF-IDF Vectorizer converts the cleaned news text into numerical feature vectors suitable for machine learning models.

### 6. Model Training
Several classification algorithms are trained on the vectorized text data.

### 7. Evaluation
The notebook evaluates model predictions using:

- Accuracy score
- Classification report

### 8. Manual Testing
A helper function allows prediction on custom news content entered by the user.

## Project Structure

```bash
fake-news-detection/
│── fake_news_detection.ipynb
│── Fake.csv
│── True.csv
│── README.md
```

## Installation

```bash
git clone <your-repository-url>
cd fake-news-detection
pip install pandas numpy matplotlib seaborn scikit-learn
```

## Usage

1. Place `Fake.csv` and `True.csv` in the same working environment as the notebook.
2. Open `fake_news_detection.ipynb` in Jupyter Notebook or Google Colab.
3. Run the notebook cells in sequence.
4. Review model training and evaluation results.
5. Use the manual testing section to check a custom news article.

## Example Prediction Flow

```python
news = "Sample news article text goes here"
manual_testing(news)
```

## Future Improvements

- Add model persistence using `joblib` or `pickle`.
- Build a Flask or Streamlit web app for live prediction.
- Perform hyperparameter tuning for better accuracy.
- Add confusion matrix and ROC-based evaluation.
- Use advanced NLP models such as LSTM, BERT, or transformers.
- Deploy the project online for public use.

## Notes

- This project is notebook-based and intended for learning and experimentation.
- Make sure the dataset file paths match your local setup if not using Google Colab.
- For production use, convert the notebook into modular Python scripts and save the trained pipeline.

## Authors

- [Subham Nayak](https://github.com/Subham73-cmd)
- [Nayanika Debnath](https://github.com/Nay-ray)

## License

This project can be shared under the MIT License. 
