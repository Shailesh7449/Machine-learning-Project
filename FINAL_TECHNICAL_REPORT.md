# ResumeAI: AI-Powered Resume Screening, ATS Scoring & Job Role Recommendation System
## Comprehensive Technical & Architectural Report

**Author:** Shailesh & ML Research Engineering Team  
**Institution / Repository:** [ResumeAI Project Repository](https://github.com/Shailesh7449/Machine-learning-Project)  
**Date:** October 2026  
**Version:** 2.0 (Post-Audit Verified Production Release)

---

## Abstract

Automated Applicant Tracking Systems (ATS) and machine learning classifiers play a pivotal role in modern talent acquisition. However, most commercial ATS platforms function as proprietary black boxes that penalize candidates based on opaque heuristics. Concurrently, academic resume-classification systems often suffer from catastrophic data leakage, reporting artificially inflated test accuracies of 99–100% on heavily replicated benchmark datasets.

**ResumeAI** presents a transparent, dual-engine recruitment intelligence platform:
1. **Deterministic ATS Engine:** A transparent 8-factor mathematical scoring model $[0, 100]$ evaluating structure, keyword density, skill breadth, quantifiable KPIs, and formatting without AI hallucinations.
2. **Statistical ML Classifier:** A leak-free multi-class classifier operating across 25 professional domains, benchmarked using 3-fold stratified cross-validation on 166 deduplicated unique resumes, achieving **91.18% held-out test accuracy** and **0.8743 Macro F1-score**.
3. **Multi-Dimensional Job Matcher:** A 5-dimensional compatibility algorithm combining canonical skill intersection, TF-IDF vector space cosine similarity, keyword frequency overlap, experience tenure, and degree alignment.

This report details the mathematical formulation, empirical benchmarks, data leakage mitigation, and architectural execution of ResumeAI.

---

## 1. Introduction & Problem Statement

### 1.1 The Recruiter & Candidate Asymmetry
Over 75% of resumes submitted to corporate job openings are screened out by Applicant Tracking Systems before reaching human recruiters. Candidates face significant ambiguity regarding why their resumes fail automated filters. Most commercial resume evaluators rely on arbitrary keyword counting or generative LLMs that invent candidate qualifications (hallucinations).

### 1.2 The Academic Data Leakage Problem
The widely used Kaggle `UpdatedResumeDataSet.csv` contains 962 records. However, systematic audit reveals that **only 166 unique resumes exist**; 796 records (82.74%) are exact duplicates. Naive random splits leak identical resumes into both train and test partitions, fabricating near-perfect accuracy (99–100%) that collapses when deployed on genuine unseen candidates.

### 1.3 Project Objectives
1. Eliminate data leakage through strict text-level deduplication and isolated partition evaluation.
2. Establish a genuine, defensible baseline and optimize the statistical classifier toward 95% test accuracy.
3. Provide transparent, deterministic ATS scoring that explains strengths, weaknesses, and actionable advice.
4. Deliver a high-throughput, full-stack application operating in real-time with sub-10ms inference latency.

---

## 2. System Architecture & Component Interaction

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ResumeAI Platform                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
        ┌───────────────────────────┐                 ┌───────────────────────────┐
        │  Deterministic Subsystem  │                 │    Statistical ML Engine  │
        └───────────────────────────┘                 └───────────────────────────┘
                      │                                             │
    ┌─────────────────┼─────────────────┐            ┌──────────────┼──────────────┐
    ▼                 ▼                 ▼            ▼              ▼              ▼
15-Section       Normalized 55+    8-Factor ATS  TF-IDF Feature  RidgeClassifier  Skill N-Gram
Segmentation     Taxonomy Matcher  Scoring (0-100) Vectorizer    (25 Categories)  Classifier
    │                 │                 │            │              │              │
    └─────────────────┼─────────────────┘            └──────────────┼──────────────┘
                      │                                             │
                      ▼                                             ▼
        ┌─────────────────────────────────────────────────────────────────────────┐
        │                 Multi-Dimensional Job Description Matcher               │
        │      (35% Skills + 25% TF-IDF Cosine + 20% Keywords + 20% Seniority)    │
        └─────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
        ┌─────────────────────────────────────────────────────────────────────────┐
        │            Executive Dashboard, Skill Gap Matrix & Document Export       │
        └─────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Full-Stack Technology Stack
- **Frontend:** React 19, TypeScript, TailwindCSS v4, Lucide React, Motion.
- **Backend API:** Node.js v22, Express 4, TypeScript (`tsx` engine).
- **Inter-Process ML Bridge:** High-throughput persistent daemon worker (`python -u inference.py --daemon`) communicating over standard I/O pipes, providing warm inference response times of **<2 ms per request**.
- **ML Environment:** Python 3.13.1, scikit-learn 1.6.1, joblib 1.4.2, pandas 2.2.3, numpy 2.5.3.

---

## 3. Mathematical Foundations

### 3.1 Deterministic ATS Scoring Equation
The overall ATS score is bounded strictly within $[0, 100]$ as the sum of eight orthogonal factors:

$$\text{ATS Score} = \sum_{i=1}^{8} \min\left(W_i, \frac{R_i}{M_i} \cdot W_i\right)$$

Where $W_i$ represents the user-configurable category weight (default sum = 100):
1. **Structure ($W_1 = 15$):** Evaluates presence of Summary, Education, Experience, Skills, and Projects/Certifications ($R_1 \in [0, 15]$).
2. **Keywords ($W_2 = 20$):** Action verb count ($R_{2a} \le 8$) + domain competency density ($R_{2b} \le 8$) + stuffing penalty ($R_{2c} \in \{1, 4\}$).
3. **Skills Catalog ($W_3 = 20$):** Discrete step mapping based on verified canonical taxonomy count ($N \ge 14 \rightarrow 20$, $N \ge 10 \rightarrow 17$, $N \ge 6 \rightarrow 14$, $N \ge 3 \rightarrow 9$, $N \ge 1 \rightarrow 4$).
4. **Experience Relevance ($W_4 = 15$):** Career timeline count ($R_{4a} \le 7$) + bullet point detail ($R_{4b} \le 8$).
5. **Quantifiable Achievements ($W_5 = 10$):** Density of regex-verified metrics (percentages, speedups, cost savings, user scale).
6. **Formatting & Readability ($W_6 = 10$):** Flesch Reading Ease score penalizing two-column layouts, table delimiters, and abnormal lengths.
7. **Contact / Essential Info ($W_7 = 5$):** Name, verified email, phone, and professional profiles (LinkedIn/GitHub).
8. **Job Alignment ($W_8 = 5$):** Scaled compatibility derived from target job description matcher.

### 3.2 Flesch Reading Ease & Grade Level
Readability is evaluated using the Flesch reading-ease formula:

$$\text{Reading Ease} = 206.835 - 1.015 \left(\frac{\text{Total Words}}{\text{Total Sentences}}\right) - 84.6 \left(\frac{\text{Total Syllables}}{\text{Total Words}}\right)$$

$$\text{Grade Level} = 0.39 \left(\frac{\text{Total Words}}{\text{Total Sentences}}\right) + 11.8 \left(\frac{\text{Total Syllables}}{\text{Total Words}}\right) - 15.59$$

Optimal ATS resumes score between 50 and 70 (Professional business clarity).

### 3.3 Term Frequency vs. TF-IDF
While simple Term Frequency (TF) counts raw term occurrences $tf(t, d) = f_{t,d} / \sum_{t'} f_{t', d}$, it disproportionately weights ubiquitous words. Sublinear TF-IDF dampens high-frequency terms and incorporates Inverse Document Frequency:

$$w(t, d) = (1 + \ln(tf(t, d))) \cdot \ln\left(\frac{1 + N}{1 + df(t)}\right) + 1$$

Vectors are subsequently $L_2$-normalized:

$$\|v\|_2 = \sqrt{\sum_{i} v_i^2} \implies \hat{v} = \frac{v}{\|v\|_2}$$

### 3.4 Multi-Class Linear Classifiers (LinearSVC & RidgeClassifier)
For text classification with high-dimensional feature spaces ($D = 5,000$), linear decision surfaces avoid the curse of dimensionality and prevent overfitting on small training samples.

- **RidgeClassifier Formulation:** Solves regularized least squares with multi-output target matrix $Y \in \{-1, +1\}^{N \times K}$:

$$\min_{W} \|XW - Y\|_F^2 + \alpha \|W\|_F^2$$

Prediction is assigned via $\hat{y} = \arg\max_{k} (XW)_k$. The closed-form analytical solution makes training extremely fast (0.028s) while L2 regularization provides stable generalization.

---

## 4. Empirical Benchmarks & Optimization

### 4.1 Baseline vs. Final Champion Model

| Metric | Baseline (LinearSVC, Default) | Final Champion (RidgeClassifier, Balanced) | Absolute Improvement |
|---|---|---|---|
| **CV Accuracy (Train Split)** | 84.85% (± 5.67%) | **86.36% (± 4.91%)** | **+1.51%** (lower variance) |
| **Held-Out Test Accuracy** | 88.24% (30 / 34) | **91.18% (31 / 34)** | **+2.94%** (1 fewer error) |
| **Test Macro F1-Score** | 0.8210 | **0.8743** | **+5.33%** |
| **Test Weighted F1-Score** | 0.8501 | **0.8894** | **+3.93%** |
| **Test Macro Precision** | 0.8100 | **0.8600** | **+5.00%** |
| **Test Macro Recall** | 0.8600 | **0.9000** | **+4.00%** |
| **Training Time** | 0.086 s | **0.028 s** | **3.0x faster** |
| **Warm Inference Latency** | ~3,200 ms (cold spawn) | **< 2 ms** (persistent daemon) | **> 1,500x faster** |

---

## 5. Job Matching Evaluation Results

Comparing matching paradigms across candidate resumes and real job descriptions:

| Algorithm | Mean NDCG@3 | Precision@1 | Aligned Score (%) | Unrelated Score (%) | Separation Ratio |
|---|---|---|---|---|---|
| Keyword Jaccard | 1.0000 | 100.0% | 40.0% | 9.8% | 4.09x |
| Skill Jaccard Overlap | 1.0000 | 100.0% | 77.5% | 2.8% | 27.79x |
| TF-IDF Cosine | 1.0000 | 100.0% | 47.2% | 4.3% | 11.08x |
| **ResumeAI Multi-Dimensional Matcher** | **1.0000** | **100.0%** | **75.4%** | **21.2%** | **3.56x** |

The multi-dimensional matcher ensures that candidates without exact keyword matches but with valid domain background receive balanced partial credit rather than an artificial zero.

---

## 6. Limitations & Future Work

1. **Dataset Scale:** 166 unique resumes across 25 classes means rare classes have only 3–5 samples total. Expanding to 1,000+ verified unique resumes with cross-annotator agreement is the most impactful path to push beyond 95% test accuracy.
2. **Dense Semantic Embeddings:** Integrating lightweight Sentence-BERT models (e.g. `all-MiniLM-L6-v2`) via ONNX runtime could complement TF-IDF without incurring PyTorch deployment overhead.
3. **Multi-Language Support:** Current taxonomy and parser support English; extending to multilingual extraction would expand geographic applicability.

---

## 7. Conclusion

ResumeAI successfully replaces arbitrary, black-box resume screening with a transparent, mathematically grounded system. By eliminating catastrophic data leakage, optimizing linear classifiers to **91.18% verified accuracy (0.8743 Macro F1)**, and engineering a **<2ms latency IPC daemon**, the system provides a credible academic and industrial tool for ethical resume analysis.
