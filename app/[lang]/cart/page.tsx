"use client";

import { useCart } from "@/lib/cart-context";
import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function CartPage() {
  const {
    items,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('cart');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              {t('clearCart')}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <svg
              className="w-24 h-24 mx-auto text-muted-foreground mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="text-xl font-semibold mb-2">{t('emptyCart')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('emptyCartDescription')}
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('continueShopping')}
            </Link>
          </div>
        ) : (
          /* Cart Content */
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                  onRemove={() => removeItem(item.id)}
                  t={t}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">{t('orderSummary')}</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('subtotal', { count: items.length })}</span>
                    <span>{subtotal.toFixed(2)} DT</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('shipping')}</span>
                    <span>{subtotal >= 75 ? t('free') : "9.99 DT"}</span>
                  </div>
                  {subtotal < 75 && (
                    <p className="text-xs text-muted-foreground">
                      {t('freeShippingThreshold', { amount: (75 - subtotal).toFixed(2) })}
                    </p>
                  )}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('total')}</span>
                    <span>{(subtotal >= 75 ? subtotal : subtotal + 9.99).toFixed(2)} DT</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full py-3 px-4 bg-primary text-primary-foreground text-center font-semibold rounded-lg hover:bg-primary/90 transition-colors mb-3"
                >
                  {t('proceedToCheckout')}
                </Link>

                <Link
                  href="/shop"
                  className="block w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('continueShopping')}
                </Link>

                {/* Features */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('freeShippingFeature')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('easyReturnsFeature')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Cart Item Row Component
function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  t,
}: {
  item: {
    id: string;
    name: string;
    slug: string;
    categorySlug: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
    image: string | null;
  };
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-xl border">
      {/* Image */}
      <Link
        href={`/product/${item.categorySlug}/${item.slug}`}
        className="w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden bg-secondary shrink-0 hover:opacity-80 transition-opacity"
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            {t('noImage')}
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <Link
            href={`/product/${item.categorySlug}/${item.slug}`}
            className="font-semibold hover:text-primary transition-colors"
          >
            {item.name}
          </Link>
          <div className="text-sm text-muted-foreground mt-1">
            {item.color} / {item.size}
          </div>
          <div className="text-sm font-medium mt-2">
            {item.price.toFixed(2)} DT
          </div>
        </div>

        {/* Quantity & Remove */}
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
              className="px-3 py-1 hover:bg-secondary transition-colors"
            >
              -
            </button>
            <span className="px-3 py-1 min-w-[40px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="px-3 py-1 hover:bg-secondary transition-colors"
            >
              +
            </button>
          </div>
          <button
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
