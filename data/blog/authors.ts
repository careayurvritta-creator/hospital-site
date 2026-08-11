import { BlogAuthor } from './types';

export const AUTHORS: Record<string, BlogAuthor> = {
  'dr-sharma': {
    id: 'dr-sharma',
    name: 'Dr. Jinendradutt Sharma',
    credentials: 'B.A.M.S., M.D. (Ayurveda) Scholar',
    role: 'Medical Director',
    regNumber: 'GB-I 26922',
    image: '/images/about/dr-sharma.png',
    specializations: [
      'Chronic Metabolic Disorders',
      'Diabetes & Thyroid',
      'Panchakarma Therapy',
      'Lifestyle Disease Management',
    ],
    bio: 'Dr. Jinendradutt Sharma is the Medical Director of Ayurvritta Ayurveda Hospital, with 15+ years of experience in classical Ayurveda. He specializes in reversing lifestyle disorders — diabetes, thyroid, obesity and digestive disease — through authentic Panchakarma and personalized treatment protocols.',
  },
  'dr-gor': {
    id: 'dr-gor',
    name: 'Dr. Sharlin H. Gor',
    credentials: 'M.D. (A.M.), B.A.M.S.',
    role: 'Senior Consultant',
    regNumber: 'GB-I 26015',
    image: '/images/about/dr-gor.png',
    specializations: [
      "Women's Health",
      'Yoga Therapy',
      'Integrative Wellness',
      'Stress Management',
    ],
    bio: 'Dr. Sharlin H. Gor is a Senior Consultant at Ayurvritta Ayurveda Hospital, holding an M.D. in Ayurveda Medicine. She brings 10+ years of experience in women’s health, hormonal balance, yoga therapy and integrative wellness, combining classical Ayurveda with modern lifestyle medicine.',
  },
};
