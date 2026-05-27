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
        if (!current) {
          current = { header: 'OVERVIEW', items: [] };
        }
        current.items.push(line.trim());
      }
    }
    if (current) sections.push(current);
    return sections;
  };

  const sections = parseSections(aiResult);

  const sectionConfig: Record<string, { icon: string; color: [number, number, number] }> = {
    'EARLY MORNING': { icon: '🌅', color: [234, 88, 12] },
    'BREAKFAST': { icon: '🥣', color: [202, 138, 4] },
    'MID-MORNING': { icon: '⏰', color: [217, 119, 6] },
    'LUNCH': { icon: '🍛', color: [22, 163, 74] },
    'EVENING SNACK': { icon: '🍵', color: [13, 148, 136] },
    'DINNER': { icon: '🥘', color: [5, 150, 105] },
    'BEDTIME': { icon: '🌙', color: [79, 70, 229] },
    'FOODS TO FAVOR': { icon: '✅', color: [21, 128, 61] },
    'FOODS TO AVOID': { icon: '🚫', color: [220, 38, 38] },
    'BENEFICIAL HERBS': { icon: '🌿', color: [5, 150, 105] },
    'LIFESTYLE TIPS': { icon: '💡', color: [37, 99, 235] },
    'PRECAUTIONS': { icon: '⚠️', color: [217, 119, 6] },
    'OVERVIEW': { icon: '📋', color: [107, 114, 128] },
  };

  const getSectionConfig = (header: string) => {
    return sectionConfig[header] || { icon: '📌', color: [107, 114, 128] };
  };

  const formatItem = (item: string): string => {
    let text = item;
    text = text.replace(/\*\*(.*?)\*\*/g, '$1');
    text = text.replace(/\*(.*?)\*/g, '$1');
    text = text.replace(/^[-*•]\s*/, '');
    text = text.replace(/^\d+[\.\)]\s*/, '');
    return text.trim();
  };

  const handleDownload = useCallback(async () => {
    if (!window.jspdf) {
      console.error('[PDF] jsPDF not loaded');
      return;
    }

    console.log('[PDF] Starting PDF generation with jsPDF...');
    setGenerating(true);

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let y = margin;

      // Helper function to add new page if needed
      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      // Helper function to draw rounded rectangle
      const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number, fillColor?: [number, number, number], strokeColor?: [number, number, number]) => {
        doc.roundedRect(x, y, w, h, r, r);
        if (fillColor) {
          doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
          doc.fill();
        }
        if (strokeColor) {
          doc.setDrawColor(strokeColor[0], strokeColor[1], strokeColor[2]);
          doc.stroke();
        }
      };

      // ─── HEADER ───
      doc.setFillColor(6, 95, 70); // #065f46
      doc.rect(0, 0, pageWidth, 45, 'F');

      // Decorative circles
      doc.setFillColor(4, 120, 87); // #047857
      doc.circle(pageWidth - 20, 10, 25, 'F');
      doc.setFillColor(5, 150, 105); // #059669
      doc.circle(pageWidth - 50, 40, 15, 'F');

      // Header text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('AYURVRITTA AYURVEDA HOSPITAL', margin, 15);

      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Personalized Diet Chart', margin, 28);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Prepared by Dr. Jinendradutt Sharma • Vadodara, Gujarat`, margin, 36);

      // Right side
      doc.setFontSize(28);
      doc.text('🌿', pageWidth - margin - 20, 20);

      doc.setFontSize(10);
      doc.text(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), pageWidth - margin - 40, 30);
      doc.text('+91 94266 84047', pageWidth - margin - 35, 36);

      y = 50;

      // ─── PATIENT INFO CARD ───
      checkPageBreak(50);

      // Card background
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(229, 231, 235); // #e5e7eb
      doc.roundedRect(margin, y, contentWidth, 45, 3, 3);
      doc.fill();
      doc.stroke();

      // Avatar circle
      doc.setFillColor(6, 95, 70);
      doc.circle(margin + 15, y + 15, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(patientName.charAt(0).toUpperCase(), margin + 15, y + 18, { align: 'center' });

      // Patient name and info
      doc.setTextColor(6, 95, 70);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(patientName, margin + 30, y + 12);

      doc.setTextColor(107, 114, 128);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const patientInfo = `${patientAge} years • ${patientGender}${patientOccupation ? ` • ${patientOccupation}` : ''}`;
      doc.text(patientInfo, margin + 30, y + 18);

      y += 25;

      // Info badges
      const badgeY = y;
      const badgeWidth = (contentWidth - 10) / 3;

      if (prakriti) {
        doc.setFillColor(240, 253, 244); // #f0fdf4
        doc.roundedRect(margin, badgeY, badgeWidth, 15, 2, 2);
        doc.fill();
        doc.setTextColor(107, 114, 128);
        doc.setFontSize(8);
        doc.text('Prakriti', margin + 5, badgeY + 5);
        doc.setTextColor(6, 95, 70);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(prakriti, margin + 5, badgeY + 12);
      }

      if (dietaryPref) {
        doc.setFillColor(239, 246, 255); // #eff6ff
        doc.roundedRect(margin + badgeWidth + 5, badgeY, badgeWidth, 15, 2, 2);
        doc.fill();
        doc.setTextColor(107, 114, 128);
        doc.setFontSize(8);
        doc.text('Diet', margin + badgeWidth + 10, badgeY + 5);
        doc.setTextColor(37, 99, 235);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(dietaryPref, margin + badgeWidth + 10, badgeY + 12);
      }

      if (condition) {
        doc.setFillColor(254, 242, 242); // #fef2f2
        doc.roundedRect(margin + (badgeWidth + 5) * 2, badgeY, badgeWidth, 15, 2, 2);
        doc.fill();
        doc.setTextColor(107, 114, 128);
        doc.setFontSize(8);
        doc.text('Condition', margin + (badgeWidth + 5) * 2 + 5, badgeY + 5);
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(condition, margin + (badgeWidth + 5) * 2 + 5, badgeY + 12);
      }

      y += 20;

      // Allergies warning
      if (allergies && allergies.length > 0 && allergies[0] !== 'None') {
        checkPageBreak(10);
        doc.setFillColor(255, 251, 235); // #fffbeb
        doc.setDrawColor(253, 230, 138); // #fde68a
        doc.roundedRect(margin, y, contentWidth, 8, 2, 2);
        doc.fill();
        doc.stroke();
        doc.setTextColor(146, 64, 14); // #92400e
        doc.setFontSize(9);
        doc.text(`⚠️ Allergies: ${allergies.join(', ')}`, margin + 5, y + 5);
        y += 12;
      }

      // ─── KNOWLEDGE SOURCES ───
      if (matchedFiles.length > 0) {
        checkPageBreak(10);
        doc.setFillColor(236, 253, 245); // #ecfdf5
        doc.setDrawColor(167, 243, 208); // #a7f3d0
        doc.roundedRect(margin, y, contentWidth, 8, 2, 2);
        doc.fill();
        doc.stroke();
        doc.setTextColor(6, 95, 70);
        doc.setFontSize(9);
        doc.text(`📚 Based on: ${matchedFiles.map(f => f.label).join(' • ')}`, margin + 5, y + 5);
        y += 12;
      }

      // ─── DIET CHART SECTIONS ───
      for (const section of sections) {
        const config = getSectionConfig(section.header);
        const isMealSection = ['EARLY MORNING', 'BREAKFAST', 'MID-MORNING', 'LUNCH', 'EVENING SNACK', 'DINNER', 'BEDTIME'].includes(section.header);

        // Section header
        checkPageBreak(15);

        // Header background
        const headerBg: [number, number, number] = [
          Math.min(255, config.color[0] + 200),
          Math.min(255, config.color[1] + 200),
          Math.min(255, config.color[2] + 200),
        ];
        doc.setFillColor(headerBg[0], headerBg[1], headerBg[2]);
        doc.setDrawColor(config.color[0], config.color[1], config.color[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, y, contentWidth, 10, 2, 2);
        doc.fill();
        doc.stroke();

        // Left border accent
        doc.setFillColor(config.color[0], config.color[1], config.color[2]);
        doc.rect(margin, y, 2, 10, 'F');

        // Section title
        doc.setTextColor(config.color[0], config.color[1], config.color[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${config.icon} ${section.header}`, margin + 8, y + 7);

        y += 14;

        // Section items
        for (const item of section.items) {
          const text = formatItem(item);
          if (!text) continue;

          // Calculate text height
          const textLines = doc.splitTextToSize(text, contentWidth - 15);
          const textHeight = textLines.length * 5 + 4;

          checkPageBreak(textHeight);

          // Item background
          if (isMealSection) {
            doc.setFillColor(249, 250, 251); // #f9fafb
            doc.roundedRect(margin + 5, y, contentWidth - 10, textHeight, 1, 1);
            doc.fill();
          }

          // Bullet point
          doc.setTextColor(config.color[0], config.color[1], config.color[2]);
          doc.setFontSize(10);
          doc.text('●', margin + 8, y + 4);

          // Item text
          doc.setTextColor(55, 65, 81); // #374151
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(textLines, margin + 14, y + 4);

          y += textHeight + 2;
        }

        y += 4;
      }

      // ─── DISCLAIMER ───
      checkPageBreak(25);
      doc.setFillColor(255, 251, 235); // #fffbeb
      doc.setDrawColor(253, 230, 138); // #fde68a
      doc.roundedRect(margin, y, contentWidth, 20, 2, 2);
      doc.fill();
      doc.stroke();

      doc.setTextColor(146, 64, 14); // #92400e
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('⚠️ Important Disclaimer', margin + 5, y + 5);

      doc.setTextColor(120, 53, 15); // #78350f
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const disclaimerText = 'This diet chart is prepared based on Ayurvedic principles and is intended as a general guideline. Please consult with Dr. Jinendradutt Sharma at Ayurvritta Ayurveda Hospital before making significant dietary changes, especially if you have existing medical conditions or are taking medications. Individual results may vary based on your unique constitution and health status.';
      const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 10);
      doc.text(disclaimerLines, margin + 5, y + 10);

      y += 25;

      // ─── FOOTER ───
      checkPageBreak(20);
      doc.setFillColor(6, 95, 70); // #065f46
      doc.rect(0, y, pageWidth, 20, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('🌿 Ayurvritta Ayurveda Hospital', pageWidth / 2, y + 7, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Authentic Ayurvedic Care by Dr. Jinendradutt Sharma', pageWidth / 2, y + 12, { align: 'center' });

      doc.setFontSize(9);
      doc.text('Vadodara, Gujarat • +91 94266 84047 • www.ayurvritta.com', pageWidth / 2, y + 17, { align: 'center' });

      // Save the PDF
      const filename = `Diet_Chart_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      console.log('[PDF] PDF generated successfully with jsPDF');
    } catch (error) {
      console.error('[PDF] PDF generation failed:', error);
    } finally {
      setGenerating(false);
    }
  }, [patientName, patientAge, patientGender, patientOccupation, prakriti, dietaryPref, allergies, condition, aiResult, matchedFiles, sections]);

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
