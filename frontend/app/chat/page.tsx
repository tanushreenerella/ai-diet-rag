"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";
import type { UserProfile } from "@/lib/types";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // ✅ added db

import { doc, getDoc } from "firebase/firestore"; // ✅ added

export default function ChatPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state:", user);

      // ❌ no user → redirect
      if (!user) {
        router.replace("/");
        return;
      }

      try {
        // 🔥 FETCH PROFILE FROM FIRESTORE (MAIN FIX)
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setUserProfile(data as UserProfile);

          // ✅ optional cache
          localStorage.setItem("userProfile", JSON.stringify(data));
        } else {
          console.log("No profile found → redirecting to onboarding");

          // ❗ if no profile exists → send to onboarding
          router.replace("/onboarding");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);

    // ✅ better than clear()
    localStorage.removeItem("userProfile");

    router.replace("/");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // ✅ fallback (just safety, rarely used now)
  const safeProfile: UserProfile = userProfile || {
    name: "User",
    age: 0,
    gender: "other",
    height: 0,
    weight: 0,
    activityLevel: "moderately_active",
    primaryGoal: "maintain",
    mealsPerDay: 3,
    dietaryRestrictions: "none",
    healthConditions: "none",
  };

  return (
    <ChatInterface
      userProfile={safeProfile}
      onLogout={handleLogout}
    />
  );
}