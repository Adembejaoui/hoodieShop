"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { Order } from "../../types";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

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

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const t = useTranslations("dashboard");
  
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-lg font-semibold">{t("order")} {order.orderNumber}</h2>
            <p className="text-sm text-muted-foreground">{formatDate(order.placedAt)}</p>
          </div>
          <button onClick={onClose} className="hover:bg-secondary p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-6">
          {/* Status & Payment */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("status")}:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            

          </div>

          {/* Items */}
          <div>
            <h3 className="font-medium mb-3">{t("itemsOrdered")}</h3>
            <div className="border rounded-lg divide-y">
              {order.items.map((item, index) => (
                <div key={index} className="p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <div className="text-sm text-muted-foreground mt-1 space-x-2">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-gray-300" style={{ backgroundColor: item.color.toLowerCase() }}></span>
                        {item.color}
                      </span>
                      <span>•</span>
                      <span>{t("size")}: {item.size}</span>
                      <span>•</span>
                      <span>{t("print")}: {item.printPosition}</span>
                    </div>
                    <p className="text-sm mt-1">{t("quantity")}: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Number(item.totalPrice).toFixed(2)} DT</p>
                    <p className="text-xs text-muted-foreground">{Number(item.unitPrice).toFixed(2)} DT {t("each")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-medium mb-3">{t("orderSummary")}</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span>{Number(order.subtotal).toFixed(2)} DT</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("shipping")}</span>
              <span>{Number(order.shippingCost) > 0 ? `${Number(order.shippingCost).toFixed(2)} DT` : t("free")}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{t("discount")} {order.couponCode && `(${order.couponCode})`}</span>
                <span>-{Number(order.discountAmount).toFixed(2)} DT</span>
              </div>
            )}
            <div className="flex justify-between font-medium pt-2 border-t text-lg">
              <span>{t("total")}</span>
              <span>{Number(order.totalPrice).toFixed(2)} DT</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">{t("shippingAddress")}</h3>
            <p className="font-medium">{order.shippingName}</p>
            <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
            <p className="text-sm text-muted-foreground">
              {order.shippingCity}, {order.shippingPostalCode}
            </p>
            <p className="text-sm text-muted-foreground">{order.shippingCountry}</p>
            {order.phone && (
              <p className="text-sm mt-2">{order.phone}</p>
            )}
          </div>

          

          {/* Timeline */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">{t("orderTimeline")}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t("orderPlaced")}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.placedAt)}</p>
                </div>
              </div>
              {order.shippedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t("shipped")}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.shippedAt)}</p>
                  </div>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t("delivered")}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.deliveredAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}