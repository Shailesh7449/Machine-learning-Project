"""
ResumeAI - Production Model Inference Engine
Provides high-performance, deterministic model inference for:
  1. Resume Category Classification (TF-IDF + RidgeClassifier / LinearSVC)
  2. Skill Extraction (TF-IDF + LogisticRegression)
Supports:
  - Persistent Daemon Mode (--daemon) via line-by-line stdin/stdout for sub-10ms response latency
  - Single-shot JSON via stdin (--json)
  - CLI argument mode (--task <task> --text <text>)
"""

import sys
import os
import re
import json
import argparse
import joblib
import numpy as np

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

_RESUME_VEC = None
_RESUME_CLF = None
_CLASS_LABELS = None
_SKILL_VEC = None
_SKILL_CLF = None

def clean_resume_text(text: str) -> str:
    """Standardizes and normalizes resume text for feature extraction (identical to training)."""
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

def load_resume_models():
    global _RESUME_VEC, _RESUME_CLF, _CLASS_LABELS
    if _RESUME_VEC is None or _RESUME_CLF is None:
        vec_path = os.path.join(MODELS_DIR, "tfidf_vectorizer.joblib")
        clf_path = os.path.join(MODELS_DIR, "resume_classifier.joblib")
        lbl_path = os.path.join(MODELS_DIR, "class_labels.joblib")
        
        _RESUME_VEC = joblib.load(vec_path)
        _RESUME_CLF = joblib.load(clf_path)
        _CLASS_LABELS = joblib.load(lbl_path) if os.path.exists(lbl_path) else _RESUME_CLF.classes_.tolist()
    return _RESUME_VEC, _RESUME_CLF, _CLASS_LABELS

def load_skill_models():
    global _SKILL_VEC, _SKILL_CLF
    if _SKILL_VEC is None or _SKILL_CLF is None:
        vec_path = os.path.join(MODELS_DIR, "skill_tfidf_vectorizer.joblib")
        clf_path = os.path.join(MODELS_DIR, "skill_classifier.joblib")
        
        _SKILL_VEC = joblib.load(vec_path)
        _SKILL_CLF = joblib.load(clf_path)
    return _SKILL_VEC, _SKILL_CLF

def classify_resume(text: str):
    if not text or not text.strip():
        return {
            "category": "Unknown",
            "confidence": 0.0,
            "topAlternatives": []
        }
    
    cleaned = clean_resume_text(text)
    if not cleaned:
        return {
            "category": "Unknown",
            "confidence": 0.0,
            "topAlternatives": []
        }
    
    vec, clf, classes = load_resume_models()
    X = vec.transform([cleaned])
    pred = clf.predict(X)[0]
    
    top_alternatives = []
    confidence = 0.85
    if hasattr(clf, "decision_function"):
        dec = clf.decision_function(X)[0]
        # Softmax approximation of decision scores for calibrated confidence ranking
        exp_dec = np.exp(dec - np.max(dec))
        probs = exp_dec / np.sum(exp_dec)
        
        top_indices = np.argsort(probs)[::-1][:4]
        confidence = float(probs[top_indices[0]])
        for idx in top_indices:
            top_alternatives.append({
                "category": clf.classes_[idx],
                "score": round(float(probs[idx]), 3)
            })
    else:
        top_alternatives.append({"category": pred, "score": 1.0})
        
    return {
        "category": pred,
        "confidence": round(confidence, 3),
        "topAlternatives": top_alternatives
    }

def extract_skills_ml(phrases: list[str], threshold: float = 0.5):
    if not phrases:
        return {"skills": [], "detailedSkills": []}
        
    vec, clf = load_skill_models()
    # Filter empty phrases
    clean_phrases = [p.strip() for p in phrases if p and p.strip() and len(p.strip()) > 1]
    if not clean_phrases:
        return {"skills": [], "detailedSkills": []}
        
    X = vec.transform(clean_phrases)
    probs = clf.predict_proba(X)[:, 1] if hasattr(clf, "predict_proba") else clf.predict(X)
    
    skills = []
    seen = set()
    for phrase, prob in zip(clean_phrases, probs):
        if prob >= threshold and phrase.lower() not in seen:
            skills.append({
                "name": phrase,
                "confidence": round(float(prob), 3)
            })
            seen.add(phrase.lower())
            
    # Sort descending by confidence
    skills.sort(key=lambda x: x["confidence"], reverse=True)
    return {
        "skills": [s["name"] for s in skills],
        "detailedSkills": skills
    }

def run_daemon():
    """Runs high-throughput line-by-line JSON stream for sub-10ms IPC latency."""
    # Warm-up model caches
    load_resume_models()
    load_skill_models()
    # Signal readiness to parent process
    sys.stdout.write(json.dumps({"status": "ready"}) + "\n")
    sys.stdout.flush()
    
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            task = req.get("task")
            if task == "classify_resume":
                result = classify_resume(req.get("text", ""))
            elif task == "extract_skills":
                result = extract_skills_ml(req.get("phrases", []))
            elif task == "ping":
                result = {"status": "pong"}
            else:
                result = {"error": f"Unknown task '{task}'"}
            sys.stdout.write(json.dumps(result) + "\n")
            sys.stdout.flush()
        except Exception as e:
            sys.stdout.write(json.dumps({"error": str(e)}) + "\n")
            sys.stdout.flush()

def main():
    parser = argparse.ArgumentParser(description="ResumeAI ML Inference")
    parser.add_argument("--task", choices=["classify_resume", "extract_skills"], help="Task to perform")
    parser.add_argument("--text", type=str, default="", help="Input text for classification")
    parser.add_argument("--json", action="store_true", help="Read JSON payload from stdin")
    parser.add_argument("--daemon", action="store_true", help="Run in continuous daemon mode via stdin/stdout")
    args = parser.parse_args()

    if args.daemon:
        run_daemon()
        return

    if args.json:
        raw_input = sys.stdin.read()
        try:
            payload = json.loads(raw_input)
            task = payload.get("task", args.task)
            if task == "classify_resume":
                result = classify_resume(payload.get("text", ""))
            elif task == "extract_skills":
                result = extract_skills_ml(payload.get("phrases", []))
            else:
                result = {"error": f"Unknown task '{task}'"}
            print(json.dumps(result))
            return
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)

    if args.task == "classify_resume":
        result = classify_resume(args.text)
        print(json.dumps(result))
    elif args.task == "extract_skills":
        phrases = args.text.split(",") if args.text else []
        result = extract_skills_ml(phrases)
        print(json.dumps(result))
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
