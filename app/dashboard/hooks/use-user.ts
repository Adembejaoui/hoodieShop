"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User, ProfileFormData, PasswordFormData } from "../types";

export function useUser() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/dashboard/profile");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Save profile
  const saveProfile = useCallback(async (profileForm: ProfileFormData) => {
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        const data = await res.json();
        setUser((prev) => (prev ? { ...prev, ...data.user } : null));
        return { success: true, message: "Profile updated successfully!" };
      }
      return { success: false, message: "Failed to update profile" };
    } catch (err) {
      console.error("Error updating profile:", err);
      return { success: false, message: "Failed to update profile" };
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (passwordForm: PasswordFormData) => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return { success: false, message: "Passwords do not match!" };
    }

    if (passwordForm.newPassword.length < 8) {
      return { success: false, message: "Password must be at least 8 characters!" };
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (res.ok) {
        return { success: true, message: "Password changed successfully!" };
      }
      const data = await res.json();
      return { success: false, message: data.error || "Failed to change password" };
    } catch (err) {
      console.error("Error changing password:", err);
      return { success: false, message: "Failed to change password" };
    }
  }, []);

  return {
    user,
    loading,
    error,
    saveProfile,
    changePassword,
  };
}
