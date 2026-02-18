"use client";

import { useTranslations } from "next-intl";
import { MapPin, Plus, ChevronRight, Edit, Trash2 } from "lucide-react";
import type { Address } from "../../types";

interface AddressesTabProps {
  addresses: Address[];
  onAddAddress: () => void;
  onEditAddress: (address: Address) => void;
  onDeleteAddress: (id: string) => void;
}

export function AddressesTab({
  addresses,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
}: AddressesTabProps) {
  const t = useTranslations("dashboard");
  
  if (addresses.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-8 text-center">
        <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">{t("noAddresses")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("addAddressForCheckout")}</p>
        <button
          onClick={onAddAddress}
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          {t("addAddress")} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t("myAddresses")}</h2>
        <button
          onClick={onAddAddress}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> {t("addNewAddress")}
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`bg-card rounded-lg border p-4 ${address.isDefault ? "border-primary" : ""}`}
          >
            {address.isDefault && (
              <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-full mb-2 inline-block">
                {t("default")}
              </span>
            )}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{address.name}</h3>
                <p className="text-sm mt-1">{address.recipientName}</p>
                <p className="text-sm text-muted-foreground">{address.address}</p>
                <p className="text-sm text-muted-foreground">
                  {address.city}, {address.postalCode}
                </p>
                <p className="text-sm text-muted-foreground">{address.country}</p>
                <p className="text-sm mt-2">{address.phone}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditAddress(address)}
                  className="p-2 hover:bg-secondary rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteAddress(address.id)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}