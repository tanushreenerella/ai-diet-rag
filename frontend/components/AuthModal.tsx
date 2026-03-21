// frontend/components/AuthModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Check, X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
  onSuccess: (email: string) => void;
}

interface PasswordValidation {
  minLength: boolean;
  hasNumber: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasSpecialChar: boolean;
}

export default function AuthModal({ isOpen, onClose, mode, onSuccess }: AuthModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasNumber: false,
    hasUppercase: false,
    hasLowercase: false,
    hasSpecialChar: false
  });
  
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [error, setError] = useState("");

  // Validate password on change
  useEffect(() => {
    const password = formData.password;
    
    setPasswordValidation({
      minLength: password.length >= 6,
      hasNumber: /\d/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
    
    // Check if passwords match
    if (mode === "signup" && formData.confirmPassword) {
      setPasswordsMatch(password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword, mode]);

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(Boolean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation for signup
    if (mode === "signup") {
      if (!formData.fullName.trim()) {
        setError("Full name is required");
        return;
      }
      
      if (!isPasswordValid()) {
        setError("Please meet all password requirements");
        return;
      }
      
      if (!passwordsMatch) {
        setError("Passwords do not match");
        return;
      }
    }

    // Email validation
    if (!formData.email.includes("@") || !formData.email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }

    // Here you would typically make an API call to authenticate
    console.log("Form submitted:", formData);
    
    // Save auth state
    localStorage.setItem("isAuthenticated", "true");
    if (mode === "signup") {
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userName", formData.fullName);
    }
    
    onSuccess(formData.email);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              type="password"
              placeholder="********"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              required
              className={mode === "signup" && formData.password && !isPasswordValid() ? "border-yellow-500" : ""}
            />
            
            {/* Password requirements box - only show during signup */}
            {mode === "signup" && (passwordFocused || formData.password) && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Password must contain:
                </h4>
                <div className="space-y-2">
                  <RequirementItem 
                    met={passwordValidation.minLength}
                    text="At least 6 characters"
                  />
                  <RequirementItem 
                    met={passwordValidation.hasNumber}
                    text="At least 1 number"
                  />
                  <RequirementItem 
                    met={passwordValidation.hasUppercase}
                    text="At least 1 uppercase letter"
                  />
                  <RequirementItem 
                    met={passwordValidation.hasLowercase}
                    text="At least 1 lowercase letter"
                  />
                  <RequirementItem 
                    met={passwordValidation.hasSpecialChar}
                    text="At least 1 special character (!@#$%^&*)"
                  />
                </div>
                
                {/* Password strength indicator */}
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Password strength:</span>
                    <span className={`text-xs font-medium ${
                      Object.values(passwordValidation).filter(Boolean).length <= 2 ? "text-red-500" :
                      Object.values(passwordValidation).filter(Boolean).length <= 4 ? "text-yellow-500" :
                      "text-green-500"
                    }`}>
                      {Object.values(passwordValidation).filter(Boolean).length}/5
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        Object.values(passwordValidation).filter(Boolean).length <= 2 ? "bg-red-500" :
                        Object.values(passwordValidation).filter(Boolean).length <= 4 ? "bg-yellow-500" :
                        "bg-green-500"
                      }`}
                      style={{ 
                        width: `${(Object.values(passwordValidation).filter(Boolean).length / 5) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="********"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className={formData.confirmPassword && !passwordsMatch ? "border-red-500" : ""}
              />
              {formData.confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-xs text-red-500">
                  Passwords do not match
                </p>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={mode === "signup" ? (!isPasswordValid() || !passwordsMatch) : false}
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

// Helper component for requirement items
function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center space-x-2 text-sm">
      {met ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <X className="w-4 h-4 text-gray-300" />
      )}
      <span className={met ? "text-gray-700" : "text-gray-400"}>
        {text}
      </span>
    </div>
  );
}