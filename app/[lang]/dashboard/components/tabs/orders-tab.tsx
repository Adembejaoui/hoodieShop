"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Package, ChevronRight, Eye } from "lucide-react";
import type { Order } from "../../types";

interface OrdersTabProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
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

export function OrdersTab({ orders, onViewOrder }: OrdersTabProps) {
  const t = useTranslations("dashboard");
  
  if (orders.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-8 text-center">
        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">{t("noOrders")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("startShopping")}</p>
        <Link href="/shop" className="inline-flex items-center gap-2 text-primary hover:underline">
          {t("browseProducts")} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onViewOrder(order)}
        >
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-secondary/50 to-secondary/30">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.placedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
               
              </div>
            </div>
          </div>

          {/* Items Preview */}
          <div className="p-4">
            <div className="flex flex-wrap gap-4">
              {order.items.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-secondary/30 rounded-lg px-3 py-2">
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs font-medium">
                    {item.quantity}x
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate max-w-[150px]">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.color} • {item.size}</p>
                  </div>
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="flex items-center justify-center bg-secondary/30 rounded-lg px-3 py-2 min-w-[100px]">
                  <span className="text-sm text-muted-foreground">+{order.items.length - 3} {t("more")}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">{t("clickToView")}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{order.items.length} {t("items")}</p>
                <p className="font-bold text-lg">{Number(order.totalPrice).toFixed(2)} DT</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}