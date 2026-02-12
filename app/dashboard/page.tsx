"use client";

import { useState, useEffect } from "react";
import { useUser, useOrders, useAddresses, useWishlist } from "./hooks";
import { DashboardSidebar, QuickStats } from "./components/sidebar";
import { AddressFormModal, OrderDetailModal, PasswordModal } from "./components/modals";
import { OrdersTab, AddressesTab, WishlistTab, ProfileTab } from "./components/tabs";
import type { TabType, Order, Address, AddressFormData, PasswordFormData, ProfileFormData } from "./types";

export default function DashboardPage() {
  // Active tab state
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Custom hooks for data
  const { user, loading, error, saveProfile, changePassword } = useUser();
  const { orders, pagination, loading: ordersLoading, setPage } = useOrders({ activeTab });
  const { addresses, loading: addressesLoading, addAddress, updateAddress, deleteAddress } = useAddresses({ activeTab });
  const { wishlist, loading: wishlistLoading, removeFromWishlist } = useWishlist({ activeTab });

  // Modal states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showOrderModal, setShowOrderModal] = useState<Order | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form states
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    name: "",
    recipientName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
    isDefault: false,
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: "",
    phone: "",
  });

  // Update profile form when user data loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Address handlers
  const handleAddAddress = () => {
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
    await deleteAddress(id);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddress) {
      await updateAddress(editingAddress.id, addressForm);
    } else {
      await addAddress(addressForm);
    }
    setShowAddressForm(false);
  };

  // Wishlist handler
  const handleRemoveFromWishlist = async (id: string) => {
    if (!confirm("Remove this item from your wishlist?")) return;
    await removeFromWishlist(id);
  };

  // Profile handler
  const handleSaveProfile = async () => {
    const result = await saveProfile(profileForm);
    alert(result.message);
  };

  // Password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await changePassword(passwordForm);
    alert(result.message);
    if (result.success) {
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modals */}
      <AddressFormModal
        isOpen={showAddressForm}
        editingAddress={editingAddress}
        formData={addressForm}
        isDefault={addresses.length === 0}
        onClose={() => setShowAddressForm(false)}
        onSubmit={handleSaveAddress}
        onFormDataChange={setAddressForm}
      />

      <OrderDetailModal
        order={showOrderModal}
        onClose={() => setShowOrderModal(null)}
      />

      <PasswordModal
        isOpen={showPasswordModal}
        formData={passwordForm}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleChangePassword}
        onFormDataChange={setPasswordForm}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || "Customer"}</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <DashboardSidebar
              user={user}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isSigningOut={isSigningOut}
              onSigningOutChange={setIsSigningOut}
            />
            <QuickStats user={user} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">My Orders</h2>
                <OrdersTab
                  orders={orders}
                  onViewOrder={(order) => setShowOrderModal(order)}
                />
              </div>
            )}

            {activeTab === "addresses" && (
              <AddressesTab
                addresses={addresses}
                onAddAddress={handleAddAddress}
                onEditAddress={handleEditAddress}
                onDeleteAddress={handleDeleteAddress}
              />
            )}

            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">My Wishlist</h2>
                <WishlistTab
                  wishlist={wishlist}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                />
              </div>
            )}

            {activeTab === "profile" && (
              <ProfileTab
                user={user}
                profileForm={profileForm}
                onProfileFormChange={setProfileForm}
                onSaveProfile={handleSaveProfile}
                onOpenPasswordModal={() => setShowPasswordModal(true)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
