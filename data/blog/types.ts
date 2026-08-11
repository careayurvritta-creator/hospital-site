export type BlogCategory = 'Ayurveda' | 'Yoga' | 'Nutrition' | 'Lifestyle' | 'Wellness';

export interface BlogAuthor {
  id: string;
  name: string;
  credentials: string;
  role: string;
  regNumber: string;
  image: string;
  specializations: string[];
  bio: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  authorId: string;
  date: string;
  readTime: string;
  image: string;
  content: string;
  featured?: boolean;
}

export interface BlogPostWithAuthor extends BlogPost {
  author: BlogAuthor;
}
