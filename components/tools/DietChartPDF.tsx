import React, { useRef, useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    html2pdf: any;
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (window.html2pdf) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!contentRef.current || !window.html2pdf) {
      console.error('html2pdf not loaded or content ref missing');
      return;
    }

    try {
      const element = contentRef.current;

      // Temporarily make element visible for rendering
      const parent = element.parentElement;
      if (parent) {
        parent.style.left = '0';
        parent.style.opacity = '1';
        parent.style.zIndex = '9999';
      }

      // Small delay to ensure rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Diet_Chart_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: true,
          letterRendering: true,
          allowTaint: false,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await window.html2pdf().set(opt).from(element).save();

      // Re-hide after generation
      if (parent) {
        parent.style.left = '-9999px';
        parent.style.opacity = '0';
        parent.style.zIndex = '-1';
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Re-hide on error
      const parent = contentRef.current?.parentElement;
      if (parent) {
        parent.style.left = '-9999px';
        parent.style.opacity = '0';
        parent.style.zIndex = '-1';
      }
    }
  }, [patientName]);

  const parseSections = (text: string) => {
    const sections: { header: string; items: string[] }[] = [];
    const lines = text.split('\n');
    let current: { header: string; items: string[] } | null = null;

    for (const line of lines) {
      let t = line.trim();
      if (!t) continue;

      // Strip markdown bold markers
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

  const sectionConfig: Record<string, { icon: string; color: string; bg: string; border: string }> = {
    'EARLY MORNING': { icon: '🌅', color: '#ea580c', bg: '#fff7ed', border: '#fb923c' },
    'BREAKFAST': { icon: '🥣', color: '#ca8a04', bg: '#fefce8', border: '#facc15' },
    'MID-MORNING': { icon: '⏰', color: '#d97706', bg: '#fffbeb', border: '#fbbf24' },
    'LUNCH': { icon: '🍛', color: '#16a34a', bg: '#f0fdf4', border: '#4ade80' },
    'EVENING SNACK': { icon: '🍵', color: '#0d9488', bg: '#f0fdfa', border: '#2dd4bf' },
    'DINNER': { icon: '🥘', color: '#059669', bg: '#ecfdf5', border: '#34d399' },
    'BEDTIME': { icon: '🌙', color: '#4f46e5', bg: '#eef2ff', border: '#818cf8' },
    'FOODS TO FAVOR': { icon: '✅', color: '#15803d', bg: '#f0fdf4', border: '#22c55e' },
    'FOODS TO AVOID': { icon: '🚫', color: '#dc2626', bg: '#fef2f2', border: '#f87171' },
    'BENEFICIAL HERBS': { icon: '🌿', color: '#059669', bg: '#ecfdf5', border: '#10b981' },
    'LIFESTYLE TIPS': { icon: '💡', color: '#2563eb', bg: '#eff6ff', border: '#60a5fa' },
    'PRECAUTIONS': { icon: '⚠️', color: '#d97706', bg: '#fffbeb', border: '#f59e0b' },
    'OVERVIEW': { icon: '📋', color: '#6b7280', bg: '#f9fafb', border: '#9ca3af' },
  };

  const getSectionMeta = (header: string) => {
    return sectionConfig[header] || { icon: '📌', color: '#6b7280', bg: '#f9fafb', border: '#d1d5db' };
  };

  const formatItem = (item: string): string => {
    let text = item;
    // Remove markdown bold
    text = text.replace(/\*\*(.*?)\*\*/g, '$1');
    // Remove markdown italic
    text = text.replace(/\*(.*?)\*/g, '$1');
    // Clean up list markers
    text = text.replace(/^[-*•]\s*/, '');
    text = text.replace(/^\d+[\.\)]\s*/, '');
    return text.trim();
  };

  const isListItem = (item: string): boolean => {
    return /^[-*•]\s/.test(item) || /^\d+[\.\)]\s/.test(item);
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={!scriptLoaded}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {scriptLoaded ? 'Download PDF' : 'Loading PDF...'}
      </button>

      {/* PDF content - hidden offscreen but renderable */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1, opacity: 0, pointerEvents: 'none', transition: 'none' }}>
        <div ref={contentRef} style={{
          fontFamily: "'Segoe UI', Arial, sans-serif",
          color: '#1f2937',
          width: '210mm',
          minHeight: '297mm',
          background: 'white',
          padding: '0',
        }}>

          {/* ─── HEADER ─── */}
          <div style={{
            background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)',
            padding: '28px 32px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', right: '40px', bottom: '-30px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '4px' }}>
                  Ayurvritta Ayurveda Hospital
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
                  Personalized Diet Chart
                </h1>
                <p style={{ fontSize: '13px', opacity: 0.85, margin: 0 }}>
                  Prepared by Dr. Jinendradutt Sharma • Vadodara, Gujarat
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '32px', marginBottom: '4px' }}>🌿</div>
                <p style={{ fontSize: '11px', opacity: 0.8, margin: '0 0 2px 0' }}>
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p style={{ fontSize: '10px', opacity: 0.7, margin: 0 }}>+91 94266 84047</p>
              </div>
            </div>
          </div>

          {/* ─── PATIENT INFO CARD ─── */}
          <div style={{ padding: '0 24px', marginTop: '-12px', position: 'relative', zIndex: 2 }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '18px 24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #065f46, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: 'white',
                  fontWeight: 'bold',
                }}>
                  {patientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 2px 0', color: '#065f46' }}>
                    {patientName}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    {patientAge} years • {patientGender}{patientOccupation ? ` • ${patientOccupation}` : ''}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {prakriti && (
                  <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '8px 12px' }}>
                    <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Prakriti</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#065f46' }}>{prakriti}</div>
                  </div>
                )}
                {dietaryPref && (
                  <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '8px 12px' }}>
                    <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Diet</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#2563eb' }}>{dietaryPref}</div>
                  </div>
                )}
                {condition && (
                  <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '8px 12px' }}>
                    <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '2px' }}>Condition</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#dc2626' }}>{condition}</div>
                  </div>
                )}
              </div>

              {allergies && allergies.length > 0 && allergies[0] !== 'None' && (
                <div style={{ marginTop: '10px', padding: '8px 12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: '11px', color: '#92400e' }}>⚠️ Allergies: {allergies.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* ─── KNOWLEDGE SOURCES ─── */}
          {matchedFiles.length > 0 && (
            <div style={{ padding: '12px 24px 0' }}>
              <div style={{
                background: '#ecfdf5',
                borderRadius: '8px',
                padding: '10px 14px',
                border: '1px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{ fontSize: '14px' }}>📚</span>
                <span style={{ fontSize: '11px', color: '#065f46' }}>
                  <strong>Based on:</strong> {matchedFiles.map(f => f.label).join(' • ')}
                </span>
              </div>
            </div>
          )}

          {/* ─── DIET CHART SECTIONS ─── */}
          <div style={{ padding: '16px 24px' }}>
            {sections.map((section, idx) => {
              const meta = getSectionMeta(section.header);
              const isMealSection = ['EARLY MORNING', 'BREAKFAST', 'MID-MORNING', 'LUNCH', 'EVENING SNACK', 'DINNER', 'BEDTIME'].includes(section.header);
              const isListSection = ['FOODS TO FAVOR', 'FOODS TO AVOID', 'BENEFICIAL HERBS', 'LIFESTYLE TIPS', 'PRECAUTIONS'].includes(section.header);

              return (
                <div key={idx} style={{ marginBottom: '14px', pageBreakInside: 'avoid' }}>
                  {/* Section Header */}
                  <div style={{
                    background: meta.bg,
                    borderLeft: `4px solid ${meta.color}`,
                    borderRadius: '10px',
                    padding: '12px 16px',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderBottom: `1px solid ${meta.border}40`,
                  }}>
                    <span style={{ fontSize: '22px' }}>{meta.icon}</span>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: meta.color, letterSpacing: '0.5px' }}>
                      {section.header}
                    </h3>
                  </div>

                  {/* Section Content */}
                  <div style={{ padding: '0 8px' }}>
                    {section.items.map((item, i) => {
                      const text = formatItem(item);
                      if (!text) return null;

                      if (isMealSection) {
                        // Meal sections: show as cards
                        const isTime = /^\d{1,2}:\d{2}\s*(AM|PM)/i.test(text);
                        return (
                          <div key={i} style={{
                            background: isTime ? '#f9fafb' : 'white',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            marginBottom: '6px',
                            border: '1px solid #f3f4f6',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                          }}>
                            <span style={{ color: meta.color, fontSize: '12px', marginTop: '2px' }}>●</span>
                            <span style={{ fontSize: '12px', lineHeight: '1.5', color: '#374151' }}>{text}</span>
                          </div>
                        );
                      }

                      if (isListSection) {
                        // List sections: show with bullets
                        return (
                          <div key={i} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            marginBottom: '6px',
                            padding: '8px 12px',
                            background: '#fafafa',
                            borderRadius: '6px',
                          }}>
                            <span style={{ color: meta.color, fontSize: '12px', marginTop: '2px' }}>●</span>
                            <span style={{ fontSize: '12px', lineHeight: '1.5', color: '#374151' }}>{text}</span>
                          </div>
                        );
                      }

                      // Default
                      return (
                        <p key={i} style={{ fontSize: '12px', lineHeight: '1.6', color: '#4b5563', margin: '0 0 6px 4px' }}>
                          {text}
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── DISCLAIMER ─── */}
          <div style={{ padding: '0 24px', marginBottom: '16px' }}>
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold', color: '#92400e' }}>
                    Important Disclaimer
                  </p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#78350f', lineHeight: '1.5' }}>
                    This diet chart is prepared based on Ayurvedic principles and is intended as a general guideline.
                    Please consult with Dr. Jinendradutt Sharma at Ayurvritta Ayurveda Hospital before making significant
                    dietary changes, especially if you have existing medical conditions or are taking medications.
                    Individual results may vary based on your unique constitution and health status.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── FOOTER ─── */}
          <div style={{
            background: 'linear-gradient(135deg, #065f46, #047857)',
            padding: '20px 24px',
            color: 'white',
            textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              🌿 Ayurvritta Ayurveda Hospital
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '12px', opacity: 0.9 }}>
              Authentic Ayurvedic Care by Dr. Jinendradutt Sharma
            </p>
            <p style={{ margin: 0, fontSize: '11px', opacity: 0.75 }}>
              Vadodara, Gujarat • +91 94266 84047 • www.ayurvritta.com
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DietChartPDF;
