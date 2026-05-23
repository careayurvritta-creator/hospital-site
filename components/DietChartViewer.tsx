import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Clock, Leaf, Download, Share2, BookOpen } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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
        
        <button
          onClick={() => navigate('/diet-charts')}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back</span>
        </button>

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
        
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-2xl p-6 text-center">
                <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {Object.keys(foodsToConsume).reduce((acc, key) => acc + foodsToConsume[key].length, 0)}
                </div>
                <div className="text-sm text-ayur-gray font-semibold">Foods to Eat</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-6 text-center">
                <X className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {Object.keys(foodsToAvoid).reduce((acc, key) => acc + foodsToAvoid[key].length, 0)}
                </div>
                <div className="text-sm text-ayur-gray font-semibold">Foods to Avoid</div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-6 text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600 mb-1">{Object.keys(dietSchedule).length}</div>
                <div className="text-sm text-ayur-gray font-semibold">Meal Times</div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-6 text-center">
                <Leaf className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600 mb-1">{lifestyleTips.length}</div>
                <div className="text-sm text-ayur-gray font-semibold">Lifestyle Tips</div>
              </div>
            </div>

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

            <div className="bg-white rounded-3xl shadow-soft p-8">
              <h3 className="text-2xl font-serif font-bold text-ayur-text mb-4">About This Diet Plan</h3>
              <p className="text-ayur-gray leading-relaxed text-lg">{description}</p>
            </div>

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
        