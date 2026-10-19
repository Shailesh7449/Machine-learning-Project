import { jsPDF } from 'jspdf';
import { AnalysisResponse } from '../types';

export function exportAnalysisPdf(analysis: AnalysisResponse, candidateName: string = 'Candidate'): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ResumeAI – Comprehensive ATS & Skills Audit Report', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Candidate: ${candidateName} | Generated: ${new Date().toLocaleDateString()} | Estimated ATS Score: ${analysis.atsScore.overallScore}/100`, 14, 20);

  y = 36;

  // Executive Score Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`ResumeAI ATS Compatibility Score: ${analysis.atsScore.overallScore} / 100`, 18, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Readability: ${analysis.qualityAudit.readability.interpretation} (Flesch Score: ${analysis.qualityAudit.readability.readingEase}) | Word Count: ${analysis.qualityAudit.readability.wordCount} words`,
    18,
    y + 15
  );
  if (analysis.jobMatch) {
    doc.text(
      `Target Role Match: ${analysis.jobMatch.overallMatchScore}% | Job Role: ${analysis.jobMatch.detectedJobRole}`,
      18,
      y + 21
    );
  } else {
    doc.text('Mode: Comprehensive General ATS Evaluation (No target job description specified)', 18, y + 21);
  }

  y += 34;

  // ATS Scoring Component Breakdown
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. ATS Score Breakdown by Category', 14, y);
  y += 6;

  const categories = Object.values(analysis.atsScore.categoryScores);
  for (const cat of categories) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${cat.name}: ${cat.score} / ${cat.maxScore} pts (${cat.percentage}%)`, 18, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`— ${cat.feedback}`, 85, y);
    y += 5.5;
  }

  y += 4;

  // Extracted Technical Skills
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`2. Extracted Normalized Skills (${analysis.skills.totalCount} detected)`, 14, y);
  y += 6;

  const skillNames = analysis.skills.matchedSkills.map(s => s.name).join(', ');
  const splitSkills = doc.splitTextToSize(skillNames || 'No canonical skills matched.', pageWidth - 32);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(splitSkills, 18, y);
  y += splitSkills.length * 4.5 + 4;

  // Key Strengths & Weaknesses
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. Strengths & High-Priority Recommendations', 14, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52); // green
  doc.text('Key Strengths:', 18, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  for (const str of analysis.atsScore.strengths.slice(0, 3)) {
    const lines = doc.splitTextToSize(`• ${str}`, pageWidth - 36);
    doc.text(lines, 20, y);
    y += lines.length * 4.5;
  }

  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28); // red
  doc.text('Actionable Improvements:', 18, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  for (const rec of analysis.atsScore.recommendations.slice(0, 4)) {
    const lines = doc.splitTextToSize(`• ${rec}`, pageWidth - 36);
    doc.text(lines, 20, y);
    y += lines.length * 4.5;
  }

  // Job Match / Skill Gap if available
  if (analysis.jobMatch && analysis.jobMatch.missingSkills.length > 0) {
    y += 4;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('4. Skill Gap for Target Job Description', 14, y);
    y += 6;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const missingLine = `Missing Required Skills: ${analysis.jobMatch.missingSkills.join(', ')}`;
    const splitMissing = doc.splitTextToSize(missingLine, pageWidth - 32);
    doc.text(splitMissing, 18, y);
    y += splitMissing.length * 4.5 + 4;
  }

  // Recommended Job Roles
  if (analysis.jobRecommendations && analysis.jobRecommendations.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    y += 4;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('5. Top Recommended Job Roles', 14, y);
    y += 6;

    for (const role of analysis.jobRecommendations.slice(0, 3)) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`${role.roleTitle} (Fit: ${role.matchPercentage}%)`, 18, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      const lines = doc.splitTextToSize(`${role.whyFits} [Salary Range: ${role.salaryRange}]`, pageWidth - 36);
      doc.text(lines, 20, y);
      y += lines.length * 4 + 3;
    }
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'ResumeAI – Academic NLP & ATS Scoring System | Disclaimer: Estimated compatibility score for academic evaluation.',
      14,
      doc.internal.pageSize.getHeight() - 8
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 28, doc.internal.pageSize.getHeight() - 8);
  }

  doc.save(`${candidateName.replace(/[^a-zA-Z0-9]/g, '_')}_ResumeAI_Report.pdf`);
}
