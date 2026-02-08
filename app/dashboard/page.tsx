"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, MapPin, Heart, User, Settings, LogOut, ChevronRight, X, Plus, Trash2, Edit, Eye } from "lucide-react";

// Types
interface Order {
  id: string;
  orderNumber: string;
  totalPrice: number;
  status: string;
  placedAt: string;
  items: Array<{
    name: string;
    color: string;
    size: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface Address {
  id: string;
  name: string;
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    frontImageURL: string | null;
    category: {
      name: string;
      slug: string;
    };
  };
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  phone: string | null;
  balance: number;
  hasPassword: boolean;
  createdAt: string;
  _count: {
    orders: number;
    addresses: number;
    wishlist: number;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

type TabType = "orders" | "addresses" | "wishlist" | "profile";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orderPagination, setOrderPagination] = useState<PaginationData>({ page: 1, limit: 10, totalCount: 0, totalPages: 0 });
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showOrderModal, setShowOrderModal] = useState<Order | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form states
  const [addressForm, setAddressForm] = useState({
    name: "",
    recipientName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
    isDefault: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });

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
        if (data.user) {
          setProfileForm({
            name: data.user.name || "",
            phone: data.user.phone || "",
          });
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/dashboard/orders?page=${orderPagination.page}&limit=${orderPagination.limit}`);
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.pagination) {
          setOrderPagination(data.pagination);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab, orderPagination.page]);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch("/api/dashboard/addresses");
        const data = await res.json();
        setAddresses(data.addresses || []);
      } catch (err) {
        console.error("Error fetching addresses:", err);
      }
    };

    if (activeTab === "addresses") {
      fetchAddresses();
    }
  }, [activeTab]);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch("/api/dashboard/wishlist");
        const data = await res.json();
        setWishlist(data.wishlist || []);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    };

    if (activeTab === "wishlist") {
      fetchWishlist();
    }
  }, [activeTab]);

  // Address CRUD functions
  const handleAddAddress = async () => {
    setEditingAddress(null);
    setAddressForm({
      name: "",
      recipientName: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "France",
      isDefault: addresses.length === 0,
    });
    setShowAddressForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name,
      recipientName: address.recipientName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    
    try {
      const res = await fetch(`/api/dashboard/addresses?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAddresses(addresses.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Error deleting address:", err);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAddress) {
        const res = await fetch("/api/dashboard/addresses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...addressForm, id: editingAddress.id }),
        });
        if (res.ok) {
          const updated = await res.json();
          setAddresses(addresses.map((a) => (a.id === editingAddress.id ? updated.address : a)));
        }
      } else {
        const res = await fetch("/api/dashboard/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressForm),
        });
        if (res.ok) {
          const newAddress = await res.json();
          setAddresses([...addresses, newAddress.address]);
        }
      }
      setShowAddressForm(false);
    } catch (err) {
      console.error("Error saving address:", err);
    }
  };

  // Wishlist functions
  const handleRemoveFromWishlist = async (id: string) => {
    if (!confirm("Remove this item from your wishlist?")) return;
    
    try {
      const res = await fetch(`/api/dashboard/wishlist?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWishlist(wishlist.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  // Profile functions
  const handleSaveProfile = async () => {
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, ...data.user });
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert("Password must be at least 8 characters!");
      return;
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
        alert("Password changed successfully!");
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to change password");
      }
    } catch (err) {
      console.error("Error changing password:", err);
    }
  };

  const tabs = [
    { id: "orders" as TabType, label: "My Orders", icon: Package, count: user?._count?.orders },
    { id: "addresses" as TabType, label: "Addresses", icon: MapPin, count: user?._count?.addresses },
    { id: "wishlist" as TabType, label: "Wishlist", icon: Heart, count: user?._count?.wishlist },
    { id: "profile" as TabType, label: "Profile", icon: User },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "PROCESSING": return "bg-blue-100 text-blue-800";
      case "SHIPPED": return "bg-purple-100 text-purple-800";
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      case "REFUNDED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>
              <button onClick={() => setShowAddressForm(false)} className="hover:bg-secondary p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAddress} className="p-4 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Address Label</label>
                <input
                  type="text"
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  placeholder="Home, Work, etc."
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Recipient Name</label>
                <input
                  type="text"
                  value={addressForm.recipientName}
                  onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Phone</label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Address</label>
                <textarea
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  rows={2}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Postal Code</label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Country</label>
                <input
                  type="text"
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  required
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Set as default address</span>
              </label>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  {editingAddress ? "Update" : "Add"} Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Change Password</h2>
              <button onClick={() => setShowPasswordModal(false)} className="hover:bg-secondary p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-4 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Order {showOrderModal.orderNumber}</h2>
              <button onClick={() => setShowOrderModal(null)} className="hover:bg-secondary p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(showOrderModal.status)}`}>
                  {showOrderModal.status}
                </span>
              </div>
              <div className="space-y-3">
                {showOrderModal.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground"> ({item.color}, {item.size})</span>
                      <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                    </div>
                    <span>${Number(item.unitPrice).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t flex justify-between font-medium">
                <span>Total</span>
                <span>${Number(showOrderModal.totalPrice).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || "Customer"}</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-card rounded-lg border overflow-hidden">
              <div className="p-4 border-b bg-secondary/50">
                <div className="flex items-center gap-3">
                  {user?.image ? (
                    <img src={user.image} alt={user.name || ""} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{user?.name || "Customer"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activeTab === tab.id ? "bg-primary-foreground/20" : "bg-secondary"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
                <Link
                  href="/api/auth/signout"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-red-50 text-red-600 transition-colors mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </Link>
              </div>
            </nav>

            {/* Quick Stats */}
            <div className="bg-card rounded-lg border p-4 mt-4">
              <h3 className="font-medium mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Orders</span>
                  <span className="font-medium">{user?._count?.orders || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saved Addresses</span>
                  <span className="font-medium">{user?._count?.addresses || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Wishlist Items</span>
                  <span className="font-medium">{user?._count?.wishlist || 0}</span>
                </div>
                {user && user.balance > 0 && (
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Store Credit</span>
                    <span className="font-medium text-green-600">${Number(user.balance).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">My Orders</h2>
                {orders.length === 0 ? (
                  <div className="bg-card rounded-lg border p-8 text-center">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No orders yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Start shopping to see your orders here</p>
                    <Link href="/shop" className="inline-flex items-center gap-2 text-primary hover:underline">
                      Browse Products <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-card rounded-lg border overflow-hidden">
                        <div className="p-4 border-b bg-secondary/30 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">{order.orderNumber}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">{formatDate(order.placedAt)}</span>
                        </div>
                        <div className="p-4">
                          <div className="space-y-2">
                            {order.items.slice(0, 3).map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="truncate max-w-xs">{item.name}</span>
                                <span className="text-muted-foreground">x{item.quantity}</span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-sm text-muted-foreground">+{order.items.length - 3} more items</p>
                            )}
                          </div>
                          <div className="mt-4 pt-3 border-t flex justify-between">
                            <button
                              onClick={() => setShowOrderModal(order)}
                              className="text-sm text-primary hover:underline"
                            >
                              View Details
                            </button>
                            <span className="font-bold">${Number(order.totalPrice).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">My Addresses</h2>
                  <button
                    onClick={handleAddAddress}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4" /> Add New Address
                  </button>
                </div>
                {addresses.length === 0 ? (
                  <div className="bg-card rounded-lg border p-8 text-center">
                    <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No addresses saved</h3>
                    <p className="text-sm text-muted-foreground mb-4">Add an address for faster checkout</p>
                    <button
                      onClick={handleAddAddress}
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      Add Address <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div key={address.id} className={`bg-card rounded-lg border p-4 ${address.isDefault ? "border-primary" : ""}`}>
                        {address.isDefault && (
                          <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-full mb-2 inline-block">
                            Default
                          </span>
                        )}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{address.name}</h3>
                            <p className="text-sm mt-1">{address.recipientName}</p>
                            <p className="text-sm text-muted-foreground">{address.address}</p>
                            <p className="text-sm text-muted-foreground">{address.city}, {address.postalCode}</p>
                            <p className="text-sm text-muted-foreground">{address.country}</p>
                            <p className="text-sm mt-2">{address.phone}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="p-2 hover:bg-secondary rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">My Wishlist</h2>
                {wishlist.length === 0 ? (
                  <div className="bg-card rounded-lg border p-8 text-center">
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">Your wishlist is empty</h3>
                    <p className="text-sm text-muted-foreground mb-4">Save items you love to your wishlist</p>
                    <Link href="/shop" className="inline-flex items-center gap-2 text-primary hover:underline">
                      Browse Products <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((item) => (
                      <div key={item.id} className="bg-card rounded-lg border overflow-hidden group">
                        <div className="aspect-square bg-secondary relative">
                          {item.product.frontImageURL && (
                            <img
                              src={item.product.frontImageURL}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            onClick={() => handleRemoveFromWishlist(item.id)}
                            className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-red-50 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-muted-foreground">{item.product.category.name}</p>
                          <Link
                            href={`/product/${item.product.category.slug}/${item.product.slug}`}
                            className="font-medium truncate block hover:text-primary"
                          >
                            {item.product.name}
                          </Link>
                          <p className="font-bold mt-1">${Number(item.product.basePrice).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Account Settings</h2>
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="font-medium mb-4">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-muted cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Phone</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Member Since</label>
                      <input
                        type="text"
                        value={user?.createdAt ? formatDate(user.createdAt) : ""}
                        disabled
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-muted cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Save Changes
                    </button>
                    {user?.hasPassword ? (
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 border rounded-md hover:bg-secondary"
                      >
                        Change Password
                      </button>
                    ) : (
                      <div className="group relative flex items-center gap-2">
                        <span className="px-4 py-2 border rounded-md bg-muted text-muted-foreground cursor-not-allowed">
                          Sign in with Provider
                        </span>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2 bg-popover text-popover-foreground text-sm rounded-md border shadow-md">
                          You signed in with Google or GitHub. Password change is not available for provider accounts.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
