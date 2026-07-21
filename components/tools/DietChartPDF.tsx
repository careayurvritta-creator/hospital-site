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
const CW = PAGE_W - M * 2;

const DietChartPDF: React.FC<DietChartPDFProps> = ({ containerId, patientName }) => {
  const [generating, setGenerating] = useState(false);

  function collectSections(root: HTMLElement): HTMLElement[] {
    const result: HTMLElement[] = [];
    for (let i = 0; i < root.children.length; i++) {
      const child = root.children[i] as HTMLElement;
      const inner = child.querySelector('.space-y-4') || child.querySelector('[class*="space-y-4"]');
      if (child.id?.includes('renderer') && inner) {
        for (let j = 0; j < inner.children.length; j++) {
          result.push(inner.children[j] as HTMLElement);
        }
      } else {
        result.push(child);
      }
    }
    return result;
  }

  const handleDownload = useCallback(async () => {
    const source = document.getElementById(containerId);
    if (!source) return;

    setGenerating(true);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = M;

    try {
      const sections = collectSections(source);

      for (const el of sections) {
        if (!el.innerHTML.trim()) continue;

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: false,
          width: el.scrollWidth,
          height: el.scrollHeight,
        });

        const imgW = CW;
        const imgH = (canvas.height * imgW) / canvas.width;

        const pageAvail = PAGE_H - M - y;
        if (imgH > PAGE_H - 2 * M) {
          if (y !== M) { pdf.addPage(); y = M; }
          const pageHpx = (canvas.width * (PAGE_H - 2 * M)) / imgW;
          let srcY = 0;
          let first = true;
          while (srcY < canvas.height) {
            const sliceH = Math.min(pageHpx, canvas.height - srcY);
            const slice = document.createElement('canvas');
            slice.width = canvas.width;
            slice.height = sliceH;
            const ctx = slice.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, slice.width, slice.height);
              ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
            }
            if (!first) pdf.addPage();
            pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', M, M, imgW, (sliceH * imgW) / canvas.width);
            srcY += sliceH;
            first = false;
          }
          y = M;
        } else if (imgH > pageAvail) {
          pdf.addPage();
          pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', M, M, imgW, imgH);
          y = M + imgH + 2;
        } else {
          pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', M, y, imgW, imgH);
          y += imgH + 2;
        }
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
