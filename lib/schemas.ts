/**
 * Zod Validation Schemas for Health Tools
 * Shared validation for all Ayurvedic assessment tools
 */

import { z } from 'zod';

// ============================================
// COMMON PRIMITIVE SCHEMAS
// ============================================

const doshaEnum = z.enum(['vata', 'pitta', 'kapha']);
const eligibilityEnum = z.enum(['Eligible', 'Caution', 'Contraindicated']);
const nonEmptyString = z.string().min(1);
const positiveInt = z.number().int().nonnegative();
const percentage = z.number().min(0).max(100);

// ============================================
// LIFESTYLE TOOL SCHEMAS
// ============================================

export const LifestyleQuestionSchema = z.object({
  id: positiveInt,
  category: nonEmptyString,
  sanskrit: nonEmptyString,
  text: nonEmptyString,
  icon: nonEmptyString,
  options: z.array(z.object({
    label: nonEmptyString,
    value: positiveInt,
    dosha: z.array(doshaEnum).min(1),
    effect: nonEmptyString,
  })).min(1),
});

export const LifestyleAnswerSchema = z.object({
  questionId: positiveInt,
  selectedOptionIndex: positiveInt,
  selectedValue: positiveInt,
  selectedDosha: z.array(doshaEnum).min(1),
});

export const LifestyleInputSchema = z.object({
  answers: z.array(LifestyleAnswerSchema).min(1).max(20),
});

export const LifestyleResultSchema = z.object({
  vataScore: positiveInt,
  pittaScore: positiveInt,
  kaphaScore: positiveInt,
  totalScore: positiveInt,
  riskLevel: z.enum(['Low', 'Moderate', 'High', 'Very High']),
  dominantDosha: doshaEnum,
  recommendations: z.array(nonEmptyString).min(1),
  timestamp: z.string().datetime(),
});

export type LifestyleInput = z.infer<typeof LifestyleInputSchema>;
export type LifestyleResult = z.infer<typeof LifestyleResultSchema>;

// ============================================
// PANCHAKARMA TOOL SCHEMAS
// ============================================

export const PanchakarmaQuestionSchema = z.object({
  id: positiveInt,
  category: nonEmptyString,
  sanskrit: nonEmptyString,
  text: nonEmptyString,
  icon: nonEmptyString,
  options: z.array(z.object({
    label: nonEmptyString,
    value: z.number().int().min(0).max(3),
    effect: nonEmptyString,
    eligibility: eligibilityEnum,
  })).min(1),
});

export const PanchakarmaAnswerSchema = z.object({
  questionId: positiveInt,
  selectedOptionIndex: positiveInt,
  selectedValue: z.number().int().min(0).max(3),
  selectedEligibility: eligibilityEnum,
});

export const PanchakarmaInputSchema = z.object({
  answers: z.array(PanchakarmaAnswerSchema).min(1).max(20),
});

export const PanchakarmaResultSchema = z.object({
  totalScore: z.number().int().min(0).max(30),
  eligibility: eligibilityEnum,
  eligibleProcedures: z.array(z.enum(['Vamana', 'Virechana', 'Basti', 'Nasya', 'Raktamokshana'])),
  cautions: z.array(nonEmptyString),
  contraindications: z.array(nonEmptyString),
  preparatorySteps: z.array(nonEmptyString),
  timestamp: z.string().datetime(),
});

export type PanchakarmaInput = z.infer<typeof PanchakarmaInputSchema>;
export type PanchakarmaResult = z.infer<typeof PanchakarmaResultSchema>;

// ============================================
// MEDA TOOL (BMI & MEDA DHATU) SCHEMAS
// ============================================

export const MedaInputSchema = z.object({
  age: z.number().int().min(1).max(120),
  gender: z.enum(['male', 'female']),
  heightCm: z.number().positive().max(300),
  weightKg: z.number().positive().max(500),
  waistCm: z.number().positive().max(200).optional(),
  hipCm: z.number().positive().max(200).optional(),
});

export const MedaResultSchema = z.object({
  bmi: z.number().positive(),
  bmiCategory: z.enum(['Underweight', 'Normal', 'Overweight', 'Obese Class I', 'Obese Class II', 'Obese Class III']),
  medaDhatuAssessment: z.enum(['Optimal', 'Mild Increase', 'Moderate Increase', 'Significant Increase']),
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  waistHipRatio: z.number().positive().optional(),
  charakaSigns: z.array(z.object({
    sign: nonEmptyString,
    present: z.boolean(),
    description: nonEmptyString,
  })),
  recommendations: z.array(nonEmptyString).min(1),
  timestamp: z.string().datetime(),
});

export type MedaInput = z.infer<typeof MedaInputSchema>;
export type MedaResult = z.infer<typeof MedaResultSchema>;

// ============================================
// SAARA TOOL (SAARA PARIKSHA) SCHEMAS
// ============================================

export const SaaraQuestionSchema = z.object({
  id: positiveInt,
  dhatu: nonEmptyString,
  sanskrit: nonEmptyString,
  text: nonEmptyString,
  icon: nonEmptyString,
  options: z.array(z.object({
    label: nonEmptyString,
    value: z.number().int().min(0).max(3),
    effect: nonEmptyString,
  })).min(1),
});

export const SaaraAnswerSchema = z.object({
  questionId: positiveInt,
  selectedOptionIndex: positiveInt,
  selectedValue: z.number().int().min(0).max(3),
});

export const SaaraInputSchema = z.object({
  answers: z.array(SaaraAnswerSchema).length(9), // Exactly 9 dhatus
});

export const SaaraResultSchema = z.object({
  dhatuScores: z.record(doshaEnum, z.number().int().min(0).max(9)),
  totalScore: z.number().int().min(0).max(27),
  saaraQuality: z.enum(['Pravara', 'Madhyama', 'Avara']),
  rasayanaRecommendations: z.array(nonEmptyString).min(1),
  dhatuAnalysis: z.array(z.object({
    dhatu: nonEmptyString,
    sanskrit: nonEmptyString,
    score: z.number().int().min(0).max(3),
    quality: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
  })).length(9),
  timestamp: z.string().datetime(),
});

export type SaaraInput = z.infer<typeof SaaraInputSchema>;
export type SaaraResult = z.infer<typeof SaaraResultSchema>;

// ============================================
// PRAKRITI TOOL SCHEMAS
// ============================================

export const PrakritiQuestionSchema = z.object({
  id: positiveInt,
  category: nonEmptyString,
  sanskrit: nonEmptyString,
  text: nonEmptyString,
  icon: nonEmptyString,
  options: z.array(z.object({
    label: nonEmptyString,
    value: positiveInt,
    dosha: z.array(doshaEnum).min(1),
    effect: nonEmptyString,
  })).min(1),
});

export const PrakritiAnswerSchema = z.object({
  questionId: positiveInt,
  selectedOptionIndex: positiveInt,
  selectedValue: positiveInt,
  selectedDosha: z.array(doshaEnum).min(1),
});

export const PrakritiInputSchema = z.object({
  answers: z.array(PrakritiAnswerSchema).min(1).max(30),
});

export const PrakritiResultSchema = z.object({
  vataScore: positiveInt,
  pittaScore: positiveInt,
  kaphaScore: positiveInt,
  totalScore: positiveInt,
  vataPercentage: percentage,
  pittaPercentage: percentage,
  kaphaPercentage: percentage,
  dominantDosha: doshaEnum,
  secondaryDosha: doshaEnum.optional(),
  prakritiType: z.enum(['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Kapha-Vata', 'Tridoshic']),
  characteristics: z.object({
    physical: z.array(nonEmptyString),
    mental: z.array(nonEmptyString),
    digestive: z.array(nonEmptyString),
  }),
  recommendations: z.object({
    diet: z.array(nonEmptyString),
    lifestyle: z.array(nonEmptyString),
    herbs: z.array(nonEmptyString),
  }),
  timestamp: z.string().datetime(),
});

export type PrakritiInput = z.infer<typeof PrakritiInputSchema>;
export type PrakritiResult = z.infer<typeof PrakritiResultSchema>;

// ============================================
// DIET CHART TOOL SCHEMAS
// ============================================

export const DietChartInputSchema = z.object({
  prakriti: z.object({
    dominantDosha: doshaEnum,
    vataPercentage: percentage,
    pittaPercentage: percentage,
    kaphaPercentage: percentage,
  }).optional(),
  age: z.number().int().min(1).max(120).optional(),
  gender: z.enum(['male', 'female']).optional(),
  healthGoals: z.array(z.enum(['weight_loss', 'weight_gain', 'maintenance', 'digestion', 'energy', 'immunity', 'skin', 'detox'])).optional(),
  dietaryRestrictions: z.array(nonEmptyString).optional(),
  allergies: z.array(nonEmptyString).optional(),
  preferredCuisine: z.array(nonEmptyString).optional(),
  mealsPerDay: z.number().int().min(1).max(6).default(3),
});

export const DietChartDaySchema = z.object({
  day: positiveInt,
  meals: z.array(z.object({
    type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    items: z.array(z.object({
      name: nonEmptyString,
      portion: nonEmptyString,
      calories: positiveInt.optional(),
      macros: z.object({
        protein: z.number().nonnegative().optional(),
        carbs: z.number().nonnegative().optional(),
        fat: z.number().nonnegative().optional(),
      }).optional(),
      benefits: z.array(nonEmptyString).optional(),
    })).min(1),
  })).min(1),
  totalCalories: positiveInt.optional(),
  doshaBalance: z.object({
    vata: percentage,
    pitta: percentage,
    kapha: percentage,
  }),
});

export const DietChartResultSchema = z.object({
  planDurationDays: positiveInt,
  dailyPlan: z.array(DietChartDaySchema),
  weeklySummary: z.object({
    averageCalories: positiveInt,
    macroSplit: z.object({
      protein: percentage,
      carbs: percentage,
      fat: percentage,
    }),
  }),
  guidelines: z.array(nonEmptyString).min(1),
  foodsToFavor: z.array(nonEmptyString),
  foodsToAvoid: z.array(nonEmptyString),
  timestamp: z.string().datetime(),
});

export type DietChartInput = z.infer<typeof DietChartInputSchema>;
export type DietChartResult = z.infer<typeof DietChartResultSchema>;

// ============================================
// INLINE CHAT TOOL SCHEMAS
// ============================================

export const InlinePrakritiQuizInputSchema = z.object({
  answers: z.array(z.object({
    questionIndex: positiveInt,
    selectedDosha: doshaEnum,
  })).length(3),
});

export const InlinePrakritiQuizResultSchema = z.object({
  vata: positiveInt,
  pitta: positiveInt,
  kapha: positiveInt,
  dominantDosha: doshaEnum,
  percentages: z.object({
    vata: percentage,
    pitta: percentage,
    kapha: percentage,
  }),
});

export type InlinePrakritiQuizInput = z.infer<typeof InlinePrakritiQuizInputSchema>;
export type InlinePrakritiQuizResult = z.infer<typeof InlinePrakritiQuizResultSchema>;

// ============================================
// VALIDATION HELPER FUNCTIONS
// ============================================

/**
 * Validates input against a schema and returns typed result or throws formatted error
 */
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const errors = result.error.issues.map(issue => 
      `${issue.path.join('.')}: ${issue.message}`
    ).join('; ');
    throw new Error(`Validation failed: ${errors}`);
  }
  return result.data;
}

/**
 * Validates input and returns result with success/error tuple (no throw)
 */
export function safeValidateInput<T>(schema: z.ZodSchema<T>, input: unknown): 
  { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    errors: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`) 
  };
}

/**
 * Validates tool result output
 */
export function validateToolResult<T>(schema: z.ZodSchema<T>, result: unknown): T {
  return validateInput(schema, result);
}

export const ToolSchemas = {
  lifestyle: { input: LifestyleInputSchema, result: LifestyleResultSchema },
  panchakarma: { input: PanchakarmaInputSchema, result: PanchakarmaResultSchema },
  meda: { input: MedaInputSchema, result: MedaResultSchema },
  saara: { input: SaaraInputSchema, result: SaaraResultSchema },
  prakriti: { input: PrakritiInputSchema, result: PrakritiResultSchema },
  dietChart: { input: DietChartInputSchema, result: DietChartResultSchema },
  inlinePrakritiQuiz: { input: InlinePrakritiQuizInputSchema, result: InlinePrakritiQuizResultSchema },
} as const;

export type ToolName = keyof typeof ToolSchemas;