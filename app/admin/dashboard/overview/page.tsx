"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Package,
  Users,
  ShoppingBag,
  Eye,
} from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/dashboard-utils";

// Types
interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
}

interface Order {
  id: string;
  orderNumber: string;
  email: string;
  phone: string | null;
  shippingName: string;
  totalPrice: number;
  status: string;
  placedAt: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
  totalPrice: number;
}

// Optimized fetch with caching
async function fetchDashboardData() {
  const [statsRes, ordersRes] = await Promise.all([
    fetch("/api/admin/stats", { 
      next: { revalidate: 60 },
      cache: 'force-cache'
    }),
    fetch("/api/admin/orders", { 
      next: { revalidate: 30 },
      cache: 'force-cache'
    }),
  ]);

  const stats = statsRes.ok ? (await statsRes.json()).stats : null;
  const orders = ordersRes.ok ? (await ordersRes.json()).orders : [];
  
  return { stats, orders };
}

export default function DashboardOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchDashboardData().then(({ stats: statsData, orders: ordersData }) => {
      if (mounted) {
        setStats(statsData);
        setOrders(ordersData.slice(0, 5)); // Only show 5 recent orders
        setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, status } : o
        ));
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  // Skeleton loader for stats
  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-card rounded-lg border p-6 animate-pulse">
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-muted rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );

  // Skeleton loader for table
  const TableSkeleton = () => (
    <div className="bg-card rounded-lg border p-6 animate-pulse">
      <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-muted rounded"></div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <StatsSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-4 gap-4">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
            </div>
            <ShoppingBag className="w-10 h-10 text-primary/20" />
          </div>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold">${(stats?.totalRevenue || 0).toFixed(2)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500/20" />
          </div>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Orders</p>
              <p className="text-3xl font-bold">{stats?.pendingOrders || 0}</p>
            </div>
            <Package className="w-10 h-10 text-yellow-500/20" />
          </div>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-3xl font-bold">{stats?.totalCustomers || 0}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500/20" />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/dashboard/orders")}>
            View All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Order</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-muted/25">
                  <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{order.shippingName}</p>
                      <p className="text-sm text-muted-foreground">{order.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">${Number(order.totalPrice).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {formatDate(order.placedAt)}
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/dashboard/orders?id=${order.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
