// frontend/components/ChatInterface.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { UserProfile } from "@/lib/types";
import axios from "axios";
import { LogOut } from "lucide-react";

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/chat", {
        query: input,
        user_data: {
          age: userProfile.age,
          weight: userProfile.weight,
          height: userProfile.height,
          goal: userProfile.primaryGoal,
          dietary_preference: userProfile.dietaryRestrictions,
          activity_level: userProfile.activityLevel
        }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.reply,
        role: "assistant",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Please try again later.",
        role: "assistant",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
        </div>

        {/* Input Area */}
        <div className="bg-white border-t p-4">
          <div className="flex space-x-4 max-w-4xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
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