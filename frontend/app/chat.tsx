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

    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    if (profile) {
      setUserProfile(JSON.parse(profile));
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
    return null;
  }

  return <ChatInterface userProfile={userProfile} />;
}