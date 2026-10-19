export interface SampleItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
}

export const SAMPLE_RESUMES: SampleItem[] = [
  {
    id: 'fullstack_senior',
    title: 'Alex Johnson – Senior Full Stack Engineer',
    category: 'Full Stack / Web Engineering',
    summary: '6+ years of full stack software engineering with React, TypeScript, Node.js, and AWS.',
    content: `Alex Johnson
Email: alex.johnson.dev@gmail.com | Phone: (415) 890-2341 | Location: San Francisco, CA
LinkedIn: linkedin.com/in/alexjohnson-tech | GitHub: github.com/alexjohnson-dev | Portfolio: https://alexjohnson.dev

PROFESSIONAL SUMMARY
Results-driven Senior Full Stack Engineer with 6+ years of experience architecting resilient distributed systems, modern web platforms, and RESTful microservices. Spearheaded cloud-native migrations saving $140,000 annually and optimized API latencies by 42%. Passionate about clean code, automated testing, and developer velocity.

TECHNICAL SKILLS
• Programming Languages: TypeScript, JavaScript, Python, Go, SQL, HTML/CSS
• Frameworks & Libraries: React, Next.js, Node.js, Express.js, Tailwind CSS, Jest
• Databases & Caching: PostgreSQL, MongoDB, Redis, Elasticsearch
• Cloud & DevOps: AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes, GitHub Actions, CI/CD, Terraform
• Methodologies & Tools: Microservices, REST APIs, GraphQL, Agile, Scrum, Git, Jira

WORK EXPERIENCE
Senior Full Stack Engineer | NovaCloud Technologies | San Francisco, CA | 2021 – Present
• Architected a high-throughput enterprise dashboard using React 18, TypeScript, and Tailwind CSS, serving over 180,000 monthly active enterprise users.
• Engineered resilient backend microservices with Node.js, Express, and PostgreSQL, reducing p99 API response times from 420ms to 95ms (a 77% latency reduction).
• Optimized relational database queries and introduced Redis distributed caching, boosting database throughput by 65% during peak traffic spikes.
• Automated end-to-end CI/CD pipelines via GitHub Actions and Docker, accelerating team release cycles from bi-weekly to 4 deployments per day.
• Mentored 5 junior and mid-level software engineers through rigorous weekly code reviews and system design workshops.

Full Stack Software Engineer | Apex Digital Labs | Austin, TX | 2018 – 2021
• Developed responsive single-page web applications with React, Redux, and Node.js for client analytics tracking.
• Implemented secure JWT-based authentication and Role-Based Access Control (RBAC) handling 45,000 daily user logins.
• Spearheaded migration from monolithic REST backend to microservices on AWS Lambda, lowering cloud infrastructure operating costs by 28%.
• Wrote comprehensive unit and integration test suites using Jest and Cypress, elevating test coverage from 52% to 91%.

EDUCATION
Bachelor of Science in Computer Science | University of Texas at Austin | 2014 – 2018
GPA: 3.8 / 4.0 | Dean's Honor Roll

KEY PROJECTS
• Distributed E-Commerce Gateway: Built event-driven checkout orchestrator in Go and TypeScript with Kafka messaging, handling 2,500 transactions/sec with zero dropped events.
• Real-Time Collaborative Canvas: Created interactive canvas app with WebSockets, React, and Redis Pub/Sub supporting 50+ concurrent users per room with <25ms broadcast latency.

CERTIFICATIONS & AWARDS
• AWS Certified Solutions Architect – Associate (2023)
• First Place Winner, Silicon Valley FinTech Hackathon (2022)`,
  },
  {
    id: 'ml_data_scientist',
    title: 'Dr. Priya Sharma – AI & Machine Learning Scientist',
    category: 'Machine Learning / AI',
    summary: 'Ph.D. researcher & ML Engineer specializing in Natural Language Processing, PyTorch, and LLM architectures.',
    content: `Dr. Priya Sharma
Email: priya.sharma.ai@stanford.edu | Phone: (650) 412-8890 | Location: Palo Alto, CA
LinkedIn: linkedin.com/in/priyasharma-ml | GitHub: github.com/priyasharma-nlp | Portfolio: https://priyasharma.ai

PROFESSIONAL SUMMARY
Senior Machine Learning Scientist and Applied Researcher with 5+ years of experience designing deep learning models, Transformer architectures, and NLP pipelines. Proven record of deploying production ML models serving 2.4 million daily inferences with 99.9% uptime. Specialized in PyTorch, Large Language Models (LLMs), RAG architectures, and statistical modeling.

TECHNICAL SKILLS
• Programming: Python, R, C++, SQL, Bash
• Deep Learning & ML: PyTorch, TensorFlow, Hugging Face, Scikit-Learn, Pandas, NumPy, SciPy
• NLP & GenAI: Large Language Models (LLMs), RAG, LangChain, Transformers, BERT, Prompt Engineering, Semantic Search
• Data & Big Data: Apache Spark, SQL, PostgreSQL, MongoDB, Data Modeling, Airflow
• DevOps & MLOps: Docker, MLflow, AWS SageMaker, Git, Linux, CI/CD

WORK EXPERIENCE
Lead Machine Learning Scientist | Cognition AI Labs | Palo Alto, CA | 2022 – Present
• Spearheaded development of proprietary domain-adapted LLM fine-tuning pipelines using PyTorch and Hugging Face, achieving an 18.4% improvement in F1-score over baseline models.
• Architected enterprise Retrieval-Augmented Generation (RAG) system with hybrid semantic vector search, indexing 8 million unstructured documents with <120ms retrieval latency.
• Optimized model inference using TensorRT and quantization (FP16/INT8), reducing GPU compute costs by 45% while preserving 99.2% accuracy.
• Designed automated evaluation pipelines tracking BLEU, ROUGE, and BERTScore benchmarks across continuous training runs.

Machine Learning Engineer | Apex Data Systems | San Jose, CA | 2019 – 2022
• Engineered predictive classification and regression models in Scikit-Learn and PyTorch, analyzing 12 million transactions daily for financial anomaly detection.
• Built distributed feature engineering pipelines using Apache Spark and Pandas, decreasing data preprocessing latency by 60%.
• Deployed production model serving endpoints on AWS SageMaker with automated autoscaling and drift monitoring via MLflow.

EDUCATION
Ph.D. in Computer Science (Specialization: Machine Learning & NLP) | Stanford University | 2019
Master of Science in Computer Science | Carnegie Mellon University | 2015
Bachelor of Technology in Electrical Engineering | IIT Bombay | 2013

KEY PROJECTS
• MedSemantic NLP: Open-source clinical entity extractor using BERT and spaCy downloaded 80,000+ times on Hugging Face Hub.
• Multimodal Document Classifier: Deep learning framework fusing OCR visual embeddings and text semantics to parse complex invoices with 97.4% precision.

PUBLICATIONS & PATENTS
• "Efficient Fine-Tuning of Attention Networks for Low-Resource Domains" – NeurIPS Workshop (2022)
• Co-inventor on 2 US Patents in automated neural text synthesis`,
  },
  {
    id: 'devops_cloud',
    title: 'Marcus Vance – Cloud & DevOps Engineer',
    category: 'Cloud / Infrastructure',
    summary: 'DevOps engineer with deep expertise in Kubernetes, Terraform, AWS, and zero-downtime CI/CD pipelines.',
    content: `Marcus Vance
Email: marcus.vance.cloud@gmail.com | Phone: (206) 773-1940 | Location: Seattle, WA
LinkedIn: linkedin.com/in/marcusvance-devops | GitHub: github.com/marcusvance-infra

PROFESSIONAL SUMMARY
DevOps & Cloud Infrastructure Engineer with 4+ years of experience engineering secure, scalable multi-region AWS and Kubernetes architectures. Championed Infrastructure as Code (IaC) with Terraform and automated CI/CD pipelines, decreasing deployment failure rates by 68%.

TECHNICAL SKILLS
• Cloud Platforms: AWS, Google Cloud Platform (GCP), Microsoft Azure
• Containerization & Orchestration: Kubernetes, Docker, Helm, Docker Compose
• Infrastructure as Code: Terraform, Ansible, CloudFormation
• CI/CD & Automation: GitHub Actions, Jenkins, GitLab CI, ArgoCD
• Scripting & OS: Python, Bash, Linux (Ubuntu, RHEL, Alpine), Shell Scripting
• Monitoring & Observability: Prometheus, Grafana, Datadog, ELK Stack

WORK EXPERIENCE
DevOps Engineer | CloudScale Systems | Seattle, WA | 2021 – Present
• Orchestrated migration of 35 production microservices to Amazon EKS (Kubernetes), boosting infrastructure utilization by 40% and saving $85,000/year.
• Automated multi-account AWS infrastructure using Terraform modules, achieving 100% reproducible disaster recovery environments.
• Implemented GitOps deployment workflows using ArgoCD and Helm charts, reducing deployment turnaround time from 45 minutes to 3 minutes with zero downtime.
• Configured distributed observability cluster with Prometheus and Grafana dashboards, decreasing mean time to detection (MTTD) by 55%.

Cloud Operations Specialist | Beacon Interactive | Bellevue, WA | 2019 – 2021
• Managed 120+ EC2 instances, RDS databases, and S3 storage buckets with automated automated backup and patching scripts.
• Created automated security scanning in CI/CD pipeline using Trivy and SonarQube, catching 300+ vulnerabilities before production release.
• Maintained 99.95% service uptime across high-traffic e-commerce seasonal peak events.

EDUCATION
Bachelor of Science in Information Technology | University of Washington | 2019

CERTIFICATIONS
• Certified Kubernetes Administrator (CKA)
• AWS Certified DevOps Engineer – Professional`,
  },
];

export const SAMPLE_JOB_DESCRIPTIONS: SampleItem[] = [
  {
    id: 'jd_senior_fullstack',
    title: 'Senior Full Stack Software Engineer (React / Node / AWS)',
    category: 'Full Stack',
    summary: 'Targeting a senior engineer with strong React, Node.js, TypeScript, PostgreSQL, and AWS expertise.',
    content: `Job Title: Senior Full Stack Software Engineer
Company: CloudScale SaaS Inc.
Location: Remote / Hybrid (San Francisco, CA)

About the Role:
We are seeking an experienced Senior Full Stack Engineer to lead the design and development of our customer-facing web platform. In this role, you will collaborate closely with product managers and designers to build robust, scalable features from database schemas up to responsive React user interfaces.

Key Responsibilities:
• Design, implement, and maintain high-performance frontend interfaces using React, TypeScript, and modern CSS frameworks.
• Build scalable backend microservices and RESTful / GraphQL APIs using Node.js, Express, and PostgreSQL.
• Architect and manage cloud infrastructure on AWS, leveraging Docker, ECS, S3, and RDS.
• Write clean, testable, and maintainable code backed by automated unit tests and integration tests (Jest, Cypress).
• Optimize web application performance, caching strategies (Redis), and database query execution.
• Participate in code reviews, architectural discussions, and mentor junior and mid-level software engineers.

Required Qualifications & Skills:
• 4+ years of professional full stack software development experience.
• Bachelor's Degree in Computer Science, Software Engineering, or equivalent practical experience.
• Proficiency in TypeScript, JavaScript, React, and Node.js.
• Strong experience with relational databases (PostgreSQL or MySQL) and query optimization.
• Solid understanding of REST APIs, Microservices, and cloud deployments on AWS.
• Hands-on familiarity with Docker containerization and CI/CD automation pipelines.
• Exceptional cross-functional communication and collaborative problem-solving skills.

Preferred Qualifications:
• Experience with Next.js, Redis, or Tailwind CSS.
• Familiarity with Kubernetes and Infrastructure as Code (Terraform).
• Knowledge of security best practices, OAuth, and web vulnerability prevention.`,
  },
  {
    id: 'jd_staff_ml_ai',
    title: 'Staff Machine Learning & Generative AI Engineer',
    category: 'AI / Machine Learning',
    summary: 'High-level role seeking expertise in Python, PyTorch, Transformers, LLMs, RAG, and MLOps.',
    content: `Job Title: Staff Machine Learning & Generative AI Engineer
Company: Synthetix AI Research
Location: Palo Alto, CA / Remote

About the Role:
Join our elite AI team pioneering generative models, semantic search systems, and production agentic pipelines. We are seeking a Staff Machine Learning Engineer to take foundational research models and turn them into scalable, high-throughput enterprise inference systems.

Key Responsibilities:
• Lead the design and deployment of advanced Machine Learning (ML) and Deep Learning (DL) architectures.
• Fine-tune and evaluate Large Language Models (LLMs) and Transformer architectures using PyTorch and Hugging Face.
• Build production-grade Retrieval-Augmented Generation (RAG) pipelines, semantic vector search, and reranking mechanisms.
• Engineer high-throughput inference endpoints with model quantization, TensorRT, and low-latency serving.
• Collaborate with data engineers on distributed feature pipelines using Apache Spark and Pandas.
• Establish rigorous offline and online evaluation metrics (BLEU, ROUGE, F1-score, Precision@K).

Required Qualifications:
• 5+ years of industry experience developing and deploying machine learning models to production.
• Master's or Ph.D. in Computer Science, AI, Mathematics, or a quantitative discipline.
• Expert proficiency in Python, PyTorch, Scikit-Learn, and scientific computing packages.
• Proven expertise with Natural Language Processing (NLP), Transformers, and modern GenAI architectures.
• Experience with Docker containerization, MLOps tooling (MLflow, SageMaker), and cloud platforms (AWS or GCP).
• Strong analytical, statistical, and problem-solving abilities.

Preferred Qualifications:
• Published research in top AI conferences (NeurIPS, ICML, ACL, EMNLP).
• Hands-on experience with vector databases (Pinecone, Milvus, Qdrant) and distributed training across multi-GPU clusters.`,
  },
  {
    id: 'jd_devops_platform',
    title: 'Senior DevOps & Cloud Platform Engineer',
    category: 'Cloud / DevOps',
    summary: 'Role focusing on Kubernetes, Terraform, AWS, multi-region architecture, and CI/CD security.',
    content: `Job Title: Senior DevOps & Cloud Platform Engineer
Company: FinTech Velocity Corporation
Location: Seattle, WA / Remote

About the Role:
FinTech Velocity is hiring a Senior DevOps Engineer to modernize our financial cloud platform. You will own our multi-region Kubernetes infrastructure, Terraform modules, and secure CI/CD pipelines supporting critical financial services.

Key Responsibilities:
• Architect, scale, and maintain resilient Kubernetes (EKS) clusters across multiple AWS regions.
• Manage 100% of cloud resources as Infrastructure as Code using Terraform and GitOps practices.
• Maintain robust continuous integration and deployment pipelines (GitHub Actions, ArgoCD) with zero-downtime rolling releases.
• Implement real-time observability, alerting, and log aggregation using Prometheus, Grafana, and Datadog.
• Enforce infrastructure security, vulnerability scanning, and compliance audits across containers and cloud workloads.

Required Qualifications:
• 4+ years of dedicated DevOps or Cloud Infrastructure engineering experience.
• Bachelor's Degree in Computer Science, Information Technology, or relevant experience.
• Deep expertise in AWS cloud services (VPC, EKS, IAM, S3, RDS, Lambda).
• Advanced Kubernetes container orchestration and Helm chart administration.
• Strong proficiency in Terraform, Linux system administration, and Bash or Python scripting.
• Proven track record with CI/CD automation and automated testing.

Preferred Qualifications:
• CKA (Certified Kubernetes Administrator) or AWS DevOps Engineer Professional certifications.
• Experience with Kafka, Redis, and financial regulatory compliance (SOC2, PCI-DSS).`,
  },
];
