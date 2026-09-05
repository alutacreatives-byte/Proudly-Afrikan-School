import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';
import { FlashcardCard } from '../study/types';
import { WorksheetData } from '../build/types';

/**
 * Export Flashcards to PDF
 */
export function exportFlashcardsToPdf(title: string, cards: FlashcardCard[], subject?: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(24, 24, 27); // #18181B
  doc.rect(0, 0, pageWidth, 75, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(217, 43, 138); // #D92B8A
  doc.text('PROUDLY AFRIKAN SCHOOL • ACTIVE RECALL FLASHCARDS', margin, 28);

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(title.toUpperCase(), margin, 52, { maxWidth: contentWidth });

  let y = 100;

  cards.forEach((card, idx) => {
    // Check if card fits on page
    if (y + 110 > pageHeight - margin) {
      doc.addPage();
      y = margin + 10;
    }

    // Card Box
    doc.setFillColor(253, 251, 247); // #FDFBF7
    doc.setDrawColor(220, 215, 205);
    doc.setLineWidth(1);
    doc.roundedRect(margin, y, contentWidth, 95, 6, 6, 'FD');

    // Accent line
    doc.setFillColor(230, 57, 86); // #E63956
    doc.rect(margin, y, 4, 95, 'F');

    // Card Number & Category
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(230, 57, 86);
    doc.text(`CARD ${idx + 1} OF ${cards.length}  •  ${(card.category || subject || 'GENERAL').toUpperCase()}`, margin + 14, y + 18);

    // Front: Question
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(22, 22, 22);
    doc.text(`Q: ${card.front}`, margin + 14, y + 36, { maxWidth: contentWidth - 28 });

    // Divider
    doc.setDrawColor(235, 230, 220);
    doc.line(margin + 14, y + 50, margin + contentWidth - 14, y + 50);

    // Back: Answer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`A: ${card.back}`, margin + 14, y + 68, { maxWidth: contentWidth - 28 });

    y += 108;
  });

  const safeFilename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-flashcards.pdf`;
  doc.save(safeFilename);
}

/**
 * Export Flashcards to PPTX Presentation Deck
 */
export async function exportFlashcardsToPptx(title: string, cards: FlashcardCard[], subject?: string) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '18181B' };

  titleSlide.addText('PROUDLY AFRIKAN SCHOOL', {
    x: 0.8,
    y: 1.2,
    fontSize: 14,
    bold: true,
    color: 'D92B8A',
    fontFace: 'Helvetica',
  });

  titleSlide.addText(title.toUpperCase(), {
    x: 0.8,
    y: 1.8,
    w: 8.5,
    fontSize: 28,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Helvetica',
  });

  titleSlide.addText(`${subject || 'Curriculum Deck'} • ${cards.length} Active Recall Cards`, {
    x: 0.8,
    y: 3.2,
    fontSize: 14,
    color: 'A1A1AA',
    fontFace: 'Helvetica',
  });

  // Each card gets Question & Answer slides
  cards.forEach((card, idx) => {
    // Question Slide
    const qSlide = pptx.addSlide();
    qSlide.background = { color: 'FAF7F0' };

    qSlide.addText(`CARD ${idx + 1} OF ${cards.length} • QUESTION`, {
      x: 0.8,
      y: 0.8,
      fontSize: 12,
      bold: true,
      color: 'E63956',
    });

    qSlide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.4,
      w: 8.4,
      h: 3.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'E5E5E5', width: 2 },
    });

    qSlide.addText(card.front, {
      x: 1.2,
      y: 1.8,
      w: 7.6,
      h: 2.4,
      fontSize: 22,
      bold: true,
      color: '161616',
      align: 'center',
    });

    // Answer Slide
    const aSlide = pptx.addSlide();
    aSlide.background = { color: '18181B' };

    aSlide.addText(`CARD ${idx + 1} OF ${cards.length} • ANSWER`, {
      x: 0.8,
      y: 0.8,
      fontSize: 12,
      bold: true,
      color: '10B981',
    });

    aSlide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.4,
      w: 8.4,
      h: 3.2,
      fill: { color: '27272A' },
      line: { color: '3F3F46', width: 2 },
    });

    aSlide.addText(card.back, {
      x: 1.2,
      y: 1.8,
      w: 7.6,
      h: 2.4,
      fontSize: 20,
      bold: false,
      color: 'FFFFFF',
      align: 'center',
    });
  });

  const safeFilename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-flashcards.pptx`;
  await pptx.writeFile({ fileName: safeFilename });
}

/**
 * Export Worksheet to PDF
 */
export function exportWorksheetToPdf(worksheet: WorksheetData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(24, 24, 27);
  doc.rect(0, 0, pageWidth, 75, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(230, 57, 86);
  doc.text('PROUDLY AFRIKAN SCHOOL • CLASSROOM WORKSHEET', margin, 28);

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(worksheet.title.toUpperCase(), margin, 52, { maxWidth: contentWidth });

  let y = 95;

  // Student Info Line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Subject: ${worksheet.subject}    |    Grade: ${worksheet.gradeLevel}    |    Name: ______________________    Date: ___________`, margin, y);
  y += 24;

  // Objectives
  if (worksheet.objectives && worksheet.objectives.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(22, 22, 22);
    doc.text('Learning Objectives:', margin, y);
    y += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    worksheet.objectives.forEach((obj) => {
      doc.text(`• ${obj}`, margin + 10, y, { maxWidth: contentWidth - 10 });
      y += 14;
    });
    y += 10;
  }

  // Exercises
  (worksheet.exercises || []).forEach((ex, exIdx) => {
    if (y + 80 > pageHeight - margin) {
      doc.addPage();
      y = margin + 10;
    }

    doc.setFillColor(245, 242, 235);
    doc.rect(margin, y, contentWidth, 24, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(22, 22, 22);
    doc.text(`Activity ${exIdx + 1}: ${ex.title}`, margin + 8, y + 16);
    y += 32;

    if (ex.instructions) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text(`Instructions: ${ex.instructions}`, margin, y, { maxWidth: contentWidth });
      y += 18;
    }

    (ex.items || []).forEach((item, itIdx) => {
      if (y + 40 > pageHeight - margin) {
        doc.addPage();
        y = margin + 10;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(`${itIdx + 1}. ${item.prompt}`, margin + 10, y, { maxWidth: contentWidth - 20 });
      y += 22;

      // Answer blank or lines
      doc.setDrawColor(200, 200, 200);
      doc.line(margin + 25, y, margin + contentWidth - 10, y);
      y += 16;
    });

    y += 15;
  });

  // Answer Key Page
  if (worksheet.answerKey && worksheet.answerKey.length > 0) {
    doc.addPage();
    y = margin + 10;

    doc.setFillColor(24, 24, 27);
    doc.rect(margin, y, contentWidth, 26, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('TEACHER ANSWER KEY (CONFIDENTIAL)', margin + 10, y + 18);
    y += 38;

    worksheet.answerKey.forEach((key) => {
      if (y + 40 > pageHeight - margin) {
        doc.addPage();
        y = margin + 10;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(230, 57, 86);
      doc.text(key.exerciseTitle, margin, y);
      y += 16;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      (key.answers || []).forEach((ans, aIdx) => {
        doc.text(`${aIdx + 1}. ${ans}`, margin + 12, y, { maxWidth: contentWidth - 20 });
        y += 15;
      });
      y += 12;
    });
  }

  const safeFilename = `${worksheet.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-worksheet.pdf`;
  doc.save(safeFilename);
}

/**
 * Export Worksheet to PPTX Presentation Slides
 */
export async function exportWorksheetToPptx(worksheet: WorksheetData) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '18181B' };

  titleSlide.addText('PROUDLY AFRIKAN SCHOOL', {
    x: 0.8,
    y: 1.2,
    fontSize: 14,
    bold: true,
    color: 'E63956',
  });

  titleSlide.addText(worksheet.title.toUpperCase(), {
    x: 0.8,
    y: 1.8,
    w: 8.5,
    fontSize: 26,
    bold: true,
    color: 'FFFFFF',
  });

  titleSlide.addText(`Subject: ${worksheet.subject} • Grade: ${worksheet.gradeLevel} • Estimated: ${worksheet.estimatedMinutes}m`, {
    x: 0.8,
    y: 3.2,
    fontSize: 14,
    color: 'D4D4D8',
  });

  // Exercise slides
  (worksheet.exercises || []).forEach((ex, exIdx) => {
    const slide = pptx.addSlide();
    slide.background = { color: 'FAF7F0' };

    slide.addText(`ACTIVITY ${exIdx + 1}: ${ex.title.toUpperCase()}`, {
      x: 0.8,
      y: 0.6,
      fontSize: 16,
      bold: true,
      color: 'E63956',
    });

    if (ex.instructions) {
      slide.addText(`Instructions: ${ex.instructions}`, {
        x: 0.8,
        y: 1.1,
        w: 8.4,
        fontSize: 12,
        italic: true,
        color: '71717A',
      });
    }

    const itemsText = (ex.items || []).map((item, itIdx) => `${itIdx + 1}. ${item.prompt}`).join('\n\n');

    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.6,
      w: 8.4,
      h: 3.4,
      fill: { color: 'FFFFFF' },
      line: { color: 'E4E4E7', width: 2 },
    });

    slide.addText(itemsText, {
      x: 1.1,
      y: 1.8,
      w: 7.8,
      h: 3.0,
      fontSize: 13,
      color: '18181B',
    });
  });

  // Answer Key Slide
  if (worksheet.answerKey && worksheet.answerKey.length > 0) {
    const keySlide = pptx.addSlide();
    keySlide.background = { color: '18181B' };

    keySlide.addText('TEACHER ANSWER KEY', {
      x: 0.8,
      y: 0.8,
      fontSize: 18,
      bold: true,
      color: '10B981',
    });

    const answersText = worksheet.answerKey.map((k) => `${k.exerciseTitle}:\n` + (k.answers || []).map((a, i) => `  ${i + 1}. ${a}`).join('\n')).join('\n\n');

    keySlide.addText(answersText, {
      x: 0.8,
      y: 1.5,
      w: 8.4,
      h: 3.5,
      fontSize: 12,
      color: 'FFFFFF',
    });
  }

  const safeFilename = `${worksheet.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-worksheet.pptx`;
  await pptx.writeFile({ fileName: safeFilename });
}
