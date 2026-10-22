"""
Reproducible Dataset Splitter for ResumeAI
Produces leak-free stratified partitions:
  - data/train_dedup.csv (80%)
  - data/test_dedup.csv  (20%)
Ensures vectorizers and encoders are fit strictly on training data.
"""

import os
import re
import pandas as pd
from sklearn.model_selection import train_test_split

RANDOM_SEED = 42

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    text = re.sub(r'\S+@\S+', ' ', text)
    text = re.sub(r'\+?\d[\d -]{8,}\d', ' ', text)
    text = re.sub(r'[^a-zA-Z0-9+#.-]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text

def create_leak_free_split(input_csv="data/UpdatedResumeDataSet.csv", out_dir="data"):
    print(f"[*] Reading raw data from: {input_csv}")
    df = pd.read_csv(input_csv)
    
    df['Clean_Resume'] = df['Resume'].apply(clean_text)
    df['Category'] = df['Category'].str.strip()
    
    # Strictly deduplicate prior to splitting
    df_dedup = df.drop_duplicates(subset=['Clean_Resume']).reset_index(drop=True)
    print(f"[*] Unique samples retained: {len(df_dedup)}")
    
    train_df, test_df = train_test_split(
        df_dedup,
        test_size=0.20,
        random_state=RANDOM_SEED,
        stratify=df_dedup['Category']
    )
    
    train_path = os.path.join(out_dir, "train_dedup.csv")
    test_path = os.path.join(out_dir, "test_dedup.csv")
    
    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)
    
    print(f"[*] Saved train split to: {train_path} ({len(train_df)} records)")
    print(f"[*] Saved test split to:  {test_path} ({len(test_df)} records)")
    
    return train_path, test_path

if __name__ == "__main__":
    create_leak_free_split()
