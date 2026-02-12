"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ChevronRight, Trash2 } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import type { WishlistItem } from "../../types";

interface WishlistTabProps {
  wishlist: WishlistItem[];
  onRemoveFromWishlist: (id: string) => void;
}

export function WishlistTab({ wishlist, onRemoveFromWishlist }: WishlistTabProps) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  if (wishlist.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-8 text-center">
        <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">Your wishlist is empty</h3>
        <p className="text-sm text-muted-foreground mb-4">Save items you love to your wishlist</p>
        <Link href="/shop" className="inline-flex items-center gap-2 text-primary hover:underline">
          Browse Products <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">My Wishlist</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.map((item) => (
          <div key={item.id} className="relative group">
            <ProductCard
              product={{
                id: item.product.id,
                name: item.product.name,
                slug: item.product.slug,
                description: item.product.description,
                basePrice: item.product.basePrice,
                printPosition: item.product.printPosition,
                category: item.product.category,
                colors: item.product.colors,
                sizeStocks: item.product.sizeStocks,
                variants: item.product.variants,
                totalStock: item.product.totalStock,
                _useNewFormat: item.product._useNewFormat,
              }}
              showLoginPrompt={showLoginPrompt}
              setShowLoginPrompt={setShowLoginPrompt}
            />
            <button
              onClick={() => onRemoveFromWishlist(item.id)}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              title="Remove from wishlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
