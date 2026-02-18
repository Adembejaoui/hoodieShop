"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
} from "@/components/ui/dialog";
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
  placedOn: string;
  status: string;
}

export default function CustomersPage() {
  const t = useTranslations("admin");
  
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
    if (!confirm(t(customer.isBlocked ? "confirmUnblock" : "confirmBlock"))) return;

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
    if (!confirm(t("confirmDeleteUser"))) return;

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
          {t("noCustomersInCategory")}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b bg-muted/25">
                <th className="text-left py-3 px-4">{t("customer")}</th>
                <th className="text-left py-3 px-4">{t("role")}</th>
                <th className="text-left py-3 px-4">{t("orders")}</th>
                <th className="text-left py-3 px-4">{t("totalSpent")}</th>
                <th className="text-left py-3 px-4">{t("joined")}</th>
                <th className="text-left py-3 px-4">{t("actions")}</th>
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
                      <p className="font-medium">{customer.name || t("guest")}</p>
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
                  <td className="py-3 px-4">{totalSpent.toFixed(2)} DT</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(customer)}
                        title={t("viewDetails")}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(customer)}
                        title={t("edit")}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {showBlockActions && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleBlock(customer)}
                          title={t("blockUser")}
                        >
                          <Ban className="w-4 h-4 text-orange-600" />
                        </Button>
                      )}
                      {showBlockActions && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id)}
                          title={t("delete")}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                      {!showBlockActions && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleBlock(customer)}
                          title={t("unblockUser")}
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
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("customers")} ({customers.length})</h2>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editCustomer")}</DialogTitle>
            <DialogDescription>
              {t("editCustomerDescription")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCustomer} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">{t("name")}</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder={t("customerNamePlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">{t("email")}</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="customer@example.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">{t("phone")}</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">{t("role")}</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">{t("customerRole")}</SelectItem>
                  <SelectItem value="ADMIN">{t("adminRole")}</SelectItem>
                  <SelectItem value="GHOST">{t("ghostRole")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit">{t("saveChanges")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customer Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("customerDetails")}</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-semibold">
                  {selectedCustomer.name ? selectedCustomer.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedCustomer.name || t("guest")}</p>
                  <p className="text-muted-foreground">{selectedCustomer.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("role")}</p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedCustomer.role === "ADMIN"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {selectedCustomer.role}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("status")}</p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedCustomer.isBlocked
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {selectedCustomer.isBlocked ? t("blocked") : t("active")}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("phone")}</p>
                  <p>{selectedCustomer.phone || t("notProvided")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("joined")}</p>
                  <p>{formatDate(selectedCustomer.createdAt)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t("orders")} ({selectedCustomer.orders.length})</p>
                {selectedCustomer.orders.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedCustomer.orders.map((order) => (
                      <div key={order.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                        <span>{t("order")} #{order.id.slice(-6)}</span>
                        <span className="font-medium">{Number(order.totalPrice).toFixed(2)} DT</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("noOrdersYet")}</p>
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
          <p className="text-muted-foreground">{t("noCustomers")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Customers Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              {t("activeCustomers")} ({activeCustomers.length})
            </h3>
            <CustomerTable data={activeCustomers} title={t("activeCustomers")} showBlockActions={true} />
          </div>

          {/* Blocked Users Section */}
          {blockedCustomers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                {t("blockedUsers")} ({blockedCustomers.length})
              </h3>
              <CustomerTable data={blockedCustomers} title={t("blockedUsers")} showBlockActions={false} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}