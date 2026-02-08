"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Variant {
  id: string;
  color: string;
  size: string;
  price: string | number;
  stockQty: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: string | number;
  printPosition: "BACK" | "FRONT" | "BOTH";
  frontImageURL: string | null;
  backImageURL: string | null;
  categoryId: string;
  category: Category;
  variants: Variant[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const categorySlug = params.categorySlug as string;
  const productSlug = params.productSlug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/products/${categorySlug}/${productSlug}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch product");
          return;
        }

        setProduct(data);

        // Set default selection
        if (data.variants.length > 0) {
          const firstVariant = data.variants[0];
          setSelectedColor(firstVariant.color);
          setSelectedSize(firstVariant.size);
          setSelectedVariant(firstVariant);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("An error occurred while loading the product");
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug && productSlug) {
      fetchProduct();
    }
  }, [categorySlug, productSlug]);

  // Update selected variant when color or size changes
  useEffect(() => {
    if (product && selectedColor && selectedSize) {
      const variant = product.variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      );
      setSelectedVariant(variant || null);
    }
  }, [selectedColor, selectedSize, product]);

  // Get unique colors and sizes
  const availableColors = product
    ? Array.from(new Set(product.variants.map((v) => v.color)))
    : [];

  const availableSizes = product
    ? Array.from(new Set(product.variants.map((v) => v.size)))
    : [];

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <p className="text-destructive">{error || "Product not found"}</p>
        </div>
      </div>
    );
  }

  const isOutOfStock = selectedVariant?.stockQty === 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            {product.frontImageURL ? (
              <img
                src={product.frontImageURL}
                alt={`${product.name} - Front`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No front image
              </div>
            )}
          </div>
          {product.backImageURL && (
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={product.backImageURL}
                alt={`${product.name} - Back`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">{product.category.name}</p>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          {/* Print position */}
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-secondary px-3 py-1 rounded-full text-sm">
              {product.printPosition === "FRONT" && "Front Print Only"}
              {product.printPosition === "BACK" && "Back Print Only"}
              {product.printPosition === "BOTH" && "Front & Back Print"}
            </span>
          </div>

          {/* Price */}
          <p className="text-2xl font-bold mb-4">
            ${typeof selectedVariant?.price === 'string' ? selectedVariant.price : selectedVariant?.price?.toFixed(2) || (typeof product.basePrice === 'string' ? product.basePrice : product.basePrice.toFixed(2))}
          </p>

          {/* Description */}
          {product.description && (
            <p className="text-muted-foreground mb-6">{product.description}</p>
          )}

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 border rounded-md transition-colors ${
                    selectedColor === color
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:border-gray-400"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Size</label>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-md transition-colors ${
                    selectedSize === size
                      ? "border-primary bg-primary/10 text-primary"
                      : "hover:border-gray-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Status */}
          {selectedVariant && (
            <div className="mb-6">
              {isOutOfStock ? (
                <p className="text-destructive font-medium">Out of Stock</p>
              ) : (
                <p className="text-green-600 font-medium">
                  In Stock ({selectedVariant.stockQty} available)
                </p>
              )}
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            disabled={!selectedVariant || isOutOfStock}
            className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>

          {/* Variant Details */}
          {selectedVariant && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Selected Variant</h3>
              <p>
                {selectedVariant.color} / {selectedVariant.size} / ${typeof selectedVariant.price === 'string' ? selectedVariant.price : selectedVariant.price.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
