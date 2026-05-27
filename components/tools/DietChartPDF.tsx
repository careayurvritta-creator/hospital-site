import React, { useRef } from 'react';

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

  const handleDownload = async () => {
    if (!contentRef.current) return;

    const html2pdf = (await import('html2pdf.js')).default;
    const element = contentRef.current;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Diet_Chart_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    await html2pdf().set(opt).from(element).save();
  };

  const parseSections = (text: string) => {
    const sections: { header: string; items: string[] }[] = [];
    const lines = text.split('\n');
    let current: { header: string; items: string[] } | null = null;

    for (const line of lines) {
      const t = line.trim();
      if (t.match(/^[A-Z][A-Z\s&()\-:]+$/) && t.length > 3 && t.length < 80) {
        if (current) sections.push(current);
        current = { header: t, items: [] };
      } else if (current && t) {
        current.items.push(t);
      } else if (!current && t) {
        sections.push({ header: 'OVERVIEW', items: [t] });
      }
    }
    if (current) sections.push(current);
    return sections;
  };

  const sections = parseSections(aiResult);

  const getSectionIcon = (header: string): string => {
    const icons: Record<string, string> = {
      'EARLY MORNING': '🌅',
      'BREAKFAST': '🥣',
      'MID-MORNING': '⏰',
      'LUNCH': '🍛',
      'EVENING SNACK': '🍵',
      'DINNER': '🥘',
      'BEDTIME': '🌙',
      'FOODS TO FAVOR': '✅',
      'FOODS TO AVOID': '🚫',
      'BENEFICIAL HERBS': '🌿',
      'LIFESTYLE TIPS': '💡',
      'PRECAUTIONS': '⚠️',
    };
    return icons[header] || '📌';
  };

  const getSectionColor = (header: string): string => {
    const colors: Record<string, string> = {
      'EARLY MORNING': '#f97316',
      'BREAKFAST': '#eab308',
      'MID-MORNING': '#f59e0b',
      'LUNCH': '#22c55e',
      'EVENING SNACK': '#14b8a6',
      'DINNER': '#10b981',
      'BEDTIME': '#6366f1',
      'FOODS TO FAVOR': '#22c55e',
      'FOODS TO AVOID': '#ef4444',
      'BENEFICIAL HERBS': '#10b981',
      'LIFESTYLE TIPS': '#3b82f6',
      'PRECAUTIONS': '#f59e0b',
    };
    return colors[header] || '#6b7280';
  };

  const formatItem = (item: string) => {
    let text = item;
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    if (text.startsWith('- ') || text.startsWith('* ') || text.startsWith('• ')) {
      return `<li style="margin-bottom: 6px; line-height: 1.5;">${text.replace(/^[-*•]\s*/, '')}</li>`;
    }
    if (/^\d+[\.\)]/.test(text)) {
      return `<li style="margin-bottom: 6px; line-height: 1.5;">${text}</li>`;
    }
    return `<p style="margin-bottom: 6px; line-height: 1.5;">${text}</p>`;
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-[0.98] text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download PDF
      </button>

      {/* Hidden PDF content */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={contentRef} style={{ fontFamily: 'Arial, sans-serif', color: '#1f2937', padding: '20px', maxWidth: '800px' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #065f46, #047857)', borderRadius: '12px', padding: '24px', marginBottom: '20px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  {patientName}'s Personalized Diet Chart
                </h1>
                <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
                  Prepared by Ayurvritta Ayurveda Hospital, Vadodara
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '12px', opacity: 0.8, margin: '0 0 4px 0' }}>Date: {new Date().toLocaleDateString()}</p>
                <p style={{ fontSize: '12px', opacity: 0.8, margin: 0 }}>Dr. Jinendradutt Sharma</p>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#065f46', margin: '0 0 12px 0' }}>
              Patient Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <p style={{ margin: 0, fontSize: '13px' }}><strong>Name:</strong> {patientName}</p>
              <p style={{ margin: 0, fontSize: '13px' }}><strong>Age:</strong> {patientAge} years</p>
              <p style={{ margin: 0, fontSize: '13px' }}><strong>Gender:</strong> {patientGender}</p>
              {patientOccupation && <p style={{ margin: 0, fontSize: '13px' }}><strong>Occupation:</strong> {patientOccupation}</p>}
              {prakriti && <p style={{ margin: 0, fontSize: '13px' }}><strong>Prakriti:</strong> {prakriti}</p>}
              {dietaryPref && <p style={{ margin: 0, fontSize: '13px' }}><strong>Diet:</strong> {dietaryPref}</p>}
              {allergies && allergies.length > 0 && (
                <p style={{ margin: 0, fontSize: '13px' }}><strong>Allergies:</strong> {allergies.join(', ')}</p>
              )}
              <p style={{ margin: 0, fontSize: '13px' }}><strong>Condition:</strong> {condition}</p>
            </div>
          </div>

          {/* Knowledge Sources */}
          {matchedFiles.length > 0 && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '12px', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#065f46' }}>
                <strong>Based on:</strong> {matchedFiles.map(f => f.label).join(' • ')}
              </p>
            </div>
          )}

          {/* Diet Chart Sections */}
          {sections.map((section, idx) => {
            const color = getSectionColor(section.header);
            const icon = getSectionIcon(section.header);
            const isListSection = ['FOODS TO FAVOR', 'FOODS TO AVOID', 'BENEFICIAL HERBS', 'LIFESTYLE TIPS', 'PRECAUTIONS'].includes(section.header);

            return (
              <div key={idx} style={{ marginBottom: '16px', pageBreakInside: 'avoid' }}>
                {/* Section Header */}
                <div style={{
                  background: `${color}15`,
                  borderLeft: `4px solid ${color}`,
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ fontSize: '18px' }}>{icon}</span>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: color }}>
                    {section.header}
                  </h3>
                </div>

                {/* Section Content */}
                <div style={{ padding: '0 8px' }}>
                  {isListSection ? (
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {section.items.map((item, i) => (
                        <span key={i} dangerouslySetInnerHTML={{ __html: formatItem(item) }} />
                      ))}
                    </ul>
                  ) : (
                    section.items.map((item, i) => (
                      <div key={i} dangerouslySetInnerHTML={{ __html: formatItem(item) }} />
                    ))
                  )}
                </div>
              </div>
            );
          })}

          {/* Disclaimer */}
          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '10px', padding: '14px', marginTop: '24px', marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: '#92400e' }}>
              ⚠️ Important Disclaimer
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#78350f', lineHeight: '1.5' }}>
              This diet chart is prepared based on Ayurvedic principles and is intended as a general guideline.
              Please consult with Dr. Jinendradutt Sharma at Ayurvritta Ayurveda Hospital before making significant
              dietary changes, especially if you have existing medical conditions or are taking medications.
              Individual results may vary based on your unique constitution and health status.
            </p>
          </div>

          {/* Footer */}
          <div style={{ background: '#065f46', borderRadius: '10px', padding: '16px', color: 'white', textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>
              Ayurvritta Ayurveda Hospital
            </p>
            <p style={{ margin: '0 0 4px 0', fontSize: '12px', opacity: 0.9 }}>
              Authentic Ayurvedic Care by Dr. Jinendradutt Sharma
            </p>
            <p style={{ margin: 0, fontSize: '11px', opacity: 0.8 }}>
              Vadodara, Gujarat • +91 94266 84047 • www.ayurvritta.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietChartPDF;
