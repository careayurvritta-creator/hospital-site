import React, { useState, useCallback, useEffect } from 'react';

declare global {
  interface Window {
    jspdf: any;
  }
}

interface DietChartPDFProps {
  patientName: string;
  patientAge: string;
  patientGender: string;
  patientOccupation?: string;
  prakriti?: string;
  dietaryPref?: string;
  allergies?: string[];
  condition: string;
  aiResult: string;
  matchedFiles: { label: string }[];
}

// ─── Section colors (RGB tuples) ───
const SECTION_COLORS: Record<string, [number, number, number]> = {
  'EARLY MORNING':    [234, 88, 12],
  'BREAKFAST':        [180, 120, 0],
  'MID-MORNING':      [217, 119, 6],
  'MORNING SNACK':    [217, 119, 6],
  'LUNCH':            [22, 130, 60],
  'AFTERNOON':        [22, 130, 60],
  'EVENING SNACK':    [13, 130, 120],
  'EVENING':          [13, 130, 120],
  'DINNER':           [5, 130, 95],
  'BEDTIME':          [79, 70, 229],
  'FOODS TO FAVOR':   [21, 120, 55],
  'FOODS TO AVOID':   [200, 35, 35],
  'BENEFICIAL HERBS': [5, 130, 95],
  'HERBS':            [5, 130, 95],
  'LIFESTYLE TIPS':   [30, 90, 210],
  'LIFESTYLE':        [30, 90, 210],
  'PRECAUTIONS':      [200, 110, 0],
  'IMPORTANT':        [200, 110, 0],
  'DIET INSTRUCTIONS': [100, 80, 180],
  'OVERVIEW':         [100, 100, 110],
};

const DEFAULT_COLOR: [number, number, number] = [100, 100, 110];

const DANGER_SECTIONS = new Set(['FOODS TO AVOID', 'PRECAUTIONS', 'IMPORTANT']);
const LIST_SECTIONS = new Set([
  'FOODS TO FAVOR', 'FOODS TO AVOID', 'BENEFICIAL HERBS', 'HERBS',
  'LIFESTYLE TIPS', 'LIFESTYLE', 'PRECAUTIONS', 'IMPORTANT',
]);

// ─── Text cleaning: strip markdown + emojis (jsPDF only supports Latin-1) ───
function cleanText(s: string): string {
  let t = s;
  t = t.replace(/\*\*(.*?)\*\*/g, '$1');    // bold
  t = t.replace(/\*(.*?)\*/g, '$1');          // italic
  t = t.replace(/^#{1,6}\s*/, '');            // markdown headers
  t = t.replace(/^[-*•]\s*/, '');             // bullets
  t = t.replace(/^\d+[\.\)]\s*/, '');         // numbered lists
  // Strip ALL non-Latin-1 characters (emojis, special Unicode)
  t = t.replace(/[^\x00-\xFF]/g, '');
  // Strip remaining problematic chars
  t = t.replace(/[\u0080-\u009F]/g, '');      // C1 control chars
  return t.replace(/\s+/g, ' ').trim();
}

function normalizeHeader(raw: string): string {
  let h = raw.replace(/\*\*/g, '').trim();
  h = h.replace(/^#{1,6}\s*/, '');
  h = h.replace(/^[-*•]\s*/, '');
  h = h.toUpperCase().trim();
  // Normalize common variations
  h = h.replace(/EARLY-MORNING/, 'EARLY MORNING');
  h = h.replace(/MID-MORNING/, 'MID-MORNING');
  return h;
}

// ─── Parse AI output into sections ───
interface Section {
  header: string;
  items: string[];
}

function parseSections(text: string): Section[] {
  const sections: Section[] = [];
  const lines = text.split('\n');
  let current: Section | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for markdown headers: ### HEADER or ## HEADER
    const mdMatch = trimmed.match(/^#{1,6}\s+(.+)/);
    if (mdMatch) {
      const header = normalizeHeader(mdMatch[1]);
      if (header.length >= 3 && header.length <= 80) {
        if (current) sections.push(current);
        current = { header, items: [] };
        continue;
      }
    }

    // Check for ALL CAPS header line
    const stripped = trimmed.replace(/\*\*/g, '').trim();
    const isAllCaps = /^[A-Z][A-Z\s&()\-:]+$/.test(stripped)
      && stripped.length >= 3
      && stripped.length <= 80
      && !stripped.includes('.')
      && stripped.split(' ').length <= 8;

    if (isAllCaps) {
      const header = normalizeHeader(stripped);
      if (current) sections.push(current);
      current = { header, items: [] };
      continue;
    }

    // Item line
    if (current) {
      current.items.push(trimmed);
    } else {
      current = { header: 'OVERVIEW', items: [trimmed] };
    }
  }
  if (current) sections.push(current);
  return sections;
}

// ─── Component ───
const DietChartPDF: React.FC<DietChartPDFProps> = ({
  patientName,
  patientAge,
  patientGender,
  patientOccupation,
  prakriti,
  dietaryPref,
  allergies,
  condition,
  aiResult,
  matchedFiles,
}) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (window.jspdf) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!window.jspdf) return;
    setGenerating(true);

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const W = 210;
      const H = 297;
      const M = 15;
      const CW = W - M * 2;
      let y = M;

      // ─── Page break helper ───
      const needPage = (h: number) => {
        if (y + h > H - M) {
          doc.addPage();
          y = M;
          return true;
        }
        return false;
      };

      // ─── Color helpers ───
      const setColor = (c: [number, number, number]) => doc.setFillColor(c[0], c[1], c[2]);

      // ━━━━━━━━━ HEADER ━━━━━━━━━
      // Main green header
      setColor([6, 78, 59]);
      doc.rect(0, 0, W, 44, 'F');

      // Amber accent bar at bottom of header
      setColor([245, 158, 11]);
      doc.rect(0, 44, W, 2, 'F');

      // Hospital name
      doc.setTextColor(180, 220, 200);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('AYURVRITTA AYURVEDA HOSPITAL', M, 14);

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Personalized Diet Chart', M, 28);

      // Subtitle
      doc.setTextColor(180, 220, 200);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Prepared by Dr. Jinendradutt Sharma  |  Vadodara, Gujarat', M, 36);

      // Date and phone (top right)
      doc.setTextColor(200, 230, 210);
      doc.setFontSize(9);
      const dateStr = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      doc.text(dateStr, W - M, 14, { align: 'right' });
      doc.text('+91 94266 84047', W - M, 20, { align: 'right' });

      y = 52;

      // ━━━━━━━━━ PATIENT INFO CARD ━━━━━━━━━
      needPage(52);

      // Card background
      doc.setDrawColor(220, 225, 230);
      doc.setLineWidth(0.3);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(M, y, CW, 46, 3, 3);
      doc.fill();
      doc.stroke();

      // Green left accent bar on card
      setColor([6, 95, 70]);
      doc.rect(M, y, 4, 46, 'F');

      // Avatar circle with initial
      setColor([6, 95, 70]);
      doc.circle(M + 18, y + 16, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const initial = cleanText(patientName).charAt(0).toUpperCase() || 'P';
      doc.text(initial, M + 18, y + 20, { align: 'center' });

      // Patient name
      doc.setTextColor(6, 78, 59);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(cleanText(patientName), M + 33, y + 13);

      // Details line
      doc.setTextColor(100, 110, 120);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const details = cleanText(
        `${patientAge} years | ${patientGender}${patientOccupation ? ' | ' + patientOccupation : ''}`
      );
      doc.text(details, M + 33, y + 20);

      y += 25;

      // ─── Badges row ───
      const badges: { label: string; value: string; bg: [number, number, number]; fg: [number, number, number] }[] = [];
      if (prakriti) badges.push({ label: 'PRAKRITI', value: cleanText(prakriti), bg: [230, 248, 235], fg: [6, 95, 70] });
      if (dietaryPref) badges.push({ label: 'DIET', value: cleanText(dietaryPref), bg: [230, 240, 255], fg: [30, 70, 200] });
      if (condition) badges.push({ label: 'CONDITION', value: cleanText(condition), bg: [255, 235, 235], fg: [200, 35, 35] });

      if (badges.length > 0) {
        const gap = 4;
        const bw = (CW - gap * (badges.length - 1)) / badges.length;
        badges.forEach((b, i) => {
          const bx = M + i * (bw + gap);
          doc.setFillColor(b.bg[0], b.bg[1], b.bg[2]);
          doc.roundedRect(bx, y, bw, 15, 2, 2);
          doc.fill();
          doc.setTextColor(130, 130, 140);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text(b.label, bx + 4, y + 5);
          doc.setTextColor(b.fg[0], b.fg[1], b.fg[2]);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          // Truncate if too long
          const maxW = bw - 8;
          let val = b.value;
          while (doc.getTextWidth(val) > maxW && val.length > 3) val = val.slice(0, -1);
          doc.text(val, bx + 4, y + 12);
        });
        y += 19;
      }

      y += 2;

      // ─── Allergies warning ───
      if (allergies && allergies.length > 0 && allergies[0] !== 'None') {
        needPage(12);
        doc.setFillColor(255, 248, 225);
        doc.setDrawColor(240, 200, 100);
        doc.setLineWidth(0.3);
        doc.roundedRect(M, y, CW, 9, 2, 2);
        doc.fill();
        doc.stroke();
        doc.setTextColor(150, 100, 10);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('[!] Allergies: ' + cleanText(allergies.join(', ')), M + 5, y + 6);
        y += 13;
      }

      // ─── Knowledge sources ───
      if (matchedFiles.length > 0) {
        needPage(12);
        doc.setFillColor(232, 248, 240);
        doc.setDrawColor(180, 220, 200);
        doc.setLineWidth(0.3);
        doc.roundedRect(M, y, CW, 9, 2, 2);
        doc.fill();
        doc.stroke();
        doc.setTextColor(6, 78, 59);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        const sources = cleanText(matchedFiles.map(f => f.label).join(' | '));
        doc.text('Based on: ' + sources, M + 5, y + 6);
        y += 14;
      }

      // ━━━━━━━━━ SECTIONS ━━━━━━━━━
      const sections = parseSections(aiResult);

      for (const section of sections) {
        const key = section.header;
        const c = SECTION_COLORS[key] || DEFAULT_COLOR;
        const isDanger = DANGER_SECTIONS.has(key);
        const isList = LIST_SECTIONS.has(key);

        // Filter out empty items
        const validItems = section.items
          .map(item => cleanText(item))
          .filter(t => t.length > 0);

        if (validItems.length === 0) continue;

        // Section header bar
        needPage(14);
        setColor(c);
        doc.roundedRect(M, y, CW, 10, 2, 2);
        doc.fill();

        // Section title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(key, M + 5, y + 7);

        y += 14;

        // Section items
        for (const text of validItems) {
          const textLines = doc.splitTextToSize(text, CW - 18);
          const lineH = 4.2;
          const itemH = textLines.length * lineH + 5;

          needPage(itemH);

          // Item card background
          if (isDanger) {
            doc.setFillColor(255, 245, 245);
          } else if (isList) {
            doc.setFillColor(245, 252, 248);
          } else {
            doc.setFillColor(248, 250, 252);
          }
          doc.setDrawColor(235, 238, 242);
          doc.setLineWidth(0.2);
          doc.roundedRect(M + 2, y, CW - 4, itemH, 1.5, 1.5);
          doc.fill();
          doc.stroke();

          // Left accent bar
          setColor(c);
          doc.rect(M + 2, y, 2, itemH, 'F');

          // Bullet dot
          setColor(c);
          doc.circle(M + 8, y + 4, 1, 'F');

          // Text
          doc.setTextColor(50, 55, 65);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(textLines, M + 12, y + 4);

          y += itemH + 1.5;
        }

        y += 2;
      }

      // ━━━━━━━━━ DISCLAIMER ━━━━━━━━━
      needPage(26);
      doc.setFillColor(255, 250, 230);
      doc.setDrawColor(240, 210, 120);
      doc.setLineWidth(0.3);
      doc.roundedRect(M, y, CW, 22, 2, 2);
      doc.fill();
      doc.stroke();

      doc.setTextColor(140, 90, 10);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Important Disclaimer', M + 5, y + 7);

      doc.setTextColor(120, 70, 10);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const disclaimer =
        'This diet chart is prepared based on Ayurvedic principles and is intended as a general guideline. ' +
        'Please consult with Dr. Jinendradutt Sharma at Ayurvritta Ayurveda Hospital before making significant dietary changes. ' +
        'Individual results may vary based on your unique constitution and health status.';
      doc.text(doc.splitTextToSize(disclaimer, CW - 10), M + 5, y + 13);

      y += 26;

      // ━━━━━━━━━ FOOTER ━━━━━━━━━
      needPage(16);
      setColor([6, 78, 59]);
      doc.rect(0, y, W, 14, 'F');
      setColor([245, 158, 11]);
      doc.rect(0, y, W, 1, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('AYURVRITTA AYURVEDA HOSPITAL', W / 2, y + 6, { align: 'center' });

      doc.setTextColor(180, 210, 195);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'Authentic Ayurvedic Care by Dr. Jinendradutt Sharma  |  Vadodara, Gujarat  |  +91 94266 84047',
        W / 2,
        y + 11,
        { align: 'center' }
      );

      // Save
      const filename = `Diet_Chart_${cleanText(patientName).replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('[PDF] Error:', error);
    } finally {
      setGenerating(false);
    }
  }, [patientName, patientAge, patientGender, patientOccupation, prakriti, dietaryPref, allergies, condition, aiResult, matchedFiles]);

  return (
    <button
      onClick={handleDownload}
      disabled={!scriptLoaded || generating}
      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {generating ? 'Generating PDF...' : scriptLoaded ? 'Download PDF' : 'Loading PDF...'}
    </button>
  );
};

export default DietChartPDF;
