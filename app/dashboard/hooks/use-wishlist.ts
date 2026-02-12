"use client";

import { useState, useEffect, useCallback } from "react";
import type { WishlistItem, TabType } from "../types";

interface UseWishlistOptions {
  activeTab: TabType;
}

export function useWishlist({ activeTab }: UseWishlistOptions) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (activeTab !== "wishlist") return;

      setLoading(true);
      try {
        const res = await fetch("/api/dashboard/wishlist");
        const data = await res.json();
        setWishlist(data.wishlist || []);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [activeTab]);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (id: string): Promise<{ success: boolean }> => {
    try {
      const res = await fetch(`/api/dashboard/wishlist?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWishlist((prev) => prev.filter((item) => item.id !== id));
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      return { success: false };
    }
  }, []);

  return {
    wishlist,
    loading,
    removeFromWishlist,
  };
}
