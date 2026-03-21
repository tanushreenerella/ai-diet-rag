// frontend/app/chat/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";
import { UserProfile } from "@/lib/types";
// Define the UserProfile type here or import from types

export default function ChatPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const profile = localStorage.getItem("userProfile");

    console.log("Auth check:", { isAuthenticated, profile }); // Debug log

    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        setUserProfile(parsedProfile);
        console.log("Profile loaded:", parsedProfile); // Debug log
      } catch (error) {
        console.error("Error parsing profile:", error);
        router.push("/");
      }
    }
    setLoading(false);
  }, [router]);

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
          <Button onClick={() => router.push("/")}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return <ChatInterface userProfile={userProfile} />;
}

// Add this if Button is not imported
import { Button } from "@/components/ui/button";