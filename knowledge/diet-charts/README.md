# Ayurvedic Diet Charts Collection

This directory contains a comprehensive collection of **35 Ayurvedic diet charts** for various health conditions, sourced from Planet Ayurveda and formatted for the Ayurvritta Ayurveda Hospital website.

## 📋 Available Diet Charts

### Digestive Health
- Diet Chart for Acidity (Gastroesophageal Reflux Disease)
- Diet Plan for Patients of Anal Fistula
- Diet Plan for Celiac Disease Patients
- Diet Plan for Constipation Problem

### Metabolic Health
- Diet Plan for Patients of Obesity
- Diet Chart for Diabetes Management
- Life Support Diet for Cancer Patients

### Women's Health
- Diet Plan for Patients of Adenomyosis
- Diet Plan for Amenorrhea
- Diet Plan for Breast Development
- Diet Plan for Pregnant Women

### Respiratory Health
- Diet Plan for Patients of Asthma
- Diet Chart for Childhood Asthma
- Diet Plan for Patients of Common Cold

### Liver & Kidney Health
- Diet Chart for Ascites
- Diet Plan for Chronic Kidney Disease Patients
- Diet Plan for Patients of Fatty Liver Disease
- Diet Plan for Patients of Kidney Stones
- Diet Chart for Jaundice

### Joint & Bone Health
- Diet Chart for Arthritis
- Diet Chart for Gout
- Diet Plan for Patients with Back Pain

### Cardiovascular Health
- Diet Plan for Patients of Edema

### Neurological Health
- Diet Plan for Patients with Bell's Palsy
- Diet Chart for Migraine
- Diet Plan for Patients of Depression

### Immunity & Infectious Diseases
- Diet Plan for Allergy
- Diet Chart for Dengue

### Eye Health
- Diet Plan for Patients with Cataract

### Reproductive Health
- Diet Plan for Patients of Infertility

### Rare Diseases
- Diet Plan for Patients of Amyloidosis

### Life Stages
- Diet Chart for Adulthood

### Blood Health
- Diet Plan for Anemia

## 🎯 Features

Each diet chart includes:

1. **Foods to Consume** - Detailed list of recommended foods organized by category
2. **Foods to Avoid** - Items that should be avoided for the specific condition
3. **Diet Schedule** - Time-based meal planning for optimal results
4. **Lifestyle Tips** - Complementary lifestyle recommendations
5. **Food Group Distribution** - Visual pie charts showing recommended proportions

## 📊 Usage on Website

The diet charts are accessible at:
- **Main Listing**: `/diet-charts`
- **Individual Charts**: `/diet-charts/[slug]`

### Example URLs:
- `/diet-charts/diet-chart-for-acidity-gastroesophageal-reflux-disease`
- `/diet-charts/diet-plan-for-patients-of-obesity`
- `/diet-charts/diet-plan-for-pregnant-women`

## 🔧 Technical Details

### Data Structure
Each diet chart is stored as a structured TypeScript object with:
- `id`: Unique identifier
- `slug`: URL-friendly name
- `title`: Display title
- `category`: Health category
- `description`: Brief overview
- `image`: Hero image URL
- `foodsToConsume`: Record of food categories and items
- `foodsToAvoid`: Record of foods to avoid
- `dietSchedule`: Time-based meal plan
- `lifestyleTips`: Array of lifestyle recommendations
- `foodGroups`: Optional pie chart data

### Components
- `DietChartCard.tsx` - Card component for listing
- `DietChartViewer.tsx` - Full viewer with tabs
- `DietCharts.tsx` - Main listing page with filters

## 🌿 Ayurvedic Principles

All diet charts follow classical Ayurvedic principles:
- **Dosha Balance**: Tailored to pacify specific doshas
- **Agni Support**: Foods that enhance digestive fire
- **Seasonal Considerations**: Aligned with Ritucharya
- **Sattvic Quality**: Emphasis on pure, wholesome foods

## 📝 Source

Original content sourced from: https://www.planetayurveda.com/diet-chart/

## 📄 License

For educational and clinical use at Ayurvritta Ayurveda Hospital.

---

**Last Updated**: 2026-05-23
**Total Charts**: 35
