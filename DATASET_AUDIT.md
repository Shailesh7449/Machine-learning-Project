# ResumeAI Dataset Quality & Data Leakage Audit

**Dataset:** `data/UpdatedResumeDataSet.csv`  
**Auditor:** Senior ML Engineer & Data Quality Specialist  
**Status:** Audit Completed — Reproducible Split Established

---

## 1. Executive Summary & Verification of the Duplication Phenomenon

A rigorous data quality analysis was performed on `UpdatedResumeDataSet.csv`. The investigation verified that:
- **Total Raw Records:** 962 records
- **Unique Resume Texts:** **166 records**
- **Exact Duplicates:** **796 records (82.74% redundancy rate)**
- **Replication Distribution:** Each unique resume is replicated between 1 and 18 times (Mean = 5.8, Median = 6.0).
- **Label Consistency:** 100% consistent across duplicates (no identical text is tagged with conflicting labels).

### The Critical Data Leakage Hazard
In standard naive train/test splits (e.g. `train_test_split(df, test_size=0.2)` on the raw 962 records), **approximately 83% of the samples in the test split are exact duplicates of samples in the training split**. This creates catastrophic data leakage, allowing unregularized models or simple nearest-neighbor memorization to score 99–100% test accuracy while failing completely on genuine unseen resumes.

To ensure academic and industry validity, all training and evaluation in ResumeAI is conducted on **deduplicated data**, with vectorizers and scalers fitted **strictly on the training split**.

---

## 2. Statistical Characterization of Unique Resumes

| Characteristic | Measurement | Notes |
|---|---|---|
| **Unique Records** | 166 | Retained after text normalization and duplicate suppression |
| **Number of Classes** | 25 | Professional technology & business disciplines |
| **Imbalance Ratio** | 4.33 : 1 | Max class: *Java Developer* (13); Min class: *PMO* (3) |
| **Normalized Shannon Entropy** | 0.9816 | Indicates balanced dispersion across the 25 classes |
| **Word Count (Mean ± Std)** | 407.3 ± 361.8 | Range: 19 to 2,062 words (Median: 320.0) |
| **Character Count (Mean ± Std)** | 2,793.5 ± 2,494.0 | Range: 122 to 13,901 characters (Median: 2,194.0) |
| **Near-Duplicates ($J \ge 0.80$)** | 0 pairs | Zero near-duplicate templates detected among the 166 unique samples |

---

## 3. Class Distribution Comparison

```
Category                    Raw Count   Unique Deduplicated Count   Replication Factor
──────────────────────────────────────────────────────────────────────────────────────
Java Developer                 84                  13                      6.46x
Database                       33                  11                      3.00x
Advocate                       20                  10                      2.00x
HR                             44                  10                      4.40x
Data Science                   40                  10                      4.00x
Automation Testing             26                   7                      3.71x
DevOps Engineer                55                   7                      7.86x
Testing                        70                   7                     10.00x
DotNet Developer               28                   7                      4.00x
Hadoop                         42                   7                      6.00x
SAP Developer                  24                   6                      4.00x
Python Developer               48                   6                      8.00x
Health and fitness             30                   6                      5.00x
Civil Engineer                 24                   6                      4.00x
Arts                           36                   6                      6.00x
Business Analyst               28                   6                      4.67x
Sales                          40                   5                      8.00x
Blockchain                     40                   5                      8.00x
Mechanical Engineer            40                   5                      8.00x
ETL Developer                  40                   5                      8.00x
Electrical Engineering         30                   5                      6.00x
Network Security Engineer      25                   5                      5.00x
Web Designing                  45                   4                     11.25x
Operations Manager             40                   4                     10.00x
PMO                            30                   3                     10.00x
──────────────────────────────────────────────────────────────────────────────────────
Total                         962                 166                      5.80x
```

---

## 4. Reproducible Leak-Free Partitioning

A deterministic split script (`scripts/split_dataset.py`) generates two isolated subsets:
1. `data/train_dedup.csv`: **132 samples (79.5%)**, stratified by class.
2. `data/test_dedup.csv`: **34 samples (20.5%)**, stratified by class.

### Partitioning Invariants
- **Random Seed:** Fixed at `42`.
- **Stratification:** Guaranteed representation for all 25 categories in both train and test splits (least populated classes with 3 samples have 2 in train, 1 in test).
- **Isolation:** $X_{\text{train}} \cap X_{\text{test}} = \emptyset$.
- **Transformation Integrity:** All feature extraction pipelines (vocabulary construction, IDF weighting, feature selection) are fitted solely on $X_{\text{train}}$.

---

## 5. Artifacts Produced
- `data_quality_report.json`: Full statistical summary including entropy, length distributions, and duplicate replication parameters.
- `data/train_dedup.csv`: Isolated training set.
- `data/test_dedup.csv`: Isolated held-out test set.
- `scripts/split_dataset.py`: Reproducible generation script.
