"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { Address, AddressFormData } from "../../types";

interface AddressFormModalProps {
  isOpen: boolean;
  editingAddress: Address | null;
  formData: AddressFormData;
  isDefault: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: AddressFormData) => void;
}

export function AddressFormModal({
  isOpen,
  editingAddress,
  formData,
  isDefault,
  onClose,
  onSubmit,
  onFormDataChange,
}: AddressFormModalProps) {
  const t = useTranslations("dashboard");
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {editingAddress ? t("editAddress") : t("addNewAddress")}
          </h2>
          <button onClick={onClose} className="hover:bg-secondary p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">{t("addressLabel")}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
              placeholder={t("addressLabelPlaceholder")}
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{t("recipientName")}</label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => onFormDataChange({ ...formData, recipientName: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{t("phone")}</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{t("address")}</label>
            <textarea
              value={formData.address}
              onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
              rows={2}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">{t("city")}</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => onFormDataChange({ ...formData, city: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">{t("postalCode")}</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => onFormDataChange({ ...formData, postalCode: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{t("country")}</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => onFormDataChange({ ...formData, country: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
              required
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => onFormDataChange({ ...formData, isDefault: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">{t("setDefaultAddress")}</span>
          </label>
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
              {editingAddress ? t("update") : t("add")} {t("address")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}