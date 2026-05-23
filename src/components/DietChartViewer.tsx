import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Check, X, Clock, Leaf, TrendingUp, Activity, 
  Heart, Droplet, ChevronRight, Download, Share2, Calendar,
  Sun, Moon, Coffee, Utensils, Apple, BookOpen
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { dietCharts } from '../data/dietCharts';
import { useLanguage } from './LanguageContext';

const DietChartViewer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'consume' | 'avoid' | 'schedule' | 'tips'>('overview');

  const dietChart = dietCharts.find(chart => chart.slug === slug);

  if (!dietChart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ayur-cream">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-ayur-text mb-4">Diet Chart Not Found</h2>
          <button
            onClick={() => navigate('/diet-charts')}
            className="btn-primary"
          >
            Back to Diet Charts
          </button>
        </div>
      </div>
    );
  }

  const {
    title,
    category,
    description,
    image,
    foodsToConsume,
    foodsToAvoid,
    dietSchedule,
    lifestyleTips,
    foodGroups = []
  } = dietChart;

  const scheduleData = Object.entries(dietSchedule).map(([time, food]) => ({
    time,
    food,
    icon: getTimeIcon(time)
  }));

  const COLORS = ['#0d8770', '#c9a227', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ayur-cream via-white to-ayur-green/5">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] bg-gradient-to-r from-ayur-green to-ayur-green-dark overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ayur-green/90" />
        </div>
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/diet-charts')}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back</span>
        </button>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-ayur-accent text-white text-sm font-semibold rounded-full">
                {category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4">
              {title}
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-3xl">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-ayur-subtle shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide py-4 gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: BookOpen },
              { id: 'consume', label: 'Foods to Consume', icon: Check },
              { id: 'avoid', label: 'Foods to Avoid', icon: X },
              { id: 'schedule', label: 'Diet Schedule', icon: Clock },
              { id: 'tips', label: 'Lifestyle Tips', icon: Leaf }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-ayur-green text-white shadow-lg transform scale-105'
                      : 'bg-ayur-surface text-ayur-gray hover:bg-ayur-subtle'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={Apple}
                value={Object.keys(foodsToConsume).reduce((acc, key) => acc + foodsToConsume[key].length, 0).toString()}
                label="Foods to Eat"
                color="text-green-600"
                bgColor="bg-green-50"
              />
              <StatCard
                icon={X}
                value={Object.keys(foodsToAvoid).reduce((acc, key) => acc + foodsToAvoid[key].length, 0).toString()}
                label="Foods to Avoid"
                color="text-red-600"
                bgColor="bg-red-50"
              />
              <StatCard
                icon={Clock}
                value={Object.keys(dietSchedule).length.toString()}
                label="Meal Times"
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatCard
                icon={Leaf}
                value={lifestyleTips.length.toString()}
                label="Lifestyle Tips"
                color="text-purple-600"
                bgColor="bg-purple-50"
              />
            </div>

            {/* Food Groups Pie Chart */}
            {foodGroups.length > 0 && (
              <div className="bg-white rounded-3xl shadow-soft p-8">
                <h3 className="text-2xl font-serif font-bold text-ayur-text mb-6">Food Group Distribution</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={foodGroups}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="percentage"
                          nameKey="name"
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          {foodGroups.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {foodGroups.map((group, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: group.color }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold text-ayur-text">{group.name}</span>
                            <span className="font-bold text-ayur-text">{group.percentage}%</span>
                          </div>
                          <div className="h-2 bg-ayur-subtle rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000"
                              style={{ 
                                width: `${group.percentage}%`,
                                backgroundColor: group.color 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-3xl shadow-soft p-8">
              <h3 className="text-2xl font-serif font-bold text-ayur-text mb-4">About This Diet Plan</h3>
              <p className="text-ayur-gray leading-relaxed text-lg">{description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-ayur-green text-white rounded-full font-semibold hover:bg-ayur-green-dark transition-colors shadow-lg">
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white text-ayur-green border-2 border-ayur-green rounded-full font-semibold hover:bg-ayur-green/10 transition-colors">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        )}

        {/* Foods to Consume Tab */}
        {activeTab === 'consume' && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-soft p-8 mb-8">
              <h2 className="text-3xl font-serif font-bold text-ayur-green mb-8 flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                Foods to Consume
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(foodsToConsume).map(([categoryName, items], idx) => (
                  <div 
                    key={idx} 
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 hover:border-green-400 transition-colors duration-300"
                  >
                    <h3 className="text-lg font-bold text-green-800 mb-4 capitalize flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      {categoryName}
                    </h3>
                    <ul className="space-y-2">
                      {items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-ayur-text">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Foods to Avoid Tab */}
        {activeTab === 'avoid' && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-soft p-8 mb-8">
              <h2 className="text-3xl font-serif font-bold text-red-700 mb-8 flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                Foods to Avoid
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(foodsToAvoid).map(([categoryName, items], idx) => (
                  <div 
                    key={idx} 
                    className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border-2 border-red-200 hover:border-red-400 transition-colors duration-300"
                  >
                    <h3 className="text-lg font-bold text-red-800 mb-4 capitalize flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      {categoryName}
                    </h3>
                    <ul className="space-y-2">
                      {items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2">
                          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-ayur-text">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Diet Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-soft p-8">
              <h2 className="text-3xl font-serif font-bold text-ayur-text mb-8 flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                Daily Diet Schedule
              </h2>
              <div className="relative">
                {/* Timeline */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-ayur-green via-ayur-accent to-ayur-green/50" />
                
                <div className="space-y-6">
                  {scheduleData.map((slot, idx) => (
                    <div key={idx} className="relative flex items-start gap-6 pl-4">
                      {/* Timeline dot */}
                      <div className="absolute left-6 top-6 w-4 h-4 -translate-x-1/2 bg-white border-4 border-ayur-green rounded-full z-10" />
                      
                      {/* Time */}
                      <div className="flex-shrink-0 w-32 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white px-4 py-3 rounded-xl font-bold shadow-lg">
                        {slot.time}
                      </div>
                      
                      {/* Food */}
                      <div className="flex-1 bg-gradient-to-r from-ayur-surface to-white rounded-xl p-4 border border-ayur-subtle">
                        <p className="text-ayur-text font-medium">{slot.food}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lifestyle Tips Tab */}
        {activeTab === 'tips' && (
          <div className="animate-fadeIn">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-xl p-8 md:p-12 text-white mb-8">
              <h2 className="text-3xl font-serif font-bold mb-8 flex items-center gap-3">
                <Leaf className="w-8 h-8" />
                Lifestyle Tips
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {lifestyleTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-lg">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getTimeIcon(time: string) {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 5 && hour < 9) return Sunrise;
  if (hour >= 9 && hour < 12) return Sun;
  if (hour >= 12 && hour < 17) return Sun;
  if (hour >= 17 && hour < 21) return Moon;
  return Moon;
}

const StatCard: React.FC<{
  icon: any;
  value: string;
  label: string;
  color: string;
  bgColor: string;
}> = ({ icon: Icon, value, label, color, bgColor }) => (
  <div className={`${bgColor} rounded-2xl p-6 text-center`}>
    <Icon className={`w-8 h-8 ${color} mx-auto mb-2`} />
    <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
    <div className="text-sm text-ayur-gray font-semibold">{label}</div>
  </div>
);

export default DietChartViewer;
