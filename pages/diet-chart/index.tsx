import React from 'react';
import Head from 'next/head';
import DietChartCard from '../../components/DietChartCard';

interface DietChart {
  title: string;
  slug: string;
  category: string;
}

const dietCharts: DietChart[] = [
  { title: 'Acidity / GERD', slug: 'diet-chart-for-acidity-gastroesophageal-reflux-disease', category: 'Digestive Health' },
  { title: 'Adenomyosis', slug: 'diet-plan-for-patients-of-adenomyosis', category: "Women's Health" },
  { title: 'Adulthood', slug: 'diet-chart-for-adulthood', category: 'Life Stages' },
  { title: 'Allergy', slug: 'diet-plan-for-allergy', category: 'Immunity' },
  { title: 'Amenorrhea', slug: 'diet-plan-for-amenorrhea', category: "Women's Health" },
  { title: 'Amyloidosis', slug: 'diet-plan-for-patients-of-amyloidosis', category: 'Rare Diseases' },
  { title: 'Anal Fistula', slug: 'diet-plan-for-patients-of-anal-fistula', category: 'Digestive Health' },
  { title: 'Anemia', slug: 'diet-plan-for-anemia', category: 'Blood Health' },
  { title: 'Arthritis', slug: 'diet-chart-for-arthritis', category: 'Joint Health' },
  { title: 'Ascites', slug: 'diet-chart-for-ascites', category: 'Liver Health' },
  { title: 'Asthma', slug: 'diet-plan-for-patients-of-asthma', category: 'Respiratory' },
  { title: 'Back Pain', slug: 'diet-plan-for-patients-with-back-pain', category: 'Pain Management' },
  { title: "Bell's Palsy", slug: 'diet-plan-for-patients-with-bells-palsy', category: 'Neurological' },
  { title: 'Breast Development', slug: 'diet-plan-for-breast-development', category: "Women's Health" },
  { title: 'Cancer Patients', slug: 'life-support-diet-for-cancer-patients', category: 'Critical Care' },
  { title: 'Cataract', slug: 'diet-plan-for-patients-with-cataract', category: 'Eye Health' },
  { title: 'Celiac Disease', slug: 'diet-plan-for-celiac-disease-patients', category: 'Digestive Health' },
  { title: 'Childhood Asthma', slug: 'diet-chart-for-childhood-asthma', category: "Children's Health" },
  { title: 'Chronic Kidney Disease', slug: 'diet-plan-for-chronic-kidney-disease-patients', category: 'Kidney Health' },
  { title: 'Common Cold', slug: 'diet-plan-for-patients-of-common-cold', category: 'Immunity' },
  { title: 'Constipation', slug: 'diet-plan-for-constipation-problem', category: 'Digestive Health' },
  { title: 'Dengue', slug: 'diet-chart-for-dengue', category: 'Infectious Disease' },
  { title: 'Depression', slug: 'diet-plan-for-patients-of-depression', category: 'Mental Health' },
  { title: 'Edema', slug: 'diet-plan-for-patients-of-edema', category: 'Cardiovascular' },
  { title: 'Fatty Liver Disease', slug: 'diet-plan-for-patients-of-fatty-liver-disease', category: 'Liver Health' },
  { title: 'Gout', slug: 'diet-chart-for-gout', category: 'Joint Health' },
  { title: 'Infertility', slug: 'diet-plan-for-patients-of-infertility', category: 'Reproductive Health' },
  { title: 'Jaundice', slug: 'diet-chart-for-jaundice', category: 'Liver Health' },
  { title: 'Kidney Stones', slug: 'diet-plan-for-patients-of-kidney-stones', category: 'Kidney Health' },
  { title: 'Migraine', slug: 'diet-chart-for-migraine', category: 'Neurological' },
  { title: 'Obesity', slug: 'diet-plan-for-patients-of-obesity', category: 'Weight Management' },
  { title: 'Pregnant Women', slug: 'diet-plan-for-pregnant-women', category: 'Pregnancy' },
];

const DietChartPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const categories = ['All', ...Array.from(new Set(dietCharts.map(chart => chart.category)))];

  const filteredCharts = dietCharts.filter(chart => {
    const matchesSearch = chart.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || chart.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Head>
        <title>Diet Charts - Ayurvritta Ayurveda</title>
        <meta name="description" content="Complete collection of Ayurvedic diet charts for various health conditions" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-6">
                <svg className="w-20 h-20 mx-auto text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Diet Charts
              </h1>
              <p className="text-xl text-green-100 max-w-2xl mx-auto mb-8">
                Discover personalized Ayurvedic diet plans for optimal health and wellness. 
                Choose from our comprehensive collection of diet charts for various health conditions.
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  placeholder="Search diet charts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 rounded-full text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-green-300 shadow-xl"
                />
                <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-green-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Diet Charts Grid */}
        <div className="container mx-auto px-4 py-12">
          {filteredCharts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredCharts.map((chart) => (
                <DietChartCard
                  key={chart.slug}
                  title={chart.title}
                  slug={chart.slug}
                  category={chart.category}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-600 mb-2">No diet charts found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="bg-white py-16 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{dietCharts.length}+</div>
                <div className="text-gray-600">Diet Charts</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-600">Conditions</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
                <div className="text-gray-600">Ayurvedic</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-gray-600">Access</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DietChartPage;
