"use client";

import { useTranslations } from "next-intl";
import { User, Package, MapPin, Heart, LogOut, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";
import type { User as UserType, TabType } from "../../types";

interface DashboardSidebarProps {
  user: UserType | null;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isSigningOut: boolean;
  onSigningOutChange: (value: boolean) => void;
}

export function DashboardSidebar({
  user,
  activeTab,
  onTabChange,
  isSigningOut,
  onSigningOutChange,
}: DashboardSidebarProps) {
  const t = useTranslations("dashboard");
  
  const tabs = [
    { id: "orders" as TabType, label: t("orders"), icon: Package, count: user?._count?.orders },
    { id: "addresses" as TabType, label: t("addresses"), icon: MapPin, count: user?._count?.addresses },
    { id: "wishlist" as TabType, label: t("wishlist"), icon: Heart, count: user?._count?.wishlist },
    { id: "profile" as TabType, label: t("profile"), icon: User },
  ];

  const handleSignOut = async () => {
    onSigningOutChange(true);
    await signOut({ callbackUrl: "/auth" });
  };

  return (
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
            <p className="font-medium">{user?.name || t("customer")}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>
      <div className="p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
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
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-red-50 text-red-600 transition-colors mt-2 disabled:opacity-50"
        >
          {isSigningOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          <span>{isSigningOut ? t("signingOut") : t("signOut")}</span>
        </button>
      </div>
    </nav>
  );
}