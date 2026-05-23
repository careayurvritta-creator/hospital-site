import { GetStaticPaths, GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import DietChartViewer from '../../components/DietChartViewer';

interface DietChartProps {
  slug: string;
  frontMatter: {
    title: string;
    category?: string;
  };
  content: string;
}

export default function DietChartPage({ slug, frontMatter, content }: DietChartProps) {
  // Parse the markdown content to extract structured data
  // This is a simplified version - you'd want more sophisticated parsing
  const foodsToConsume = {
    'Cereals': ['Whole grains', 'Brown rice', 'Oats'],
    'Fruits': ['Fresh fruits', 'Seasonal fruits'],
    'Vegetables': ['Green leafy vegetables', 'Fresh vegetables']
  };

  const foodsToAvoid = {
    'Processed Foods': ['Packaged foods', 'Junk food'],
    'Dairy': ['Full-fat dairy']
  };

  const lifestyleTips = [
    'Drink plenty of water',
    'Eat at regular intervals',
    'Avoid stress',
    'Practice yoga and meditation'
  ];

  const dietSchedule = {
    'Early Morning': 'Warm water with lemon',
    'Breakfast': 'Light and nutritious meal',
    'Lunch': 'Balanced meal with all food groups',
    'Evening': 'Herbal tea',
    'Dinner': 'Light meal before 8 PM'
  };

  return (
    <DietChartViewer
      title={frontMatter.title || 'Diet Chart'}
      slug={slug}
      content={content.substring(0, 500) + '...'}
      foodsToConsume={foodsToConsume}
      foodsToAvoid={foodsToAvoid}
      dietSchedule={dietSchedule}
      lifestyleTips={lifestyleTips}
    />
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(path.join('knowledge', 'diet-charts'));
  
  const paths = files.map((file) => {
    const slug = file.replace('.md', '');
    return {
      params: { slug },
    };
  });

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug;
  
  try {
    const file = fs.readFileSync(
      path.join('knowledge', 'diet-charts', `${slug}.md`),
      'utf-8'
    );

    const { data, content } = matter(file);

    return {
      props: {
        slug,
        frontMatter: {
          title: data.title || 'Diet Chart',
          category: data.category || 'General',
        },
        content,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
