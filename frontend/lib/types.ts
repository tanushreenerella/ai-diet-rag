// frontend/lib/types.ts

// 🔐 ONLY for login/signup
export type UserAuth = {
  email: string;
  password: string;
  fullName: string;
};

// 🧠 onboarding form data
export type OnboardingData = {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';

  height: number;
  weight: number;

  activityLevel:
    | 'sedentary'
    | 'lightly_active'
    | 'moderately_active'
    | 'very_active'
    | 'extra_active';

  primaryGoal: 'lose_weight' | 'maintain' | 'gain_muscle';
  mealsPerDay: 2 | 3 | 4 | 5;

  dietaryRestrictions: string;
  healthConditions: string;
};

// ✅ THIS is what chat actually uses
export type UserProfile = OnboardingData;