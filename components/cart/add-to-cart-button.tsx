"use client";

import { useCart, CartItem } from "@/lib/cart-context";
import { useState, useEffect } from "react";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  slug: string;
  categorySlug: string;
  price: number;
  image: string | null;
  printPosition: "BACK" | "FRONT" | "BOTH";
  colors: string[];
  sizes: string[];
  variants: Array<{ color: string; size: string; stockQty: number; frontImageURL?: string | null; backImageURL?: string | null }>;
  selectedColor?: string;
  selectedSize?: string;
  defaultSize?: string;
  className?: string;
}

export function AddToCartButton({
  productId,
  name,
  slug,
  categorySlug,
  price,
  image,
  printPosition,
  colors,
  sizes,
  variants,
  selectedColor: propSelectedColor,
  selectedSize: propSelectedSize,
  defaultSize,
  className = "",
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState(propSelectedColor || colors[0] || "");
  const [selectedSize, setSelectedSize] = useState(propSelectedSize || defaultSize || sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Update selectedColor when prop changes
  useEffect(() => {
    if (propSelectedColor) {
      setSelectedColor(propSelectedColor);
    }
  }, [propSelectedColor]);

  // Update selectedSize when prop changes
  useEffect(() => {
    if (propSelectedSize) {
      setSelectedSize(propSelectedSize);
    }
  }, [propSelectedSize]);

  // Check if selected combination is in stock
  const isInStock = variants.some(
    (v) => v.color === selectedColor && v.size === selectedSize && v.stockQty > 0
  );

  // Get stock quantity and images for selected combination
  const selectedVariant = variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );
  const maxQuantity = selectedVariant?.stockQty || 0;
  const variantImage = selectedVariant?.frontImageURL || image;

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize || !isInStock) return;

    setIsAdding(true);

    // Simulate adding
    await new Promise((resolve) => setTimeout(resolve, 500));

    addItem({
      productId,
      name,
      slug,
      categorySlug,
      color: selectedColor,
      size: selectedSize,
      price,
      quantity,
      image: variantImage,
      printPosition,
    });

    setIsAdding(false);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Color</label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const hasStock = variants.some(
                (v) => v.color === color && v.stockQty > 0
              );
              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  disabled={!hasStock}
                  className={`w-10 h-10 rounded-full border-2 transition-all relative ${
                    selectedColor === color
                      ? "border-primary scale-110"
                      : "border-transparent hover:scale-105"
                  } ${!hasStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={`${color}${!hasStock ? " (Out of Stock)" : ""}`}
                >
                  {selectedColor === color && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className={`w-5 h-5 ${
                          ["white", "#ffffff", "#fff"].includes(color.toLowerCase())
                            ? "text-black"
                            : "text-white"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Size</label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const hasStock = variants.some(
                (v) => v.color === selectedColor && v.size === size && v.stockQty > 0
              );
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  disabled={!hasStock}
                  className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                    selectedSize === size
                      ? "border-primary bg-primary text-primary-foreground"
                      : hasStock
                      ? "border-border hover:border-primary"
                      : "border-border opacity-50 cursor-not-allowed line-through"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Quantity</label>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 hover:bg-secondary transition-colors"
              disabled={quantity <= 1}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              className="px-3 py-2 hover:bg-secondary transition-colors"
              disabled={quantity >= maxQuantity || maxQuantity === 0}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          {selectedVariant && selectedVariant.stockQty > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedVariant.stockQty} available
            </span>
          )}
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={!isInStock || isAdding || !selectedColor || !selectedSize}
        className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
          isInStock && selectedColor && selectedSize
            ? showFeedback
              ? "bg-green-600 text-white"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
      >
        {isAdding ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Adding...
          </>
        ) : showFeedback ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Added to Cart!
          </>
        ) : !isInStock ? (
          "Out of Stock"
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Add to Cart
          </>
        )}
      </button>
    </div>
  );
}

// Simple Add to Cart Button for Product Cards
interface SimpleAddToCartProps {
  productId: string;
  name: string;
  slug: string;
  categorySlug: string;
  price: number;
  image: string | null;
  printPosition: "BACK" | "FRONT" | "BOTH";
  colors: string[];
  sizes: string[];
  variants: Array<{ color: string; size: string; stockQty: number }>;
}

export function SimpleAddToCart({
  productId,
  name,
  slug,
  categorySlug,
  price,
  image,
  printPosition,
  colors,
  sizes,
  variants,
}: SimpleAddToCartProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Find first available variant
    const availableVariant = variants.find((v) => v.stockQty > 0);
    if (!availableVariant) return;

    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    addItem({
      productId,
      name,
      slug,
      categorySlug,
      color: availableVariant.color,
      size: availableVariant.size,
      price,
      quantity: 1,
      image,
      printPosition,
    });

    setIsAdding(false);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || !variants.some((v) => v.stockQty > 0)}
      className={`p-2 rounded-lg transition-all ${
        showFeedback
          ? "bg-green-600 text-white"
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      }`}
      title="Add to Cart"
    >
      {isAdding ? (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : showFeedback ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      )}
    </button>
  );
}
