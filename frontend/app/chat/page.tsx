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
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const profile = localStorage.getItem("userProfile");

    console.log("Auth check:", { isAuthenticated, profile });

    // 🚨 FIX: invalidate broken auth state
    if (isAuthenticated === "true" && !profile) {
      localStorage.removeItem("isAuthenticated"); // 🔥 important
    }

    if (isAuthenticated !== "true" || !profile) {
      router.replace("/");
      return;
    }

    try {
      const parsedProfile = JSON.parse(profile);
      setUserProfile(parsedProfile);
    } catch (error) {
      localStorage.clear(); // 🔥 clean bad state
      router.replace("/");
      return;
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/");
  };

  if (loading) return null;

  return (
    <ChatInterface userProfile={userProfile!} onLogout={handleLogout} />
  );
}