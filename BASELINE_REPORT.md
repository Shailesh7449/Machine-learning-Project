# ResumeAI Baseline Performance & Reproducibility Report

**Date:** October 2026  
**Evaluation Status:** Audited & Verified  
**Random Seed:** 42  
**Dataset:** `data/UpdatedResumeDataSet.csv` (166 unique deduplicated records across 25 classes)  
**Execution Environment:** Python 3.13.1, scikit-learn 1.6.1, pandas 2.2.3, numpy 2.5.3, joblib 1.4.2

---

## 1. Baseline Summary & Key Findings

To establish a defensible, reproducible benchmark before applying model enhancements, the existing training pipeline was executed on deduplicated data with a fixed stratified train/test split (80% train, 20% held-out test).

### Core Baseline Metrics

| Metric | Cross-Validation (Train Split, 3-Fold) | Held-Out Test Split (N=34) |
|---|---|---|
| **Accuracy** | **84.85% (± 5.67%)** | **88.24%** (30 / 34 correct) |
| **Macro Precision** | — | **81.00%** |
| **Macro Recall** | — | **86.00%** |
| **Macro F1-Score** | — | **82.10%** |
| **Weighted F1-Score**| — | **85.01%** |

### Candidate Models Comparison (3-Fold Stratified CV on Training Set)

| Candidate Model | Mean CV Accuracy | Std Dev | Fold Scores |
|---|---|---|---|
| **LinearSVC (Champion)** | **84.85%** | **± 5.67%** | `[0.9091, 0.8636, 0.7727]` |
| **RandomForest** | 68.94% | ± 7.03% | `[0.7500, 0.7273, 0.5909]` |
| **MultinomialNB** | 64.39% | ± 7.50% | `[0.7273, 0.6591, 0.5455]` |
| **LogisticRegression** | 34.09% | ± 3.71% | `[0.3864, 0.2955, 0.3409]` |

---

## 2. Dataset & Split Methodology

1. **Raw Records:** 962 rows across 25 category classes.
2. **Deduplication:** Exactly 796 duplicate records (82.7%) were detected and removed, leaving **166 unique resumes**.
3. **Partitioning:**
   - **Training Set:** 132 resumes (80%), stratified by category.
   - **Held-Out Test Set:** 34 resumes (20%), strictly isolated from training and vectorizer fitting.
4. **Feature Extraction:**
   - Sublinear term frequency (`sublinear_tf=True`)
   - N-gram range: `(1, 2)` (unigrams and bigrams)
   - Max features: 5,000 vocabulary size
   - Stop words: English
   - Minimum Document Frequency: `min_df=1`, Maximum Document Frequency: `max_df=0.95`
   - **No Data Leakage:** Vectorizer fitted exclusively on $X_{\text{train}}$ and transformed on $X_{\text{test}}$.

---

## 3. Detailed Error Analysis of Baseline Misclassifications

The baseline LinearSVC misclassified **4 out of 34** held-out test samples:

```
┌──────────────┬──────────────────────┬──────────────────────┬──────────────────────────────────────────────┐
│ Sample Index │ True Category        │ Predicted Category   │ Primary Error Cause                          │
├──────────────┼──────────────────────┼──────────────────────┼──────────────────────────────────────────────┤
│ 1            │ Mechanical Engineer  │ Operations Manager   │ Heavy administrative & managerial vocabulary │
│ 6            │ PMO                  │ Business Analyst     │ Severe class rarity (only 3 samples total);  │
│              │                      │                      │ high vocabulary overlap with BA              │
│ 17           │ Web Designing        │ Java Developer       │ Academic BCA degree and Java mentions        │
│ 18           │ Testing              │ Automation Testing   │ Shared terms ('selenium', 'test framework')  │
└──────────────┴──────────────────────┴──────────────────────┴──────────────────────────────────────────────┘
```

---

## 4. Generated Artifacts & Deliverables

1. **`baseline_metrics.json`**: Complete machine-readable performance metrics, cross-validation results, and per-class precision, recall, and F1 scores.
2. **`baseline_predictions.csv`**: Record-level predictions on all 34 held-out test samples, with ground truth, predicted class, boolean accuracy, and text snippets.
3. **`baseline_confusion_matrix.png`**: High-resolution heatmap of the 25x25 category confusion matrix.
4. **`models/resume_classifier.joblib`**: Serialized LinearSVC champion model.
5. **`models/tfidf_vectorizer.joblib`**: Serialized scikit-learn TF-IDF vectorizer.
6. **`models/class_labels.joblib`**: Sorted 25 category labels array.

---

## 5. Transition to Phase 3 & 4

The baseline of **88.24% test accuracy (84.85% CV)** is solid, verified, and uninflated. In Phase 3 and Phase 4, we will:
1. Address the fine-grained confusion between closely related domains (e.g. *Testing* vs *Automation Testing*, *Web Designing* vs *Frontend/Java*).
2. Explore character-level n-grams and subword representations to better identify technical libraries and acronyms.
3. Systematically evaluate ensemble pipelines and regularized linear classifiers to push generalization toward the **95%** target.
