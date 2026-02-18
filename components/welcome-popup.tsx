"use client";

import { useState, useEffect } from "react";
import { X, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomePopup({ isOpen, onClose }: WelcomePopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay for animation
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShopNow = () => {
    onClose();
    window.location.href = "/shop";
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className={`bg-card rounded-2xl border shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6 text-white">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 hover:bg-white/20 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-8 h-8" />
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          
          <h2 className="text-2xl font-bold">
            🎁 Welcome to the Family!
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-muted-foreground text-center">
            To celebrate your first visit, here's an exclusive discount on your first order!
          </p>

          {/* Discount tiers */}
          <div className="space-y-3">
            {/* 2+ Hoodies tier */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 rounded-xl border border-pink-200 dark:border-pink-800">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                10%
              </div>
              <div>
                <p className="font-semibold text-foreground">Buy 2+ Hoodies</p>
                <p className="text-sm text-muted-foreground">Get 10% off your entire order</p>
              </div>
            </div>

            {/* 3+ Hoodies tier */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                20%
              </div>
              <div>
                <p className="font-semibold text-foreground">Buy 3+ Hoodies</p>
                <p className="text-sm text-muted-foreground">Get 20% off your entire order</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Discount applies automatically at checkout
          </p>
        </div>

        {/* Footer with CTA */}
        <div className="p-6 pt-0 space-y-3">
          <Button 
            onClick={handleShopNow}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Start Shopping Now →
          </Button>
          
          <button 
            onClick={onClose}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to manage welcome popup state with localStorage
export function useWelcomePopup() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if user just registered or just signed in
    const justRegistered = sessionStorage.getItem('justRegistered');
    const justSignedIn = sessionStorage.getItem('justSignedIn');
    const popupSeen = localStorage.getItem('welcomePopupSeen');
    
    // Show popup for new signup or existing user sign in (if not seen before)
    if ((justRegistered || justSignedIn) && !popupSeen) {
      setShowPopup(true);
      localStorage.setItem('welcomePopupSeen', 'true');
      sessionStorage.removeItem('justRegistered');
      sessionStorage.removeItem('justSignedIn');
    }
  }, []);

  const closePopup = () => setShowPopup(false);

  return { showPopup, closePopup };
}
