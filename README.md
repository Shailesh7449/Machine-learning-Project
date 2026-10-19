# ResumeAI — AI-Powered Resume Screening and Job Role Recommendation System

[![Live Demo](https://img.shields.io/badge/Demo-Live%20App-brightgreen)](https://resumeaicourseproject.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.13.1-blue.svg)](https://www.python.org/)
[![scikit--learn](https://img.shields.io/badge/scikit--learn-1.6.1-orange.svg)](https://scikit-learn.org/)
[![Node](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-36%20Passed-success)](test/pipeline.test.ts)

## 📌 Overview

**ResumeAI** is an industrial-grade, AI-powered resume screening, ATS compatibility scoring, and job role recommendation system. It combines statistical Machine Learning (scikit-learn Linear Support Vector Classification with sublinear TF-IDF vectorization), NLP skill taxonomy normalization, and transparent deterministic mathematical evaluation to bridge the gap between candidate resumes and job requirements.

---

## 🏛️ System Architecture

The system strictly decouples deterministic heuristic scoring from trained statistical machine learning:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             ResumeAI Architecture                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│   Statistical Machine Learning│             │   Deterministic NLP & Rules   │
│   (scikit-learn 1.6.1)        │             │   (TypeScript / Node.js)      │
├───────────────────────────────┤             ├───────────────────────────────┤
│ • Resume Category Classifier  │             │ • 15-Section Segmentation     │
│   (LinearSVC + TF-IDF)        │             │ • Skill Taxonomy (300+ canonical)
│   - 25 Professional Classes   │             │ • 8-Factor ATS Scoring Formula│
│   - 88.24% Held-Out Accuracy  │             │   (Mathematically bounded)    │
│ • Character N-Gram Skill Extr.│             │ • Cosine Job Description Match│
│ • IPC Subprocess Inference    │             │ • Flesch Readability & Metrics│
│   (inference.py --json)       │             │ • Skill Gap Identification    │
└───────────────────────────────┘             └───────────────────────────────┘
```

---

## 🔬 Machine Learning Pipeline & Academic Benchmarks

### 1. Dataset Audit & Data Leakage Resolution
- **Dataset**: `UpdatedResumeDataSet.csv` containing 962 candidate resumes across 25 professional categories (Data Science, Java Developer, DevOps Engineer, Python Developer, HR, Sales, etc.).
- **Data Leakage Resolution**: Repository audit revealed that 796 out of 962 raw records were duplicate resume texts (only 166 unique resumes). Naive train/test splitting caused severe data leakage. Our training pipeline (`train.py`) enforces strict deduplication prior to stratified 80/20 train/test splitting (132 training samples, 34 held-out test samples).

### 2. Model Selection & Cross-Validation
Evaluated candidate models using 3-Fold Stratified Cross-Validation strictly on the training split:

| Model Architecture | 3-Fold CV Mean Accuracy | Std Deviation | Status |
| :--- | :---: | :---: | :--- |
| **Multinomial Naive Bayes** | 64.39% | ±7.50% | Baseline |
| **Logistic Regression (L2)** | 34.09% | ±3.71% | Underfitted |
| **Random Forest (100 Trees)** | 68.94% | ±7.03% | Overfitted on small text samples |
| **LinearSVC (Champion)** | **84.85%** | **±5.67%** | **Selected Champion Model** |

### 3. Held-Out Test Evaluation (LinearSVC)
Evaluated on 34 unobserved, deduplicated test resumes:
- **Test Accuracy**: `88.24%` (`88.2%`)
- **Macro Precision**: `0.8100`
- **Macro Recall**: `0.8600`
- **Macro F1-Score**: `0.8210`
- **Weighted F1-Score**: `0.8501`

### 4. Model Artifacts (`models/`)
- `models/resume_classifier.joblib`: Trained scikit-learn 1.6.1 LinearSVC model.
- `models/tfidf_vectorizer.joblib`: Fitted sublinear TF-IDF vectorizer (max 5,000 features, ngram_range 1-2).
- `models/class_labels.joblib`: 25 professional class label mappings.
- `models/skill_classifier.joblib`: Trained character n-gram logistic regression classifier for boundary-resilient skill token recognition.
- `models/skill_tfidf_vectorizer.joblib`: Fitted character n-gram vectorizer (ngram_range 3-5).
- `models/metrics_report.json`: Serialized evaluation metrics and validation history.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS, Lucide React, Recharts
- **Backend**: Node.js, Express 4, TypeScript, tsx
- **Machine Learning**: Python 3.13, scikit-learn 1.6.1, pandas 2.2, numpy 2.5, joblib 1.4
- **Document Processing**: `pdf-parse`, `mammoth` (DOCX), sanitize-html, DOMPurify
- **Testing**: Node test runner with custom assertion harness (`tsx test/pipeline.test.ts`)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher (Python 3.13 recommended)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Shailesh7449/ResumeAI-Course-Project.git
cd ResumeAI-Course-Project

# Install frontend and backend npm packages
npm install

# Install required Python packages for ML pipeline
pip install scikit-learn==1.6.1 pandas numpy scipy joblib
```

### 3. Environment Variables
Create a `.env` file in the project root:
```env
PORT=3000
NODE_ENV=development
GEMINI_API_KEY="" # Optional: for AI Section Enhancer
GEMINI_MODEL="gemini-2.5-flash"
```

### 4. Train or Retrain the ML Pipeline
To retrain the ML classification and skill extraction models from scratch:
```bash
python train.py
```
This script will:
1. Load `data/UpdatedResumeDataSet.csv`
2. Deduplicate records to eliminate data leakage
3. Perform 3-Fold Stratified Cross-Validation across candidate models
4. Evaluate the champion LinearSVC on held-out test data
5. Train the character n-gram skill classifier
6. Serialize all artifacts to `models/` and emit `models/metrics_report.json`

### 5. Running the Application
Start the development server:
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 🧪 Automated Testing & Verification

The project includes an end-to-end automated test suite covering 36 assertions across 11 distinct suites:

```bash
npm test
```

### Test Suites Overview:
1. **Skill Taxonomy & Normalization Engine**: Verifies canonical mappings, aliases, acronyms, and empty inputs.
2. **Resume Parsing & 15-Section Segmentation**: Tests contact extraction, structured sectioning, and missing sections.
3. **ATS Scoring Engine Bounds**: Confirms strict [0, 100] mathematical bounds and prevents artificial inflation.
4. **Job Matching & Cosine Similarity**: Tests vector alignment and prevents unearned scores on 0-experience profiles.
5. **Job Role Recommender Engine**: Tests sorting order and verifies 0% match on zero-skill overlap.
6. **NLP Readability & Metrics Analysis**: Tests Flesch reading ease, action verb density, and keyword stuffing detection.
7. **Section-Specific Improvement Engine**: Tests rule-based action verb substitution and conciseness enhancements.
8. **Real Indian Job & Portal Discovery Engine**: Validates portal query generation (Naukri, LinkedIn, Indeed).
9. **Machine Learning Inference Engine**: Verifies Python child process IPC, LinearSVC classification, and skill predictions.
10. **Express Server API Endpoint Contract Tests**: Validates HTTP status codes, request schemas, and error responses.
11. **Document Extraction Robustness & Security**: Tests empty buffer rejection, non-extractable files, and path validation.

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint returning system status and enabled features |
| `GET` | `/api/academic/benchmarks` | Returns real ML model evaluation metrics and cross-validation comparisons |
| `GET` | `/api/samples` | Returns pre-configured resume and job description samples |
| `POST` | `/api/resume/analyze` | Accepts raw text or uploaded PDF/DOCX and performs full parsing, ATS scoring, and ML classification |
| `POST` | `/api/job/analyze` | Parses a job description and extracts required skills and experience levels |
| `POST` | `/api/skills/gap` | Compares resume skills against job requirements and computes skill gaps |
| `POST` | `/api/improve/section` | Generates section enhancements (conciseness, impact metrics, action verbs) |

---

## 🛡️ Security, Privacy & Fairness

1. **In-Memory File Processing**: Uploaded resumes are parsed in memory using ephemeral buffers; files are never stored or logged to disk.
2. **PII Sanitization**: Contact information is stripped before sending to external NLP endpoints.
3. **Deterministic ATS Scoring**: Scoring criteria are mathematically transparent and based strictly on technical competence, verifiable experience, quantifiable achievements, and readability. Demographics, gender, age, and nationality have zero weight in scoring or recommendations.
4. **No Artificial Inflation**: Mathematical clamps (`Math.max(20, ...)`, `Math.max(25, ...)`) have been completely removed. Completely unqualified resumes receive true 0% scores rather than artificially inflated passing marks.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
