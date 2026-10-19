# ResumeAI — Resume Analysis and Job Matching System

## Overview
ResumeAI is a comprehensive course project designed to analyze resumes, score them against job descriptions, and provide explainable ATS compatibility insights. The system utilizes deterministic scoring mechanisms, natural language processing for skill extraction, and TF-IDF semantic matching to bridge the gap between candidate resumes and job requirements.

## Problem Statement
Job seekers often struggle to understand why their resumes fail to pass Application Tracking Systems (ATS). The lack of transparency in automated screening leaves candidates guessing about missing keywords and formatting issues.

## Objectives
- Build a transparent, deterministic ATS scoring engine.
- Provide explainable breakdown of resume compatibility.
- Enable automatic extraction of skills and experiences.
- Match candidate skills against job description requirements.
- Identify skill gaps and offer actionable recommendations.

## Core Features (Course Project Scope)
1. **Resume Parsing**: Supports PDF and DOCX file uploads, with robust text extraction.
2. **ATS Compatibility Scoring**: An 8-factor mathematical scoring system (structure, keywords, experience, format, etc.) without black-box logic.
3. **Skill Extraction & Normalization**: Extracts recognized skills from resume text using a predefined taxonomy and synonyms.
4. **Job Description Matching**: Computes match percentage and identifies matching keywords and missing requirements.
5. **Skill Gap Analysis**: Suggests improvements by highlighting missing or weakly evidenced skills.
6. **Analytics Dashboard**: Clean interface to view the score, extracted data, and matching results.

## Technology Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, TypeScript
- **Parsing**: `pdf-parse` (PDF extraction), `mammoth` (DOCX extraction)

## Architecture and Workflow
1. User uploads a PDF/DOCX resume (and optionally pastes a job description).
2. Backend parses the file, extracts plain text, and segments the resume into logical sections (Education, Experience, Skills, Summary).
3. The extracted text is processed using NLP techniques to count tokens, compute TF-IDF, and evaluate readability.
4. The system calculates a deterministic ATS score and compares extracted skills to the target job description.
5. Results are served to the React frontend, displaying a comprehensive dashboard with actionable insights.

## Installation Instructions

1. **Clone the repository** (from the new course-project location):
   ```bash
   git clone https://github.com/Shailesh7449/ResumeAI-Course-Project.git
   cd ResumeAI-Course-Project
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Required Environment Variables**:
   Create a `.env` file based on `.env.example`:
   ```env
   PORT=3000
   GEMINI_API_KEY="YOUR_API_KEY" # Optional for basic rule-based analysis
   ```

## Running the Application
Start the application in development mode:
```bash
npm run dev
```
The frontend and backend will spin up using Vite's server middleware, typically accessible at `http://localhost:3000` (check terminal output for the exact port).

## Usage Guide
1. Navigate to the application URL in your browser.
2. **Upload a Resume**: Drag and drop your PDF or DOCX file.
3. **Analyze Job Match**: Once parsed, go to the "Job Match" tab and paste a job description to see compatibility and skill gaps.
4. **View Scores**: Check the ATS Score and details in the dashboard.

## ATS Scoring Methodology and Limitations
The ATS score is calculated using a transparent weighted average of the following:
- Keyword presence & density
- Action verb usage
- Section completeness (Summary, Experience, Education)
- Quantifiable metrics in bullet points
- Formatting and readability

**Limitations**: This score represents general best practices and deterministic matching. It does not replicate any specific proprietary ATS logic used by corporate HR systems.

## Testing
Run the following commands to verify the build:
```bash
npm run build
```
*(Optional) Run linting or testing if scripts are defined in package.json*

## Known Limitations & Future Enhancements
- Some complex multi-column PDFs might not parse perfectly.
- Semantic understanding relies on keyword normalization rather than deep contextual transformers.
- **Reserved for Future Capstone**: Advanced Resume Studio with AI-powered section rewriting, intelligent career chatbots, and automated real-time job discovery.
