"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { useCart } from "@/lib/cart-context";
import { useSession } from "next-auth/react";
import { Heart, Lock } from "lucide-react";

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  imageURL: string | null;
}

interface Variant {
  id: string;
  color: string;
  size: string;
  price: number;
  stockQty: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  printPosition: "BACK" | "FRONT" | "BOTH";
  frontImageURL: string | null;
  backImageURL: string | null;
  categoryId: string;
  category: Category;
  variants: Variant[];
}

interface FAQ {
  question: string;
  answer: string;
}

// FAQ data
const faqs: FAQ[] = [
  {
    question: "What is your shipping policy?",
    answer:
      "We offer free shipping on all orders over $75. Standard shipping takes 5-7 business days, while express shipping takes 2-3 business days. International shipping is available to most countries.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We accept returns within 30 days of purchase. Items must be unworn, unwashed, and in their original packaging. Custom orders are final sale.",
  },
  {
    question: "How do I find my size?",
    answer:
      "We recommend measuring your chest and comparing it to our size chart. Our hoodies run true to size. If you're between sizes, we recommend sizing up for a more comfortable fit.",
  },
  {
    question: "How should I care for my hoodie?",
    answer:
      "Machine wash cold with similar colors. Tumble dry on low heat or hang to dry. Do not bleach or iron directly on the print. For best results, wash inside out.",
  },
  {
    question: "Are the prints durable?",
    answer:
      "Yes! Our high-quality vinyl prints are designed to last through many washes without cracking or fading. We use premium materials and heat-transfer techniques for long-lasting results.",
  },
];

interface ProductPageProps {
  params: Promise<{
    categorySlug: string;
    productSlug: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState<"front" | "back">("front");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { toggleCart } = useCart();
  const { data: session } = useSession();

  // Toggle wishlist
  const toggleWishlist = async () => {
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
  };

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
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params]);

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
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <Link href="/shop" className="text-primary hover:underline">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  // Get unique colors and sizes
  const colors = [...new Set(product.variants.map((v: Variant) => v.color))];
  const sizes = [...new Set(product.variants.map((v: Variant) => v.size))];

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
              Shop
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
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-square bg-secondary rounded-xl overflow-hidden border max-w-md">
              {product.frontImageURL && (
                <img
                  src={product.frontImageURL}
                  alt={`${product.name} - Front`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    activeImage === "front" ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}

              {product.backImageURL && (
                <img
                  src={product.backImageURL}
                  alt={`${product.name} - Back`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    activeImage === "back" ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}

              {/* Print Position Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                  {product.printPosition === "BOTH"
                    ? "Front & Back"
                    : product.printPosition === "FRONT"
                    ? "Front"
                    : "Back"}
                </span>
              </div>

              {/* View Toggle */}
              {product.frontImageURL && product.backImageURL && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  <button
                    onClick={() => setActiveImage("front")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      activeImage === "front"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/80 backdrop-blur-sm text-foreground hover:bg-secondary"
                    }`}
                  >
                    Front
                  </button>
                  <button
                    onClick={() => setActiveImage("back")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      activeImage === "back"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/80 backdrop-blur-sm text-foreground hover:bg-secondary"
                    }`}
                  >
                    Back
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.frontImageURL && product.backImageURL && (
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveImage("front")}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === "front" ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={product.frontImageURL} alt="Front" className="w-full h-full object-cover" />
                </button>
                <button
                  onClick={() => setActiveImage("back")}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === "back" ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={product.backImageURL} alt="Back" className="w-full h-full object-cover" />
                </button>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Category */}
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="inline-block text-sm text-primary hover:underline"
            >
              {product.category.name}
            </Link>

            {/* Title */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold leading-tight">{product.name}</h1>
              <button
                onClick={toggleWishlist}
                className={`p-2 rounded-full transition-colors ${
                  !session?.user
                    ? "bg-secondary/50 text-muted-foreground/50 cursor-not-allowed"
                    : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                }`}
                title={!session?.user ? "Log in to add to wishlist" : "Add to wishlist"}
                disabled={!session?.user}
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                ${Number(product.basePrice).toFixed(2)}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed text-sm">
                {product.description}
              </p>
            )}

            {/* Add to Cart Button */}
            <AddToCartButton
              productId={product.id}
              name={product.name}
              slug={product.slug}
              categorySlug={product.category.slug}
              price={Number(product.basePrice)}
              image={product.frontImageURL}
              printPosition={product.printPosition}
              colors={colors}
              sizes={sizes}
              variants={product.variants}
            />

            {/* Features */}
            <div className="flex gap-4 pt-3 border-t">
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span className="text-muted-foreground">Free Shipping $75+</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-muted-foreground">30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-8 max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-card rounded-lg border overflow-hidden">
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-secondary/50 transition-colors"
              >
                <span className="text-sm font-medium">{faq.question}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${openFAQ === index ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFAQ === index && (
                <div className="px-4 pb-3 text-sm text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Related Products */}
      <section className="container mx-auto px-4 py-8 border-t">
        <h2 className="text-xl font-bold mb-4">You May Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Link
              key={i}
              href={`/product/related-${i}`}
              className="group bg-card rounded-lg border overflow-hidden"
            >
              <div className="aspect-square bg-secondary" />
              <div className="p-3">
                <p className="font-semibold group-hover:text-primary transition-colors text-sm">
                  Anime Hoodie {i}
                </p>
                <p className="text-sm font-bold mt-1">$59.99</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Log in to unlock exclusive benefits!</h3>
              <p className="text-muted-foreground mb-6">
                Create an account or log in to enjoy:
              </p>
              <ul className="text-sm text-left space-y-2 mb-6 bg-secondary/50 rounded-lg p-4">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Apply coupon codes for discounts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Save your favorite hoodies
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Track your order history
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Faster checkout experience
                </li>
              </ul>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 py-2.5 px-4 border rounded-lg hover:bg-secondary transition-colors"
                >
                  Continue Shopping
                </button>
                <Link
                  href="/login"
                  className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-center font-medium"
                >
                  Log In
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
                {' '}and get exclusive drops!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
