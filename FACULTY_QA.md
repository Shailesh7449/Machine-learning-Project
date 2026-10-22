# ResumeAI Faculty Review & Defense Q&A Master Guide

**Target Audience:** University Examination Committee, Capstone Reviewers, Senior ML Auditors  
**Project:** ResumeAI — AI-Powered Resume Screening & Role Recommendation System  
**Date:** October 2026  

---

### Question 1: "Many published papers and GitHub projects claim 99% or 100% accuracy on this dataset. Why does your model report 91.18%?"

**Definitive Answer:**
> "Those 99% claims are the result of **catastrophic data leakage**.
> 
> When we audited `UpdatedResumeDataSet.csv`, we discovered that while the dataset contains 962 rows, **there are only 166 unique resumes**. 796 rows (82.74%) are exact duplicates repeated 4 to 18 times.
>
> When naive researchers execute a standard random train/test split on the raw 962 records, approximately 83% of the samples in the test split are exact duplicates of training samples. The model is merely memorizing and retrieving exact strings, not learning to generalize.
>
> In ResumeAI, we eliminated all duplicate records prior to splitting, strictly isolated the training and test sets ($N=132$ train, $N=34$ held-out test), and fitted all vectorizers solely on training data. Our **91.18% test accuracy (0.8743 Macro F1)** is a genuine, uninflated, scientifically defensible result."

---

### Question 2: "Why did you select LinearSVC and RidgeClassifier over Deep Learning or Large Language Models like BERT?"

**Definitive Answer:**
> "There are three primary scientific and engineering justifications:
> 
> 1. **Sample Size vs. Parameter Dimensionality:** Our deduplicated dataset contains 132 training samples across 25 categories. Deep neural networks like BERT have 110M+ parameters and require thousands of samples per class to avoid severe overfitting. Conversely, linear models (LinearSVC and RidgeClassifier) paired with TF-IDF features ($D = 5,000$) operate in a convex optimization regime where closed-form L2 regularization prevents overfitting on small corpora.
> 2. **Inference Latency & Production Efficiency:** RidgeClassifier evaluates in **0.69 ms per sample**, and our warm Python daemon handles requests in **< 2 ms**. In contrast, a local transformer like BERT requires 250–500 ms per sample on CPU and requires gigabytes of PyTorch dependencies.
> 3. **Mathematical Simplicity:** Linear decision surfaces provide transparent feature weight inspectability; each coefficient directly reflects how strongly a term (e.g. `'kubernetes'`, `'spring boot'`) pushes the resume toward a category."

---

### Question 3: "What is the difference between your ATS Score and your ML Category Classifier?"

**Definitive Answer:**
> "They solve two completely different problems:
>
> - **The Statistical ML Classifier** is a predictive model that answers: *'Which of the 25 professional job domains does this resume belong to?'* (e.g. Python Developer vs. DevOps Engineer). It outputs category probabilities and alternative rankings.
> - **The Deterministic ATS Scorer** is an objective, mathematical compliance auditor that answers: *'How well does this resume follow industry-standard ATS parsing rules?'* It evaluates 8 structural and stylistic factors on a strict $[0, 100]$ scale (presence of canonical sections, quantifiable metric density, active verbs, readability index, and formatting flags).
>
> We purposely do not use an opaque ML model for ATS scoring because candidates deserve 100% explainable, deterministic feedback on why their score is what it is."

---

### Question 4: "Why use sublinear TF-IDF instead of simple Term Frequency (TF)?"

**Definitive Answer:**
> "Simple term frequency assumes term importance scales linearly with repetition count: a word appearing 10 times is considered 10 times as important as a word appearing once. In resumes, this rewards unnatural repetition and keyword stuffing.
>
> Sublinear term frequency applies logarithmic dampening:
> $$tf_{\text{sublinear}} = 1 + \ln(tf) \quad (\text{for } tf > 0)$$
> This recognizes that the second or fifth occurrence of a skill like `'Python'` adds marginal informational value compared to the first.
>
> Furthermore, multiplying by the Inverse Document Frequency $\ln((1+N)/(1+df))$ downweights ubiquitous terms common to all resumes (like `'project'`, `'team'`, `'experience'`) while highlighting distinctive domain competencies (like `'kubernetes'`, `'pytorch'`, `'solidity'`)."

---

### Question 5: "How do you prevent false positive substring collisions in skill extraction (e.g., 'trust' matching 'Rust' or 'cat' matching 'C')?"

**Definitive Answer:**
> "We implement a 3-tier defense:
>
> 1. **Word-Boundary Regex with Symbol Whitelist:** We match aliases using `(?:^|[^a-z0-9#+.])alias(?:$|[^a-z0-9#+.]|\s)`. Characters `#`, `+`, `.`, and `-` are explicitly treated as token constituents, which preserves `C++`, `C#`, `.NET`, `Node.js`, `Next.js`, and `Vue.js`.
> 2. **Compound Single-Letter Aliases:** Single-letter languages like `C` and `R` never match lone letters. They are strictly restricted to compound aliases like `'c language'`, `'ansi c'`, `'r programming'`, and `'r language'`.
> 3. **Canonical Normalization:** Aliases like `'k8s'` and `'amazon web services'` are mapped to canonical entities (`'Kubernetes'`, `'AWS'`), eliminating duplication."

---

### Question 6: "Why is Accuracy an insufficient metric, and why do you emphasize Macro F1?"

**Definitive Answer:**
> "In an imbalanced multi-class dataset, standard accuracy is dominated by the majority classes. For example, if a majority class has 13 samples and a rare class (like `PMO`) has only 3 samples, a model that completely ignores `PMO` can still achieve high overall accuracy.
>
> **Macro F1** computes the unweighted mean of F1-scores across all 25 classes:
> $$\text{Macro F1} = \frac{1}{K} \sum_{k=1}^{K} F1_k$$
> This gives equal weight to every single professional category, penalizing models that sacrifice rare classes. In our experiments, our champion RidgeClassifier achieved a **Macro F1 of 0.8743**, proving that it classifies rare classes (like PMO, Sales, and Civil Engineering) with high precision and recall."

---

### Question 7: "How is your Job Description Matching Score calculated?"

**Definitive Answer:**
> "Rather than relying solely on lexical keyword matching or an uncalibrated LLM opinion, ResumeAI calculates a multi-dimensional weighted score $[0, 100]$:
>
> $$\text{Match Score} = 0.35 \cdot S_{\text{skills}} + 0.25 \cdot S_{\text{tfidf\_cosine}} + 0.20 \cdot S_{\text{keywords}} + 0.10 \cdot S_{\text{experience}} + 0.10 \cdot S_{\text{education}}$$
>
> 1. **$S_{\text{skills}}$ (35%):** Normalized canonical skill overlap, granting partial credit for same-domain competencies.
> 2. **$S_{\text{tfidf\_cosine}}$ (25%):** Cosine angle between sublinear TF-IDF vectors in high-dimensional term space.
> 3. **$S_{\text{keywords}}$ (20%):** Overlap of non-stopword domain terminology.
> 4. **$S_{\text{experience}}$ (10%):** Tenure matching candidate verified years against JD requirements.
> 5. **$S_{\text{education}}$ (10%):** Degree qualification verification (Bachelor's, Master's, PhD).
>
> In benchmark evaluations, this multi-dimensional approach achieved **100% Precision@1** and a **3.56x contrastive separation** between aligned and cross-domain roles."

---

### Question 8: "How does the Node.js backend communicate with the Python ML model without incurring 3-second cold-start delays?"

**Definitive Answer:**
> "In initial testing, calling `child_process.execFile('python', ['inference.py'])` on every HTTP request required ~3.2 seconds because Windows has to spawn a new Python process, import large scientific packages (`sklearn`, `joblib`, `numpy`), and deserialize model files from disk.
>
> We re-architected this into a **high-throughput persistent daemon worker**:
> - Node.js spawns `python -u inference.py --daemon` once on startup with standard I/O pipes.
> - Python pre-loads all models into memory during boot and signals readiness.
> - When an API request arrives, Node writes a single line of JSON to `stdin`. Python processes it in memory and immediately flushes a single JSON line to `stdout`.
> - This reduced warm inference latency from **3,200 ms to < 2 ms**—a **1,500x acceleration**."

---

### Question 9: "What are the ethical safeguards against AI hallucinations in ResumeAI?"

**Definitive Answer:**
> "Generative AI systems (like ChatGPT) frequently hallucinate accomplishments that candidates never achieved (e.g. fabricating imaginary metrics or skills).
>
> In ResumeAI:
> 1. **Zero Hallucination Scoring:** The ATS score and Job Match score are computed purely by deterministic mathematical equations. No LLM touches the scoring pipeline.
> 2. **Constrained Suggestions:** If AI bullet-point rewrites are enabled via Gemini, the model is strictly constrained by prompt engineering to restructure existing user bullets using the XYZ formula (*Accomplished [X], as measured by [Y], by doing [Z]*), with explicit instructions never to invent unverified metrics, tools, or employment history."

---

### Question 10: "What are the remaining limitations of the system, and what would you do with additional resources?"

**Definitive Answer:**
> "The primary limitation is the total size of public deduplicated resume datasets: 166 unique samples across 25 classes is a modest sample size.
>
> With additional resources, we would:
> 1. Partner with universities and industry recruiters to compile an anonymized, open-source dataset of 1,000+ deduplicated resumes with multi-annotator ground truth labels.
> 2. Export lightweight Sentence-BERT embeddings into ONNX format for browser-side or local CPU execution.
> 3. Expand the taxonomy to multi-lingual resume parsing for global candidates."
