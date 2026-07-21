import React, { useState, useCallback } from 'react';

interface DietChartPDFProps {
  patientName: string;
  patientAge: string;
  patientGender: string;
  patientOccupation?: string;
  prakriti?: string;
  dietaryPref?: string;
  allergies?: string[];
  condition: string;
  containerId: string;
}

const DietChartPDF: React.FC<DietChartPDFProps> = ({ containerId, patientName }) => {
  const [generating, setGenerating] = useState(false);

  const handleDownload = useCallback(() => {
    const source = document.getElementById(containerId);
    if (!source) return;

    setGenerating(true);

    try {
      const clone = source.cloneNode(true) as HTMLElement;
      const allStyles = document.querySelectorAll('style, link[rel="stylesheet"]');
      let styleText = '';
      allStyles.forEach(s => {
        if (s.tagName === 'STYLE') styleText += s.innerHTML + '\n';
        else if (s.tagName === 'LINK') styleText += `<link rel="stylesheet" href="${(s as HTMLLinkElement).href}">\n`;
      });

      styleText += `
        @page { margin: 15mm; size: A4; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          div[id^="diet-chart"] > div { page-break-inside: avoid; }
          div[class*="rounded-2xl"] { page-break-inside: avoid; }
          div[class*="rounded-3xl"] { page-break-inside: avoid; }
          h2, h3, h4 { page-break-after: avoid; }
          table { page-break-inside: avoid; }
          img, svg { page-break-inside: avoid; }
        }
      `;

      const win = window.open('', '_blank');
      if (!win) { setGenerating(false); return; }

      win.document.write(`<!DOCTYPE html><html><head>
        <meta charset="UTF-8">
        <title>${patientName} - Diet Chart</title>
        ${styleText}
      </head><body>${clone.outerHTML}</body></html>`);
      win.document.close();

      setTimeout(() => {
        win.focus();
        win.print();
        setTimeout(() => { win.close(); setGenerating(false); }, 1000);
      }, 1500);
    } catch (error) {
      console.error('[PDF] Error:', error);
      setGenerating(false);
    }
  }, [containerId, patientName]);

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {generating ? 'Opening Print Dialog...' : 'Download PDF'}
    </button>
  );
};

export default DietChartPDF;
