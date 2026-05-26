import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Heart, Activity, Droplet, Brain, Eye, Baby, Bone, Wind, Flower2, Shield, Sun, Stethoscope, Pill, Sparkles } from 'lucide-react';

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

const DietChartCard: React.FC<DietChartCardProps> = ({
  title,
  slug,
  category,
  description,
  image,
  foodGroups,
  featured,
  index = 0,
}) => {
  const IconComponent = categoryIcons[category] || categoryIcons.default;
  const gradient = categoryGradients[category] || categoryGradients.default;

  return (
    <Link to={`/diet-charts/${slug}`} className="group block h-full">
      <div className={`bg-white rounded-3xl overflow-hidden border h-full flex flex-col transform transition-all duration-500 hover:-translate-y-2 ${
        featured
          ? 'shadow-lg border-ayur-accent/30 hover:shadow-2xl hover:shadow-ayur-accent/20 ring-1 ring-ayur-accent/10'
          : 'shadow-soft border-ayur-subtle/50 hover:shadow-card-hover hover:border-ayur-green/30'
      }`}>
        {/* Image Container */}
        <div className="relative h-52 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-3 left-3 z-10">
              <div className="flex items-center gap-1 px-2.5 py-1 bg-ayur-accent text-white text-xs font-bold rounded-full shadow-lg animate-pulse-slow">
                <Sparkles className="w-3 h-3" />
                Featured
              </div>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${gradient} text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm`}>
              <IconComponent className="w-3.5 h-3.5" />
              <span className="max-w-[120px] truncate">{category}</span>
            </div>
          </div>

          {/* Food Group Pills */}
          {foodGroups && foodGroups.length > 0 && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex gap-1.5 flex-wrap">
                {foodGroups.slice(0, 3).map((group, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: group.color }}
                    />
                    <span className="text-[10px] font-bold text-ayur-text">{group.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-ayur-gray">{group.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-serif font-bold text-ayur-text mb-2 line-clamp-2 group-hover:text-ayur-green transition-colors duration-300 leading-snug">
            {title}
          </h3>

          <p className="text-ayur-gray text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
            {description}
          </p>

          {/* Food Group Bars */}
          {foodGroups && foodGroups.length > 0 && (
            <div className="mb-4 space-y-1.5">
              {foodGroups.slice(0, 3).map((group, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-ayur-surface rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${group.percentage}%`,
                        backgroundColor: group.color,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-ayur-gray w-8 text-right">{group.percentage}%</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center gap-2 text-ayur-green font-semibold text-sm pt-3 border-t border-ayur-subtle/50">
            <span>View Diet Plan</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DietChartCard;
