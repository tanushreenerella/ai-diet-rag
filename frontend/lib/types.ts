// frontend/lib/types.ts
export type UserAuth = {
  email: string;
  password: string;
  fullName: string;
};

export type OnboardingData = {
  // Step 1: Basics
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  
  // Step 2: Physical stats
  height: number; // in cm
  weight: number; // in kg
  
  // Step 3: Activity level
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  
  // Step 4: Goals
  primaryGoal: 'lose_weight' | 'maintain' | 'gain_muscle';
  mealsPerDay: 2 | 3 | 4 | 5;
  
  // Step 5: Preferences
  dietaryRestrictions: string;
  healthConditions: string;
};

export type UserProfile = UserAuth & OnboardingData;