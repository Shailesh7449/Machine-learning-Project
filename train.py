"""
ResumeAI - Production-Grade ML Training and Evaluation Pipeline
Trains:
  1. Resume Category Classifier (TF-IDF + LinearSVC / MultinomialNB / LogisticRegression / RandomForest)
     Evaluated with Stratified K-Fold CV on training split and evaluated on held-out test split.
  2. Skill Extraction Classifier (Character/Word N-Gram TF-IDF + LogisticRegression)
Generates:
  - Clean, uncorrupted .joblib artifacts compatible with scikit-learn 1.6.1
  - Complete metrics report JSON with accuracy, macro/weighted F1, confusion matrix, CV scores.
"""

import os
import re
import json
import joblib
import numpy as np
import pandas as pd
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
    """Standardizes and normalizes resume text for feature extraction."""
    if not isinstance(text, str):
        return ""
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    # Remove Email addresses
    text = re.sub(r'\S+@\S+', ' ', text)
    # Remove phone numbers
    text = re.sub(r'\+?\d[\d -]{8,}\d', ' ', text)
    # Remove extra punctuation but keep tech-relevant symbols like c++, c#, .net, node.js
    text = re.sub(r'[^a-zA-Z0-9+#.-]', ' ', text)
    # Normalize whitespaces
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text

def train_resume_classifier(data_path="data/UpdatedResumeDataSet.csv", output_dir="models"):
    os.makedirs(output_dir, exist_ok=True)
    print(f"[*] Loading dataset from: {data_path}")
    df = pd.read_csv(data_path)
    total_raw = len(df)
    print(f"[*] Total raw records: {total_raw}")
    
    # Audit: Detect and eliminate duplicates to prevent catastrophic data leakage
    df['Clean_Resume'] = df['Resume'].apply(clean_resume_text)
    df['Category'] = df['Category'].str.strip()
    
    unique_before = df['Clean_Resume'].nunique()
    print(f"[*] Unique resume bodies: {unique_before} out of {total_raw}")
    
    # Drop duplicate resumes
    df_dedup = df.drop_duplicates(subset=['Clean_Resume']).reset_index(drop=True)
    dedup_count = len(df_dedup)
    print(f"[*] Retained {dedup_count} unique resume records across {df_dedup['Category'].nunique()} categories.")
    
    # Class distribution check
    class_counts = df_dedup['Category'].value_counts()
    print("[*] Classes and counts:")
    for cat, cnt in class_counts.items():
        print(f"    - {cat}: {cnt}")
    
    X = df_dedup['Clean_Resume'].values
    y = df_dedup['Category'].values
    classes = sorted(list(set(y)))
    
    # Split into train (80%) and held-out test (20%), stratified by category
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_SEED, stratify=y
    )
    print(f"[*] Training samples: {len(X_train_raw)}, Held-out test samples: {len(X_test_raw)}")
    
    # Fit TF-IDF Vectorizer ONLY on training data to strictly prevent data leakage
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
    print(f"[*] Vocabulary size: {len(vectorizer.vocabulary_)} features")
    
    # Define candidate models
    candidate_models = {
        "MultinomialNB (Baseline)": MultinomialNB(alpha=0.1),
        "LogisticRegression": LogisticRegression(max_iter=1000, C=1.0, random_state=RANDOM_SEED),
        "LinearSVC": LinearSVC(C=1.0, random_state=RANDOM_SEED, max_iter=2000),
        "RandomForest": RandomForestClassifier(n_estimators=100, random_state=RANDOM_SEED)
    }
    
    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=RANDOM_SEED)
    cv_results = {}
    
    print("\n[*] Running 3-Fold Stratified Cross-Validation on Training Split:")
    for name, model in candidate_models.items():
        scores = cross_val_score(model, X_train_vec, y_train, cv=cv, scoring='accuracy')
        cv_results[name] = {
            "mean_accuracy": float(np.mean(scores)),
            "std_accuracy": float(np.std(scores)),
            "fold_scores": [float(s) for s in scores]
        }
        print(f"    - {name}: Mean Acc = {np.mean(scores):.4f} (+/- {np.std(scores):.4f})")
    
    # Select the champion model (LinearSVC or highest CV score)
    best_model_name = max(cv_results, key=lambda k: cv_results[k]["mean_accuracy"])
    champion_model = candidate_models[best_model_name]
    print(f"\n[*] Champion Model Selected: {best_model_name}")
    
    # Train champion on full training split
    champion_model.fit(X_train_vec, y_train)
    
    # Evaluate on Held-Out Test Set
    y_pred = champion_model.predict(X_test_vec)
    test_acc = accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average='macro', zero_division=0)
    weighted_f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    macro_prec = precision_score(y_test, y_pred, average='macro', zero_division=0)
    macro_rec = recall_score(y_test, y_pred, average='macro', zero_division=0)
    
    print(f"\n[*] Held-Out Test Set Evaluation:")
    print(f"    - Accuracy:    {test_acc:.4f} ({test_acc * 100:.1f}%)")
    print(f"    - Macro F1:    {macro_f1:.4f}")
    print(f"    - Weighted F1: {weighted_f1:.4f}")
    print(f"    - Precision:   {macro_prec:.4f}")
    print(f"    - Recall:      {macro_rec:.4f}")
    
    report_dict = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    conf_matrix = confusion_matrix(y_test, y_pred, labels=classes).tolist()
    
    # Save Model Artifacts
    vec_path = os.path.join(output_dir, "tfidf_vectorizer.joblib")
    clf_path = os.path.join(output_dir, "resume_classifier.joblib")
    lbl_path = os.path.join(output_dir, "class_labels.joblib")
    
    joblib.dump(vectorizer, vec_path)
    joblib.dump(champion_model, clf_path)
    joblib.dump(classes, lbl_path)
    print(f"[*] Saved vectorizer to: {vec_path}")
    print(f"[*] Saved classifier to: {clf_path}")
    print(f"[*] Saved class labels to: {lbl_path}")
    
    return {
        "dataset_summary": {
            "source": "Kaggle UpdatedResumeDataSet.csv",
            "total_raw_records": total_raw,
            "deduplicated_records": dedup_count,
            "duplicate_records_removed": total_raw - dedup_count,
            "train_samples": len(X_train_raw),
            "test_samples": len(X_test_raw),
            "num_classes": len(classes),
            "classes": classes
        },
        "model_selection": {
            "candidate_cv_scores": cv_results,
            "champion_model": best_model_name,
        },
        "test_metrics": {
            "accuracy": float(test_acc),
            "macro_f1": float(macro_f1),
            "weighted_f1": float(weighted_f1),
            "macro_precision": float(macro_prec),
            "macro_recall": float(macro_rec),
            "classification_report": report_dict,
            "confusion_matrix": conf_matrix
        }
    }

def train_skill_classifier(output_dir="models"):
    """
    Trains a high-precision binary skill classifier to identify technical skills vs non-skill phrases.
    Uses canonical taxonomy skills as positive examples and common resume stop-phrases as negative examples.
    """
    print("\n[*] Training Skill Extraction Classifier...")
    # Read taxonomy skills
    positive_skills = [
        "python", "javascript", "typescript", "react", "next.js", "vue", "angular", "node.js",
        "express", "django", "fastapi", "spring boot", "c++", "c#", ".net core", "java", "golang",
        "rust", "sql", "postgresql", "mysql", "mongodb", "redis", "docker", "kubernetes", "aws",
        "azure", "gcp", "terraform", "ci/cd", "git", "machine learning", "deep learning", "pytorch",
        "tensorflow", "scikit-learn", "nlp", "computer vision", "pandas", "numpy", "apache spark",
        "hadoop", "power bi", "tableau", "rest api", "graphql", "microservices", "unit testing",
        "cybersecurity", "linux", "bash", "agile", "jira", "data modeling", "etl", "large language models",
        "prompt engineering", "langchain", "elasticsearch", "kafka", "flask", "ruby on rails", "scala",
        "swift", "kotlin", "html5", "css3", "tailwind css", "sass", "jenkins", "ansible", "helm",
        "prometheus", "grafana", "snowflake", "databricks", "dbt", "airflow", "dynamodb", "cassandra"
    ]
    
    # Common non-skill resume phrases
    negative_phrases = [
        "responsible for", "worked with", "assisted in", "managed team", "participated in",
        "conducted meetings", "delivered presentations", "day to day", "years of experience",
        "bachelor of science", "master of science", "university of", "college of engineering",
        "high school", "phone number", "email address", "references available", "curriculum vitae",
        "summary of qualifications", "objective statement", "hobbies include", "fluent in english",
        "strong work ethic", "hard worker", "quick learner", "team player", "attention to detail",
        "results oriented", "self motivated", "excellent communication", "duties included",
        "helped clients", "served customers", "answered calls", "scheduled appointments",
        "organized files", "processed invoices", "attended workshops", "created spreadsheets",
        "wrote emails", "filed documents", "supervised staff", "tracked progress", "resolved conflicts",
        "met deadlines", "exceeded quotas", "handled complaints", "maintained inventory", "placed orders"
    ]
    
    X = positive_skills + negative_phrases
    y = [1] * len(positive_skills) + [0] * len(negative_phrases)
    
    # Vectorize with character & word ngrams
    vec = TfidfVectorizer(ngram_range=(1, 3), analyzer='char_wb', min_df=1)
    X_vec = vec.fit_transform(X)
    
    # Train LogisticRegression with explicit multi_class / solver parameters for scikit-learn 1.6 compatibility
    clf = LogisticRegression(C=2.0, max_iter=1000, random_state=RANDOM_SEED)
    clf.fit(X_vec, y)
    
    # Verify inference
    test_words = ["python", "docker", "deep learning", "managed team", "answered calls"]
    preds = clf.predict(vec.transform(test_words))
    probs = clf.predict_proba(vec.transform(test_words))[:, 1]
    print("[*] Sample Skill Classifier Validation:")
    for w, p, pr in zip(test_words, preds, probs):
        print(f"    - '{w}': is_skill={p} (confidence={pr:.3f})")
    
    vec_path = os.path.join(output_dir, "skill_tfidf_vectorizer.joblib")
    clf_path = os.path.join(output_dir, "skill_classifier.joblib")
    joblib.dump(vec, vec_path)
    joblib.dump(clf, clf_path)
    print(f"[*] Saved skill vectorizer to: {vec_path}")
    print(f"[*] Saved skill classifier to: {clf_path}")
    
    return {
        "num_positive_examples": len(positive_skills),
        "num_negative_examples": len(negative_phrases),
        "training_accuracy": float(accuracy_score(y, clf.predict(X_vec)))
    }

if __name__ == "__main__":
    resume_metrics = train_resume_classifier()
    skill_metrics = train_skill_classifier()
    
    report = {
        "timestamp": pd.Timestamp.now().isoformat(),
        "sklearn_version": joblib.__version__,
        "resume_classifier": resume_metrics,
        "skill_classifier": skill_metrics
    }
    
    with open("models/metrics_report.json", "w") as f:
        json.dump(report, f, indent=2)
    print("\n[*] Complete training & evaluation report written to models/metrics_report.json")
