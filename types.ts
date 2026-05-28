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

export interface Advice {
  diet: string[];
  lifestyle: string[];
}

export interface InsurancePartner {
  name: string;
  logo: string;
  type?: 'Insurer' | 'TPA';
}