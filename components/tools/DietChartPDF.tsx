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

const DietChartPDF: React.FC<DietChartPDFProps> = ({
  patientName,
  patientAge,
  patientGender,
  patientOccupation,
  prakriti,
  dietaryPref,
  allergies,
  condition,
  containerId,
}) => {
  const [generating, setGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    const element = document.getElementById(containerId);
    if (!element) {
      console.error('[PDF] Element #' + containerId + ' not found');
      return;
    }

    setGenerating(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: false,
        onclone: (clonedDoc) => {
          const cloned = clonedDoc.getElementById(containerId);
          if (cloned) {
            cloned.style.width = '800px';
            cloned.style.padding = '16px';
          }
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 12;
      const pdfWidth = pageWidth - margin * 2;

      const canvasPageHeight = (canvas.width * (pageHeight - margin * 2)) / pdfWidth;
      let srcY = 0;

      while (srcY < canvas.height) {
        const sliceHeight = Math.min(canvasPageHeight, canvas.height - srcY);

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeight;
        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, srcY, canvas.width, sliceHeight,
            0, 0, canvas.width, sliceHeight,
          );
        }

        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.92);

        if (srcY > 0) pdf.addPage();
        pdf.addImage(sliceData, 'JPEG', margin, margin, pdfWidth, (sliceHeight * pdfWidth) / canvas.width);
        srcY += sliceHeight;
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
