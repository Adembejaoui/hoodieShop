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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import {
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Users,
  AlertTriangle,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/dashboard-utils";

// Types
interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  phone: string | null;
  isBlocked: boolean;
  createdAt: string;
  orders: Order[];
}

interface Order {
  id: string;
  totalPrice: number;
  placedAt: string;
  status: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
  });

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

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      name: customer.name || "",
      email: customer.email || "",
      role: customer.role,
      phone: customer.phone || "",
    });
    setShowEditDialog(true);
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailDialog(true);
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      const response = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCustomer.id,
          ...editForm,
        }),
      });

      if (response.ok) {
        setShowEditDialog(false);
        fetchCustomers();
      }
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  const handleToggleBlock = async (customer: Customer) => {
    if (!confirm(`Are you sure you want to ${customer.isBlocked ? "unblock" : "block"} this user?`)) return;

    try {
      const response = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: customer.id,
          isBlocked: !customer.isBlocked,
        }),
      });

      if (response.ok) {
        fetchCustomers();
      }
    } catch (error) {
      console.error("Error toggling block status:", error);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/admin/customers?id=${customerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCustomers();
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const activeCustomers = customers.filter((c) => !c.isBlocked);
  const blockedCustomers = customers.filter((c) => c.isBlocked);

  const CustomerTable = ({ data, title, showBlockActions }: { data: Customer[]; title: string; showBlockActions: boolean }) => (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          {showBlockActions ? (
            <Users className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
          {title} ({data.length})
        </h3>
      </div>
      {data.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No customers in this category
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/25">
              <th className="text-left py-3 px-4">Customer</th>
              <th className="text-left py-3 px-4">Role</th>
              <th className="text-left py-3 px-4">Orders</th>
              <th className="text-left py-3 px-4">Total Spent</th>
              <th className="text-left py-3 px-4">Joined</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((customer) => {
              const totalSpent = customer.orders.reduce(
                (sum, o) => sum + Number(o.totalPrice),
                0
              );
              return (
                <tr key={customer.id} className={`border-b hover:bg-muted/25 ${customer.isBlocked ? "opacity-60 bg-red-50/30" : ""}`}>
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
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(customer)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(customer)}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {showBlockActions && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleBlock(customer)}
                          title="Block User"
                        >
                          <Ban className="w-4 h-4 text-orange-600" />
                        </Button>
                      )}
                      {showBlockActions && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                      {!showBlockActions && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleBlock(customer)}
                          title="Unblock User"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customers ({customers.length})</h2>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCustomer} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Customer name"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="customer@example.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="GHOST">Ghost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customer Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-semibold">
                  {selectedCustomer.name ? selectedCustomer.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedCustomer.name || "Guest"}</p>
                  <p className="text-muted-foreground">{selectedCustomer.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedCustomer.role === "ADMIN"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {selectedCustomer.role}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedCustomer.isBlocked
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {selectedCustomer.isBlocked ? "Blocked" : "Active"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{selectedCustomer.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p>{formatDate(selectedCustomer.createdAt)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Orders ({selectedCustomer.orders.length})</p>
                {selectedCustomer.orders.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedCustomer.orders.map((order) => (
                      <div key={order.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                        <span>Order #{order.id.slice(-6)}</span>
                        <span className="font-medium">${Number(order.totalPrice).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No customers found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Customers Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Active Customers ({activeCustomers.length})
            </h3>
            <CustomerTable data={activeCustomers} title="Active Customers" showBlockActions={true} />
          </div>

          {/* Blocked Users Section */}
          {blockedCustomers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Blocked Users ({blockedCustomers.length})
              </h3>
              <CustomerTable data={blockedCustomers} title="Blocked Users" showBlockActions={false} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
