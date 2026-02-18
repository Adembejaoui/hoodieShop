"use client";

import { useTranslations } from "next-intl";
import type { User } from "../../types";

interface QuickStatsProps {
  user: User | null;
}

export function QuickStats({ user }: QuickStatsProps) {
  const t = useTranslations("dashboard");
  
  return (
    <div className="bg-card rounded-lg border p-4 mt-4">
      <h3 className="font-medium mb-3">{t("quickStats")}</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("totalOrders")}</span>
          <span className="font-medium">{user?._count?.orders || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("savedAddresses")}</span>
          <span className="font-medium">{user?._count?.addresses || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("wishlistItems")}</span>
          <span className="font-medium">{user?._count?.wishlist || 0}</span>
        </div>
      </div>
    </div>
  );
}