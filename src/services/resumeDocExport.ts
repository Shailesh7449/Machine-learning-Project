import { jsPDF } from 'jspdf';
import { ParsedSections } from '../types';

export function exportCleanResumePdf(parsed: ParsedSections, candidateName: string = 'Candidate', template: 'ats_classic' | 'modern' = 'ats_classic'): boolean {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;
    let y = 45;

    const checkPageBreak = (neededPt: number) => {
      if (y + neededPt > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        y = 45;
      }
    };

    const drawSectionHeader = (title: string) => {
      checkPageBreak(30);
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(template === 'modern' ? 30 : 0, template === 'modern' ? 58 : 0, template === 'modern' ? 138 : 0);
      doc.text(title.toUpperCase(), margin, y);
      y += 4;
      doc.setDrawColor(template === 'modern' ? 147 : 180, template === 'modern' ? 197 : 180, template === 'modern' ? 253 : 180);
      doc.setLineWidth(0.75);
      doc.line(margin, y, margin + contentWidth, y);
      y += 12;
      doc.setTextColor(30, 41, 59);
    };

    // 1. Candidate Name Header
    const displayName = (parsed.personal.name !== 'Not detected' && parsed.personal.name) ? parsed.personal.name : candidateName;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(displayName, pageWidth / 2, y, { align: 'center' });
    y += 14;

    // Contact Information Line
    const contactParts = [
      parsed.personal.email !== 'Not detected' ? parsed.personal.email : null,
      parsed.personal.phone !== 'Not detected' ? parsed.personal.phone : null,
      parsed.personal.location !== 'Not detected' ? parsed.personal.location : null,
      parsed.personal.linkedin !== 'Not detected' ? parsed.personal.linkedin : null,
      parsed.personal.github !== 'Not detected' ? parsed.personal.github : null,
      parsed.personal.portfolio !== 'Not detected' ? parsed.personal.portfolio : null,
    ].filter(Boolean) as string[];

    if (contactParts.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const contactLine = contactParts.join('  •  ');
      doc.text(contactLine, pageWidth / 2, y, { align: 'center', maxWidth: contentWidth });
      y += 16;
    }

    // 2. Professional Summary
    const summarySection = parsed.sectionsList?.find(s => s.key === 'summary');
    const summaryText = summarySection?.currentText || parsed.summary;
    if (summaryText && summaryText !== 'Not detected' && summaryText.trim().length > 10) {
      drawSectionHeader('Professional Summary');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(summaryText, contentWidth);
      checkPageBreak(lines.length * 11);
      doc.text(lines, margin, y);
      y += lines.length * 11 + 4;
    }

    // 3. Technical & Soft Skills
    const skillsSection = parsed.sectionsList?.find(s => s.key === 'technical_skills');
    const skillsText = skillsSection?.currentText || parsed.skillsText;
    if (skillsText && skillsText.trim().length > 0) {
      drawSectionHeader('Technical Skills');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(skillsText, contentWidth);
      checkPageBreak(lines.length * 11);
      doc.text(lines, margin, y);
      y += lines.length * 11 + 4;
    }

    // 4. Work Experience
    const expSection = parsed.sectionsList?.find(s => s.key === 'work_experience');
    const expContent = expSection?.currentText;
    if (expContent && expContent.trim().length > 15) {
      drawSectionHeader('Work Experience');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);

      const expLines = expContent.split('\n');
      for (const line of expLines) {
        if (!line.trim()) continue;
        const isHeader = line.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present|\d{4})\b/i) || line.includes('|');
        if (isHeader) {
          checkPageBreak(24);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42);
          doc.text(line.trim(), margin, y);
          y += 12;
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          const bulletText = line.startsWith('•') || line.startsWith('-') ? line.trim() : `• ${line.trim()}`;
          const split = doc.splitTextToSize(bulletText, contentWidth - 10);
          checkPageBreak(split.length * 10.5);
          doc.text(split, margin + 5, y);
          y += split.length * 10.5;
        }
      }
      y += 4;
    }

    // 5. Internships
    const internSection = parsed.sectionsList?.find(s => s.key === 'internships');
    const internContent = internSection?.currentText;
    if (internContent && internContent.trim().length > 15) {
      drawSectionHeader('Internship Experience');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);

      const lines = internContent.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        const split = doc.splitTextToSize(line.startsWith('•') ? line : `• ${line}`, contentWidth - 10);
        checkPageBreak(split.length * 10.5);
        doc.text(split, margin + 5, y);
        y += split.length * 10.5;
      }
      y += 4;
    }

    // 6. Academic & Notable Projects
    const projSection = parsed.sectionsList?.find(s => s.key === 'projects');
    const projContent = projSection?.currentText;
    if (projContent && projContent.trim().length > 15) {
      drawSectionHeader('Key Projects');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);

      const lines = projContent.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        const split = doc.splitTextToSize(line.startsWith('•') ? line : `• ${line}`, contentWidth - 10);
        checkPageBreak(split.length * 10.5);
        doc.text(split, margin + 5, y);
        y += split.length * 10.5;
      }
      y += 4;
    }

    // 7. Education
    const eduSection = parsed.sectionsList?.find(s => s.key === 'education');
    const eduContent = eduSection?.currentText;
    if (eduContent && eduContent.trim().length > 10) {
      drawSectionHeader('Education');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);

      const lines = eduContent.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        const split = doc.splitTextToSize(line, contentWidth);
        checkPageBreak(split.length * 11);
        doc.text(split, margin, y);
        y += split.length * 11;
      }
      y += 4;
    }

    // 8. Certifications & Achievements
    const certSection = parsed.sectionsList?.find(s => s.key === 'certifications');
    const achSection = parsed.sectionsList?.find(s => s.key === 'achievements');
    const extraContent = [certSection?.currentText, achSection?.currentText].filter(Boolean).join('\n');
    if (extraContent && extraContent.trim().length > 10) {
      drawSectionHeader('Certifications & Honors');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);

      const lines = extraContent.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        const split = doc.splitTextToSize(line.startsWith('•') ? line : `• ${line}`, contentWidth - 10);
        checkPageBreak(split.length * 10.5);
        doc.text(split, margin + 5, y);
        y += split.length * 10.5;
      }
    }

    // Save PDF
    const filename = `${displayName.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`;
    doc.save(filename);
    return true;
  } catch (err) {
    console.error('Resume PDF Export Error:', err);
    return false;
  }
}
