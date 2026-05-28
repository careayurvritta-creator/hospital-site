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

  const parseSections = (text: string) => {
    const sections: { header: string; items: string[] }[] = [];
    const lines = text.split('\n');
    let current: { header: string; items: string[] } | null = null;

    for (const line of lines) {
      let t = line.trim();
      if (!t) continue;
      const stripped = t.replace(/\*\*/g, '').trim();
      const isHeader = /^[A-Z][A-Z\s&()\-:]+$/.test(stripped) && stripped.length >= 3 && stripped.length <= 80;
      if (isHeader) {
        if (current) sections.push(current);
        current = { header: stripped, items: [] };
      } else if (current) {
        current.items.push(line.trim());
      } else {
        if (!current) current = { header: 'OVERVIEW', items: [] };
        current.items.push(line.trim());
      }
    }
    if (current) sections.push(current);
    return sections;
  };

  const sections = parseSections(aiResult);

  // Colors for each section (RGB values) - NO emojis
  const sectionColors: Record<string, { color: [number, number, number]; label: string }> = {
    'EARLY MORNING': { color: [234, 88, 12], label: 'EARLY MORNING' },
    'BREAKFAST': { color: [180, 120, 0], label: 'BREAKFAST' },
    'MID-MORNING': { color: [217, 119, 6], label: 'MID-MORNING' },
    'LUNCH': { color: [22, 130, 60], label: 'LUNCH' },
    'EVENING SNACK': { color: [13, 130, 120], label: 'EVENING SNACK' },
    'DINNER': { color: [5, 130, 95], label: 'DINNER' },
    'BEDTIME': { color: [79, 70, 229], label: 'BEDTIME' },
    'FOODS TO FAVOR': { color: [21, 120, 55], label: 'FOODS TO FAVOR' },
    'FOODS TO AVOID': { color: [200, 35, 35], label: 'FOODS TO AVOID' },
    'BENEFICIAL HERBS': { color: [5, 130, 95], label: 'BENEFICIAL HERBS' },
    'LIFESTYLE TIPS': { color: [30, 90, 210], label: 'LIFESTYLE TIPS' },
    'PRECAUTIONS': { color: [200, 110, 0], label: 'PRECAUTIONS' },
    'OVERVIEW': { color: [100, 100, 110], label: 'OVERVIEW' },
  };

  const getSectionMeta = (header: string) => {
    return sectionColors[header] || { color: [100, 100, 110], label: header };
  };

  const formatItem = (item: string): string => {
    let text = item;
    text = text.replace(/\*\*(.*?)\*\*/g, '$1');
    text = text.replace(/\*(.*?)\*/g, '$1');
    text = text.replace(/^[-*•]\s*/, '');
    text = text.replace(/^\d+[\.\)]\s*/, '');
    // Remove any remaining emoji characters
    text = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
    text = text.replace(/[\u{2600}-\u{26FF}]/gu, '');
    text = text.replace(/[\u{2700}-\u{27BF}]/gu, '');
    return text.trim();
  };

  // Helper: draw a filled circle (bullet)
  const drawBullet = (x: number, y: number, r: number, color: [number, number, number]) => {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.circle(x, y, r, 'F');
  };

  // Store doc reference for helper functions
  let doc: any;

  const handleDownload = useCallback(async () => {
    if (!window.jspdf) return;

    setGenerating(true);

    try {
      const { jsPDF } = window.jspdf;
      doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const W = 210;
      const H = 297;
      const M = 15;
      const CW = W - M * 2;
      let y = M;

      const needPage = (h: number) => {
        if (y + h > H - M) { doc.addPage(); y = M; return true; }
        return false;
      };

      // Helper: strip emojis from any text for PDF rendering
      const clean = (s: string) => s.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '').replace(/\s+/g, ' ').trim();

      // ━━━ HEADER ━━━
      // Main gradient background
      doc.setFillColor(6, 78, 59); // deep green
      doc.rect(0, 0, W, 48, 'F');
      // Lighter overlay strip
      doc.setFillColor(4, 108, 78);
      doc.rect(0, 38, W, 10, 'F');

      // Decorative circles (top-right)
      doc.setFillColor(4, 120, 87);
      doc.circle(W - 15, 8, 22, 'F');
      doc.setFillColor(5, 150, 105);
      doc.circle(W - 45, 42, 14, 'F');
      // Decorative circle (bottom-left)
      doc.setFillColor(6, 95, 70);
      doc.circle(8, 42, 10, 'F');

      // Hospital name
      doc.setTextColor(200, 230, 210);
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

      // Date and phone (right side)
      doc.setTextColor(200, 230, 210);
      doc.setFontSize(9);
      const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      doc.text(dateStr, W - M, 14, { align: 'right' });
      doc.text('+91 94266 84047', W - M, 20, { align: 'right' });

      // Thin accent line below header
      y = 48;
      doc.setFillColor(245, 158, 11); // amber accent
      doc.rect(0, y, W, 1.5, 'F');
      y += 6;

      // ━━━ PATIENT INFO CARD ━━━
      needPage(50);

      // Card shadow
      doc.setFillColor(230, 230, 235);
      doc.roundedRect(M + 0.5, y + 0.5, CW, 48, 3, 3);
      doc.fill();
      // Card
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(220, 225, 230);
      doc.setLineWidth(0.3);
      doc.roundedRect(M, y, CW, 48, 3, 3);
      doc.fill();
      doc.stroke();

      // Avatar
      doc.setFillColor(6, 95, 70);
      doc.circle(M + 16, y + 16, 11, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(patientName.charAt(0).toUpperCase(), M + 16, y + 20, { align: 'center' });

      // Name
      doc.setTextColor(6, 78, 59);
      doc.setFontSize(17);
      doc.setFont('helvetica', 'bold');
      doc.text(clean(patientName), M + 32, y + 13);

      // Details line
      doc.setTextColor(100, 110, 120);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const details = clean(`${patientAge} years | ${patientGender}${patientOccupation ? ' | ' + patientOccupation : ''}`);
      doc.text(details, M + 32, y + 20);

      y += 26;

      // Badges row
      const badges: { label: string; value: string; bg: [number, number, number]; text: [number, number, number] }[] = [];
      if (prakriti) badges.push({ label: 'PRAKRITI', value: clean(prakriti), bg: [230, 248, 235], text: [6, 95, 70] });
      if (dietaryPref) badges.push({ label: 'DIET', value: clean(dietaryPref), bg: [230, 240, 255], text: [30, 70, 200] });
      if (condition) badges.push({ label: 'CONDITION', value: clean(condition), bg: [255, 235, 235], text: [200, 35, 35] });

      if (badges.length > 0) {
        const bw = (CW - (badges.length - 1) * 5) / badges.length;
        badges.forEach((b, i) => {
          const bx = M + i * (bw + 5);
          doc.setFillColor(b.bg[0], b.bg[1], b.bg[2]);
          doc.roundedRect(bx, y, bw, 16, 2, 2);
          doc.fill();
          doc.setTextColor(130, 130, 140);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text(b.label, bx + 4, y + 5);
          doc.setTextColor(b.text[0], b.text[1], b.text[2]);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(b.value, bx + 4, y + 12);
        });
        y += 20;
      }

      // Allergies warning
      if (allergies && allergies.length > 0 && allergies[0] !== 'None') {
        needPage(10);
        doc.setFillColor(255, 248, 225);
        doc.setDrawColor(240, 200, 100);
        doc.setLineWidth(0.3);
        doc.roundedRect(M, y, CW, 9, 2, 2);
        doc.fill();
        doc.stroke();
        // Warning icon (triangle)
        doc.setFillColor(220, 160, 0);
        doc.triangle(M + 5, y + 2, M + 3, y + 7, M + 7, y + 7, 'F');
        doc.setTextColor(150, 100, 10);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Allergies: ' + clean(allergies.join(', ')), M + 10, y + 6);
        y += 13;
      }

      // ━━━ KNOWLEDGE SOURCES ━━━
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
        doc.text('Based on: ' + clean(matchedFiles.map(f => f.label).join(' | ')), M + 5, y + 6);
        y += 14;
      }

      // ━━━ SECTIONS ━━━
      for (const section of sections) {
        const meta = getSectionMeta(section.header);
        const c = meta.color;
        const isMeal = ['EARLY MORNING', 'BREAKFAST', 'MID-MORNING', 'LUNCH', 'EVENING SNACK', 'DINNER', 'BEDTIME'].includes(section.header);
        const isList = ['FOODS TO FAVOR', 'FOODS TO AVOID', 'BENEFICIAL HERBS', 'LIFESTYLE TIPS', 'PRECAUTIONS'].includes(section.header);
        const isDanger = section.header === 'FOODS TO AVOID' || section.header === 'PRECAUTIONS';

        // Section header bar
        needPage(14);

        // Full-width colored header bar
        doc.setFillColor(c[0], c[1], c[2]);
        doc.roundedRect(M, y, CW, 11, 2, 2);
        doc.fill();

        // Section title (white on colored bar)
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(clean(section.header), M + 6, y + 7.5);

        // Small circle indicator on right side of header
        doc.setFillColor(255, 255, 255);
        doc.circle(M + CW - 7, y + 5.5, 3, 'F');
        doc.setFillColor(c[0], c[1], c[2]);
        doc.circle(M + CW - 7, y + 5.5, 1.5, 'F');

        y += 15;

        // Section items
        for (const item of section.items) {
          const text = formatItem(item);
          if (!text) continue;

          const textLines = doc.splitTextToSize(text, CW - 18);
          const lineH = 4.5;
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
          doc.roundedRect(M + 3, y, CW - 6, itemH, 1.5, 1.5);
          doc.fill();
          doc.stroke();

          // Left accent bar
          doc.setFillColor(c[0], c[1], c[2]);
          doc.rect(M + 3, y, 2, itemH, 'F');

          // Bullet dot
          doc.setFillColor(c[0], c[1], c[2]);
          doc.circle(M + 10, y + 4.5, 1.2, 'F');

          // Text
          doc.setTextColor(50, 55, 65);
          doc.setFontSize(9.5);
          doc.setFont('helvetica', 'normal');
          doc.text(textLines, M + 14, y + 4.5);

          y += itemH + 2;
        }

        y += 3;
      }

      // ━━━ DISCLAIMER ━━━
      needPage(28);
      doc.setFillColor(255, 250, 230);
      doc.setDrawColor(240, 210, 120);
      doc.setLineWidth(0.3);
      doc.roundedRect(M, y, CW, 24, 2, 2);
      doc.fill();
      doc.stroke();

      // Warning icon (filled triangle)
      doc.setFillColor(220, 160, 0);
      doc.triangle(M + 6, y + 4, M + 3, y + 10, M + 9, y + 10, 'F');

      doc.setTextColor(140, 90, 10);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Important Disclaimer', M + 13, y + 8);

      doc.setTextColor(120, 70, 10);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const disclaimer = 'This diet chart is prepared based on Ayurvedic principles and is intended as a general guideline. Please consult with Dr. Jinendradutt Sharma at Ayurvritta Ayurveda Hospital before making significant dietary changes. Individual results may vary based on your unique constitution and health status.';
      doc.text(doc.splitTextToSize(disclaimer, CW - 14), M + 5, y + 14);

      y += 28;

      // ━━━ FOOTER ━━━
      needPage(18);
      // Footer background
      doc.setFillColor(6, 78, 59);
      doc.rect(0, y, W, 16, 'F');
      // Accent line above footer
      doc.setFillColor(245, 158, 11);
      doc.rect(0, y, W, 1, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('AYURVRITTA AYURVEDA HOSPITAL', W / 2, y + 6, { align: 'center' });

      doc.setTextColor(180, 210, 195);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Authentic Ayurvedic Care by Dr. Jinendradutt Sharma  |  Vadodara, Gujarat  |  +91 94266 84047', W / 2, y + 12, { align: 'center' });

      // Save
      const filename = `Diet_Chart_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
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
