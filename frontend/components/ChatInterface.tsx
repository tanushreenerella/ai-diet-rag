// frontend/components/ChatInterface.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { UserProfile } from "@/lib/types";
import axios from "axios";
import { LogOut } from "lucide-react";
import HealthCharts from "./HealthCharts";
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatInterfaceProps {
  userProfile: UserProfile;
  onLogout: () => void;
}

export default function ChatInterface({ userProfile, onLogout }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `Hello ${userProfile.name}! I'm your AI diet assistant. I've analyzed your profile and I'm here to help you with personalized nutrition advice. What would you like to know about your diet plan?`,
      role: "assistant",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [bmiData, setBmiData] = useState<any>(null);
const [macroData, setMacroData] = useState<any>(null);
const [loadingMeal, setLoadingMeal] = useState(false);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
const sendMessage = async () => {
  if (!input.trim() || isLoading) return;

  const currentInput = input; // ✅ FIX (important)
  
  const userMessage: Message = {
    id: Date.now().toString(),
    content: currentInput,
    role: "user",
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  setInput("");
  setIsLoading(true);

  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/chat",
      {
        query: currentInput,
        user_data: {
          age: userProfile.age,
          weight: userProfile.weight,
          height: userProfile.height,
          goal: userProfile.primaryGoal,
          dietary_preference: userProfile.dietaryRestrictions,
          activity_level: userProfile.activityLevel
        }
      },
      {
        timeout: 10000 // ✅ FIX
      }
    );

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: response.data?.reply || "No response",
      role: "assistant",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);

  } catch (error: any) {
    console.error("Error:", error);

    let message = "Something went wrong.";

    if (error.response) {
      message = error.response.data?.detail || "Server error";
    } else if (error.request) {
      message = "Server not responding";
    }

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        content: message,
        role: "assistant",
        timestamp: new Date()
      }
    ]);
  } finally {
    setIsLoading(false);
  }
};
const generateMealPlan = async () => {
  setLoadingMeal(true);

  try {
    const res = await fetch("http://127.0.0.1:8000/generate-meal-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "generate meal plan",
        user_data: userProfile,
      }),
    });

    const data = await res.json();

    // ✅ show in chat
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        content: data.meal_plan,
        role: "assistant",
        timestamp: new Date(),
      }
    ]);

    // ✅ trigger visualization
    getMacros(data.meal_plan);
    getBMI();

  } catch (err) {
    console.error(err);
  }

  setLoadingMeal(false);
};
const getBMI = async () => {
  try {
    const res = await fetch("http://localhost:8000/visualize-bmi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "",
        user_data: userProfile,
      }),
    });

    const data = await res.json();
    setBmiData(data);
  } catch (err) {
    console.error(err);
  }
};

const getMacros = async (mealText: string) => {
  try {
    const res = await fetch("http://localhost:8000/visualize-macros", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: mealText,
        user_data: userProfile,
      }),
    });

    const data = await res.json();
    setMacroData(data);
  } catch (err) {
    console.error(err);
  }
};
const bmi = userProfile.weight / ((userProfile.height / 100) ** 2);

const macros = {
  protein: Math.round(userProfile.weight * 1.2),
  carbs: Math.round(userProfile.weight * 2),
  fats: Math.round(userProfile.weight * 0.8),
};
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r p-6 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <span className="text-2xl font-bold text-gray-800">NutriAI</span>
          <button
            onClick={onLogout}
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Your Profile</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-600">Name:</span> {userProfile.name}</p>
            <p><span className="text-gray-600">Age:</span> {userProfile.age}</p>
            <p><span className="text-gray-600">Height:</span> {userProfile.height} cm</p>
            <p><span className="text-gray-600">Weight:</span> {userProfile.weight} kg</p>
            <p><span className="text-gray-600">Goal:</span> {userProfile.primaryGoal.replace("_", " ")}</p>
            <p><span className="text-gray-600">Activity:</span> {userProfile.activityLevel.replace("_", " ")}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => setInput("What should I eat today?")}
          >
            🍽️ Meal Ideas
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => setInput("Calculate my daily calorie needs")}
          >
            🔥 Calorie Calculator
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => setInput("Give me a sample meal plan")}
          >
            📋 Sample Meal Plan
          </Button>
          <Button
  variant="outline"
  className="w-full justify-start text-left"
  onClick={generateMealPlan}
>
  🥗 Generate Meal Plan
</Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b p-4">
          <h2 className="text-xl font-semibold">AI Diet Assistant</h2>
          <p className="text-sm text-gray-600">Personalized nutrition advice based on your profile</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-2xl rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-green-600 text-white"
                    : "bg-white border"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.role === "user" ? "text-green-100" : "text-gray-500"
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border rounded-lg p-4">
                <p className="text-gray-500">Typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
          {macroData && bmiData && (
  <div className="mt-6">
    <h2 className="text-lg font-semibold mb-2">📊 Your Health Insights</h2>
    
    <HealthCharts
      macros={{
        protein: macroData.protein,
        carbs: macroData.carbs,
        fats: macroData.fats,
      }}
      bmi={bmiData.bmi}
    />
  </div>
)}
        </div>
        {/* ✅ BMI DISPLAY */}
{bmiData && (
  <div className="bg-white border rounded-lg p-4 mt-4">
    <h3 className="font-semibold">Your BMI</h3>
    <p>{bmiData.bmi} ({bmiData.category})</p>
  </div>
)}

{/* ✅ MACRO DISPLAY */}
{macroData && (
  <div className="bg-white border rounded-lg p-4 mt-4">
    <h3 className="font-semibold mb-2">Macro Distribution</h3>
    <p>Protein: {macroData.protein}</p>
    <p>Carbs: {macroData.carbs}</p>
    <p>Fats: {macroData.fats}</p>
  </div>
)}
        {/* Input Area */}
        <div className="bg-white border-t p-4">
          <div className="flex space-x-4 max-w-4xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
  if (e.key === "Enter" && !isLoading) {
    sendMessage();
  }
}}
              placeholder="Ask about your diet, meal plans, nutrition tips..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}