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

const DietChartPDF: React.FC<DietChartPDFProps> = ({ containerId, patientName }) => {
  const [generating, setGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    const source = document.getElementById(containerId);
    if (!source) return;

    setGenerating(true);

    try {
      const canvas = await html2canvas(source, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: false,
        width: source.scrollWidth,
        height: source.scrollHeight,
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const margin = 15;
      const pageW = 210 - margin * 2;
      const pageH = 297 - margin * 2;

      const imgW = pageW;
      const totalImgH = (canvas.height * imgW) / canvas.width;
      const pageCanvasH = (canvas.width * pageH) / imgW;

      let srcY = 0;
      let pageNum = 0;

      while (srcY < canvas.height) {
        const sliceH = Math.min(pageCanvasH, canvas.height - srcY);
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = sliceH;

        const ctx = slice.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, slice.width, slice.height);
          ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        }

        if (pageNum > 0) pdf.addPage();
        pdf.addImage(
          slice.toDataURL('image/jpeg', 0.95),
          'JPEG',
          margin, margin,
          imgW,
          (sliceH * imgW) / canvas.width,
        );

        srcY += pageCanvasH;
        pageNum++;
      }

      pdf.save(`${patientName.replace(/\s+/g, '_')}_Diet_Chart_${new Date().toISOString().split('T')[0]}.pdf`);
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
