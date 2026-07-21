import React, { useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { parseAIResult, stripMarkdown, Section } from './DietChartRenderer';

interface DietChartPDFProps {
  patientName: string;
  aiResult: string;
}

const M = 18;
const PW = 210;
const PH = 297;
const CW = PW - M * 2;
const LH = 5;

const C = {
  primary:    [27, 94, 59] as [number, number, number],
  primaryDark:[15, 70, 40] as [number, number, number],
  primaryLight:[232, 245, 235] as [number, number, number],
  accent:     [245, 158, 11] as [number, number, number],
  accentLight:[255, 251, 235] as [number, number, number],
  white:      [255, 255, 255] as [number, number, number],
  gray50:     [249, 250, 251] as [number, number, number],
  gray100:    [243, 244, 246] as [number, number, number],
  gray200:    [229, 231, 235] as [number, number, number],
  gray400:    [156, 163, 175] as [number, number, number],
  gray500:    [107, 114, 128] as [number, number, number],
  gray600:    [75, 85, 99] as [number, number, number],
  gray700:    [55, 65, 81] as [number, number, number],
  gray800:    [31, 41, 55] as [number, number, number],
  green500:   [34, 197, 94] as [number, number, number],
  green700:   [21, 128, 61] as [number, number, number],
  red400:     [248, 113, 113] as [number, number, number],
  red600:     [220, 38, 38] as [number, number, number],
  amber500:   [245, 158, 11] as [number, number, number],
};

function wrap(doc: jsPDF, text: string, w: number): string[] {
  return doc.splitTextToSize(stripMarkdown(text), w);
}

function textH(lines: number): number {
  return lines * LH;
}

function setFill(doc: jsPDF, rgb: [number, number, number]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}

function lineH(doc: jsPDF, text: string, w: number): number {
  return textH(wrap(doc, text, w).length);
}

// ─── Page Header & Footer ───────────────────────────────────────────────────

function drawPageHeader(doc: jsPDF, patientName: string) {
  setFill(doc, C.primary);
  doc.roundedRect(M, M, CW, 16, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Ayurvritta Ayurveda Hospital', M + 8, M + 7);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 220, 210);
  doc.text('Personalized Diet Chart' + (patientName ? ` — ${patientName}` : ''), M + 8, M + 13);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Vadodara, Gujarat | www.ayurvrittaayurveda.in', PW - M - 8, M + 10.5, { align: 'right' });
  return 28;
}

function drawPageFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const footerY = PH - 12;
  doc.setDrawColor(C.gray200[0], C.gray200[1], C.gray200[2]);
  doc.setLineWidth(0.3);
  doc.line(M, footerY - 2, PW - M, footerY - 2);
  doc.setTextColor(C.gray400[0], C.gray400[1], C.gray400[2]);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Ayurvritta Ayurveda Hospital — For educational purposes. Consult your physician before making dietary changes.', M, footerY);
  if (totalPages > 1) {
    doc.text(`Page ${pageNum} of ${totalPages}`, PW - M, footerY, { align: 'right' });
  }
}

// ─── Section Wrappers ────────────────────────────────────────────────────────

function sectionHeader(doc: jsPDF, title: string, color: [number, number, number], icon: string, x: number, y: number, w: number): number {
  const h = 10;
  setFill(doc, color);
  doc.roundedRect(x, y, w, h, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${icon}  ${title.toUpperCase()}`, x + 5, y + 6.5);
  return h + 4;
}

function cardBegin(doc: jsPDF, x: number, y: number, w: number, bg = C.white): { y: number } {
  setFill(doc, bg);
  doc.setDrawColor(C.gray200[0], C.gray200[1], C.gray200[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, w, 0, 0, 0, 'F');
  return { y };
}

function cardEnd(doc: jsPDF, x: number, y: number, w: number, h: number) {
  setFill(doc, C.white);
  doc.setDrawColor(C.gray200[0], C.gray200[1], C.gray200[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, w, h, 3, 3, 'FD');
  return y + h;
}

function addPageIfNeeded(doc: jsPDF, curY: number, need: number, pageNum: { n: number }, sections: Array<{ y: number }>): number {
  if (curY + need > PH - M - 20) {
    drawPageFooter(doc, pageNum.n, 0);
    doc.addPage();
    pageNum.n++;
    const newY = M + 28;
    sections.push({ y: newY });
    return newY;
  }
  return curY;
}

// ─── Intro / Understanding ──────────────────────────────────────────────────

function drawIntroSection(doc: jsPDF, s: Section, x: number, startY: number, w: number, pageNum: { n: number }, sections: Array<{ y: number }>): number {
  const text = s.introText || '';
  if (!text.trim()) return startY;
  const lines = wrap(doc, text, w - 16);
  const innerH = textH(lines.length) + 10;
  const totalH = innerH + 8;
  let cy = addPageIfNeeded(doc, startY, totalH, pageNum, sections);
  cy = sectionHeader(doc, s.title || 'Understanding Your Health', C.primary, 'ℹ', x, cy, w);
  cy = cardEnd(doc, x, cy, w, innerH);
  doc.setTextColor(C.gray600[0], C.gray600[1], C.gray600[2]);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(lines, x + 8, cy - innerH + 8);
  return cy;
}

// ─── Core Principles ─────────────────────────────────────────────────────────

function drawPrinciplesSection(doc: jsPDF, s: Section, x: number, startY: number, w: number, pageNum: { n: number }, sections: Array<{ y: number }>): number {
  const items = s.principles || [];
  if (!items.length) return startY;

  const itemRows: Array<{ label: string; desc: string; lines: string[] }> = [];
  items.forEach(item => {
    const bm = item.match(/^\*\*(.+?)\*\*[:\s]*(.*)/);
    const label = bm ? bm[1] : '';
    const desc = bm ? bm[2] : item;
    const lines = wrap(doc, stripMarkdown(desc), w - 44);
    itemRows.push({ label, desc, lines });
  });

  const itemHs = itemRows.map(r => Math.max(textH(r.lines.length) + 8, 18));
  const totalInnerH = itemHs.reduce((a, b) => a + b, 0) + itemRows.length * 2;
  const totalH = totalInnerH + 8;

  let cy = addPageIfNeeded(doc, startY, totalH, pageNum, sections);
  const secY = cy;
  cy = sectionHeader(doc, s.title || 'Core Dietary Principles', C.primary, '✓', x, cy, w);
  cy = cardEnd(doc, x, cy, w, totalInnerH + 4);

  let iy = secY + 8;
  itemRows.forEach((r, i) => {
    const ih = itemHs[i];
    if (r.label) {
      doc.setTextColor(C.green700[0], C.green700[1], C.green700[2]);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text(stripMarkdown(r.label), x + 8, iy + 6);
      doc.setTextColor(C.gray700[0], C.gray700[1], C.gray700[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(r.lines.join('\n'), x + 8, iy + 12);
    } else {
      doc.setTextColor(C.gray700[0], C.gray700[1], C.gray700[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(r.lines.join('\n'), x + 8, iy + 6);
    }
    iy += ih + 2;
  });
  return iy + 4;
}

// ─── Ayurvedic Meal Principles ───────────────────────────────────────────────

function drawAyurvedicSection(doc: jsPDF, s: Section, x: number, startY: number, w: number, pageNum: { n: number }, sections: Array<{ y: number }>): number {
  const raw = s.rawLines.filter(l => l.trim() && !l.startsWith('#'));
  if (!raw.length) return startY;

  const rows: Array<{ lines: string[]; label: string }> = [];
  raw.forEach(line => {
    const bm = line.match(/^\*\*(.+?)\*\*[:\s]*(.*)/);
    if (bm) {
      const descText = stripMarkdown(bm[2] || '');
      const lines = wrap(doc, descText, w - 16);
      rows.push({ label: stripMarkdown(bm[1]), lines });
    } else {
      const text = stripMarkdown(line.replace(/^[-*•]\s*/, ''));
      const lines = wrap(doc, text, w - 16);
      rows.push({ label: '', lines });
    }
  });

  const totalInnerH = rows.reduce((sum, r) => sum + textH(r.lines.length) + 6, 0) + 4;
  const totalH = totalInnerH + 8;

  let cy = addPageIfNeeded(doc, startY, totalH, pageNum, sections);
  const secY = cy;
  cy = sectionHeader(doc, s.title || 'Ayurvedic Meal Guidelines', C.accent, '✦', x, cy, w);
  cy = cardEnd(doc, x, cy, w, totalInnerH + 4);

  let iy = secY + 8;
  rows.forEach(r => {
    if (r.label) {
      doc.setTextColor(C.amber500[0], C.amber500[1], C.amber500[2]);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text(r.label, x + 8, iy + 5);
      doc.setTextColor(C.gray600[0], C.gray600[1], C.gray600[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(r.lines.join('\n'), x + 8, iy + 10);
    } else {
      doc.setTextColor(C.gray600[0], C.gray600[1], C.gray600[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(r.lines.join('\n'), x + 8, iy + 5);
    }
    iy += textH(r.lines.length) + 6;
  });
  return iy + 4;
}

// ─── Meal Block ─────────────────────────────────────────────────────────────

function drawMealBlockSection(doc: jsPDF, s: Section, x: number, startY: number, w: number, pageNum: { n: number }, sections: Array<{ y: number }>): number {
  const entries = s.mealEntries || [];
  if (!entries.length) return startY;

  let totalInnerH = 0;
  const entryData: Array<{ heading: string; time: string; note: string; recLines: string[][]; avdLines: string[][] }> = [];

  entries.forEach(e => {
    const recLines = e.recommended.map(item => wrap(doc, stripMarkdown(item.split(/[—–]/)[0].trim()), (w / 2) - 14));
    const avdLines = e.avoid.map(item => wrap(doc, stripMarkdown(item.split(/[—–]/)[0].trim()), (w / 2) - 14));
    const maxRec = Math.max(...recLines.map(l => l.length));
    const maxAvd = Math.max(...avdLines.map(l => l.length));
    const itemsH = Math.max(maxRec, maxAvd) * LH + 4;
    const entryH = itemsH + 24;
    entryData.push({ heading: e.heading, time: e.time || '', note: e.note || '', recLines, avdLines });
    totalInnerH += entryH + 4;
  });

  const totalH = totalInnerH + 8;
  let cy = addPageIfNeeded(doc, startY, totalH, pageNum, sections);
  const secY = cy;
  cy = sectionHeader(doc, s.title || 'Day Plan — Meal by Meal', C.accent, '☀', x, cy, w);
  cy = cardEnd(doc, x, cy, w, totalInnerH + 4);

  entryData.forEach((e, i) => {
    const maxLines = Math.max(e.recLines.reduce((m, l) => Math.max(m, l.length), 0), e.avdLines.reduce((m, l) => Math.max(m, l.length), 0));
    const itemsH = maxLines * LH + 4;
    const entryH = itemsH + 24;

    setFill(doc, C.gray50);
    doc.setDrawColor(C.gray200[0], C.gray200[1], C.gray200[2]);
    doc.setLineWidth(0.15);
    doc.roundedRect(x + 2, cy, w - 4, entryH, 2, 2, 'FD');

    doc.setTextColor(C.gray800[0], C.gray800[1], C.gray800[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(stripMarkdown(e.heading), x + 8, cy + 9);

    if (e.time) {
      doc.setTextColor(C.gray500[0], C.gray500[1], C.gray500[2]);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const tw = doc.getTextWidth(stripMarkdown(e.time));
      doc.text(stripMarkdown(e.time), x + w - 8 - tw, cy + 9);
    }

    if (e.note) {
      doc.setTextColor(C.gray400[0], C.gray400[1], C.gray400[2]);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.text(stripMarkdown(e.note), x + 8, cy + 15);
    }

    const colW = (w - 16) / 2;
    const iy = cy + 20;

    setFill(doc, C.primaryLight);
    doc.setDrawColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.setLineWidth(0.1);
    doc.roundedRect(x + 6, iy, colW, itemsH + 4, 2, 2, 'FD');
    doc.setTextColor(C.green700[0], C.green700[1], C.green700[2]);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMMENDED', x + 10, iy + 5);
    doc.setTextColor(C.gray700[0], C.gray700[1], C.gray700[2]);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    e.recLines.forEach((lines, li) => {
      doc.text(lines.join('  '), x + 10, iy + 11 + li * LH);
    });

    setFill(doc, [255,240,240]);
    doc.setDrawColor(C.red400[0], C.red400[1], C.red400[2]);
    doc.setLineWidth(0.1);
    doc.roundedRect(x + 8 + colW, iy, colW, itemsH + 4, 2, 2, 'FD');
    doc.setTextColor(C.red600[0], C.red600[1], C.red600[2]);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('AVOID', x + 12 + colW, iy + 5);
    doc.setTextColor(C.gray700[0], C.gray700[1], C.gray700[2]);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    e.avdLines.forEach((lines, li) => {
      doc.text(lines.join('  '), x + 12 + colW, iy + 11 + li * LH);
    });

    cy += entryH + 4;
  });

  return cy + 4;
}

// ─── Pathya / Apathya ──────────────────────────────────────────────────────

function drawPathyaSection(doc: jsPDF, s: Section, x: number, startY: number, w: number, isApathya: boolean, pageNum: { n: number }, sections: Array<{ y: number }>): number {
  const items = isApathya ? s.apathyaItems : s.pathyaItems;
  const c = isApathya ? C.red600 : C.primary;
  const bg = isApathya ? [255,245,245] as [number,number,number] : C.primaryLight;
  if (!items) return startY;
  const cats = Object.keys(items).filter(k => items[k]?.length > 0);
  if (!cats.length) return startY;

  const catItems: Array<{ cat: string; items: string[] }> = cats.map(cat => ({
    cat,
    items: items[cat] || []
  }));

  const colW = (w - 8) / 2;
  const rows: Array<{ cols: typeof catItems; maxH: number }> = [];
  let row: typeof catItems = [];
  let rowMaxH = 0;
  catItems.forEach(item => {
    const itemCount = item.items.length;
    const estH = itemCount * 9 + 16;
    if (row.length === 2) {
      rows.push({ cols: row, maxH: rowMaxH });
      row = [item];
      rowMaxH = estH;
    } else {
      row.push(item);
      rowMaxH = Math.max(rowMaxH, estH);
    }
  });
  if (row.length) rows.push({ cols: row, maxH: rowMaxH });

  const totalInnerH = rows.reduce((sum, r) => sum + r.maxH + 4, 0) + 4;
  const totalH = totalInnerH + 8;
  let cy = addPageIfNeeded(doc, startY, totalH, pageNum, sections);
  const title = s.title || (isApathya ? 'Apathya — Strictly Avoid' : 'Pathya — Eat Freely');
  const icon = isApathya ? '✕' : '✓';
  cy = sectionHeader(doc, title, c, icon, x, cy, w);
  cy = cardEnd(doc, x, cy, w, totalInnerH + 4);

  rows.forEach(row => {
    let rx = x + 2;
    row.cols.forEach(col => {
      setFill(doc, bg);
      doc.setDrawColor(c[0], c[1], c[2], 0.2);
      doc.setLineWidth(0.15);
      doc.roundedRect(rx, cy, colW, row.maxH, 2, 2, 'FD');
      doc.setTextColor(c[0], c[1], c[2]);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(col.cat.toUpperCase(), rx + 5, cy + 6);
      doc.setTextColor(C.gray600[0], C.gray600[1], C.gray600[2]);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      col.items.forEach((it, i) => {
        const txt = stripMarkdown(it.split(/[—–]/)[0].trim());
        doc.text('• ' + txt, rx + 5, cy + 12 + i * 9);
      });
      rx += colW + 4;
    });
    cy += row.maxH + 4;
  });

  return cy + 4;
}

// ─── Dinacharya ──────────────────────────────────────────────────────────────

function drawDinacharyaSection(doc: jsPDF, s: Section, x: number, startY: number, w: number, pageNum: { n: number }, sections: Array<{ y: number }>): number {
  const items = s.dinacharya || [];
  if (!items.length) return startY;

  const totalInnerH = items.reduce((sum, it) => {
    const actLines = wrap(doc, stripMarkdown(it.activity), w - 50);
    return sum + textH(actLines.length) + (it.time ? 7 : 0) + (it.benefit ? 7 : 0) + 10;
  }, 0) + 4;
  const totalH = totalInnerH + 8;

  let cy = addPageIfNeeded(doc, startY, totalH, pageNum, sections);
  const secY = cy;
  cy = sectionHeader(doc, s.title || 'Daily Routine (Dinacharya)', [79, 70, 229], '☀', x, cy, w);
  cy = cardEnd(doc, x, cy, w, totalInnerH + 4);

  items.forEach((it, i) => {
    const actLines = wrap(doc, stripMarkdown(it.activity), w - 50);
    const ih = textH(actLines.length) + (it.time ? 7 : 0) + (it.benefit ? 7 : 0) + 6;
    setFill(doc, C.gray50);
    doc.setDrawColor(C.gray200[0], C.gray200[1], C.gray200[2]);
    doc.setLineWidth(0.15);
    doc.roundedRect(x + 2, cy, w - 4, ih, 2, 2, 'FD');
    doc.setTextColor([79, 70, 229][0], [79, 70, 229][1], [79, 70, 229][2]);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(String(i + 1) + '.', x + 6, cy + 5);
    if (it.time) {
      doc.setTextColor([79, 70, 229][0], [79, 70, 229][1], [79, 70, 229][2]);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(stripMarkdown(it.time), x + w - 8, cy + 5, { align: 'right' });
    }
    doc.setTextColor(C.gray800[0], C.gray800[1], C.gray800[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(actLines.join('\n'), x + 14, cy + 5);
    let by = cy + 5 + textH(actLines.length);
    if (it.benefit) {
      doc.setTextColor(C.gray500[0], C.gray500[1], C.gray500[2]);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.text('→ ' + stripMarkdown(it.benefit), x + 14, by + 4);
      by += 7;
    }
    cy += ih + 2;
  });

  return cy + 4;
}

// ─── Remedies ───────────────────────────────────────────────────────────────

function drawRemediesSection(doc: jsPDF, s: Section, x: number, startY: number, w: number, pageNum: { n: number }, sections: Array<{ y: number }>): number {
  const remedies = s.remedies || [];
  if (!remedies.length) return startY;

  const totalInnerH = remedies.reduce((sum, r) => {
    let h = 20;
    if (r.preparation) h += 7;
    if (r.when) h += 7;
    if (r.benefit) h += 7;
    return sum + h;
  }, 0) + 4;
  const totalH = totalInnerH + 8;

  let cy = addPageIfNeeded(doc, startY, totalH, pageNum, sections);
  cy = sectionHeader(doc, s.title || 'Classical Home Remedies', C.accent, '🌿', x, cy, w);
  cy = cardEnd(doc, x, cy, w, totalInnerH + 4);

  remedies.forEach((r, i) => {
    let rh = 20;
    if (r.preparation) rh += 7;
    if (r.when) rh += 7;
    if (r.benefit) rh += 7;

    setFill(doc, C.accentLight);
    doc.setDrawColor([245, 158, 11][0], [245, 158, 11][1], [245, 158, 11][2], 0.3);
    doc.setLineWidth(0.15);
    doc.roundedRect(x + 2, cy, w - 4, rh, 2, 2, 'FD');

    doc.setTextColor(C.amber500[0], C.amber500[1], C.amber500[2]);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(String(i + 1) + '. ' + stripMarkdown(r.name), x + 6, cy + 7);

    let ry = cy + 12;
    if (r.preparation) {
      doc.setTextColor(C.gray600[0], C.gray600[1], C.gray600[2]);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Preparation: ' + stripMarkdown(r.preparation), x + 8, ry);
      ry += 7;
    }
    if (r.when) {
      doc.setTextColor(C.gray600[0], C.gray600[1], C.gray600[2]);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text('When: ' + stripMarkdown(r.when), x + 8, ry);
      ry += 7;
    }
    if (r.benefit) {
      doc.setTextColor(C.green700[0], C.green700[1], C.green700[2]);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'italic');
      doc.text('Benefit: ' + stripMarkdown(r.benefit), x + 8, ry);
    }
    cy += rh + 2;
  });

  return cy + 4;
}

// ─── Lifestyle ──────────────────────────────────────────────────────────────

function drawLifestyleSection(doc: jsPDF, s: Section, x: number, startY: number, w: number, pageNum: { n: number }, sections: Array<{ y: number }>): number {
  const lifestyle = s.lifestyle || {};
  const cats = Object.keys(lifestyle).filter(k => lifestyle[k]?.length > 0);
  if (!cats.length) return startY;

  const totalInnerH = cats.reduce((sum, cat) => {
    const lines = lifestyle[cat].reduce((s2, it) => s2 + Math.ceil(stripMarkdown(it).length / 45) + 1, 0);
    return sum + Math.max(lines * 9 + 14, 24);
  }, 0) + 4;
  const totalH = totalInnerH + 8;

  let cy = addPageIfNeeded(doc, startY, totalH, pageNum, sections);
  cy = sectionHeader(doc, s.title || 'Lifestyle Guidelines', [20, 184, 166], '♡', x, cy, w);
  cy = cardEnd(doc, x, cy, w, totalInnerH + 4);

  cats.forEach(cat => {
    const lines = lifestyle[cat].reduce((s2, it) => s2.concat(wrap(doc, stripMarkdown(it), w - 30)), [] as string[]);
    const ih = Math.max(lines.length * 9 + 14, 24);
    setFill(doc, [240, 253, 250] as [number,number,number]);
    doc.setDrawColor([20, 184, 166][0], [20, 184, 166][1], [20, 184, 166][2], 0.3);
    doc.setLineWidth(0.15);
    doc.roundedRect(x + 2, cy, w - 4, ih, 2, 2, 'FD');
    doc.setTextColor([20, 184, 166][0], [20, 184, 166][1], [20, 184, 166][2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(stripMarkdown(cat), x + 6, cy + 6);
    doc.setTextColor(C.gray700[0], C.gray700[1], C.gray700[2]);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    lines.forEach((l, i) => {
      doc.text('• ' + l, x + 8, cy + 12 + i * 9);
    });
    cy += ih + 3;
  });

  return cy + 4;
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function drawDoctorFooter(doc: jsPDF, s: Section, x: number, startY: number, w: number, pageNum: { n: number }, sections: Array<{ y: number }>): number {
  const text = stripMarkdown(s.title || s.rawLines?.join(' ') || '');
  if (!text.trim()) return startY;
  const lines = wrap(doc, text, w - 16);
  const innerH = textH(lines.length) + 8;
  const totalH = innerH + 8;
  let cy = addPageIfNeeded(doc, startY, totalH, pageNum, sections);
  cy = sectionHeader(doc, 'Guidance', C.primary, '✎', x, cy, w);
  cy = cardEnd(doc, x, cy, w, innerH + 2);
  doc.setTextColor(C.gray500[0], C.gray500[1], C.gray500[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(lines, x + 8, cy - innerH + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.primary[0], C.primary[1], C.primary[2]);
  doc.setFontSize(7.5);
  doc.text('Dr. Jinendradutt Sharma (BAMS, MD) — Ayurvritta Ayurveda Hospital, Vadodara', x + 8, cy);
  return cy + 4;
}

// ─── Validation ──────────────────────────────────────────────────────────────

function drawValidationSection(doc: jsPDF, s: Section, x: number, startY: number, w: number, pageNum: { n: number }, sections: Array<{ y: number }>): number {
  const errs = s.validationErrors || [];
  const warns = s.validationWarnings || [];
  if (!errs.length && !warns.length) return startY;

  const totalH = (errs.length + warns.length) * 12 + 16;
  let cy = addPageIfNeeded(doc, startY, totalH, pageNum, sections);
  const secY = cy;
  cy = sectionHeader(doc, 'Important Notes', [180, 83, 9], '!', x, cy, w);

  let iy = secY + 6;
  errs.forEach(e => {
    const txt = stripMarkdown(e.replace('[BLOCKED]', '').trim());
    doc.setTextColor(C.red600[0], C.red600[1], C.red600[2]);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠ ' + txt, x + 4, iy + 5);
    iy += 10;
  });
  warns.forEach(w => {
    const txt = stripMarkdown(w.replace('[Note]', '').trim());
    doc.setTextColor(C.amber500[0], C.amber500[1], C.amber500[2]);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('→ ' + txt, x + 4, iy + 5);
    iy += 10;
  });
  return iy + 4;
}

// ─── Component ───────────────────────────────────────────────────────────────

const DietChartPDF: React.FC<DietChartPDFProps> = ({ patientName, aiResult }) => {
  const [generating, setGenerating] = useState(false);

  const handleDownload = useCallback(() => {
    setGenerating(true);
    try {
      const sections = parseAIResult(aiResult);
      if (!sections.length) { setGenerating(false); return; }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageNum = { n: 1 };
      const renderedSections: Array<{ y: number }> = [];

      let y = M + drawPageHeader(pdf, patientName);
      renderedSections.push({ y });

      for (const section of sections) {
        const sx: Record<string, (d: jsPDF, s: Section, x: number, y: number, w: number, pn: { n: number }, rs: Array<{ y: number }>) => number> = {
          title: drawIntroSection,
          intro: drawIntroSection,
          'core-principles': drawPrinciplesSection,
          'ayurvedic-principles': drawAyurvedicSection,
          'meal-block': drawMealBlockSection,
          pathya: (d, s, x, y, w, pn, rs) => drawPathyaSection(d, s, x, y, w, false, pn, rs),
          apathya: (d, s, x, y, w, pn, rs) => drawPathyaSection(d, s, x, y, w, true, pn, rs),
          dinacharya: drawDinacharyaSection,
          remedies: drawRemediesSection,
          lifestyle: drawLifestyleSection,
          footer: drawDoctorFooter,
          validation: drawValidationSection,
        };
        const fn = sx[section.type];
        if (fn) {
          y = fn(pdf, section, M, y, CW, pageNum, renderedSections);
        }
      }

      drawPageFooter(pdf, pageNum.n, pageNum.n);

      pdf.save(`${patientName.replace(/\s+/g, '_')}_Diet_Chart_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('[PDF] Error:', error);
    } finally {
      setGenerating(false);
    }
  }, [patientName, aiResult]);

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {generating ? 'Generating...' : 'Download PDF'}
    </button>
  );
};

export default DietChartPDF;