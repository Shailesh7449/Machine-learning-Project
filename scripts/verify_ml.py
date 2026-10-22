import pickle
import pandas as pd
import numpy as np
import time
from sklearn.metrics import accuracy_score, f1_score, classification_report
import re

# 1. Inspect datasets
train_df = pd.read_csv('data/train_dedup.csv')
test_df = pd.read_csv('data/test_dedup.csv')
print(f'Train shape: {train_df.shape}, Test shape: {test_df.shape}')

# Check for data leakage
train_resumes = set(train_df['Resume'].str.strip())
test_resumes = set(test_df['Resume'].str.strip())
leakage = train_resumes.intersection(test_resumes)
print(f'Data leakage count between train and test: {len(leakage)}')
assert len(leakage) == 0, 'DATA LEAKAGE DETECTED!'

# 2. Check preprocessing function matching inference.py & train.py
def clean_resume_text(text):
    text = re.sub(r'http\S+\s*', ' ', text)
    text = re.sub(r'RT|cc', ' ', text)
    text = re.sub(r'#\S+', '', text)
    text = re.sub(r'@\S+', '  ', text)
    text = re.sub(r'[%s]' % re.escape('''!"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~'''), ' ', text)
    text = re.sub(r'[^\x00-\x7f]', r' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()

# 3. Load champion model
import joblib
clf = joblib.load('models/resume_classifier.joblib')
vec = joblib.load('models/tfidf_vectorizer.joblib')

# 4. Measure cold start latency (model load + vectorizer transform + predict)
t_cold_start = time.perf_counter()
test_cleaned = [clean_resume_text(t) for t in test_df['Resume']]
X_test = vec.transform(test_cleaned)
preds = clf.predict(X_test)
cold_latency_ms = (time.perf_counter() - t_cold_start) * 1000

# 5. Measure warm inference latency (single sample)
warm_times = []
single_sample_vec = vec.transform([clean_resume_text(test_df['Resume'].iloc[0])])
for _ in range(100):
    t0 = time.perf_counter()
    _ = clf.predict(single_sample_vec)
    warm_times.append((time.perf_counter() - t0) * 1000)
avg_warm_latency_ms = float(np.mean(warm_times))

# 6. Verify accuracy and Macro F1
y_true = test_df['Category']
acc = accuracy_score(y_true, preds)
macro_f1 = f1_score(y_true, preds, average='macro')
weighted_f1 = f1_score(y_true, preds, average='weighted')

print(f'Held-Out Test Accuracy: {acc * 100:.2f}% ({np.sum(y_true == preds)}/{len(y_true)})')
print(f'Held-Out Macro F1: {macro_f1:.4f}')
print(f'Held-Out Weighted F1: {weighted_f1:.4f}')
print(f'Batch Cold Transform & Predict Latency: {cold_latency_ms:.2f}ms ({cold_latency_ms/len(test_df):.2f}ms/sample)')
print(f'Warm Single-Sample Latency (In-Process Python): {avg_warm_latency_ms:.3f}ms')
