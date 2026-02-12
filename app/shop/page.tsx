"use client";

import { useState, useEffect, useCallback, useContext, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CartContext } from "@/lib/cart-context";
import { useSession } from "next-auth/react";
import { Search, ShoppingCart, Heart, Lock, Filter, X } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import * as Dialog from "@/components/ui/dialog";

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
  colors: Array<{
    id: string;
    color: string;
    frontImageURL: string | null;
    backImageURL: string | null;
  }>;
  sizeStocks: Array<{
    id: string;
    size: string;
    stockQty: number;
  }>;
  variants: Variant[];
  _useNewFormat?: boolean;
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ProductsResponse {
  products: Product[];
  pagination: PaginationData;
  colors?: string[];
  sizes?: string[];
}

interface ErrorResponse {
  error: string;
}

// All available filter options (loaded once and persisted)
const DEFAULT_COLORS = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Gray", "Navy", "Brown"];
const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedPrintPosition, setSelectedPrintPosition] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters Content Component (used in both desktop sidebar and mobile dialog)
  function FiltersContent() {
    return (
      <div className="sticky top-4 space-y-6">
        {/* Categories */}
        <div>
          <h3 className="font-semibold mb-3">Categories</h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                setSelectedCategory("");
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                !selectedCategory ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
              >
                {category.imageURL && (
                  <img
                    src={category.imageURL}
                    alt={category.name}
                    className="w-6 h-6 rounded object-cover"
                  />
                )}
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Print Position */}
        <div>
          <h3 className="font-semibold mb-3">Print Position</h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                setSelectedPrintPosition("");
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                !selectedPrintPosition ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setSelectedPrintPosition(selectedPrintPosition === "FRONT" ? "" : "FRONT");
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                selectedPrintPosition === "FRONT" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              Front
            </button>
            <button
              onClick={() => {
                setSelectedPrintPosition(selectedPrintPosition === "BACK" ? "" : "BACK");
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                selectedPrintPosition === "BACK" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              Back
            </button>
            <button
              onClick={() => {
                setSelectedPrintPosition(selectedPrintPosition === "BOTH" ? "" : "BOTH");
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                selectedPrintPosition === "BOTH" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              Both
            </button>
          </div>
        </div>

        {/* Colors */}
        {availableColors.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Colors</h3>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(selectedColor === color ? "" : color);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    selectedColor === color
                      ? "border-primary scale-110 ring-2 ring-primary/20"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sizes */}
        {DEFAULT_SIZES.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Sizes</h3>
            <div className="grid grid-cols-3 gap-2">
              {DEFAULT_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(selectedSize === size ? "" : size);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`px-2 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                    selectedSize === size
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-secondary"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="w-full py-2 px-4 border border-destructive text-destructive rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            Clear Filters ({activeFiltersCount})
          </button>
        )}
      </div>
    );
  }

  // Pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Active filters count
  const activeFiltersCount = [
    selectedCategory,
    selectedSize,
    selectedColor,
    selectedPrintPosition,
  ].filter(Boolean).length;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
          
          // Check for category query param and set selected category
          const categorySlug = searchParams.get("category");
          if (categorySlug) {
            const matchingCategory = data.categories.find((c: Category) => c.slug === categorySlug);
            if (matchingCategory) {
              setSelectedCategory(matchingCategory.id);
            }
          }
          setCategoriesLoaded(true);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategoriesLoaded(true);
      }
    };
    fetchCategories();
  }, [searchParams]);

  // Fetch all available filter options (called once)
  const fetchFilterOptions = useCallback(async () => {
    try {
      // Fetch all products to get all available options (use a high limit to get all colors/sizes)
      const res = await fetch("/api/products?limit=100");
      const data = await res.json();
      if (data.colors && data.colors.length > 0) {
        setAvailableColors(data.colors);
      } else {
        setAvailableColors(DEFAULT_COLORS);
      }
      if (data.sizes && data.sizes.length > 0) {
        setAvailableSizes(data.sizes);
      } else {
        setAvailableSizes(DEFAULT_SIZES);
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
      // Fallback to default options
      setAvailableColors(DEFAULT_COLORS);
      setAvailableSizes(DEFAULT_SIZES);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Fetch products with filters and pagination
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("categoryId", selectedCategory);
      if (selectedPrintPosition) params.set("printPosition", selectedPrintPosition);
      if (searchQuery) params.set("search", searchQuery);
      if (selectedSize) params.set("size", selectedSize);
      if (selectedColor) params.set("color", selectedColor);
      params.set("page", pagination.page.toString());
      params.set("sortBy", sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setError(`Failed to fetch products (${res.status})`);
        setLoading(false);
        return;
      }
      
      const data = await res.json();

      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("An error occurred while loading products");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedPrintPosition, searchQuery, selectedSize, selectedColor, pagination.page]);

  const previousPageRef = useRef<number | null>(null);
  const previousFiltersRef = useRef<string>('');

  // Create a stable filter signature
  const filterSignature = `${selectedCategory}-${selectedPrintPosition}-${searchQuery}-${selectedSize}-${selectedColor}-${sortBy}`;

  useEffect(() => {
    const isInitialLoad = previousPageRef.current === null;
    const filtersChanged = filterSignature !== previousFiltersRef.current;
    const pageChanged = pagination.page !== previousPageRef.current;
    
    // Don't fetch until categories are loaded
    if (!categoriesLoaded) return;
    
    if (isInitialLoad || filtersChanged || pageChanged) {
      fetchProducts();
      previousPageRef.current = pagination.page;
      previousFiltersRef.current = filterSignature;
    }
  }, [selectedCategory, selectedPrintPosition, searchQuery, selectedSize, selectedColor, sortBy, pagination.page, fetchProducts, filterSignature, categoriesLoaded]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedSize("");
    setSelectedColor("");
    setSelectedPrintPosition("");
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const goToPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with Search */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold">Shop</h1>
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-4 py-2 pl-10 border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar Filters - Desktop Only */}
          <div className="hidden lg:block w-64 shrink-0">
            <FiltersContent />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-md"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Filter Dialog */}
            <Dialog.Dialog open={showMobileFilters} onOpenChange={setShowMobileFilters}>
              <Dialog.DialogContent className="sm:max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">
                        {activeFiltersCount}
                      </span>
                    )}
                  </h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-secondary rounded-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Filter products by category, color, size, and print position
                </p>
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                  <FiltersContent />
                </div>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="mt-4 w-full py-2 px-4 bg-primary text-primary-foreground rounded-md"
                >
                  Done
                </button>
              </Dialog.DialogContent>
            </Dialog.Dialog>

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {products.length} of {pagination.totalCount} products
              </p>

              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-3 py-1.5 border rounded-md bg-background text-foreground text-sm"
              >
                <option value="createdAt">Newest</option>
                <option value="basePrice">Price: Low to High</option>
                <option value="basePrice">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 bg-white/5 rounded-2xl animate-pulse" />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => fetchProducts()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Products */}
            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* No Results */}
                {products.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No products found matching your criteria.</p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <Pagination
                    pagination={pagination}
                    onPageChange={goToPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Product Card Component with hover animation
function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { addItem } = useContext(CartContext)!;
  const { data: session } = useSession();

  // Get first color's images (supports both new and legacy formats)
  const getFirstColor = () => {
    if (product._useNewFormat && product.colors.length > 0) {
      return product.colors[0];
    }
    return product.variants[0] || null;
  };

  const firstColor = getFirstColor();
  const frontImage = firstColor?.frontImageURL || null;
  const backImage = firstColor?.backImageURL || null;

  // Determine primary and secondary images based on print position
  const getImageDisplay = () => {
    const printPos = product.printPosition;
    
    if (printPos === "FRONT") {
      return {
        primaryImage: frontImage,
        secondaryImage: null,
        hasHover: false,
      };
    } else if (printPos === "BACK") {
      return {
        primaryImage: backImage,
        secondaryImage: null,
        hasHover: false,
      };
    } else {
      return {
        primaryImage: frontImage,
        secondaryImage: backImage,
        hasHover: true,
      };
    }
  };

  const { primaryImage, secondaryImage, hasHover } = getImageDisplay();

  // Get colors list (supports both formats)
  const getColors = () => {
    if (product._useNewFormat) {
      return product.colors.map((c) => c.color);
    }
    return [...new Set(product.variants.map((v) => v.color))];
  };

  // Get sizes list (supports both formats)
  const getSizes = () => {
    if (product._useNewFormat) {
      return product.sizeStocks.filter((s) => s.stockQty > 0).map((s) => s.size);
    }
    return [...new Set(product.variants.map((v) => v.size))];
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add first available item to cart
    if (product._useNewFormat && product.colors.length > 0 && product.sizeStocks.length > 0) {
      const firstColor = product.colors[0];
      const firstSize = product.sizeStocks.find((s) => s.stockQty > 0);
      if (firstSize) {
        addItem({
          productId: product.id,
          name: product.name,
          slug: product.slug,
          categorySlug: product.category.slug,
          color: firstColor.color,
          size: firstSize.size,
          price: Number(product.basePrice),
          quantity: 1,
          image: frontImage,
          printPosition: product.printPosition,
        });
      }
    } else if (product.variants.length > 0) {
      const firstVariant = product.variants[0];
      addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        categorySlug: product.category.slug,
        color: firstVariant.color,
        size: firstVariant.size,
        price: Number(firstVariant.price),
        quantity: 1,
        image: firstVariant.frontImageURL || frontImage,
        printPosition: product.printPosition,
      });
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session?.user) {
      setShowLoginPrompt(true);
      return;
    }
    
    try {
      const res = await fetch("/api/dashboard/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.ok) {
        // Wishlist toggled successfully
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  return (
    <>
      <Link
        href={`/product/${product.category.slug}/${product.slug}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-card rounded-lg border overflow-hidden transition-shadow hover:shadow-lg">
          {/* Product Image */}
          <ProductImage
            frontImage={frontImage || '/placeholder.svg'}
            backImage={backImage || undefined}
            printType={product.printPosition.toLowerCase() as 'front' | 'back' | 'both'}
            productName={product.name}
            width={400}
            height={400}
            className="aspect-square"
          />

          {/* Print position badge */}
          <div className="absolute top-2 left-2">
            {product.printPosition === "BOTH" ? (
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                Front & Back
              </span>
            ) : product.printPosition === "FRONT" ? (
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                Front Print
              </span>
            ) : (
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                Back Print
              </span>
            )}
          </div>

          {/* Wishlist heart button */}
          <button
            onClick={toggleWishlist}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
              !session?.user
                ? "bg-white/50 text-muted-foreground/50 cursor-not-allowed opacity-100"
                : "bg-white/80 text-muted-foreground hover:bg-white hover:text-red-500 opacity-0 group-hover:opacity-100"
            }`}
            title={!session?.user ? "Log in to add to wishlist" : "Add to wishlist"}
            disabled={!session?.user}
          >
            <Heart className="w-4 h-4" />
          </button>

          {/* Product Info */}
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-1">{product.category.name}</p>
            <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
            <p className="text-lg font-bold mt-2">
              ${Number(product.basePrice).toFixed(2)}
            </p>

            {/* Available variants preview */}
            <div className="flex flex-wrap gap-1 mt-2">
              {getColors().slice(0, 4).map((color) => (
                <span
                  key={color}
                  className="inline-flex items-center px-2 py-0.5 bg-secondary rounded text-xs"
                >
                  {color}
                </span>
              ))}
              {getColors().length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{getColors().length - 4}
                </span>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/product/${product.category.slug}/${product.slug}`;
              }}
              className="w-full mt-4 py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </Link>

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
                {" "}and get exclusive drops!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Pagination Component
function Pagination({
  pagination,
  onPageChange,
}: {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}) {
  const { page, totalPages, hasNextPage, hasPrevPage } = pagination;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (page > 3) pages.push("...");
      
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (page < totalPages - 2) pages.push("...");
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage}
        className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary"
      >
        Previous
      </button>
      
      {getPageNumbers().map((num, idx) =>
        typeof num === "string" ? (
          <span key={idx} className="px-2">
            {num}
          </span>
        ) : (
          <button
            key={idx}
            onClick={() => onPageChange(num)}
            className={`w-10 h-10 rounded-md ${
              num === page
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary"
            }`}
          >
            {num}
          </button>
        )
      )}
      
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary"
      >
        Next
      </button>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background py-12 flex items-center justify-center"><p>Loading shop...</p></div>}>
      <ShopContent />
    </Suspense>
  );
}
