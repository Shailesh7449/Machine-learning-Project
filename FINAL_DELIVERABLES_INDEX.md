# ResumeAI Master Deliverables & Artifact Index

**Project:** ResumeAI — AI-Powered Resume Screening, ATS Scoring, and Job Role Recommendation System  
**Audit & Engineering Completion Date:** October 2026  
**Repository:** [https://github.com/Shailesh7449/Machine-learning-Project](https://github.com/Shailesh7449/Machine-learning-Project)  

---

## 1. Documentation & Research Deliverables

| Deliverable File | Description & Scope |
|---|---|
| [PROJECT_AUDIT.md](file:///d:/BI/Machine-learning-Project/PROJECT_AUDIT.md) | Initial architectural audit, complete pipeline review, defect identification, and severity matrix. |
| [BASELINE_REPORT.md](file:///d:/BI/Machine-learning-Project/BASELINE_REPORT.md) | Reproducible baseline metrics report, candidate model cross-validation, and error breakdown. |
| [DATASET_AUDIT.md](file:///d:/BI/Machine-learning-Project/DATASET_AUDIT.md) | Mathematical analysis of dataset quality, discovery of 82.74% duplicate rate, and leakage prevention protocol. |
| [MODEL_EXPERIMENTS.md](file:///d:/BI/Machine-learning-Project/MODEL_EXPERIMENTS.md) | Detailed documentation of all 11 ML experiments, hyperparameter tuning, feature engineering, and champion selection. |
| [SKILL_EXTRACTION_EVALUATION.md](file:///d:/BI/Machine-learning-Project/SKILL_EXTRACTION_EVALUATION.md) | Empirical evaluation of 55+ skill taxonomy, substring collision defense (100% precision), and regex lookarounds. |
| [JOB_MATCHING_EVALUATION.md](file:///d:/BI/Machine-learning-Project/JOB_MATCHING_EVALUATION.md) | Benchmark comparison of Jaccard vs TF-IDF Cosine vs Multi-Dimensional Matcher (NDCG@3, Precision@1). |
| [FINAL_TECHNICAL_REPORT.md](file:///d:/BI/Machine-learning-Project/FINAL_TECHNICAL_REPORT.md) | Comprehensive engineering whitepaper detailing mathematical models, architecture, and empirical findings. |
| [BENCHMARK_REPORT.md](file:///d:/BI/Machine-learning-Project/BENCHMARK_REPORT.md) | Tabular master experiment comparison, fold-by-fold CV scores, and latency benchmarks. |
| [RESEARCH_GAP_ANALYSIS.md](file:///d:/BI/Machine-learning-Project/RESEARCH_GAP_ANALYSIS.md) | Comparative review against commercial ATS (Jobscan/Taleo) and academic Kaggle papers. |
| [FACULTY_QA.md](file:///d:/BI/Machine-learning-Project/FACULTY_QA.md) | Defense questions and definitive answers for university examination and technical review committees. |
| [DEMO_SCRIPT.md](file:///d:/BI/Machine-learning-Project/DEMO_SCRIPT.md) | Step-by-step speaker script for conducting a flawless 10-minute live demonstration. |
| [FINAL_DELIVERABLES_INDEX.md](file:///d:/BI/Machine-learning-Project/FINAL_DELIVERABLES_INDEX.md) | Centralized index of all code, data, models, and evaluation deliverables. |

---

## 2. Experimental Data & Metric Artifacts

| Artifact File | Format | Contents |
|---|---|---|
| [baseline_metrics.json](file:///d:/BI/Machine-learning-Project/baseline_metrics.json) | JSON | Machine-readable baseline metrics, CV fold scores, and per-class reports. |
| [baseline_predictions.csv](file:///d:/BI/Machine-learning-Project/baseline_predictions.csv) | CSV | Sample-by-sample predictions for all 34 held-out test samples under baseline. |
| [baseline_confusion_matrix.png](file:///d:/BI/Machine-learning-Project/baseline_confusion_matrix.png) | PNG | High-resolution 200 DPI blue heatmap of baseline 25-category confusion matrix. |
| [data_quality_report.json](file:///d:/BI/Machine-learning-Project/data_quality_report.json) | JSON | Quantitative audit data: duplicate replication counts, entropy, and length stats. |
| [model_comparison.csv](file:///d:/BI/Machine-learning-Project/model_comparison.csv) | CSV | Full comparison matrix of all 11 model configurations evaluated. |
| [per_class_metrics.csv](file:///d:/BI/Machine-learning-Project/per_class_metrics.csv) | CSV | Precision, Recall, and F1-score for each of the 25 classes under champion model. |
| [model_metrics.json](file:///d:/BI/Machine-learning-Project/model_metrics.json) | JSON | Complete metrics report for the champion RidgeClassifier pipeline. |
| [confusion_matrix.png](file:///d:/BI/Machine-learning-Project/confusion_matrix.png) | PNG | High-resolution 200 DPI green heatmap of champion 25-category confusion matrix. |
| [job_matching_results.csv](file:///d:/BI/Machine-learning-Project/job_matching_results.csv) | CSV | Evaluation matrix of 4 matching algorithms across paired test scenarios. |
| [evaluation/skill_extraction_results.json](file:///d:/BI/Machine-learning-Project/evaluation/skill_extraction_results.json) | JSON | Detailed token-level precision and recall metrics on skill extraction benchmark. |

---

## 3. Machine Learning Models & Serialized Artifacts

| Model File | Library | Size | Description |
|---|---|---|---|
| [models/resume_classifier.joblib](file:///d:/BI/Machine-learning-Project/models/resume_classifier.joblib) | scikit-learn 1.6.1 | ~200 KB | Serialized champion RidgeClassifier model (balanced class weights, $\alpha=0.8$). |
| [models/tfidf_vectorizer.joblib](file:///d:/BI/Machine-learning-Project/models/tfidf_vectorizer.joblib) | scikit-learn 1.6.1 | ~203 KB | Serialized Sublinear TF-IDF Vectorizer ($D=5,000$, n-grams 1–2). |
| [models/class_labels.joblib](file:///d:/BI/Machine-learning-Project/models/class_labels.joblib) | joblib | ~400 B | Serialized array of 25 sorted category labels. |
| [models/resume_classifier_pipeline.joblib](file:///d:/BI/Machine-learning-Project/models/resume_classifier_pipeline.joblib) | scikit-learn 1.6.1 | ~400 KB | Complete scikit-learn Pipeline combining TF-IDF and RidgeClassifier. |
| [models/skill_classifier.joblib](file:///d:/BI/Machine-learning-Project/models/skill_classifier.joblib) | scikit-learn 1.6.1 | ~10 KB | Serialized binary LogisticRegression skill/non-skill discriminator. |
| [models/skill_tfidf_vectorizer.joblib](file:///d:/BI/Machine-learning-Project/models/skill_tfidf_vectorizer.joblib) | scikit-learn 1.6.1 | ~20 KB | Serialized character-wb TF-IDF vectorizer for skill classification. |
| [models/metrics_report.json](file:///d:/BI/Machine-learning-Project/models/metrics_report.json) | JSON | Live metrics report consumed by the frontend Academic Benchmarks dashboard. |

---

## 4. Reproducible Source Code & Scripts

| Script / Source File | Language | Purpose |
|---|---|---|
| [train.py](file:///d:/BI/Machine-learning-Project/train.py) | Python 3.13 | Master training pipeline: cross-validates candidate models and serializes champion artifacts. |
| [inference.py](file:///d:/BI/Machine-learning-Project/inference.py) | Python 3.13 | High-throughput inference engine supporting persistent daemon mode (`--daemon`) and CLI (`--json`). |
| [scripts/generate_baseline.py](file:///d:/BI/Machine-learning-Project/scripts/generate_baseline.py) | Python 3.13 | Generates baseline metrics, predictions CSV, and confusion matrix image. |
| [scripts/audit_data_quality.py](file:///d:/BI/Machine-learning-Project/scripts/audit_data_quality.py) | Python 3.13 | Audits dataset duplicates, near-duplicates, class imbalance, and entropy. |
| [scripts/split_dataset.py](file:///d:/BI/Machine-learning-Project/scripts/split_dataset.py) | Python 3.13 | Produces reproducible, leak-free train and test split CSV files. |
| [scripts/run_experiments.py](file:///d:/BI/Machine-learning-Project/scripts/run_experiments.py) | Python 3.13 | Executes the 11 candidate model experiment suite and generates comparison tables. |
| [scripts/evaluate_skill_extraction.py](file:///d:/BI/Machine-learning-Project/scripts/evaluate_skill_extraction.py) | Python 3.13 | Evaluates skill extraction precision, recall, and substring collision defense. |
| [scripts/evaluate_job_matcher.py](file:///d:/BI/Machine-learning-Project/scripts/evaluate_job_matcher.py) | Python 3.13 | Benchmarks ranking fidelity (NDCG@3, P@1) across 4 matching paradigms. |
| [server/mlService.ts](file:///d:/BI/Machine-learning-Project/server/mlService.ts) | TypeScript | Full-stack ML integration service with persistent IPC daemon (<2ms latency). |
| [server/atsScorer.ts](file:///d:/BI/Machine-learning-Project/server/atsScorer.ts) | TypeScript | Deterministic 8-factor mathematical ATS scoring engine. |
| [server/parser.ts](file:///d:/BI/Machine-learning-Project/server/parser.ts) | TypeScript | 15-section canonical resume parser and PDF/DOCX extractor. |
| [server/taxonomy.ts](file:///d:/BI/Machine-learning-Project/server/taxonomy.ts) | TypeScript | Curated 55+ entity normalized skill taxonomy. |
| [server/jobMatcher.ts](file:///d:/BI/Machine-learning-Project/server/jobMatcher.ts) | TypeScript | Multi-dimensional 5-factor job description compatibility matcher. |
| [test/pipeline.test.ts](file:///d:/BI/Machine-learning-Project/test/pipeline.test.ts) | TypeScript | Master automated test suite containing 41 comprehensive tests across 12 suites. |
