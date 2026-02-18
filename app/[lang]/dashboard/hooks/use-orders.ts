"use client";

import { useState, useEffect, useCallback } from "react";
import type { Order, PaginationData, TabType } from "../types";

interface UseOrdersOptions {
  activeTab: TabType;
  initialPage?: number;
  limit?: number;
}

export function useOrders({ activeTab, initialPage = 1, limit = 10 }: UseOrdersOptions) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: initialPage,
    limit,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (activeTab !== "orders") return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/dashboard/orders?page=${pagination.page}&limit=${pagination.limit}`
      );
      const data = await res.json();
      setOrders(data.orders || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  return {
    orders,
    pagination,
    loading,
    refetch: fetchOrders,
    setPage,
  };
}