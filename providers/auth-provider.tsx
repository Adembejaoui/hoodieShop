"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/cart-context";
import { MiniCart } from "@/components/cart/mini-cart";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <MiniCart />
      </CartProvider>
    </SessionProvider>
  );
}
