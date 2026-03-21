"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";
import type { UserProfile } from "@/lib/types";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ChatPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state:", user);

      // ❌ no user → go back
      if (!user) {
        router.replace("/");
        return;
      }

      // ✅ try to load profile
      const profile = localStorage.getItem("userProfile");

      if (profile) {
        try {
          setUserProfile(JSON.parse(profile));
        } catch {
          localStorage.removeItem("userProfile");
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    localStorage.clear();
    await signOut(auth);
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // ✅ fallback profile (NO TS ERROR now)
  const safeProfile: UserProfile = userProfile || {
  name: "User",
  age: 0,
  gender: "other", // ✅ required

  height: 0,
  weight: 0,

  activityLevel: "moderately_active", // ✅ correct enum

  primaryGoal: "maintain", // ✅ correct enum
  mealsPerDay: 3, // ✅ required

  dietaryRestrictions: "none",
  healthConditions: "none" // ✅ required
};

  return (
    <ChatInterface
      userProfile={safeProfile}
      onLogout={handleLogout}
    />
  );
}