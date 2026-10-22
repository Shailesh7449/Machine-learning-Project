"""
ResumeAI - Systematic Model Optimization and Experimentation Engine
Evaluates candidate representations and classifiers using:
  - 3-Fold Stratified Cross-Validation on X_train (132 samples)
  - Strict isolation of X_test (34 samples)
  - Comprehensive metrics: Accuracy, Macro F1, Weighted F1, Macro Precision, Recall, Latency, Size
Generates:
  - model_comparison.csv
  - per_class_metrics.csv
  - model_metrics.json
  - confusion_matrix.png
"""

import os
import re
import time
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.linear_model import LogisticRegression, RidgeClassifier, SGDClassifier
from sklearn.naive_bayes import ComplementNB, MultinomialNB
from sklearn.ensemble import VotingClassifier, RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score, precision_score, recall_score

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

def clean_text_advanced(text: str) -> str:
    """Enhanced text cleaner that preserves technical terms and removes noise."""
    if not isinstance(text, str):
        return ""
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    text = re.sub(r'\S+@\S+', ' ', text)
    text = re.sub(r'\+?\d[\d -]{8,}\d', ' ', text)
    # Preserve key programming punctuation while removing noise
    text = re.sub(r'[^a-zA-Z0-9+#.-]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text

def build_feature_extractors():
    """Builds diverse candidate feature representations."""
    # 1. Baseline Word (1, 2)
    feat_word_baseline = TfidfVectorizer(
        sublinear_tf=True,
        ngram_range=(1, 2),
        min_df=1,
        max_df=0.95,
        max_features=5000,
        stop_words='english'
    )
    
    # 2. Rich Word (1, 3) with sublinear scaling
    feat_word_rich = TfidfVectorizer(
        sublinear_tf=True,
        ngram_range=(1, 3),
        min_df=1,
        max_df=0.90,
        max_features=8000,
        stop_words='english'
    )
    
    # 3. Character N-Grams (captures typos, prefixes, technical suffixes)
    feat_char_wb = TfidfVectorizer(
        sublinear_tf=True,
        ngram_range=(3, 5),
        analyzer='char_wb',
        min_df=2,
        max_features=10000
    )
    
    # 4. Hybrid Word + Character-wb FeatureUnion
    feat_hybrid = FeatureUnion([
        ('word', TfidfVectorizer(
            sublinear_tf=True,
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.90,
            max_features=6000,
            stop_words='english'
        )),
        ('char_wb', TfidfVectorizer(
            sublinear_tf=True,
            ngram_range=(3, 5),
            analyzer='char_wb',
            min_df=2,
            max_features=8000
        ))
    ])
    
    # 5. Tuned Hybrid Word (1,3) + Char-wb (3,5)
    feat_hybrid_deep = FeatureUnion([
        ('word', TfidfVectorizer(
            sublinear_tf=True,
            ngram_range=(1, 3),
            min_df=1,
            max_df=0.88,
            max_features=8000,
            stop_words='english',
            norm='l2'
        )),
        ('char_wb', TfidfVectorizer(
            sublinear_tf=True,
            ngram_range=(3, 5),
            analyzer='char_wb',
            min_df=1,
            max_features=10000,
            norm='l2'
        ))
    ])

    return {
        "word_baseline": feat_word_baseline,
        "word_rich": feat_word_rich,
        "char_wb": feat_char_wb,
        "hybrid_word_char": feat_hybrid,
        "hybrid_deep": feat_hybrid_deep
    }

def main():
    train_path = "data/train_dedup.csv"
    test_path = "data/test_dedup.csv"
    output_dir = "models"
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"[*] Loading train data: {train_path}")
    print(f"[*] Loading test data:  {test_path}")
    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)
    
    X_train = train_df['Clean_Resume'].values
    y_train = train_df['Category'].values
    X_test = test_df['Clean_Resume'].values
    y_test = test_df['Category'].values
    classes = sorted(list(set(y_train)))
    
    print(f"[*] X_train shape: {X_train.shape}, classes: {len(classes)}")
    print(f"[*] X_test shape:  {X_test.shape}")
    
    features = build_feature_extractors()
    
    # Define experiment configurations (Pipeline of Feature + Classifier)
    experiments = [
        # Baseline
        {
            "id": "EXP-01",
            "name": "LinearSVC (Baseline Word TF-IDF)",
            "pipeline": Pipeline([
                ('vec', features["word_baseline"]),
                ('clf', LinearSVC(C=1.0, random_state=RANDOM_SEED, max_iter=3000))
            ]),
            "feature_desc": "Word TF-IDF (1,2) 5k features",
            "hyperparams": "C=1.0, max_iter=3000"
        },
        # MultinomialNB
        {
            "id": "EXP-02",
            "name": "MultinomialNB (Baseline Word TF-IDF)",
            "pipeline": Pipeline([
                ('vec', features["word_baseline"]),
                ('clf', MultinomialNB(alpha=0.1))
            ]),
            "feature_desc": "Word TF-IDF (1,2) 5k features",
            "hyperparams": "alpha=0.1"
        },
        # ComplementNB (Specifically handles imbalanced text corpora)
        {
            "id": "EXP-03",
            "name": "ComplementNB (Word TF-IDF)",
            "pipeline": Pipeline([
                ('vec', features["word_baseline"]),
                ('clf', ComplementNB(alpha=0.2, norm=True))
            ]),
            "feature_desc": "Word TF-IDF (1,2) 5k features",
            "hyperparams": "alpha=0.2, norm=True"
        },
        # LogisticRegression Balanced
        {
            "id": "EXP-04",
            "name": "LogisticRegression (L2, Balanced)",
            "pipeline": Pipeline([
                ('vec', features["word_baseline"]),
                ('clf', LogisticRegression(C=5.0, class_weight='balanced', max_iter=2000, random_state=RANDOM_SEED))
            ]),
            "feature_desc": "Word TF-IDF (1,2) 5k features",
            "hyperparams": "C=5.0, class_weight=balanced"
        },
        # RidgeClassifier
        {
            "id": "EXP-05",
            "name": "RidgeClassifier (Word TF-IDF)",
            "pipeline": Pipeline([
                ('vec', features["word_baseline"]),
                ('clf', RidgeClassifier(alpha=0.8, class_weight='balanced', random_state=RANDOM_SEED))
            ]),
            "feature_desc": "Word TF-IDF (1,2) 5k features",
            "hyperparams": "alpha=0.8, class_weight=balanced"
        },
        # Tuned Word (1,3) + LinearSVC
        {
            "id": "EXP-06",
            "name": "LinearSVC (Rich Word (1,3) TF-IDF)",
            "pipeline": Pipeline([
                ('vec', features["word_rich"]),
                ('clf', LinearSVC(C=1.2, class_weight='balanced', random_state=RANDOM_SEED, max_iter=3000))
            ]),
            "feature_desc": "Word TF-IDF (1,3) 8k features",
            "hyperparams": "C=1.2, class_weight=balanced"
        },
        # Pure Char-wb
        {
            "id": "EXP-07",
            "name": "LinearSVC (Char-wb (3,5) TF-IDF)",
            "pipeline": Pipeline([
                ('vec', features["char_wb"]),
                ('clf', LinearSVC(C=1.0, class_weight='balanced', random_state=RANDOM_SEED, max_iter=3000))
            ]),
            "feature_desc": "Char-wb (3,5) 10k features",
            "hyperparams": "C=1.0, class_weight=balanced"
        },
        # Hybrid Word + Char-wb + LinearSVC
        {
            "id": "EXP-08",
            "name": "LinearSVC (Hybrid Word + Char-wb)",
            "pipeline": Pipeline([
                ('vec', features["hybrid_word_char"]),
                ('clf', LinearSVC(C=1.0, class_weight='balanced', random_state=RANDOM_SEED, max_iter=3000))
            ]),
            "feature_desc": "Hybrid Word (1,2) + Char-wb (3,5) 14k features",
            "hyperparams": "C=1.0, class_weight=balanced"
        },
        # Hybrid Word + Char-wb + Tuned LinearSVC
        {
            "id": "EXP-09",
            "name": "LinearSVC (Deep Hybrid Word(1,3)+Char(3,5) Tuned)",
            "pipeline": Pipeline([
                ('vec', features["hybrid_deep"]),
                ('clf', LinearSVC(C=1.5, class_weight='balanced', random_state=RANDOM_SEED, max_iter=4000))
            ]),
            "feature_desc": "Deep Hybrid Word (1,3) 8k + Char-wb (3,5) 10k (18k total)",
            "hyperparams": "C=1.5, class_weight=balanced, loss=squared_hinge"
        },
        # Hybrid Word + Char-wb + RidgeClassifier
        {
            "id": "EXP-10",
            "name": "RidgeClassifier (Deep Hybrid Word+Char)",
            "pipeline": Pipeline([
                ('vec', features["hybrid_deep"]),
                ('clf', RidgeClassifier(alpha=0.6, class_weight='balanced', random_state=RANDOM_SEED))
            ]),
            "feature_desc": "Deep Hybrid Word (1,3) + Char-wb (3,5) 18k features",
            "hyperparams": "alpha=0.6, class_weight=balanced"
        },
        # Voting Ensemble
        {
            "id": "EXP-11",
            "name": "Voting Ensemble (LinearSVC + Ridge + Logistic)",
            "pipeline": Pipeline([
                ('vec', features["hybrid_deep"]),
                ('clf', VotingClassifier(
                    estimators=[
                        ('svc', LinearSVC(C=1.5, class_weight='balanced', random_state=RANDOM_SEED, max_iter=4000)),
                        ('ridge', RidgeClassifier(alpha=0.6, class_weight='balanced', random_state=RANDOM_SEED)),
                        ('lr', LogisticRegression(C=5.0, class_weight='balanced', max_iter=2000, random_state=RANDOM_SEED))
                    ],
                    voting='hard'
                ))
            ]),
            "feature_desc": "Deep Hybrid Word (1,3) + Char-wb (3,5) 18k features",
            "hyperparams": "Hard Voting: SVC(C=1.5) + Ridge(a=0.6) + LR(C=5.0)"
        }
    ]
    
    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=RANDOM_SEED)
    results = []
    
    print("\n" + "="*80)
    print("   RUNNING MODEL OPTIMIZATION & COMPARISON EXPERIMENTS")
    print("="*80)
    
    best_exp = None
    best_cv_acc = -1.0
    
    for exp in experiments:
        pipe = exp["pipeline"]
        
        # Measure Cross-Validation on Training Split ONLY
        t0 = time.time()
        cv_scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring='accuracy')
        cv_mean = float(np.mean(cv_scores))
        cv_std = float(np.std(cv_scores))
        
        # Fit on full training split
        fit_t0 = time.time()
        pipe.fit(X_train, y_train)
        fit_time = time.time() - fit_t0
        
        # Measure inference latency on test set
        inf_t0 = time.time()
        y_pred = pipe.predict(X_test)
        inf_latency_per_sample_ms = ((time.time() - inf_t0) / len(X_test)) * 1000.0
        
        # Compute test metrics
        test_acc = float(accuracy_score(y_test, y_pred))
        macro_f1 = float(f1_score(y_test, y_pred, average='macro', zero_division=0))
        weighted_f1 = float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
        macro_prec = float(precision_score(y_test, y_pred, average='macro', zero_division=0))
        macro_rec = float(recall_score(y_test, y_pred, average='macro', zero_division=0))
        
        # Approximate model size by dumping to temporary scratch
        temp_path = "models/temp_test_model.joblib"
        joblib.dump(pipe, temp_path)
        model_size_kb = os.path.getsize(temp_path) / 1024.0
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        res_row = {
            "experiment_id": exp["id"],
            "model_name": exp["name"],
            "features": exp["feature_desc"],
            "hyperparameters": exp["hyperparams"],
            "cv_accuracy_mean": round(cv_mean, 4),
            "cv_accuracy_std": round(cv_std, 4),
            "cv_fold_scores": [round(float(s), 4) for s in cv_scores],
            "test_accuracy": round(test_acc, 4),
            "test_macro_precision": round(macro_prec, 4),
            "test_macro_recall": round(macro_rec, 4),
            "test_macro_f1": round(macro_f1, 4),
            "test_weighted_f1": round(weighted_f1, 4),
            "train_time_sec": round(fit_time, 3),
            "inference_latency_ms": round(inf_latency_per_sample_ms, 2),
            "model_size_kb": round(model_size_kb, 1)
        }
        results.append(res_row)
        
        print(f"[{exp['id']}] {exp['name']}:")
        print(f"     CV Acc: {cv_mean:.4f} (±{cv_std:.4f}) | Test Acc: {test_acc:.4f} ({test_acc*100:.1f}%) | Macro F1: {macro_f1:.4f} | Latency: {inf_latency_per_sample_ms:.2f}ms")
        
        if cv_mean > best_cv_acc:
            best_cv_acc = cv_mean
            best_exp = {
                "config": exp,
                "metrics": res_row,
                "y_pred": y_pred,
                "pipeline": pipe
            }
            
    # Save Model Comparison CSV
    results_df = pd.DataFrame(results)
    results_df.to_csv("model_comparison.csv", index=False)
    print("\n[*] Saved model_comparison.csv")
    
    # Select Champion Model (by highest validated CV performance)
    champion_pipe = best_exp["pipeline"]
    champion_id = best_exp["config"]["id"]
    champion_name = best_exp["config"]["name"]
    champion_pred = best_exp["y_pred"]
    
    print(f"\n========================================================")
    print(f"   SELECTED CHAMPION MODEL: {champion_id} - {champion_name}")
    print(f"   CV Accuracy:   {best_exp['metrics']['cv_accuracy_mean']:.4f} (±{best_exp['metrics']['cv_accuracy_std']:.4f})")
    print(f"   Test Accuracy: {best_exp['metrics']['test_accuracy']:.4f} ({best_exp['metrics']['test_accuracy']*100:.2f}%)")
    print(f"   Macro F1:      {best_exp['metrics']['test_macro_f1']:.4f}")
    print(f"   Weighted F1:   {best_exp['metrics']['test_weighted_f1']:.4f}")
    print(f"========================================================\n")
    
    # Save per-class metrics for Champion
    report_dict = classification_report(y_test, champion_pred, output_dict=True, zero_division=0)
    per_class_rows = []
    for cls_name in classes:
        if cls_name in report_dict:
            per_class_rows.append({
                "category": cls_name,
                "precision": round(report_dict[cls_name]["precision"], 4),
                "recall": round(report_dict[cls_name]["recall"], 4),
                "f1_score": round(report_dict[cls_name]["f1-score"], 4),
                "support": int(report_dict[cls_name]["support"])
            })
    per_class_df = pd.DataFrame(per_class_rows)
    per_class_df.to_csv("per_class_metrics.csv", index=False)
    print("[*] Saved per_class_metrics.csv")
    
    # Plot and save high-res Confusion Matrix for Champion
    cm = confusion_matrix(y_test, champion_pred, labels=classes)
    plt.figure(figsize=(16, 14))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Greens)
    plt.title(f"Optimized Champion Model Confusion Matrix ({champion_name})", fontsize=14, pad=15)
    plt.colorbar(fraction=0.046, pad=0.04)
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=90, fontsize=9)
    plt.yticks(tick_marks, classes, fontsize=9)
    
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
    plt.savefig("confusion_matrix.png", dpi=200)
    plt.close()
    print("[*] Saved confusion_matrix.png")
    
    # Save Champion Model Artifacts into models/
    champion_pipeline_path = os.path.join(output_dir, "resume_classifier_pipeline.joblib")
    joblib.dump(champion_pipe, champion_pipeline_path)
    
    # Also save separate vectorizer and classifier components for backward compatibility with inference.py
    vec_step = champion_pipe.named_steps.get('vec')
    clf_step = champion_pipe.named_steps.get('clf')
    joblib.dump(vec_step, os.path.join(output_dir, "tfidf_vectorizer.joblib"))
    joblib.dump(clf_step, os.path.join(output_dir, "resume_classifier.joblib"))
    joblib.dump(classes, os.path.join(output_dir, "class_labels.joblib"))
    print(f"[*] Serialized champion artifacts into {output_dir}/")
    
    # Save complete model_metrics.json
    final_metrics_data = {
        "timestamp": pd.Timestamp.now().isoformat(),
        "champion_model": {
            "id": champion_id,
            "name": champion_name,
            "features": best_exp["config"]["feature_desc"],
            "hyperparameters": best_exp["config"]["hyperparams"],
            "cv_accuracy_mean": best_exp["metrics"]["cv_accuracy_mean"],
            "cv_accuracy_std": best_exp["metrics"]["cv_accuracy_std"],
            "cv_fold_scores": best_exp["metrics"]["cv_fold_scores"],
            "test_accuracy": best_exp["metrics"]["test_accuracy"],
            "test_macro_precision": best_exp["metrics"]["test_macro_precision"],
            "test_macro_recall": best_exp["metrics"]["test_macro_recall"],
            "test_macro_f1": best_exp["metrics"]["test_macro_f1"],
            "test_weighted_f1": best_exp["metrics"]["test_weighted_f1"],
            "train_time_sec": best_exp["metrics"]["train_time_sec"],
            "inference_latency_ms": best_exp["metrics"]["inference_latency_ms"],
            "model_size_kb": best_exp["metrics"]["model_size_kb"]
        },
        "all_experiments": results,
        "per_class_summary": per_class_rows,
        "confusion_matrix": cm.tolist(),
        "classes": classes
    }
    
    with open("model_metrics.json", "w") as f:
        json.dump(final_metrics_data, f, indent=2)
    print("[*] Saved model_metrics.json")

if __name__ == "__main__":
    main()
