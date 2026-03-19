// frontend/components/OnboardingModal.tsx
"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import type { OnboardingData } from "@/lib/types";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
  userEmail: string;
}

export default function OnboardingModal({ isOpen, onClose, onComplete, userEmail }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    name: "",
    age: 0,
    gender: "male",
    height: 0,
    weight: 0,
    activityLevel: "sedentary",
    primaryGoal: "maintain",
    mealsPerDay: 3,
    dietaryRestrictions: "",
    healthConditions: ""
  });

  if (!isOpen) return null;

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    onComplete(formData as OnboardingData);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Let's start with the basics</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What's your name?
              </label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How old are you?
              </label>
              <Input
                type="number"
                placeholder="Enter your age"
                value={formData.age || ""}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's your gender?
              </label>
              <div className="space-y-2">
                {["male", "female", "other"].map((gender) => (
                  <label key={gender} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={formData.gender === gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="text-green-600"
                    />
                    <span className="capitalize">{gender}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Your physical stats</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What's your height? (in cm)
              </label>
              <Input
                type="number"
                placeholder="e.g., 170"
                value={formData.height || ""}
                onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What's your current weight? (in kg)
              </label>
              <Input
                type="number"
                placeholder="e.g., 70"
                value={formData.weight || ""}
                onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">How active are you?</h3>
            
            <div className="space-y-3">
              {[
                { value: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
                { value: "lightly_active", label: "Lightly Active", desc: "Exercise 1-3 days/week" },
                { value: "moderately_active", label: "Moderately Active", desc: "Exercise 3-5 days/week" },
                { value: "very_active", label: "Very Active", desc: "Exercise 6-7 days/week" },
                { value: "extra_active", label: "Extra Active", desc: "Very hard exercise & physical job" }
              ].map((activity) => (
                <label key={activity.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="activityLevel"
                    value={activity.value}
                    checked={formData.activityLevel === activity.value}
                    onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as any })}
                    className="mt-1 text-green-600"
                  />
                  <div>
                    <div className="font-medium">{activity.label}</div>
                    <div className="text-sm text-gray-500">{activity.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">What's your goal?</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Goal
              </label>
              <div className="space-y-2">
                {[
                  { value: "lose_weight", label: "Lose Weight" },
                  { value: "maintain", label: "Maintain Weight" },
                  { value: "gain_muscle", label: "Gain Weight/Muscle" }
                ].map((goal) => (
                  <label key={goal.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="primaryGoal"
                      value={goal.value}
                      checked={formData.primaryGoal === goal.value}
                      onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value as any })}
                      className="text-green-600"
                    />
                    <span>{goal.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How many meals do you prefer per day?
              </label>
              <div className="space-y-2">
                {[2, 3, 4, 5].map((num) => (
                  <label key={num} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="mealsPerDay"
                      value={num}
                      checked={formData.mealsPerDay === num}
                      onChange={(e) => setFormData({ ...formData, mealsPerDay: parseInt(e.target.value) as any })}
                      className="text-green-600"
                    />
                    <span>{num} {num === 5 ? "+" : ""} meals</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Final details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Any dietary preferences or restrictions?
              </label>
              <Input
                type="text"
                placeholder="e.g., Vegetarian, Vegan, Keto, No dairy, etc."
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Any health conditions we should know about? (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g., Diabetes, High blood pressure, Allergies, etc."
                value={formData.healthConditions}
                onChange={(e) => setFormData({ ...formData, healthConditions: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
            <span className="text-sm font-medium text-green-600">{progress}%</span>
          </div>
          <Progress value={progress} />
          <p className="text-sm text-gray-600 mt-2">
            Answer a few questions and get your personalized diet plan in minutes
          </p>
        </div>

        {renderStep()}

        <div className="flex justify-between mt-8">
          <Button
            onClick={handleBack}
            variant="outline"
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            disabled={step === 1}
          >
            ← Back
          </Button>
          
          {step === totalSteps ? (
            <Button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Generate Plan
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Next →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}