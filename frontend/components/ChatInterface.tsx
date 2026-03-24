// frontend/components/ChatInterface.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { UserProfile } from "@/lib/types";
import axios from "axios";
import { LogOut } from "lucide-react";
import HealthCharts from "./HealthCharts";

interface ChatInterfaceProps {
  userProfile: UserProfile;
  onLogout: () => void;
}
interface Message {
  id: string;
  content?: string;
  role: "user" | "assistant";
  timestamp: Date;
  type?: "text" | "chart"|"image";
  chartData?: any;
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
const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

const sendMessage = async () => {
  if ((!input.trim() && !selectedFile) || isLoading) return;

  const currentInput = input;

const userMessage: Message = {
  id: Date.now().toString(),
  content: selectedFile ? URL.createObjectURL(selectedFile) : currentInput,
  role: "user",
  timestamp: new Date(),
  type: selectedFile ? "image" : "text"
};

  setMessages(prev => [...prev, userMessage]);
  setInput("");
  setIsLoading(true);

  try {
    let response;

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("user_data", JSON.stringify(userProfile));
      response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/analyze-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setSelectedFile(null);
    } else {
      response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        query: currentInput,
        user_data: userProfile,
        history: messages
  .filter(m => m.type === "text" || !m.type)
  .map(m => ({
    role: m.role,
    content: m.content
  }))
      });
    }

    setMessages(prev => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        content: response.data?.reply || "Processed successfully",
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
  } catch (error: any) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }

  setIsLoading(false);
};
const generateMealPlan = async () => {
  setLoadingMeal(true);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-meal-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "generate meal plan",
        user_data: userProfile,
      }),
    });

    const data = await res.json();

// 1️⃣ Show meal plan text
setMessages(prev => [
  ...prev,
  {
    id: Date.now().toString(),
    content: data.meal_plan,
    role: "assistant",
    timestamp: new Date(),
  },
]);

// 2️⃣ Fetch macros + BMI
const macros = await getMacros(data.meal_plan);
const bmi = await getBMI();

// 3️⃣ Push chart message
setMessages(prev => [
  ...prev,
  {
    id: Date.now().toString(),
    role: "assistant",
    timestamp: new Date(),
    type: "chart",
    chartData: {
      macros,
      bmi
    },
  },
]);

  } catch (err) {
    console.error(err);
  }

  setLoadingMeal(false);
};
const getBMI = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/visualize-bmi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "",
        user_data: userProfile,
      }),
    });

    return await res.json();
  } catch (err) {
    console.error(err);
  }
};

const getMacros = async (mealText: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/visualize-macros`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: mealText,
        user_data: userProfile,
      }),
    });

    return await res.json();
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
  className={`rounded-lg p-4 ${
    message.type === "chart"
      ? "w-full max-w-4xl"
      : "max-w-2xl"
  } ${
    message.role === "user"
      ? "bg-green-600 text-white"
      : "bg-white border"
  }`}
>
      {/* ✅ TEXT MESSAGE */}
     {/* ✅ IMAGE MESSAGE */}
{message.type === "image" && (
  <img
    src={message.content}
    alt="uploaded"
    className="max-w-xs rounded-lg"
  />
)}

{/* ✅ TEXT MESSAGE */}
{message.type === "text" && (
  <p className="whitespace-pre-wrap">{message.content}</p>
)}

      {/* ✅ CHART MESSAGE */}
      {message.type === "chart" && message.chartData && (
        <HealthCharts
          macros={{
            protein: message.chartData.macros.protein,
            carbs: message.chartData.macros.carbs,
            fats: message.chartData.macros.fats,
          }}
          bmi={message.chartData?.bmi?.bmi||0}
        />
      )}

      <p className="text-xs mt-2 text-gray-500">
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
        </div>
        {/* Input Area */}
        <div className="bg-white border-t p-4">
           <div className="flex items-center gap-2 max-w-4xl mx-auto bg-gray-100 rounded-full px-3 py-2">

  {/* 🔥 FILE INPUT */}
  <input
    type="file"
    accept="image/*"
    className="hidden"
    id="fileUpload"
    onChange={(e) => {
      if (e.target.files?.[0]) {
        setSelectedFile(e.target.files[0]);
      }
    }}
  />

  {/* ➕ BUTTON */}
  <label
    htmlFor="fileUpload"
    className="cursor-pointer text-xl px-2"
  >
    +
  </label>

  {/* 🖼️ INLINE IMAGE PREVIEW */}
  {selectedFile && (
    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border">
      <img
        src={URL.createObjectURL(selectedFile)}
        className="w-8 h-8 object-cover rounded"
      />
      <button
        onClick={() => setSelectedFile(null)}
        className="text-red-500 text-xs"
      >
        ✕
      </button>
    </div>
  )}

  {/* ✏️ INPUT */}
  <input
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !isLoading) {
        sendMessage();
      }
    }}
    placeholder="Ask about your diet..."
    className="flex-1 bg-transparent outline-none px-2"
    disabled={isLoading}
  />

  {/* 🚀 SEND */}
  <button
    onClick={sendMessage}
    disabled={isLoading || (!input.trim() && !selectedFile)}
    className="bg-green-600 text-white px-4 py-1 rounded-full"
  >
    Send
  </button>
</div>
        </div>
      </div>
    </div>
  );
}