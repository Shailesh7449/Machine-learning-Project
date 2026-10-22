"""
Comprehensive Data Quality & Leakage Audit Script for ResumeAI
Analyzes UpdatedResumeDataSet.csv:
  - Exact duplicates and replication factor
  - Near-duplicates via pairwise Jaccard similarity
  - Label consistency across identical / near-identical samples
  - Class distribution and imbalance ratios
  - Document length statistics
  - Generates data_quality_report.json
"""

import os
import re
import json
import numpy as np
import pandas as pd
from itertools import combinations

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    text = re.sub(r'\S+@\S+', ' ', text)
    text = re.sub(r'\+?\d[\d -]{8,}\d', ' ', text)
    text = re.sub(r'[^a-zA-Z0-9+#.-]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text

def compute_jaccard(tokens1: set, tokens2: set) -> float:
    if not tokens1 or not tokens2:
        return 0.0
    inter = len(tokens1.intersection(tokens2))
    union = len(tokens1.union(tokens2))
    return inter / union if union > 0 else 0.0

def main():
    data_path = "data/UpdatedResumeDataSet.csv"
    print(f"[*] Auditing dataset: {data_path}")
    df = pd.read_csv(data_path)
    total_raw = len(df)
    
    # 1. Clean and check nulls
    null_counts = df.isnull().sum().to_dict()
    df['Clean_Resume'] = df['Resume'].apply(clean_text)
    df['Category'] = df['Category'].str.strip()
    
    # 2. Exact Duplicates Analysis
    unique_resumes = df['Clean_Resume'].nunique()
    exact_duplicates = total_raw - unique_resumes
    duplication_rate = (exact_duplicates / total_raw) * 100
    
    # Check if identical resumes have conflicting labels
    resume_groups = df.groupby('Clean_Resume')['Category'].nunique()
    conflicting_labels_count = int((resume_groups > 1).sum())
    
    # Duplication frequency distribution
    dup_counts = df.groupby('Clean_Resume').size()
    duplication_distribution = {
        "min_replications": int(dup_counts.min()),
        "max_replications": int(dup_counts.max()),
        "mean_replications": round(float(dup_counts.mean()), 2),
        "median_replications": float(dup_counts.median())
    }
    
    # 3. Deduplicate dataset for distinct analysis
    df_dedup = df.drop_duplicates(subset=['Clean_Resume']).reset_index(drop=True)
    dedup_count = len(df_dedup)
    
    # 4. Class Distribution & Imbalance
    class_counts_raw = df['Category'].value_counts().to_dict()
    class_counts_dedup = df_dedup['Category'].value_counts().to_dict()
    
    counts_array = list(class_counts_dedup.values())
    max_class_count = max(counts_array)
    min_class_count = min(counts_array)
    imbalance_ratio = round(max_class_count / min_class_count, 2)
    
    # Shannon Entropy for class balance (normalized: 1.0 = perfectly balanced)
    probs = np.array(counts_array) / sum(counts_array)
    shannon_entropy = -np.sum(probs * np.log2(probs))
    max_entropy = np.log2(len(counts_array))
    entropy_balance_ratio = round(float(shannon_entropy / max_entropy), 4)
    
    # 5. Near-Duplicate Detection (> 0.85 Jaccard similarity across unique resumes)
    token_sets = [set(r.split()) for r in df_dedup['Clean_Resume']]
    near_duplicate_pairs = []
    
    for i, j in combinations(range(dedup_count), 2):
        sim = compute_jaccard(token_sets[i], token_sets[j])
        if sim >= 0.80:
            near_duplicate_pairs.append({
                "sample_a_index": i,
                "sample_b_index": j,
                "category_a": df_dedup.loc[i, 'Category'],
                "category_b": df_dedup.loc[j, 'Category'],
                "jaccard_similarity": round(float(sim), 4),
                "same_category": df_dedup.loc[i, 'Category'] == df_dedup.loc[j, 'Category']
            })
            
    print(f"[*] Found {len(near_duplicate_pairs)} near-duplicate resume pairs (Jaccard >= 0.80).")
    
    # 6. Text Length & Vocabulary Statistics
    word_lengths = [len(r.split()) for r in df_dedup['Clean_Resume']]
    char_lengths = [len(r) for r in df_dedup['Clean_Resume']]
    
    length_stats = {
        "words": {
            "min": int(np.min(word_lengths)),
            "max": int(np.max(word_lengths)),
            "mean": round(float(np.mean(word_lengths)), 1),
            "median": float(np.median(word_lengths)),
            "std": round(float(np.std(word_lengths)), 1)
        },
        "characters": {
            "min": int(np.min(char_lengths)),
            "max": int(np.max(char_lengths)),
            "mean": round(float(np.mean(char_lengths)), 1),
            "median": float(np.median(char_lengths)),
            "std": round(float(np.std(char_lengths)), 1)
        }
    }
    
    report = {
        "dataset_metadata": {
            "filepath": data_path,
            "total_raw_records": total_raw,
            "deduplicated_unique_records": dedup_count,
            "duplicate_records_removed": exact_duplicates,
            "duplication_rate_percent": round(duplication_rate, 2),
            "conflicting_labels_count": conflicting_labels_count,
            "null_values": null_counts,
            "num_categories": len(class_counts_dedup)
        },
        "duplication_distribution": duplication_distribution,
        "class_balance_analysis": {
            "imbalance_ratio": imbalance_ratio,
            "max_class": {"category": max(class_counts_dedup, key=class_counts_dedup.get), "count": max_class_count},
            "min_class": {"category": min(class_counts_dedup, key=class_counts_dedup.get), "count": min_class_count},
            "shannon_entropy_ratio": entropy_balance_ratio,
            "class_distribution_raw": class_counts_raw,
            "class_distribution_dedup": class_counts_dedup
        },
        "near_duplicate_analysis": {
            "similarity_threshold": 0.80,
            "total_near_duplicate_pairs": len(near_duplicate_pairs),
            "cross_category_near_duplicates": [p for p in near_duplicate_pairs if not p["same_category"]],
            "same_category_near_duplicates": [p for p in near_duplicate_pairs if p["same_category"]]
        },
        "document_length_statistics": length_stats
    }
    
    with open("data_quality_report.json", "w") as f:
        json.dump(report, f, indent=2)
    print("[*] Successfully generated data_quality_report.json")

if __name__ == "__main__":
    main()
