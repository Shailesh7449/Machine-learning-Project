"""
Reproducible Baseline Generator for ResumeAI
Generates:
  - baseline_metrics.json
  - baseline_predictions.csv
  - baseline_confusion_matrix.png
"""

import os
import re
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score, precision_score, recall_score

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

def clean_resume_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    text = re.sub(r'\S+@\S+', ' ', text)
    text = re.sub(r'\+?\d[\d -]{8,}\d', ' ', text)
    text = re.sub(r'[^a-zA-Z0-9+#.-]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text

def main():
    data_path = "data/UpdatedResumeDataSet.csv"
    output_dir = "models"
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs("evaluation", exist_ok=True)

    print(f"[*] Reading dataset: {data_path}")
    df = pd.read_csv(data_path)
    total_raw = len(df)
    
    df['Clean_Resume'] = df['Resume'].apply(clean_resume_text)
    df['Category'] = df['Category'].str.strip()
    
    # Deduplicate to strictly prevent data leakage
    df_dedup = df.drop_duplicates(subset=['Clean_Resume']).reset_index(drop=True)
    dedup_count = len(df_dedup)
    
    X = df_dedup['Clean_Resume'].values
    y = df_dedup['Category'].values
    classes = sorted(list(set(y)))
    
    # Stratified Split
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_SEED, stratify=y
    )
    
    # TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(
        sublinear_tf=True,
        ngram_range=(1, 2),
        min_df=1,
        max_df=0.95,
        max_features=5000,
        stop_words='english'
    )
    X_train_vec = vectorizer.fit_transform(X_train_raw)
    X_test_vec = vectorizer.transform(X_test_raw)
    
    candidate_models = {
        "MultinomialNB": MultinomialNB(alpha=0.1),
        "LogisticRegression": LogisticRegression(max_iter=1000, C=1.0, random_state=RANDOM_SEED),
        "LinearSVC": LinearSVC(C=1.0, random_state=RANDOM_SEED, max_iter=2000),
        "RandomForest": RandomForestClassifier(n_estimators=100, random_state=RANDOM_SEED)
    }
    
    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=RANDOM_SEED)
    cv_results = {}
    for name, model in candidate_models.items():
        scores = cross_val_score(model, X_train_vec, y_train, cv=cv, scoring='accuracy')
        cv_results[name] = {
            "mean_accuracy": round(float(np.mean(scores)), 4),
            "std_accuracy": round(float(np.std(scores)), 4),
            "fold_scores": [round(float(s), 4) for s in scores]
        }
        print(f"[*] {name}: CV Mean = {cv_results[name]['mean_accuracy']} (+/- {cv_results[name]['std_accuracy']})")
    
    # Train champion LinearSVC
    champion = candidate_models["LinearSVC"]
    champion.fit(X_train_vec, y_train)
    y_pred = champion.predict(X_test_vec)
    
    test_acc = accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average='macro', zero_division=0)
    weighted_f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    macro_prec = precision_score(y_test, y_pred, average='macro', zero_division=0)
    macro_rec = recall_score(y_test, y_pred, average='macro', zero_division=0)
    
    print("\n[*] Baseline Test Evaluation:")
    print(f"    Accuracy:        {test_acc:.4f} ({test_acc*100:.2f}%)")
    print(f"    Macro F1:        {macro_f1:.4f}")
    print(f"    Weighted F1:     {weighted_f1:.4f}")
    print(f"    Macro Precision: {macro_prec:.4f}")
    print(f"    Macro Recall:    {macro_rec:.4f}")
    
    # Generate Predictions CSV
    predictions_df = pd.DataFrame({
        "sample_index": range(len(y_test)),
        "true_category": y_test,
        "predicted_category": y_pred,
        "is_correct": [t == p for t, p in zip(y_test, y_pred)],
        "resume_snippet": [snippet[:120].replace("\n", " ") + "..." for snippet in X_test_raw]
    })
    predictions_df.to_csv("baseline_predictions.csv", index=False)
    print("[*] Saved baseline_predictions.csv")
    
    # Generate Baseline Metrics JSON
    report_dict = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    cm = confusion_matrix(y_test, y_pred, labels=classes)
    
    baseline_metrics = {
        "metadata": {
            "dataset": "UpdatedResumeDataSet.csv",
            "total_raw_records": total_raw,
            "deduplicated_unique_records": dedup_count,
            "train_samples": len(X_train_raw),
            "test_samples": len(X_test_raw),
            "num_classes": len(classes),
            "random_seed": RANDOM_SEED,
            "train_split": 0.80,
            "test_split": 0.20,
            "vectorizer": "TfidfVectorizer(sublinear_tf=True, ngram_range=(1,2), max_features=5000, stop_words='english')",
            "classifier": "LinearSVC(C=1.0, random_state=42, max_iter=2000)",
            "sklearn_version": "1.6.1",
            "pandas_version": pd.__version__,
            "numpy_version": np.__version__
        },
        "cross_validation_train": cv_results,
        "held_out_test_metrics": {
            "accuracy": round(float(test_acc), 4),
            "macro_f1": round(float(macro_f1), 4),
            "weighted_f1": round(float(weighted_f1), 4),
            "macro_precision": round(float(macro_prec), 4),
            "macro_recall": round(float(macro_rec), 4),
            "correct_predictions": int(np.sum(y_test == y_pred)),
            "total_test_samples": int(len(y_test))
        },
        "per_class_metrics": {k: v for k, v in report_dict.items() if k not in ["accuracy", "macro avg", "weighted avg"]}
    }
    
    with open("baseline_metrics.json", "w") as f:
        json.dump(baseline_metrics, f, indent=2)
    print("[*] Saved baseline_metrics.json")
    
    # Plot baseline confusion matrix
    plt.figure(figsize=(16, 14))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title("Baseline LinearSVC Confusion Matrix (25 Resume Categories)", fontsize=14, pad=15)
    plt.colorbar(fraction=0.046, pad=0.04)
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=90, fontsize=9)
    plt.yticks(tick_marks, classes, fontsize=9)
    
    # Label cell counts
    thresh = cm.max() / 2.
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            val = cm[i, j]
            if val > 0:
                plt.text(j, i, format(val, 'd'),
                         ha="center", va="center",
                         color="white" if val > thresh else "black",
                         fontsize=8)
                
    plt.ylabel('True Category Label', fontsize=11)
    plt.xlabel('Predicted Category Label', fontsize=11)
    plt.tight_layout()
    plt.savefig("baseline_confusion_matrix.png", dpi=200)
    plt.close()
    print("[*] Saved baseline_confusion_matrix.png")

if __name__ == "__main__":
    main()
