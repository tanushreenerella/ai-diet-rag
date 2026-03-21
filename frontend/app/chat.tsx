// frontend/app/chat/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";
import type { UserProfile } from "@/lib/types";

export default function ChatPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const profile = localStorage.getItem("userProfile");

    console.log("Chat page - Auth check:", { isAuthenticated, profile });

    if (!isAuthenticated || isAuthenticated !== "true") {
      router.push("/");
      return;
    }

    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        setUserProfile(parsedProfile);
        console.log("Profile loaded:", parsedProfile);
      } catch (error) {
        console.error("Error parsing profile:", error);
        router.push("/");
      }
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    console.log("Logging out...");
    // Clear all auth data
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userProfile");
    // Redirect to home page
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">No user profile found</p>
          <button
            onClick={() => router.push("/")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return <ChatInterface userProfile={userProfile} onLogout={handleLogout} />;
}