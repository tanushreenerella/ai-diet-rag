// frontend/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import OnboardingModal from "@/components/OnboardingModal";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "outline";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const Button = ({ 
  children, 
  onClick, 
  className = "", 
  variant = "default", 
  type = "button", 
  disabled = false 
}: ButtonProps) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants: Record<"default" | "outline", string> = {
    default: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    outline: "border-2 border-gray-300 hover:bg-gray-50 focus:ring-gray-500"
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
};

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<"signin" | "signup">("signup");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      router.push("/chat");
    }
  }, [router]);

  const openAuthModal = (mode: "signin" | "signup") => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (email: string, mode: "signin" | "signup") => {
    setUserEmail(email);
    setIsAuthModalOpen(false);
    
    if (mode === "signup") {
      // Open onboarding modal after successful signup
      setIsOnboardingOpen(true);
    } else {
      // For signin, go directly to chat
      router.push("/chat");
    }
  };

  const handleOnboardingComplete = (data: any) => {
    console.log("Onboarding complete with data:", data);
    // Save user profile data
    localStorage.setItem("userProfile", JSON.stringify(data));
    setIsOnboardingOpen(false);
    router.push("/chat");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto border-b">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-gray-800">NutriAI</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
          <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</a>
          <a href="#workouts" className="text-gray-600 hover:text-gray-900">Workouts</a>
          <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => openAuthModal("signin")}
            className="text-gray-600 hover:text-gray-900"
          >
            Sign In
          </button>
          <Button
            onClick={() => openAuthModal("signup")}
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
              AI-Powered Nutrition
            </div>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Your Personal <br />
              <span className="text-green-600">AI Dietitian</span>
            </h1>
            <p className="text-xl text-gray-600 mt-6 mb-8">
              Transform your health journey with AI-powered meal planning, smart tracking, 
              and expert guidance—all in one beautiful app.
            </p>
            <div className="flex space-x-4">
              <Button
                onClick={() => openAuthModal("signup")}
                className="px-8 py-3 rounded-lg text-lg"
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                className="px-8 py-3 rounded-lg text-lg"
              >
                Watch Demo
              </Button>
            </div>
          </div>
          <div className="relative h-96 bg-green-50 rounded-2xl flex items-center justify-center">
            <span className="text-gray-400">Hero Image Placeholder</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Everything You Need</h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Powerful AI features designed to make your nutrition journey effortless
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Get started in minutes with our simple 3-step process
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-600 mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">Tell us about yourself—age, height, weight, activity level, and goals.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-600 mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Get Your AI Plan</h3>
              <p className="text-gray-600">Receive a customized meal plan designed by AI to meet your specific needs.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-600 mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Track & Achieve</h3>
              <p className="text-gray-600">Log meals, track progress, chat with AI, and reach your goals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authInitialMode}
        onSuccess={handleAuthSuccess}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
        userEmail={userEmail}
      />
    </div>
  );
}

const features = [
  {
    title: "AI Meal Planning",
    description: "Personalized meal plans generated by AI based on your goals, preferences, and nutritional needs.",
    icon: "🍽️"
  },
  {
    title: "Smart Tracking",
    description: "Log meals with photos and get instant AI-powered calorie and macro estimates.",
    icon: "📱"
  },
  {
    title: "Progress Prediction",
    description: "Weekly predictions and insights to keep you motivated and on track.",
    icon: "📈"
  },
  {
    title: "AI Chatbot",
    description: "24/7 AI assistant to answer nutrition questions and provide guidance.",
    icon: "💬"
  },
  {
    title: "Expert Consultation",
    description: "Book video calls with professional dietitians for personalized advice.",
    icon: "👨‍⚕️"
  },
  {
    title: "Health Metrics",
    description: "Track BMR, TDEE, macros, and all your health data in one place.",
    icon: "📊"
  }
];