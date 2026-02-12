"use client";

import { useState, useEffect, useCallback } from "react";
import type { Address, AddressFormData, TabType } from "../types";

interface UseAddressesOptions {
  activeTab: TabType;
}

export function useAddresses({ activeTab }: UseAddressesOptions) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (activeTab !== "addresses") return;

      setLoading(true);
      try {
        const res = await fetch("/api/dashboard/addresses");
        const data = await res.json();
        setAddresses(data.addresses || []);
      } catch (err) {
        console.error("Error fetching addresses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [activeTab]);

  // Add address
  const addAddress = useCallback(async (formData: AddressFormData): Promise<{ success: boolean; address?: Address }> => {
    try {
      const res = await fetch("/api/dashboard/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses((prev) => [...prev, data.address]);
        return { success: true, address: data.address };
      }
      return { success: false };
    } catch (err) {
      console.error("Error adding address:", err);
      return { success: false };
    }
  }, []);

  // Update address
  const updateAddress = useCallback(async (id: string, formData: AddressFormData): Promise<{ success: boolean; address?: Address }> => {
    try {
      const res = await fetch("/api/dashboard/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id }),
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses((prev) =>
          prev.map((a) => (a.id === id ? data.address : a))
        );
        return { success: true, address: data.address };
      }
      return { success: false };
    } catch (err) {
      console.error("Error updating address:", err);
      return { success: false };
    }
  }, []);

  // Delete address
  const deleteAddress = useCallback(async (id: string): Promise<{ success: boolean }> => {
    try {
      const res = await fetch(`/api/dashboard/addresses?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error("Error deleting address:", err);
      return { success: false };
    }
  }, []);

  return {
    addresses,
    loading,
    addAddress,
    updateAddress,
    deleteAddress,
  };
}
