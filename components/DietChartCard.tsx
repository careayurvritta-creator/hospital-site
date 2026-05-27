import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Heart, Activity, Droplet, Brain, Eye, Baby, Bone, Wind, Flower2, Shield, Sun, Stethoscope, Pill, Sparkles, Utensils, Clock, Star, ChevronRight, Flame } from 'lucide-react';

interface DietChartCardProps {
  title: string;
  slug: string;
  category: string;
  description: string;
  image: string;
  foodGroups?: Array<{
    name: string;
    percentage: number;
    color: string;
  }>;
  foodsToConsume?: Record<string, string[]>;
  foodsToAvoid?: Record<string, string[]>;
  lifestyleTips?: string[];
  featured?: boolean;
  index?: number;
}

const categoryIcons: Record<string, React.ComponentType<any>> = {
  'Digestive Health': Activity,
  'Weight Management': Activity,
  'Pregnancy': Heart,
  'Metabolic Health': Droplet,
  'Kidney Health': Droplet,
  'Liver Health': Shield,
  'Heart Health': Heart,
  'Thyroid Health': Activity,
  'Skin Health': Sparkles,
  'Bone & Joint Health': Bone,
  'Respiratory Health': Wind,
  'Reproductive Health': Flower2,
  'Blood Health': Droplet,
  'Cancer Support': Shield,
  'Child Health': Baby,
  'Seasonal Diet': Sun,
  'Ayurvedic Constitution': Leaf,
  'Mental Health': Brain,
  'Eye Health': Eye,
  'GI Disorders': Activity,
  'Allergy Care': Shield,
  'Complex Conditions': Pill,
  'Neurological & Surgical': Brain,
  'Immune & Chronic': Shield,
  'Specific Conditions': Stethoscope,
  'General Health': Leaf,
  'default': Leaf,
};

const categoryGradients: Record<string, string> = {
  'Digestive Health': 'from-amber-500 to-orange-600',
  'Weight Management': 'from-green-500 to-emerald-600',
  'Pregnancy': 'from-pink-500 to-rose-600',
  'Metabolic Health': 'from-red-500 to-rose-600',
  'Kidney Health': 'from-blue-500 to-indigo-600',
  'Liver Health': 'from-amber-600 to-yellow-700',
  'Heart Health': 'from-red-500 to-pink-600',
  'Thyroid Health': 'from-purple-500 to-violet-600',
  'Skin Health': 'from-pink-400 to-fuchsia-600',
  'Bone & Joint Health': 'from-stone-500 to-stone-700',
  'Respiratory Health': 'from-sky-500 to-cyan-600',
  'Reproductive Health': 'from-fuchsia-500 to-purple-600',
  'Blood Health': 'from-red-600 to-red-800',
  'Cancer Support': 'from-violet-500 to-purple-700',
  'Child Health': 'from-yellow-400 to-amber-500',
  'Seasonal Diet': 'from-lime-500 to-green-600',
  'Ayurvedic Constitution': 'from-teal-500 to-emerald-600',
  'Mental Health': 'from-indigo-500 to-blue-600',
  'Eye Health': 'from-sky-400 to-blue-500',
  'GI Disorders': 'from-orange-500 to-red-500',
  'Allergy Care': 'from-cyan-500 to-teal-600',
  'default': 'from-teal-500 to-emerald-600',
};

const categoryGlowColors: Record<string, string> = {
  'Digestive Health': 'rgba(245,158,11,0.18)',
  'Weight Management': 'rgba(16,185,129,0.18)',
  'Pregnancy': 'rgba(236,72,153,0.18)',
  'Metabolic Health': 'rgba(239,68,68,0.18)',
  'Kidney Health': 'rgba(59,130,246,0.18)',
  'Liver Health': 'rgba(217,119,6,0.18)',
  'Heart Health': 'rgba(239,68,68,0.18)',
  'Thyroid Health': 'rgba(139,92,246,0.18)',
  'Skin Health': 'rgba(217,70,239,0.18)',
  'Bone & Joint Health': 'rgba(120,113,108,0.18)',
  'Respiratory Health': 'rgba(14,165,233,0.18)',
  'Reproductive Health': 'rgba(192,38,211,0.18)',
  'Blood Health': 'rgba(220,38,38,0.18)',
  'Cancer Support': 'rgba(124,58,237,0.18)',
  'Child Health': 'rgba(251,191,36,0.18)',
  'Seasonal Diet': 'rgba(132,204,22,0.18)',
  'Ayurvedic Constitution': 'rgba(20,184,166,0.18)',
  'Mental Health': 'rgba(99,102,241,0.18)',
  'Eye Health': 'rgba(56,189,248,0.18)',
  'GI Disorders': 'rgba(249,115,22,0.18)',
  'Allergy Care': 'rgba(6,182,212,0.18)',
  'default': 'rgba(13,135,112,0.18)',
};

const categoryFallbackColors: Record<string, string> = {
  'Digestive Health': '#f59e0b',
  'Weight Management': '#10b981',
  'Pregnancy': '#ec4899',
  'Metabolic Health': '#ef4444',
  'Kidney Health': '#3b82f6',
  'Liver Health': '#d97706',
  'Heart Health': '#ef4444',
  'Thyroid Health': '#8b5cf6',
  'Skin Health': '#d946ef',
  'Bone & Joint Health': '#78716c',
  'Respiratory Health': '#0ea5e9',
  'Reproductive Health': '#c026d3',
  'Blood Health': '#dc2626',
  'Cancer Support': '#7c3aed',
  'Child Health': '#fbbf24',
  'Seasonal Diet': '#84cc16',
  'Ayurvedic Constitution': '#14b8a6',
  'Mental Health': '#6366f1',
  'Eye Health': '#38bdf8',
  'GI Disorders': '#f97316',
  'Allergy Care': '#06b6d4',
  'default': '#0d8770',
};

const DietChartCard: React.FC<DietChartCardProps> = ({
  title,
  slug,
  category,
  description,
  image,
  foodGroups,
  foodsToConsume,
  foodsToAvoid,
  lifestyleTips,
  featured,
  index = 0,
}) => {
  const [imgError, setImgError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const IconComponent = categoryIcons[category] || categoryIcons.default;
  const gradient = categoryGradients[category] || categoryGradients.default;
  const glowColor = categoryGlowColors[category] || categoryGlowColors.default;
  const fallbackColor = categoryFallbackColors[category] || categoryFallbackColors.default;

  const totalFoods = foodsToConsume
    ? (Object.values(foodsToConsume) as string[][]).reduce((sum: number, arr: string[]) => sum + arr.length, 0)
    : 0;

  const totalAvoid = foodsToAvoid
    ? (Object.values(foodsToAvoid) as string[][]).reduce((s: number, a: string[]) => s + a.length, 0)
    : 0;

  // Staggered entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), Math.min(index * 50, 300));
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="h-full"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(index * 0.04, 0.3)}s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(index * 0.04, 0.3)}s`,
      }}
    >
      <Link to={`/diet-charts/${slug}`} className="group block h-full">
        <div
          className="bg-white rounded-3xl overflow-hidden border h-full flex flex-col transform transition-all duration-500 hover:-translate-y-2"
          style={{
            boxShadow: featured
              ? '0 4px 24px rgba(201,162,39,0.15), 0 0 0 1px rgba(201,162,39,0.1)'
              : '0 2px 12px rgba(0,0,0,0.06)',
            borderColor: featured ? 'rgba(201,162,39,0.3)' : 'rgba(229,231,235,0.5)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 16px 48px ${glowColor}, 0 6px 16px rgba(0,0,0,0.08)`;
            e.currentTarget.style.borderColor = fallbackColor + '50';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = featured
              ? '0 4px 24px rgba(201,162,39,0.15), 0 0 0 1px rgba(201,162,39,0.1)'
              : '0 2px 12px rgba(0,0,0,0.06)';
            e.currentTarget.style.borderColor = featured ? 'rgba(201,162,39,0.3)' : 'rgba(229,231,235,0.5)';
          }}
        >
          {/* Image Container */}
          <div className="relative h-40 sm:h-48 md:h-52 overflow-hidden">
            {!imgError ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: `url(${image})` }}
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${fallbackColor}15, ${fallbackColor}35, ${fallbackColor}20)` }}
              >
                {/* Decorative pattern for fallback */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 w-20 h-20 rounded-full" style={{ background: fallbackColor }} />
                  <div className="absolute bottom-6 right-8 w-16 h-16 rounded-full" style={{ background: fallbackColor }} />
                  <div className="absolute top-12 right-12 w-8 h-8 rounded-full" style={{ background: fallbackColor }} />
                </div>
                <div className="text-center relative z-10">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-2xl flex items-center justify-center" style={{ background: `${fallbackColor}20` }}>
                    <IconComponent className="w-8 h-8" style={{ color: fallbackColor }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: fallbackColor }}>{category}</span>
                </div>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

            {/* Top badges */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
              {/* Featured Badge */}
              {featured && (
                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold rounded-full shadow-lg">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Featured</span>
                </div>
              )}
              {!featured && <div />}

              {/* Category Badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${gradient} text-white text-xs font-bold rounded-full shadow-lg`}>
                <IconComponent className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">{category}</span>
              </div>
            </div>

            {/* Bottom info badges */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 z-10">
              {/* Food Group Pills */}
              {foodGroups && foodGroups.length > 0 && (
                <div className="flex gap-1.5 flex-wrap flex-1 min-w-0">
                  {foodGroups.slice(0, 2).map((group, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="text-[10px] font-bold text-gray-800">{group.name.split(' ')[0]}</span>
                      <span className="text-[10px] text-gray-500">{group.percentage}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Food Count Badge */}
              {totalFoods > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm flex-shrink-0">
                  <Utensils className="w-3 h-3 text-ayur-green" />
                  <span className="text-[10px] font-bold text-gray-800">{totalFoods}</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-ayur-green transition-colors duration-300 leading-snug">
              {title}
            </h3>

            <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
              {description}
            </p>

            {/* Food Group Bars */}
            {foodGroups && foodGroups.length > 0 && (
              <div className="mb-4 space-y-1.5">
                {foodGroups.slice(0, 3).map((group, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-gray-400 w-20 sm:w-16 truncate">{group.name}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${group.percentage}%`,
                          backgroundColor: group.color,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 w-8 text-right">{group.percentage}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Stats Row */}
            <div className="flex items-center gap-3 mb-3">
              {lifestyleTips && lifestyleTips.length > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Leaf className="w-3 h-3 text-ayur-green" />
                  <span>{lifestyleTips.length} tips</span>
                </div>
              )}
              {totalAvoid > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Shield className="w-3 h-3 text-red-400" />
                  <span>{totalAvoid} avoid</span>
                </div>
              )}
              {totalFoods > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span>{totalFoods} foods</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between text-ayur-green font-semibold text-sm pt-3 border-t border-gray-100">
              <span>View Diet Plan</span>
              <div className="w-8 h-8 rounded-full bg-ayur-green/5 flex items-center justify-center group-hover:bg-ayur-green group-hover:text-white transition-all duration-300">
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default DietChartCard;
