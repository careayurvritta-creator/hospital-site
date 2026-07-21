import React, { useState, useCallback, useEffect } from 'react';

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
  const [printing, setPrinting] = useState(false);

  const handleClick = useCallback(() => {
    setPrinting(true);

    // Clone the chart content as a direct child of body for clean print isolation
    const original = document.getElementById(containerId);
    if (!original) return;

    const clone = original.cloneNode(true) as HTMLElement;
    clone.id = 'diet-print-clone';
    clone.style.position = 'absolute';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.width = '100%';
    clone.style.zIndex = '10000';
    clone.style.background = '#ffffff';
    document.body.appendChild(clone);

    const style = document.createElement('style');
    style.id = 'diet-print-styles';
    style.textContent = `
      @media print {
        @page { margin: 15mm; size: A4 portrait; }
        body > * { display: none !important; }
        body > #diet-print-clone,
        body > #diet-print-clone > * {
          display: block !important;
        }
        #diet-print-clone {
          display: block !important;
          position: static !important;
          width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          background: #ffffff !important;
        }
        #diet-print-clone > div { page-break-inside: avoid; }
        #diet-print-clone img, #diet-print-clone svg { page-break-inside: avoid; }
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => window.print(), 400);
  }, [containerId]);

  useEffect(() => {
    const cleanup = () => {
      document.getElementById('diet-print-clone')?.remove();
      document.getElementById('diet-print-styles')?.remove();
      setPrinting(false);
    };
    window.addEventListener('afterprint', cleanup);
    const fallback = setTimeout(cleanup, 30000);
    return () => {
      window.removeEventListener('afterprint', cleanup);
      clearTimeout(fallback);
      cleanup();
    };
  }, []);

  return (
    <>
      {printing && (
        <div className="fixed inset-0 z-[9999] bg-white/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-4 p-6">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
            <p className="text-gray-700 font-semibold text-lg">Preparing your PDF...</p>
            <p className="text-gray-400 text-sm">In the print dialog, choose <strong>Save as PDF</strong> as the destination and click Save.</p>
          </div>
        </div>
      )}
      <button
        onClick={handleClick}
        disabled={printing}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {printing ? 'Opening Print...' : 'Download PDF'}
      </button>
    </>
  );
};

export default DietChartPDF;
