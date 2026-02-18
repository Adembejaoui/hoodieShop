"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useCart } from "@/lib/cart-context";
import { useSession } from "next-auth/react";
import { Heart, Lock, ChevronDown, ChevronUp, ShoppingBag, Sparkles, Shield, Zap, Star } from "lucide-react";

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  imageURL: string | null;
}

interface ProductColor {
  id: string;
  color: string;
  frontImageURL: string | null;
  backImageURL: string | null;
}

interface ProductSizeStock {
  id: string;
  size: string;
  stockQty: number;
}

interface Variant {
  id: string;
  color: string;
  size: string;
  price: number;
  stockQty: number;
  frontImageURL: string | null;
  backImageURL: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  printPosition: "BACK" | "FRONT" | "BOTH";
  categoryId: string;
  category: Category;
  colors: ProductColor[];
  sizeStocks: ProductSizeStock[];
  variants: Variant[];
  _useNewFormat: boolean;
}

interface ProductPageProps {
  params: Promise<{
    categorySlug: string;
    productSlug: string;
  }>;
}

// Size ordering helper
const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const sortSizes = (sizes: string[]) =>
  sizes.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));

export default function ProductPage({ params }: ProductPageProps) {
  const t = useTranslations("product");
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState<"front" | "back">("front");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { addItem, toggleCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { categorySlug, productSlug } = await params;
        const res = await fetch(`/api/products/${categorySlug}/${productSlug}`);
        if (!res.ok) {
          notFound();
        }
        const data = await res.json();
        setProduct(data);

        // Set default color and size
        if (data._useNewFormat) {
          if (data.colors.length > 0) {
            setSelectedColor(data.colors[0].color);
          }
          if (data.sizeStocks.length > 0) {
            setSelectedSize(data.sizeStocks[0].size);
          }
        } else {
          if (data.variants && data.variants.length > 0) {
            const firstVariant = data.variants[0];
            setSelectedColor(firstVariant.color);
            setSelectedSize(firstVariant.size);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params]);

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const res = await fetch("/api/products?limit=5");
        if (res.ok) {
          const data = await res.json();
          const filtered = data.products
            ?.filter((p: Product) => p.id !== product?.id)
            ?.slice(0, 5) || [];
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error("Error fetching related products:", err);
      }
    };

    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  // Calculate color data from new format
  const colorDataNew = useMemo(() => {
    if (!product || !product._useNewFormat) return [];
    return product.colors.map((c) => ({
      color: c.color,
      image: c.frontImageURL,
    }));
  }, [product]);

  // Calculate size stocks from new format
  const sizeDataNew = useMemo(() => {
    if (!product || !product._useNewFormat) return [];
    return product.sizeStocks.map((s) => ({
      size: s.size,
      stockQty: s.stockQty,
    }));
  }, [product]);

  // Build color/size data from legacy variants format
  const colorDataLegacy = useMemo(() => {
    if (!product || product._useNewFormat) return [];

    const colorMap = new Map<string, { image: string | null; sizes: string[] }>();

    product.variants.forEach((variant) => {
      if (!colorMap.has(variant.color)) {
        colorMap.set(variant.color, {
          image: variant.frontImageURL,
          sizes: [],
        });
      }
      const existing = colorMap.get(variant.color)!;
      if (!existing.sizes.includes(variant.size)) {
        existing.sizes.push(variant.size);
      }
    });

    return Array.from(colorMap.entries())
      .map(([color, data]) => ({
        color,
        image: data.image,
        sizes: sortSizes(data.sizes),
      }))
      .sort((a, b) => a.color.localeCompare(b.color));
  }, [product]);

  // Use new format if available, otherwise fall back to legacy
  const colorData = product?._useNewFormat ? colorDataNew : colorDataLegacy;
  const sizeData = product?._useNewFormat ? sizeDataNew : [];

  // Get sizes available for selected color (legacy format only)
  const availableSizesForColor = useMemo(() => {
    if (product?._useNewFormat) {
      return sizeData.map((s) => s.size);
    }
    const legacyColor = colorDataLegacy.find((c) => c.color === selectedColor);
    return (legacyColor?.sizes || []) as string[];
  }, [product, colorDataLegacy, sizeData, selectedColor]);

  // Auto-select first available size when color changes
  useEffect(() => {
    if (availableSizesForColor.length > 0 && !availableSizesForColor.includes(selectedSize)) {
      setSelectedSize(availableSizesForColor[0]);
    }
  }, [availableSizesForColor, selectedSize]);

  // Get stock for selected size
  const currentStock = useMemo(() => {
    if (!product) return 0;
    if (product._useNewFormat) {
      const sizeStock = sizeData.find((s) => s.size === selectedSize);
      return sizeStock?.stockQty || 0;
    } else {
      const variant = product.variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      );
      return variant?.stockQty || 0;
    }
  }, [product, selectedColor, selectedSize, sizeData]);

  const isInStock = currentStock > 0;

  // Get images for selected color
  const variantFrontImage = useMemo(() => {
    if (!product) return null;
    if (product._useNewFormat) {
      const color = product.colors.find((c) => c.color === selectedColor);
      return color?.frontImageURL || null;
    } else {
      const colorVariant = product.variants.find(
        (v) => v.color === selectedColor
      );
      return colorVariant?.frontImageURL || null;
    }
  }, [product, selectedColor]);

  const variantBackImage = useMemo(() => {
    if (!product) return null;
    if (product._useNewFormat) {
      const color = product.colors.find((c) => c.color === selectedColor);
      return color?.backImageURL || null;
    } else {
      const colorVariant = product.variants.find(
        (v) => v.color === selectedColor
      );
      return colorVariant?.backImageURL || null;
    }
  }, [product, selectedColor]);

  // Handle add to cart
  const handleAddToCart = useCallback(() => {
    if (!isInStock || !product) return;

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      categorySlug: product.category.slug,
      color: selectedColor,
      size: selectedSize,
      price: Number(product.basePrice),
      quantity: 1,
      image: variantFrontImage,
      printPosition: product.printPosition,
    });
    toggleCart();
  }, [product, isInStock, selectedColor, selectedSize, variantFrontImage, addItem, toggleCart]);

  // Toggle wishlist
  const handleToggleWishlist = useCallback(async () => {
    if (!session?.user) {
      setShowLoginPrompt(true);
      return;
    }

    if (!product) return;

    try {
      const res = await fetch("/api/dashboard/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  }, [product, session]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted animate-pulse rounded-lg" />
            <div className="space-y-4">
              <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-5 bg-muted animate-pulse rounded w-1/4" />
              <div className="h-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t("notFound")}</h1>
          <Link href="/shop" className="text-primary hover:underline">
            {t("back")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Breadcrumb */}
      <div className="border-b bg-secondary/50">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("shop") || "Shop"}
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {product.category.name}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-secondary rounded-xl overflow-hidden border max-w-lg mx-auto lg:mx-0">
              {variantFrontImage && (
                <img
                  src={variantFrontImage}
                  alt={`${product.name} - Front - ${selectedColor}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    activeImage === "front" ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}

              {variantBackImage && (
                <img
                  src={variantBackImage}
                  alt={`${product.name} - Back - ${selectedColor}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    activeImage === "back" ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}

              {/* No image placeholder */}
              {!variantFrontImage && !variantBackImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-muted-foreground">No image available</span>
                </div>
              )}

              {/* Color Selection */}
              <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                <div className="flex gap-2 flex-wrap justify-end max-w-[150px]">
                  {colorData.map(({ color, image }) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setActiveImage("front");
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all relative ${
                        selectedColor === color
                          ? "border-primary scale-110 ring-2 ring-primary/20"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    >
                      {image && (
                        <img
                          src={image}
                          alt={color}
                          className="w-full h-full rounded-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Print Position Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium shadow">
                  {product.printPosition === "BOTH"
                    ? t("both")
                    : product.printPosition === "FRONT"
                    ? t("front")
                    : t("back")}
                </span>
              </div>

              {/* View Toggle */}
              {variantFrontImage && variantBackImage && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  <button
                    onClick={() => setActiveImage("front")}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shadow ${
                      activeImage === "front"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/90 backdrop-blur-sm text-foreground hover:bg-secondary"
                    }`}
                  >
                    {t("front")}
                  </button>
                  <button
                    onClick={() => setActiveImage("back")}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shadow ${
                      activeImage === "back"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/90 backdrop-blur-sm text-foreground hover:bg-secondary"
                    }`}
                  >
                    {t("back")}
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {variantFrontImage && variantBackImage && (
              <div className="flex gap-2 justify-center lg:justify-start">
                <button
                  onClick={() => setActiveImage("front")}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === "front" ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img
                    src={variantFrontImage}
                    alt="Front"
                    className="w-full h-full object-cover"
                  />
                </button>
                <button
                  onClick={() => setActiveImage("back")}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === "back" ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img
                    src={variantBackImage}
                    alt="Back"
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="inline-block text-sm text-primary hover:underline font-medium"
            >
              {product.category.name}
            </Link>

            {/* Title */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight">{product.name}</h1>
              <button
                onClick={handleToggleWishlist}
                className={`p-3 rounded-full transition-all ${
                  !session?.user
                    ? "bg-secondary/50 text-muted-foreground/50 cursor-not-allowed"
                    : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-red-500"
                }`}
                title={!session?.user ? "Log in to add to wishlist" : "Add to wishlist"}
                disabled={!session?.user}
              >
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-foreground">
                {Number(product.basePrice).toFixed(2)} DT
              </span>
              {currentStock > 0 && (
                <span className="text-sm text-green-600 font-medium">
                  {currentStock} {t("inStock").toLowerCase()}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed text-lg">
                {product.description}
              </p>
            )}

            {/* Color Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">{t("color")}</label>
                <span className="text-sm text-muted-foreground">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {colorData.map(({ color, image }) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setActiveImage("front");
                    }}
                    className={`w-12 h-12 rounded-full border-2 transition-all relative ${
                      selectedColor === color
                        ? "border-primary scale-110 ring-2 ring-primary/20"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  >
                    {image && (
                      <img
                        src={image}
                        alt={color}
                        className="w-full h-full rounded-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">{t("size")}</label>
                <button className="text-sm text-primary hover:underline flex items-center gap-1">
                  Size Guide
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {availableSizesForColor.map((size) => {
                  const hasStock = product._useNewFormat
                    ? (sizeData.find((s) => s.size === size)?.stockQty || 0) > 0
                    : product.variants.some(
                        (v) => v.color === selectedColor && v.size === size && v.stockQty > 0
                      );

                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!hasStock}
                      className={`py-3 px-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : hasStock
                          ? "border-border hover:border-primary hover:bg-secondary/50"
                          : "border-border opacity-50 cursor-not-allowed line-through bg-muted/30"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {!isInStock && (
                <p className="text-sm text-red-500">{t("outOfStock")}</p>
              )}
            </div>

            {/* Add to Cart & Quantity */}
            <div className="space-y-3">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">{t("quantity")}</label>
                <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Buttons - Vertical Stack */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    if (!isInStock || !product) return;
                    addItem({
                      productId: product.id,
                      name: product.name,
                      slug: product.slug,
                      categorySlug: product.category.slug,
                      color: selectedColor,
                      size: selectedSize,
                      price: Number(product.basePrice),
                      quantity,
                      image: variantFrontImage,
                      printPosition: product.printPosition,
                    });
                    router.push(`/checkout?quantity=${quantity}`);
                  }}
                  disabled={!isInStock}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                    isInStock
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {!isInStock ? t("outOfStock") : t("buyNow")}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                    isInStock
                      ? "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {!isInStock
                    ? t("outOfStock")
                    : `${t("addToCart")} - ${Number(product.basePrice).toFixed(2)} DT`}
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-6 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <span className="text-muted-foreground">{t("freeShipping")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className="text-muted-foreground">30-Day Returns</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-muted-foreground">{t("securePayment")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
         <section className="container mx-auto px-4 py-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-background to-primary/10 border border-primary/20">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          {/* Floating Stars */}
          <div className="absolute top-10 left-10 text-primary/20 animate-pulse">
            <Star className="w-6 h-6" />
          </div>
          <div className="absolute top-20 right-20 text-primary/15 animate-pulse delay-300">
            <Star className="w-4 h-4" />
          </div>
          <div className="absolute bottom-16 right-32 text-primary/10 animate-pulse delay-500">
            <Star className="w-5 h-5" />
          </div>

          <div className="relative z-10 p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">{t("quality.badge")}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("quality.title")}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{t("quality.subtitle")}</p>
            </div>

            {/* Quality Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Premium Fabric */}
              <div className="group relative bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{t("quality.fabric.title")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t("quality.fabric.description")}</p>
                </div>
              </div>

              {/* HD Print Technology */}
              <div className="group relative bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{t("quality.print.title")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t("quality.print.description")}</p>
                </div>
              </div>

              {/* Reinforced Stitching */}
              <div className="group relative bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{t("quality.stitching.title")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t("quality.stitching.description")}</p>
                </div>
              </div>

              {/* Perfect Fit */}
              <div className="group relative bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{t("quality.fit.title")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t("quality.fit.description")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-8 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">{t("reviews")}</h2>
        <div className="space-y-3">
          {["shipping", "returns","care", "durability"].map((faqKey, index) => (
            <div key={faqKey} className="bg-card rounded-lg border overflow-hidden">
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-secondary/50 transition-colors"
              >
                <span className="font-medium">{t(`faq.${faqKey}.question`)}</span>
                {openFAQ === index ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              {openFAQ === index && (
                <div className="px-5 pb-4 text-muted-foreground leading-relaxed">
                  {t(`faq.${faqKey}.answer`)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Premium Quality Section */}
   

      {/* Related Products */}
      <section className="container mx-auto px-4 py-8 border-t">
        <h2 className="text-2xl font-bold mb-6">{t("relatedProducts")}</h2>
        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {relatedProducts.map((relatedProduct) => {
              const productImage = relatedProduct._useNewFormat
                ? relatedProduct.colors[0]?.frontImageURL
                : relatedProduct.variants[0]?.frontImageURL;

              return (
                <Link
                  key={relatedProduct.id}
                  href={`/product/${relatedProduct.category.slug}/${relatedProduct.slug}`}
                  className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-square bg-secondary relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                      {relatedProduct.name}
                    </p>
                    <p className="text-sm font-bold mt-1">
                      {Number(relatedProduct.basePrice).toFixed(2)} DT
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No related products found
          </p>
        )}
      </section>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Log in to unlock exclusive benefits!</h3>
              <p className="text-muted-foreground mb-6">
                Create an account or log in to enjoy:
              </p>
              <ul className="text-sm text-left space-y-3 mb-6 bg-secondary/50 rounded-xl p-4">
                <li className="flex items-center gap-3">
                  <span className="text-primary font-bold">{"\u2713"}</span>
                  Apply coupon codes for discounts
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-primary font-bold">{"\u2713"}</span>
                  Save your favorite hoodies
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-primary font-bold">{"\u2713"}</span>
                  Track your order history
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-primary font-bold">{"\u2713"}</span>
                  Faster checkout experience
                </li>
              </ul>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 py-3 px-4 border rounded-xl hover:bg-secondary transition-colors font-medium"
                >
                  Continue Shopping
                </button>
                <Link
                  href="/auth"
                  className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-center font-medium"
                >
                  Log In
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Don't have an account?{" "}
                <Link href="/auth" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
                {" "}and get exclusive drops!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}