import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Clock, Leaf, Download, Share2, BookOpen, Utensils, AlertTriangle, Calendar, Sparkles, ChevronRight, Printer, Heart } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { dietCharts } from '../data/dietCharts';

const DietChartViewer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState<Record<string, number>>({});
  const heroRef = useRef<HTMLDivElement>(null);

  const dietChart = dietCharts.find(chart => chart.slug === slug);

  useEffect(() => {
    if (dietChart) {
      setIsVisible(true);
      
      // Animate stats counters
      const stats = {
        foods: Object.keys(dietChart.foodsToConsume).reduce((acc, key) => acc + dietChart.foodsToConsume[key].length, 0),
        avoid: Object.keys(dietChart.foodsToAvoid).reduce((acc, key) => acc + dietChart.foodsToAvoid[key].length, 0),
        meals: Object.keys(dietChart.dietSchedule).length,
        tips: dietChart.lifestyleTips.length
      };

      const duration = 1000;
      const steps = 30;
      const interval = duration / steps;

      Object.keys(stats).forEach(key => {
        let current = 0;
        const target = stats[key as keyof typeof stats];
        const increment = target / steps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setAnimatedStats(prev => ({ ...prev, [key]: target }));
            clearInterval(timer);
          } else {
            setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(current) }));
          }
        }, interval);
      });
    }
  }, [dietChart]);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        const parallax = scrollY * 0.3;
        const heroImage = heroRef.current.querySelector('.hero-image') as HTMLElement;
        if (heroImage) {
          heroImage.style.transform = `translateY(${parallax}px) scale(1.1)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!dietChart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ayur-cream">
        <div className="text-center animate-fadeIn">
          <div className="w-24 h-24 bg-ayur-surface rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-ayur-gray" />
          </div>
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

  const { title, category, description, image, foodsToConsume, foodsToAvoid, dietSchedule, lifestyleTips, foodGroups = [] } = dietChart;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'consume', label: 'Foods to Consume', icon: Check },
    { id: 'avoid', label: 'Foods to Avoid', icon: X },
    { id: 'schedule', label: 'Meal Plan', icon: Calendar },
    { id: 'tips', label: 'Lifestyle Tips', icon: Leaf }
  ];

  const scheduleData = Object.entries(dietSchedule).map(([time, food]) => {
    const hour = parseInt(time.split(':')[0]);
    let period = 'Morning';
    if (hour >= 12 && hour < 17) period = 'Afternoon';
    else if (hour >= 17) period = 'Evening';
    
    return { time, food, period };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-ayur-cream via-white to-ayur-green/5">
      {/* Hero Section */}
      <div ref={heroRef} className="relative h-[60vh] min-h-[450px] overflow-hidden">
        <div 
          className="hero-image absolute inset-0 bg-cover bg-center will-change-transform"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-ayur-green/90" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/diet-charts')}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-105 min-h-[48px] animate-fadeIn"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back</span>
        </button>

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 z-20 flex gap-3">
          <button className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110 min-h-[48px] min-w-[48px] flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </button>
          <button className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110 min-h-[48px] min-w-[48px] flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110 min-h-[48px] min-w-[48px] flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Content */}
        <div className={`absolute bottom-0 left-0 right-0 p-8 md:p-12 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-ayur-accent text-white text-sm font-semibold rounded-full shadow-lg">
                {category}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                Ayurvedic Diet Plan
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 leading-tight">
              {title}
            </h1>
            
            <p className="text-white/90 text-lg md:text-xl max-w-3xl line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-ayur-subtle shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide py-4 gap-2">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 min-h-[48px] ${
                    isActive 
                      ? 'bg-ayur-green text-white shadow-lg transform scale-105' 
                      : 'bg-ayur-surface text-ayur-gray hover:bg-ayur-subtle hover:text-ayur-text'
                  }`}
                  style={{ transitionDelay: `${idx * 50}ms` }}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-ayur-green animate-pulse-slow opacity-20 -z-10" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'foods', label: 'Foods to Eat', icon: Utensils, color: 'from-green-500 to-emerald-600', bg: 'bg-green-50' },
                { key: 'avoid', label: 'Foods to Avoid', icon: X, color: 'from-red-500 to-rose-600', bg: 'bg-red-50' },
                { key: 'meals', label: 'Daily Meals', icon: Calendar, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50' },
                { key: 'tips', label: 'Lifestyle Tips', icon: Leaf, color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50' }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={stat.key}
                    className={`${stat.bg} rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-3 bg-gradient-to-r ${stat.color} text-white p-1.5 rounded-lg`} />
                    <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                      {animatedStats[stat.key] || 0}
                    </div>
                    <div className="text-sm text-ayur-gray font-semibold">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Food Groups Chart */}
            {foodGroups.length > 0 && (
              <div className="bg-white rounded-3xl shadow-soft p-8 md:p-12">
                <h3 className="text-2xl font-serif font-bold text-ayur-text mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-ayur-green/10 rounded-full flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-ayur-green" />
                  </div>
                  Food Group Distribution
                </h3>
                
                <div className="grid md:grid-cols-2 gap-12">
                  {/* Pie Chart */}
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={foodGroups}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="percentage"
                          animationBegin={0}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        >
                          {foodGroups.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color}
                              stroke="transparent"
                              style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value: number, name: string) => [`${value}%`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="space-y-4">
                    {foodGroups.map((group, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-4 p-4 bg-ayur-surface rounded-xl hover:bg-ayur-subtle transition-colors"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0 shadow-md" 
                          style={{ backgroundColor: group.color }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-ayur-text">{group.name}</span>
                            <span className="font-bold text-ayur-green">{group.percentage}%</span>
                          </div>
                          <div className="h-2.5 bg-ayur-subtle rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{ 
                                width: `${group.percentage}%`,
                                backgroundColor: group.color,
                                transitionDelay: `${idx * 150}ms`
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

            {/* About Section */}
            <div className="bg-white rounded-3xl shadow-soft p-8 md:p-12">
              <h3 className="text-2xl font-serif font-bold text-ayur-text mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-ayur-green/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-ayur-green" />
                </div>
                About This Diet Plan
              </h3>
              <p className="text-ayur-gray text-lg leading-relaxed">{description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-ayur-green to-emerald-600 text-white rounded-full font-semibold hover:shadow-2xl hover:shadow-ayur-green/30 transition-all duration-300 transform hover:-translate-y-1 min-h-[56px]">
                <Download className="w-6 h-6" />
                Download PDF Guide
              </button>
              <button className="flex items-center gap-3 px-8 py-4 bg-white text-ayur-green border-2 border-ayur-green rounded-full font-semibold hover:bg-ayur-green/5 transition-all duration-300 min-h-[56px]">
                <Share2 className="w-6 h-6" />
                Share with Friends
              </button>
            </div>
          </div>
        )}

        {/* Foods to Consume Tab */}
        {activeTab === 'consume' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 md:p-12 text-white">
              <h2 className="text-3xl font-serif font-bold mb-4 flex items-center gap-3">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                Foods to Consume
              </h2>
              <p className="text-white/90 text-lg">Include these foods in your daily diet for best results</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(foodsToConsume).map(([categoryName, items], categoryIdx) => (
                <div 
                  key={categoryName}
                  className="bg-white rounded-3xl shadow-soft p-6 hover:shadow-card-hover transition-all duration-500 transform hover:-translate-y-2"
                  style={{ animationDelay: `${categoryIdx * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-green-800 capitalize">{categoryName}</h3>
                  </div>
                  <ul className="space-y-3">
                    {items.map((item, itemIdx) => (
                      <li 
                        key={itemIdx} 
                        className="flex items-start gap-3 p-3 bg-green-50/50 rounded-xl hover:bg-green-100 transition-colors"
                        style={{ animationDelay: `${(categoryIdx * items.length + itemIdx) * 50}ms` }}
                      >
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-ayur-text font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Foods to Avoid Tab */}
        {activeTab === 'avoid' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl p-8 md:p-12 text-white">
              <h2 className="text-3xl font-serif font-bold mb-4 flex items-center gap-3">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8" />
                </div>
                Foods to Avoid
              </h2>
              <p className="text-white/90 text-lg">Avoid these foods to maintain optimal health</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(foodsToAvoid).map(([categoryName, items], categoryIdx) => (
                <div 
                  key={categoryName}
                  className="bg-white rounded-3xl shadow-soft p-6 hover:shadow-card-hover transition-all duration-500 transform hover:-translate-y-2 border-2 border-red-100"
                  style={{ animationDelay: `${categoryIdx * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-red-800 capitalize">{categoryName}</h3>
                  </div>
                  <ul className="space-y-3">
                    {items.map((item, itemIdx) => (
                      <li 
                        key={itemIdx} 
                        className="flex items-start gap-3 p-3 bg-red-50/50 rounded-xl hover:bg-red-100 transition-colors"
                        style={{ animationDelay: `${(categoryIdx * items.length + itemIdx) * 50}ms` }}
                      >
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-ayur-text font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diet Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl p-8 md:p-12 text-white">
              <h2 className="text-3xl font-serif font-bold mb-4 flex items-center gap-3">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8" />
                </div>
                Daily Meal Plan
              </h2>
              <p className="text-white/90 text-lg">Follow this schedule for optimal digestion and health</p>
            </div>

            <div className="bg-white rounded-3xl shadow-soft p-8">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-ayur-green via-ayur-accent to-ayur-green/50 rounded-full" />
                
                <div className="space-y-6">
                  {scheduleData.map((slot, idx) => {
                    const isMorning = slot.period === 'Morning';
                    const isAfternoon = slot.period === 'Afternoon';
                    const isEvening = slot.period === 'Evening';
                    
                    return (
                      <div 
                        key={idx}
                        className="relative flex items-start gap-6 pl-4"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        {/* Timeline Dot */}
                        <div className={`absolute left-6 top-6 w-5 h-5 rounded-full border-4 border-white z-10 ${
                          isMorning ? 'bg-amber-500' : isAfternoon ? 'bg-orange-500' : 'bg-purple-500'
                        }`} />
                        
                        {/* Time */}
                        <div className={`flex-shrink-0 w-32 px-4 py-3 rounded-xl font-bold text-center shadow-lg ${
                          isMorning ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' :
                          isAfternoon ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
                          'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                        }`}>
                          {slot.time}
                        </div>
                        
                        {/* Meal Card */}
                        <div className="flex-1 bg-gradient-to-r from-ayur-surface to-white rounded-xl p-5 border border-ayur-subtle hover:border-ayur-green/30 transition-all hover:shadow-lg">
                          <p className="text-ayur-text font-medium text-lg">{slot.food}</p>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            isMorning ? 'bg-amber-100 text-amber-700' :
                            isAfternoon ? 'bg-orange-100 text-orange-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {slot.period}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lifestyle Tips Tab */}
        {activeTab === 'tips' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white">
              <h2 className="text-3xl font-serif font-bold mb-4 flex items-center gap-3">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <Leaf className="w-8 h-8" />
                </div>
                Lifestyle Tips
              </h2>
              <p className="text-white/90 text-lg">Complement your diet with these healthy habits</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {lifestyleTips.map((tip, idx) => (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl shadow-soft p-6 flex items-start gap-4 hover:shadow-card-hover transition-all duration-500 transform hover:-translate-y-1"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-purple-50 text-purple-600 text-xs font-semibold rounded-full mb-2">
                      Tip #{idx + 1}
                    </span>
                    <p className="text-ayur-text font-medium">{tip}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Resources */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100">
              <h3 className="text-xl font-bold text-ayur-text mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Need More Help?
              </h3>
              <p className="text-ayur-gray mb-6">
                Consult with our Ayurvedic experts for personalized diet recommendations
              </p>
              <button className="btn-primary">
                Book Consultation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietChartViewer;