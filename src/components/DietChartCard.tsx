import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Heart, Activity, Droplet } from 'lucide-react';

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
}

const categoryIcons: Record<string, React.ComponentType<any>> = {
  'Digestive Health': Activity,
  'Weight Management': Activity,
  'Pregnancy': Heart,
  'Metabolic Health': Droplet,
  'Kidney Health': Droplet,
  'default': Leaf
};

const DietChartCard: React.FC<DietChartCardProps> = ({
  title,
  slug,
  category,
  description,
  image,
  foodGroups
}) => {
  const IconComponent = categoryIcons[category] || categoryIcons.default;

  return (
    <Link to={`/diet-charts/${slug}`} className="group">
      <div className="bg-white rounded-3xl shadow-soft hover:shadow-card-hover transition-all duration-500 overflow-hidden border border-ayur-subtle hover:border-ayur-green/30 h-full flex flex-col transform hover:-translate-y-2">
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
              <IconComponent className="w-4 h-4 text-ayur-green" />
              <span className="text-xs font-semibold text-ayur-green">{category}</span>
            </div>
          </div>

          {/* Quick Stats Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-2">
              {foodGroups && foodGroups.slice(0, 3).map((group, idx) => (
                <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: group.color }}
                  />
                  <span className="text-xs font-medium text-ayur-text">{group.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-serif font-bold text-ayur-text mb-3 line-clamp-2 group-hover:text-ayur-green transition-colors duration-300">
            {title}
          </h3>
          
          <p className="text-ayur-gray text-sm mb-6 line-clamp-3 flex-1">
            {description}
          </p>

          {/* Action Button */}
          <div className="flex items-center gap-2 text-ayur-green font-semibold text-sm group/btn">
            <span>View Complete Diet Plan</span>
            <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-2 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DietChartCard;
