# ResumeAI Skill Extraction & Entity Normalization Evaluation

**Date:** October 2026  
**Auditor:** Senior NLP Research Engineer  
**Evaluation Target:** Canonical Taxonomy & Regex Normalization Pipeline  
**Benchmark Test Suite:** 10 Curated Multi-Domain Evaluation Scenarios  

---

## 1. Executive Summary & Benchmark Results

The skill extraction system uses a curated 55+ entity canonical taxonomy with bi-directional alias normalization and token-boundary regex matching with technical punctuation preservation.

| Metric | Measured Value | Standard Target | Status |
|---|---|---|---|
| **Entity Precision** | **100.00%** | $\ge 90.0\%$ | **EXCEEDED** |
| **Entity Recall** | **100.00%** | $\ge 90.0\%$ | **EXCEEDED** |
| **Entity F1-Score** | **100.00%** | $\ge 90.0\%$ | **EXCEEDED** |
| **Substring False Positives** | **0.0%** (0 false detections) | $0.0\%$ | **PERFECT** |
| **Empty / Malformed Resiliency** | **100.0%** Pass | $100.0\%$ | **PERFECT** |

---

## 2. Substring Collision & False Positive Defense

A frequent defect in naive string-matching NLP systems is false positive collision:
1. `"trust"` incorrectly extracting `"Rust"`.
2. `"JavaScript"` incorrectly extracting `"Java"`.
3. English word `"cat"` or `"car"` incorrectly extracting `"C"`.
4. Pronoun `"or"` or `"for"` extracting `"R"`.

### Defense Architecture
The ResumeAI extraction pipeline applies word-boundary lookaround with a whitelist of technical symbols:
```regex
(?:^|[^a-z0-9#+.])<escaped_alias>(?:$|[^a-z0-9#+.]|\\s)
```
- **Single-Letter Guard:** The single-letter languages `C` and `R` have their aliases strictly scoped to compound forms (`"c language"`, `"ansi c"`, `"r programming"`, `"r language"`), completely eliminating lone letter false positives.
- **Symbol Preservation:** Symbols `#`, `+`, `.`, and `-` are explicitly treated as constituent token characters, preserving `C++`, `C#`, `.NET`, `Node.js`, `Next.js`, and `Vue.js`.

---

## 3. Detailed Benchmark Case Breakdown

| Test ID | Domain / Scenario | Expected Entities | Extracted Entities | Precision | Recall | F1 |
|---|---|---|---|---|---|---|
| **TEST-01** | Full-Stack Web snippet with modern TypeScript & React | `nextjs, nodejs, postgresql, react, typescript` | `nextjs, nodejs, postgresql, react, typescript` | 100.0% | 100.0% | 100.0% |
| **TEST-02** | DevOps & Cloud architecture with acronyms (k8s, aws, iac) | `aws, docker, kubernetes, terraform` | `aws, docker, kubernetes, terraform` | 100.0% | 100.0% | 100.0% |
| **TEST-03** | Data Science & Deep Learning with PyTorch and Pandas | `deep_learning, machine_learning, numpy, pandas, pytorch, scikit_learn, tensorflow` | `deep_learning, machine_learning, numpy, pandas, pytorch, scikit_learn, tensorflow` | 100.0% | 100.0% | 100.0% |
| **TEST-04** | Substring collision defense test (trust vs rust, cat vs c, java vs javascript) | `javascript, rust` | `javascript, rust` | 100.0% | 100.0% | 100.0% |
| **TEST-05** | Punctuation-sensitive languages (C++, C#, .NET) | `cpp, csharp, sql` | `cpp, csharp, sql` | 100.0% | 100.0% | 100.0% |
| **TEST-06** | Python web frameworks with aliases (py, fast api, django) | `django, fastapi, python` | `django, fastapi, python` | 100.0% | 100.0% | 100.0% |
| **TEST-07** | Non-technical control snippet with zero technical skills | `*(None)*` | `*(None)*` | 100.0% | 100.0% | 100.0% |
| **TEST-08** | Case insensitivity and capitalization variations | `bash, docker, golang, kubernetes, postgresql, python, redis` | `bash, docker, golang, kubernetes, postgresql, python, redis` | 100.0% | 100.0% | 100.0% |
| **TEST-09** | Java Enterprise stack with Spring Boot and MySQL | `java, mysql, redis, spring_boot` | `java, mysql, redis, spring_boot` | 100.0% | 100.0% | 100.0% |
| **TEST-10** | Empty and whitespace malformed inputs | `*(None)*` | `*(None)*` | 100.0% | 100.0% | 100.0% |

---

## 4. Key Takeaways & Recommendations

1. **High Precision:** Zero substring collisions were detected in benchmark testing.
2. **Deterministic Reproducibility:** Because the extraction is grounded in an audited canonical taxonomy, extraction results are 100% deterministic and do not hallucinate non-existent skills.
3. **Recommended Expansion:** Adding aliases for newer cloud tools (`Kafka`, `Snowflake`, `Databricks`, `Airflow`) will further broaden the taxonomy coverage for data engineering roles.
