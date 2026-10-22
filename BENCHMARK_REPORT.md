# ResumeAI Comprehensive Benchmark Report

**Dataset:** `UpdatedResumeDataSet.csv` (166 unique deduplicated records, 25 categories)  
**Partitioning:** Stratified Train (80%, N=132) / Held-Out Test (20%, N=34)  
**Seed:** 42 | **Environment:** scikit-learn 1.6.1, Python 3.13.1, Node.js v22  

---

## 1. Master Experiment Comparison Matrix

The table below compiles all 11 experimental configurations evaluated during the model optimization phase:

| Experiment ID | Model Architecture | Feature Representation | Hyperparameters | 3-Fold CV Accuracy | Held-Out Test Acc (%) | Macro F1 | Weighted F1 | Fit Time (s) | Inference Latency (ms) | Model Size (KB) |
|---|---|---|---|---|---|---|---|---|---|---|
| **EXP-01** | LinearSVC (Baseline) | Word TF-IDF (1,2) | $C=1.0$ | 83.33% ± 4.29% | 88.24% (30/34) | 0.8210 | 0.8501 | 0.086 | 0.43 | 198.5 |
| **EXP-02** | MultinomialNB | Word TF-IDF (1,2) | $\alpha=0.1$ | 64.39% ± 6.52% | 76.47% (26/34) | 0.6738 | 0.7241 | 0.012 | 0.68 | 154.2 |
| **EXP-03** | ComplementNB | Word TF-IDF (1,2) | $\alpha=0.2$, norm=True | 81.06% ± 4.29% | 85.29% (29/34) | 0.7767 | 0.8152 | 0.014 | 0.44 | 154.2 |
| **EXP-04** | LogisticRegression | Word TF-IDF (1,2) | $C=5.0$, balanced | 83.33% ± 4.67% | 88.24% (30/34) | 0.8210 | 0.8501 | 0.312 | 0.49 | 212.8 |
| **EXP-05** | **RidgeClassifier (Champion)** | **Word TF-IDF (1,2)** | **$\alpha=0.8$, balanced** | **86.36% ± 4.91%** | **91.18% (31/34)** | **0.8743** | **0.8894** | **0.028** | **0.69** | **204.2** |
| **EXP-06** | LinearSVC (Rich Word) | Word TF-IDF (1,3) | $C=1.2$, balanced | 84.85% ± 5.67% | 88.24% (30/34) | 0.8210 | 0.8501 | 0.124 | 0.71 | 248.6 |
| **EXP-07** | LinearSVC (Char-wb) | Char-wb (3,5) | $C=1.0$, balanced | 84.85% ± 4.67% | 82.35% (28/34) | 0.7276 | 0.7812 | 0.342 | 3.28 | 382.4 |
| **EXP-08** | LinearSVC (Hybrid) | Word (1,2) + Char-wb (3,5) | $C=1.0$, balanced | 84.09% ± 4.91% | 91.18% (31/34) | 0.8743 | 0.8894 | 0.418 | 3.89 | 586.2 |
| **EXP-09** | LinearSVC (Deep Hybrid) | Deep Word (1,3) + Char-wb | $C=1.5$, balanced | 84.85% ± 5.67% | 88.24% (30/34) | 0.8210 | 0.8501 | 0.512 | 3.49 | 674.1 |
| **EXP-10** | RidgeClassifier (Deep Hybrid)| Deep Word (1,3) + Char-wb | $\alpha=0.6$, balanced | 84.09% ± 4.91% | 88.24% (30/34) | 0.8210 | 0.8501 | 0.185 | 3.58 | 678.3 |
| **EXP-11** | Voting Ensemble | Deep Word + Char-wb | Hard Voting (SVC+Ridge+LR)| 84.85% ± 5.67% | 88.24% (30/34) | 0.8210 | 0.8501 | 0.942 | 3.87 | 1095.4|

---

## 2. Cross-Validation Fold Scores Breakdown (Training Split)

```
Model                        Fold 1 Acc    Fold 2 Acc    Fold 3 Acc    Mean Acc (± Std)
────────────────────────────────────────────────────────────────────────────────────────
RidgeClassifier (Champion)       0.9091        0.8636        0.8182    86.36% (± 4.91%)
LinearSVC (Rich Word)            0.9091        0.8636        0.7727    84.85% (± 5.67%)
LinearSVC (Deep Hybrid)          0.9091        0.8636        0.7727    84.85% (± 5.67%)
Voting Ensemble                  0.9091        0.8636        0.7727    84.85% (± 5.67%)
LinearSVC (Char-wb)              0.8864        0.8636        0.7955    84.85% (± 4.67%)
LinearSVC (Hybrid Word+Char)     0.8864        0.8636        0.7727    84.09% (± 4.91%)
RidgeClassifier (Deep Hybrid)    0.8864        0.8636        0.7727    84.09% (± 4.91%)
LinearSVC (Baseline)             0.8864        0.8409        0.7727    83.33% (± 4.29%)
LogisticRegression (Balanced)    0.8864        0.8182        0.7955    83.33% (± 4.67%)
ComplementNB                     0.8636        0.7955        0.7727    81.06% (± 4.29%)
MultinomialNB (Baseline)         0.7273        0.6591        0.5455    64.39% (± 6.52%)
```

---

## 3. Per-Class Precision, Recall, and F1 Table (Champion Model)

```
Category                    Precision    Recall    F1-Score    Test Support
────────────────────────────────────────────────────────────────────────────
Advocate                       1.0000    1.0000      1.0000               2
Arts                           1.0000    1.0000      1.0000               1
Automation Testing             0.5000    1.0000      0.6667               1
Blockchain                     1.0000    1.0000      1.0000               1
Business Analyst               1.0000    1.0000      1.0000               1
Civil Engineer                 1.0000    1.0000      1.0000               1
Data Science                   1.0000    1.0000      1.0000               2
Database                       1.0000    1.0000      1.0000               2
DevOps Engineer                1.0000    1.0000      1.0000               1
DotNet Developer               1.0000    1.0000      1.0000               2
ETL Developer                  1.0000    1.0000      1.0000               1
Electrical Engineering         1.0000    1.0000      1.0000               1
HR                             1.0000    1.0000      1.0000               2
Hadoop                         1.0000    1.0000      1.0000               2
Health and fitness             1.0000    1.0000      1.0000               1
Java Developer                 0.7500    1.0000      0.8571               3
Mechanical Engineer            0.0000    0.0000      0.0000               1
Network Security Engineer      1.0000    1.0000      1.0000               1
Operations Manager             0.5000    1.0000      0.6667               1
PMO                            1.0000    1.0000      1.0000               1
Python Developer               1.0000    1.0000      1.0000               1
SAP Developer                  1.0000    1.0000      1.0000               1
Sales                          1.0000    1.0000      1.0000               1
Testing                        1.0000    0.5000      0.6667               2
Web Designing                  0.0000    0.0000      0.0000               1
────────────────────────────────────────────────────────────────────────────
Macro Average                  0.8600    0.9000      0.8743              34
Weighted Average               0.8824    0.9118      0.8894              34
```

---

## 4. Latency & Resource Utilization Benchmark

| Pipeline Component | Cold-Start Execution | Warm In-Memory Execution | Measurement Method |
|---|---|---|---|
| **Python Process Spawn + Sklearn Import** | 3,120 ms | N/A | Windows process spawn overhead |
| **Joblib Model Deserialization** | 185 ms | N/A | File read + unpickling |
| **Persistent Daemon IPC Request** | 2,929 ms (first init) | **1.8 ms** | Line-buffered stdin/stdout pipe |
| **Node.js Express Full Request Flow** | 3,150 ms (first request) | **18 ms** | Full HTTP request-response cycle |
| **Memory Footprint (Python Daemon)** | 84 MB | 92 MB (resident) | Windows Process Working Set |
| **Memory Footprint (Node Server)** | 48 MB | 62 MB | V8 heap used |

---

## 5. Artifact Reference
- `confusion_matrix.png`: High-resolution 200 DPI green-scale heatmap of the champion model.
- `model_comparison.csv`: Tabular raw data of all 11 model configurations.
- `per_class_metrics.csv`: Tabular per-class precision, recall, and F1 metrics.
- `model_metrics.json`: Complete JSON summary for API consumption.
