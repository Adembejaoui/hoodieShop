"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/dashboard-utils";

// Types
interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "",
    description: "",
    type: "PERCENTAGE",
    value: 0,
    minOrderAmount: 0,
    maxUses: 0,
    expiresAt: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/admin/coupons");
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...couponForm,
          maxUses: couponForm.maxUses || null,
          expiresAt: couponForm.expiresAt || null,
        }),
      });

      if (response.ok) {
        setShowCouponForm(false);
        setCouponForm({
          code: "",
          description: "",
          type: "PERCENTAGE",
          value: 0,
          minOrderAmount: 0,
          maxUses: 0,
          expiresAt: "",
        });
        fetchCoupons();
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
    }
  };

  const handleToggleCoupon = async (couponId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });

      if (response.ok) {
        fetchCoupons();
      }
    } catch (error) {
      console.error("Error toggling coupon:", error);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCoupons();
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Coupons ({coupons.length})</h2>
        <Button onClick={() => setShowCouponForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Coupon
        </Button>
      </div>

      {/* Coupon Form */}
      {showCouponForm && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Create New Coupon</h3>
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  value={couponForm.code}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., SAVE20"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={couponForm.description}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, description: e.target.value })
                  }
                  placeholder="e.g., 20% off your order"
                />
              </div>
              <div>
                <Label htmlFor="type">Discount Type</Label>
                <Select
                  value={couponForm.type}
                  onValueChange={(value) =>
                    setCouponForm({ ...couponForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Discount Value</Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  value={couponForm.value}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, value: parseFloat(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="minOrderAmount">Minimum Order Amount</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  min="0"
                  value={couponForm.minOrderAmount}
                  onChange={(e) =>
                    setCouponForm({
                      ...couponForm,
                      minOrderAmount: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="maxUses">Maximum Uses</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="0"
                  value={couponForm.maxUses}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, maxUses: parseInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label htmlFor="expiresAt">Expiration Date</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={couponForm.expiresAt}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, expiresAt: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create Coupon</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCouponForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No coupons found</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4">Code</th>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-left py-3 px-4">Discount</th>
                <th className="text-left py-3 px-4">Usage</th>
                <th className="text-left py-3 px-4">Expires</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b hover:bg-muted/25">
                  <td className="py-3 px-4 font-mono font-medium">{coupon.code}</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {coupon.description || "-"}
                  </td>
                  <td className="py-3 px-4">
                    {coupon.type === "PERCENTAGE"
                      ? `${coupon.value}%`
                      : `$${coupon.value}`}
                  </td>
                  <td className="py-3 px-4">
                    {coupon.usedCount}
                    {coupon.maxUses && ` / ${coupon.maxUses}`}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {coupon.expiresAt
                      ? formatDate(coupon.expiresAt)
                      : "Never"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        coupon.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {coupon.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleCoupon(coupon.id, coupon.active)}
                      >
                        {coupon.active ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
