import React, { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

const PAGE_W = 210;
const PAGE_H = 297;
const M = 15;
const CONTENT_W = PAGE_W - M * 2;

function mmToPx(mm: number, dpi = 96): number {
  return Math.round((mm * dpi) / 25.4);
}

const DietChartPDF: React.FC<DietChartPDFProps> = ({ containerId, patientName }) => {
  const [generating, setGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    const source = document.getElementById(containerId);
    if (!source) return;

    setGenerating(true);

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const children = Array.from(source.children) as HTMLElement[];
      let y = M;

      const addPageIfNeeded = (hMm: number) => {
        if (y + hMm > PAGE_H - M) {
          pdf.addPage();
          y = M;
        }
      };

      for (let ci = 0; ci < children.length; ci++) {
        const child = children[ci];

        const canvas = await html2canvas(child, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: false,
          width: child.scrollWidth,
          height: child.scrollHeight,
        });

        const imgW = CONTENT_W;
        const imgH = (canvas.height * imgW) / canvas.width;

        addPageIfNeeded(imgH);

        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.92),
          'JPEG',
          M,
          y,
          imgW,
          imgH,
        );

        y += imgH + 2;
      }

      const filename = `${patientName.replace(/\s+/g, '_')}_Diet_Chart_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('[PDF] Error:', error);
    } finally {
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
      {generating ? 'Generating PDF...' : 'Download PDF'}
    </button>
  );
};

export default DietChartPDF;
