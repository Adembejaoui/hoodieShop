"use client";

import { useTranslations } from "next-intl";
import { User, Settings, Key } from "lucide-react";
import type { User as UserType, ProfileFormData } from "../../types";

interface ProfileTabProps {
  user: UserType | null;
  profileForm: ProfileFormData;
  onProfileFormChange: (data: ProfileFormData) => void;
  onSaveProfile: () => void;
  onOpenPasswordModal: () => void;
}

export function ProfileTab({
  user,
  profileForm,
  onProfileFormChange,
  onSaveProfile,
  onOpenPasswordModal,
}: ProfileTabProps) {
  const t = useTranslations("dashboard");
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t("profile")}</h2>
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center gap-4 mb-6">
          {user?.image ? (
            <img src={user.image} alt={user.name || ""} className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <User className="w-8 h-8" />
            </div>
          )}
          <div>
            <p className="font-medium text-lg">{user?.name || t("user")}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">{t("name")}</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => onProfileFormChange({ ...profileForm, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{t("phone")}</label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => onProfileFormChange({ ...profileForm, phone: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={onSaveProfile}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {t("saveChanges")}
            </button>
            <button
              onClick={onOpenPasswordModal}
              className="px-4 py-2 border rounded-md hover:bg-secondary flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              {t("changePassword")}
            </button>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-card rounded-lg border p-6">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("memberSince")}</span>
            <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : t("na")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("email")}</span>
            <span>{user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}