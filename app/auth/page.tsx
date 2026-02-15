"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";

// Anime-themed background with dark overlay
const AnimeBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Anime background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=80')`,
        }}
      />
      {/* Dark gradient overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
      {/* Animated accent glow */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"
        animate={{
          scale: [1.5, 1, 1.5],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
};

// Content component that uses useSearchParams - wrapped in Suspense
function AuthContent() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get("registered") === "true";
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasRedirected = useRef(false);

  // Show success message when user just registered
  useEffect(() => {
    if (showSuccess) {
      setActiveTab("login");
    }
  }, [showSuccess]);

  // Redirect to home if already logged in - use ref to prevent multiple redirects
  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return;
    
    // Wait for session to be ready before checking
    if (status === "loading") {
      return;
    }
    
    // Redirect to appropriate page if already logged in
    if (status === "authenticated" && session?.user) {
      hasRedirected.current = true;
      const userRole = (session.user as any).role;
      const callbackUrl = searchParams.get("callbackUrl");
      
      // Use window.location for immediate redirect
      if (callbackUrl) {
        const decodedCallbackUrl = decodeURIComponent(callbackUrl);
        if (decodedCallbackUrl.includes("/admin") && userRole !== "ADMIN") {
          window.location.href = "/shop";
        } else {
          window.location.href = decodedCallbackUrl;
        }
      } else if (userRole === "ADMIN") {
        window.location.href = "/admin/dashboard/overview";
      } else {
        window.location.href = "/shop";
      }
    }
  }, [status, session, searchParams]);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <>
        <AnimeBackground />
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md backdrop-blur-xl bg-black/40 rounded-3xl border border-white/10 shadow-2xl p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-white/10 rounded w-1/2 mx-auto mb-4" />
              <div className="h-4 bg-white/10 rounded w-3/4 mx-auto" />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Don't render form if authenticated (redirect is in progress)
  if (status === "authenticated") {
    return (
      <>
        <AnimeBackground />
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md backdrop-blur-xl bg-black/40 rounded-3xl border border-white/10 shadow-2xl p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-white/10 rounded w-1/2 mx-auto mb-4" />
              <div className="h-4 bg-white/10 rounded w-3/4 mx-auto" />
            </div>
          </div>
        </div>
      </>
    );
  }

  const tabs = [
    { key: "login" as const, label: "Sign In" },
    { key: "register" as const, label: "Create Account" },
  ];

  return (
    <>
      <AnimeBackground />

      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Glassmorphism Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="backdrop-blur-xl bg-black/40 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-purple-900/80 to-pink-900/80 p-6 sm:p-8 text-center border-b border-white/10">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl font-bold text-white"
              >
                {activeTab === "login" ? "Welcome Back" : "Join the Community"}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/70 mt-2 text-sm sm:text-base"
              >
                {activeTab === "login"
                  ? "Sign in to access your account"
                  : "Create your account to get started"}
              </motion.p>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex-1 py-4 text-sm sm:text-base font-medium transition-all relative overflow-hidden",
                    activeTab === tab.key
                      ? "text-white"
                      : "text-white/50 hover:text-white/80"
                  )}
                >
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/10"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Form Container */}
            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {showSuccess && activeTab === "login" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 text-sm"
                  >
                    Account created successfully! Please sign in.
                  </motion.div>
                )}

                {activeTab === "login" ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LoginForm darkMode />
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RegisterForm darkMode />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 sm:px-8 py-4 bg-white/5 border-t border-white/10">
              <p className="text-center text-white/50 text-sm">
                {activeTab === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("register")}
                      className="text-purple-400 hover:text-purple-300 font-medium"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("login")}
                      className="text-pink-400 hover:text-pink-300 font-medium"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <>
        <AnimeBackground />
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md backdrop-blur-xl bg-black/40 rounded-3xl border border-white/10 shadow-2xl p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/10 rounded w-1/2 mx-auto" />
              <div className="h-4 bg-white/10 rounded w-3/4 mx-auto" />
              <div className="space-y-3 mt-8">
                <div className="h-12 bg-white/10 rounded" />
                <div className="h-12 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </div>
      </>
    }>
      <AuthContent />
    </Suspense>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
