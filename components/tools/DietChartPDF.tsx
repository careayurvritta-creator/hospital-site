import React, { useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { parseAIResult } from './DietChartRenderer';

interface DietChartPDFProps {
  patientName: string;
  aiResult: string;
}

const M = 15;
const PW = 210;
const PH = 297;
const CW = PW - M * 2;
const HEADER_FOOTER_H = 16;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function rgbaStr(r: number, g: number, b: number, a: number): string {
  return `rgba(${r},${g},${b},${a})`;
}

function getBackdropOpacity(el: HTMLElement): number {
  const cls = el.className?.toString() || '';
  if (cls.includes('/90')) return 0.9;
  if (cls.includes('/80')) return 0.8;
  if (cls.includes('/70')) return 0.7;
  if (cls.includes('/60')) return 0.6;
  if (cls.includes('/50')) return 0.5;
  if (cls.includes('/40')) return 0.4;
  if (cls.includes('/30')) return 0.3;
  if (cls.includes('/20')) return 0.2;
  if (cls.includes('/10')) return 0.1;
  return 0.7;
}

const COLOR_MAP: Record<string, [number, number, number]> = {
  'white': [255, 255, 255],
  'emerald-50': [236, 253, 245],
  'emerald-100': [209, 250, 229],
  'emerald-200': [167, 243, 208],
  'emerald-300': [110, 231, 183],
  'emerald-400': [52, 211, 153],
  'emerald-500': [16, 185, 129],
  'emerald-600': [5, 150, 105],
  'emerald-700': [4, 120, 87],
  'emerald-800': [6, 95, 70],
  'amber-50': [255, 251, 235],
  'amber-100': [254, 243, 199],
  'amber-200': [253, 230, 138],
  'amber-300': [252, 211, 77],
  'amber-400': [251, 191, 36],
  'amber-500': [245, 158, 11],
  'amber-600': [217, 119, 6],
  'amber-700': [180, 83, 9],
  'amber-800': [146, 64, 14],
  'indigo-50': [238, 242, 255],
  'indigo-100': [199, 210, 254],
  'indigo-200': [165, 177, 236],
  'indigo-500': [99, 102, 241],
  'indigo-600': [79, 70, 229],
  'indigo-700': [67, 56, 202],
  'teal-50': [240, 253, 250],
  'teal-100': [204, 251, 241],
  'teal-200': [153, 246, 228],
  'teal-500': [20, 184, 166],
  'teal-600': [13, 148, 136],
  'teal-700': [15, 118, 110],
  'gray-50': [249, 250, 251],
  'gray-100': [243, 244, 246],
  'gray-200': [229, 231, 235],
  'gray-300': [209, 213, 219],
  'gray-400': [156, 163, 175],
  'gray-500': [107, 114, 128],
  'gray-600': [75, 85, 99],
  'gray-700': [55, 65, 81],
  'gray-800': [31, 41, 55],
  'gray-900': [17, 24, 39],
  'red-50': [254, 242, 242],
  'red-100': [254, 226, 226],
  'red-200': [254, 202, 202],
  'red-300': [252, 165, 165],
  'red-400': [248, 113, 113],
  'red-500': [239, 68, 68],
  'red-600': [220, 38, 38],
  'red-700': [185, 28, 28],
  'green-50': [239, 246, 239],
  'green-100': [209, 250, 229],
  'sky-50': [240, 249, 255],
  'sky-100': [224, 242, 254],
  'lime-50': [240, 253, 232],
  'rose-50': [255, 241, 242],
  'rose-100': [255, 228, 230],
  'orange-50': [255, 247, 237],
  'orange-100': [255, 237, 213],
  'slate-50': [248, 250, 252],
  'slate-100': [241, 245, 249],
  'slate-200': [226, 232, 240],
  'zinc-50': [250, 250, 250],
  'zinc-100': [244, 244, 245],
};

function getBgRgb(el: HTMLElement): [number, number, number] {
  const cls = el.className?.toString() || '';
  for (const c of cls.split(' ')) {
    if (c.startsWith('bg-')) {
      const part = c.replace('bg-', '').split('/')[0];
      if (COLOR_MAP[part]) return COLOR_MAP[part];
    }
  }
  return [249, 250, 251];
}

function applySolidBackground(el: HTMLElement): { prevBg: string; prevBf: string } | null {
  const style = el.style as any;
  const computed = getComputedStyle(el);
  const bf = computed.backdropFilter || (style.webkitBackdropFilter as string) || '';

  if (bf && bf !== 'none' && bf.includes('blur')) {
    const prevBg = style.backgroundColor;
    const prevBf = style.backdropFilter || (style.webkitBackdropFilter as string) || '';
    const opacity = getBackdropOpacity(el);
    const rgb = getBgRgb(el);
    style.backgroundColor = rgbaStr(rgb[0], rgb[1], rgb[2], opacity);
    style.backdropFilter = 'none';
    style.webkitBackdropFilter = 'none';
    return { prevBg, prevBf };
  }
  return null;
}

async function makeAllContentVisible(el: HTMLElement): Promise<{ savedBody: string; savedOverflow: string }> {
  const body = document.body;
  const savedBody = body.style.cssText;
  const savedOverflow = body.style.overflow || '';
  body.style.overflow = 'visible';

  const savedEl = el.style.cssText;
  const origPos = el.style.position;
  const origH = el.style.height;
  const origOvf = el.style.overflow;

  el.style.position = 'relative';
  el.style.height = 'auto';
  el.style.overflow = 'visible';
  el.style.maxWidth = 'none';

  await sleep(50);
  return { savedBody, savedOverflow };
}

function restoreAllContent(
  el: HTMLElement,
  savedBody: string,
  savedOverflow: string,
  restoreFns: Array<() => void>
): void {
  document.body.style.cssText = savedBody;
  document.body.style.overflow = savedOverflow;
  for (const fn of restoreFns) fn();
}

async function captureChart(element: HTMLElement, bgColor: string): Promise<HTMLCanvasElement> {
  const restoreFns: Array<() => void> = [];
  const body = document.body;
  const savedBodyOverflow = body.style.overflow;
  body.style.overflow = 'visible';

  const savedElCss = element.style.cssText;
  element.style.position = 'relative';
  element.style.height = 'auto';
  element.style.overflow = 'visible';
  element.style.maxWidth = 'none';

  await sleep(80);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: bgColor,
    logging: false,
    windowHeight: element.offsetHeight + 200,
    onclone: (doc) => {
      const cloneBody = doc.body;
      cloneBody.style.cssText = 'margin:0;padding:16px;background:' + bgColor + ';overflow:visible;';
      const cloneEl = doc.getElementById('diet-chart-renderer');
      if (cloneEl) {
        cloneEl.style.cssText = 'position:relative;height:auto;overflow:visible;max-width:none;';
        const walker = doc.createTreeWalker(cloneEl, NodeFilter.SHOW_ELEMENT);
        let node: Node | null = walker.currentNode;
        while (node) {
          const el = node as HTMLElement;
          if (el.style) {
            const style = el.style as any;
            const bf = getComputedStyle(el as Element).backdropFilter;
            if (bf && bf !== 'none' && bf.includes('blur')) {
              const cls = el.className?.toString() || '';
              const opacityMatch = cls.match(/\/(\d+)/);
              const opacity = opacityMatch ? parseInt(opacityMatch[1]) / 100 : 0.7;
              const prevBg = style.backgroundColor;
              let rgb: [number, number, number] = [249, 250, 251];
              for (const c of cls.split(' ')) {
                if (c.startsWith('bg-')) {
                  const part = c.replace('bg-', '').split('/')[0];
                  if (COLOR_MAP[part]) { rgb = COLOR_MAP[part]; break; }
                }
              }
              style.backgroundColor = rgbaStr(rgb[0], rgb[1], rgb[2], opacity);
              style.backdropFilter = 'none';
              style.webkitBackdropFilter = 'none';
              restoreFns.push(() => {
                style.backgroundColor = prevBg;
                style.backdropFilter = bf;
                style.webkitBackdropFilter = bf;
              });
            }
          }
          node = walker.nextNode();
        }
      }
    },
  });

  body.style.overflow = savedBodyOverflow;
  element.style.cssText = savedElCss;
  for (const fn of restoreFns) fn();

  return canvas;
}

function buildPdf(pdf: jsPDF, canvas: HTMLCanvasElement, contentW: number, contentH: number): void {
  const canvasW = canvas.width;
  const canvasH = canvas.height;

  const imgWmm = contentW;
  const imgHmm = (canvasH * imgWmm) / canvasW;

  const pxPerMmW = canvasW / imgWmm;
  const pxPerMmH = canvasH / imgHmm;
  const sliceHeightPx = Math.floor(contentH * pxPerMmH);
  const pagesNeeded = Math.ceil(canvasH / sliceHeightPx);

  for (let page = 0; page < pagesNeeded; page++) {
    if (page > 0) pdf.addPage();

    const srcY = page * sliceHeightPx;
    const remaining = canvasH - srcY;
    const actualH = Math.min(sliceHeightPx, remaining);
    const actualHmm = actualH * (imgWmm / canvasW);

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvasW;
    pageCanvas.height = actualH;
    const ctx = pageCanvas.getContext('2d')!;
    ctx.drawImage(canvas, 0, srcY, canvasW, actualH, 0, 0, canvasW, actualH);

    const dataUrl = pageCanvas.toDataURL('image/png', 1.0);
    pdf.addImage(dataUrl, 'PNG', M, M, imgWmm, actualHmm);
  }
}

async function drawHeader(pdf: jsPDF, patientName: string): Promise<number> {
  const green = [6, 78, 59] as [number, number, number];
  const greenLight = [232, 245, 235] as [number, number, number];

  pdf.setFillColor(green[0], green[1], green[2]);
  pdf.roundedRect(M, M, CW, 13, 2, 2, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Ayurvritta Ayurveda Hospital', M + 6, M + 6);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(200, 220, 210);
  pdf.text('Personalized Ayurvedic Diet Chart' + (patientName ? ` — ${patientName}` : ''), M + 6, M + 10.5);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(7.5);
  pdf.text('www.ayurvrittaayurveda.in', PW - M - 6, M + 7.5, { align: 'right' });

  pdf.setFillColor(greenLight[0], greenLight[1], greenLight[2]);
  pdf.rect(M, M + 13, CW, 1.5, 'F');

  return M + 14.5;
}

function drawFooter(pdf: jsPDF, pageNum: number, totalPages: number): void {
  const footerY = PH - 10;
  pdf.setDrawColor(229, 231, 235);
  pdf.setLineWidth(0.2);
  pdf.line(M, footerY - 2, PW - M, footerY - 2);
  pdf.setTextColor(156, 163, 175);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text(
    'Ayurvritta Ayurveda Hospital — For educational purposes. Consult your physician before dietary changes.',
    M,
    footerY
  );
  if (totalPages > 1) {
    pdf.text(`Page ${pageNum} of ${totalPages}`, PW - M, footerY, { align: 'right' });
  }
}

const DietChartPDF: React.FC<DietChartPDFProps> = ({ patientName, aiResult }) => {
  const [generating, setGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    setGenerating(true);
    try {
      const sections = parseAIResult(aiResult);
      if (!sections.length) { setGenerating(false); return; }

      const el = document.getElementById('diet-chart-renderer');
      if (!el) { console.error('[PDF] element #diet-chart-renderer not found'); setGenerating(false); return; }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const bgColor = '#f0fdf4';

      const headerBottom = await drawHeader(pdf, patientName);
      const availableH = PH - headerBottom - HEADER_FOOTER_H;

      const canvas = await captureChart(el, bgColor);
      buildPdf(pdf, canvas, CW, availableH);

      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        drawFooter(pdf, i, pageCount);
      }

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
      {generating ? 'Capturing...' : 'Download PDF'}
    </button>
  );
};

export default DietChartPDF;