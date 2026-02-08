"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Eye,
} from "lucide-react";
import { formatDate } from "@/lib/dashboard-utils";

// Types
interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  orders: Order[];
}

interface Order {
  id: string;
  totalPrice: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/admin/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customers ({customers.length})</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No customers found</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Orders</th>
                <th className="text-left py-3 px-4">Total Spent</th>
                <th className="text-left py-3 px-4">Joined</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const totalSpent = customer.orders.reduce(
                  (sum, o) => sum + Number(o.totalPrice),
                  0
                );
                return (
                  <tr key={customer.id} className="border-b hover:bg-muted/25">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{customer.name || "Guest"}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        customer.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {customer.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">{customer.orders.length}</td>
                    <td className="py-3 px-4">${totalSpent.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
