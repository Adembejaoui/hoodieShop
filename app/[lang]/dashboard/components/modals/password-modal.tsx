"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { PasswordFormData } from "../../types";

interface PasswordModalProps {
  isOpen: boolean;
  formData: PasswordFormData;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: PasswordFormData) => void;
}

export function PasswordModal({
  isOpen,
  formData,
  onClose,
  onSubmit,
  onFormDataChange,
}: PasswordModalProps) {
  const t = useTranslations("dashboard");
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t("changePassword")}</h2>
          <button onClick={onClose} className="hover:bg-secondary p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">{t("currentPassword")}</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => onFormDataChange({ ...formData, currentPassword: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{t("newPassword")}</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => onFormDataChange({ ...formData, newPassword: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{t("confirmNewPassword")}</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => onFormDataChange({ ...formData, confirmPassword: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
              required
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-md hover:bg-secondary"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {t("changePassword")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}