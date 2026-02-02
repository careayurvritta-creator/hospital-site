import { LucideIcon } from "lucide-react";

export type Language = 'en' | 'hi' | 'gu';

export interface NavItem {
  label: string;
  path: string;
}

export interface SubService {
  name: string;
  price: number;
  description: string; // Made mandatory for the use-cases
  image: string;       // Added for the therapy image
}

export interface Service {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  benefits?: string[];
  icon: LucideIcon;
  tags: string[];
  subServices?: SubService[];
  image?: string;
}

export interface Program {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  idealFor: string[];
  includes: string[];
  icon: LucideIcon;
}

export interface Testimonial {
  id: string;
  name: string;
  condition: string;
  text: string;
  rating: number;
}

export interface QuestionOption {
  label: string;
  value?: string | number; // Made optional to support Prakriti questions
  dosha?: 'Vata' | 'Pitta' | 'Kapha'; // For Prakriti
  weight?: number; // For Risk scores
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

export interface QuestionnaireSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface DoshaScore {
  name: string;
  score: number;
  fill: string;
}

export interface Advice {
  diet: string[];
  lifestyle: string[];
}

export interface InsurancePartner {
  name: string;
  logo: string;
  type?: 'Insurer' | 'TPA';
}