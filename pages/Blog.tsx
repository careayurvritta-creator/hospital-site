/**
 * Blog Page (Phase 6)
 * Lists Ayurveda health articles
 */

import React from 'react';
import { NavLink } from '../components/Layout';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    category: string;
    image: string;
    readTime: string;
}

const BLOG_POSTS: BlogPost[] = [
    {
        id: 'hemanta-ritucharya',
        title: 'Hemanta Ritucharya: Ayurveda Guide for Early Winter',
        excerpt: 'As the cold sets in, optimize your diet and lifestyle according to Ayurveda to boost immunity and maintain energy levels.',
        author: 'Dr. Jinendradutt Sharma',
        date: 'Dec 15, 2025',
        category: 'Seasonal Health',
        image: 'https://images.unsplash.com/photo-1544367563-12123d895e29?auto=format&fit=crop&w=800&q=80',
        readTime: '5 min read'
    },
    {
        id: 'panchakarma-benefits',
        title: 'Why You Need Panchakarma Detox This Year',
        excerpt: 'Discover how the 5 purification therapies can reset your metabolism, clear toxins, and rejuvenate your body from the cellular level.',
        author: 'Dr. J. Sharma',
        date: 'Jan 02, 2026',
        category: 'Treatments',
        image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80',
        readTime: '7 min read'
    },
    {
        id: 'diabetes-ayurveda',
        title: 'Managing Diabetes Naturally with Ayurveda',
        excerpt: 'Effective herbs, dietary changes, and lifestyle modifications to manage blood sugar levels and prevent complications.',
        author: 'Dr. J. Sharma',
        date: 'Nov 28, 2025',
        category: 'Disease Management',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
        readTime: '6 min read'
    }
];

const Blog: React.FC = () => {
    return (
        <div className="min-h-screen bg-ayur-cream pt-20">
            {/* Header */}
            <div className="bg-ayur-green text-white py-16 md:py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <span className="text-ayur-gold font-bold uppercase tracking-widest text-xs mb-4 block">Knowledge Center</span>
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Ayurveda Health Insights</h1>
                    <p className="text-lg text-ayur-cream/80 max-w-2xl mx-auto">
                        Expert articles on seasonal regimens, disease management, and holistic wellness.
                    </p>
                </div>
            </div>

            {/* Blog Grid */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {BLOG_POSTS.map((post) => (
                        <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-ayur-green flex items-center shadow-sm">
                                    <Tag size={12} className="mr-1.5 text-ayur-accent" />
                                    {post.category}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center text-xs text-gray-400 mb-3 space-x-4">
                                    <span className="flex items-center"><Calendar size={12} className="mr-1" /> {post.date}</span>
                                    <span className="flex items-center"><User size={12} className="mr-1" /> {post.author}</span>
                                </div>

                                <h2 className="font-serif text-xl font-bold text-ayur-green mb-3 group-hover:text-ayur-accent transition-colors">
                                    {post.title}
                                </h2>

                                <p className="text-ayur-gray text-sm leading-relaxed mb-4 flex-grow">
                                    {post.excerpt}
                                </p>

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-400">{post.readTime}</span>
                                    <button className="text-ayur-accent text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform min-h-[44px] px-2 active:scale-95">
                                        Read Article <ArrowRight size={16} className="ml-1" />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
