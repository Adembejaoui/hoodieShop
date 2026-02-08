"use client";

import { useState, useEffect, useCallback, useContext } from "react";
import Link from "next/link";
import { CartContext } from "@/lib/cart-context";
import { useSession } from "next-auth/react";
import { Search, ShoppingCart, Heart, Lock } from "lucide-react";

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
const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedPrintPosition, setSelectedPrintPosition] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");

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
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch all available filter options (called once)
  const fetchFilterOptions = useCallback(async () => {
    try {
      // Fetch without filters to get all available options
      const res = await fetch("/api/products?limit=1");
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
      const data = await res.json();

      if (!res.ok) {
        setError((data as ErrorResponse).error || "Failed to fetch products");
        return;
      }

      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("An error occurred while loading products");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedPrintPosition, searchQuery, selectedSize, selectedColor, pagination.page, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
          {/* Left Sidebar Filters */}
          <div className="hidden lg:block w-64 shrink-0">
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

              {/* Colors - Always visible with all options */}
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

              {/* Sizes - Always visible with all options */}
              {availableSizes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Sizes</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSizes.map((size) => (
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
          </div>

          {/* Products Grid */}
          <div className="flex-1">
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

            {/* Filter Navbar */}
            <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-card rounded-lg border">
              <span className="text-sm font-medium">Quick Filters:</span>
              
              {/* Print Position Quick Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Print:</span>
                <button
                  onClick={() => {
                    setSelectedPrintPosition(selectedPrintPosition === "FRONT" ? "" : "FRONT");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedPrintPosition === "FRONT"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  Front
                </button>
                <button
                  onClick={() => {
                    setSelectedPrintPosition(selectedPrintPosition === "BACK" ? "" : "BACK");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedPrintPosition === "BACK"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    setSelectedPrintPosition(selectedPrintPosition === "BOTH" ? "" : "BOTH");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedPrintPosition === "BOTH"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  Both
                </button>
              </div>

              {/* Color Quick Filter */}
              {availableColors.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Color:</span>
                  <div className="flex gap-1">
                    {availableColors.slice(0, 5).map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(selectedColor === color ? "" : color);
                          setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                          selectedColor === color ? "border-primary scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                    {availableColors.length > 5 && (
                      <span className="text-xs text-muted-foreground self-center">
                        +{availableColors.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Size Quick Filter */}
              {availableSizes.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Size:</span>
                  <div className="flex gap-1">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(selectedSize === size ? "" : size);
                          setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        className={`w-7 h-7 flex items-center justify-center text-xs font-medium rounded transition-colors ${
                          selectedSize === size
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg border overflow-hidden animate-pulse">
                    <div className="aspect-square bg-muted" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-primary hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

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

  const currentImage = product.frontImageURL || product.backImageURL;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add first available variant to cart
    if (product.variants.length > 0) {
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
        image: product.frontImageURL,
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
    <Link
      href={`/product/${product.category.slug}/${product.slug}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-card rounded-lg border overflow-hidden transition-shadow hover:shadow-lg">
        {/* Product Image with Flip Animation */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {currentImage ? (
            <img
              src={currentImage}
              alt={product.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                product.printPosition === "BOTH" && product.backImageURL
                  ? isHovered ? "opacity-0" : "opacity-100"
                  : "opacity-100"
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          
          {/* Back Image (shown on hover for BOTH print) */}
          {product.printPosition === "BOTH" && product.backImageURL && (
            <img
              src={product.backImageURL}
              alt={`${product.name} - Back`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

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

          {/* Hover indicator */}
          {product.printPosition === "BOTH" && product.backImageURL && (
            <div className={`absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}>
              Hover to see back
            </div>
          )}

          {/* Quick add to cart on hover */}
          <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}>
            <button 
              onClick={handleQuickAdd}
              className="w-full bg-white text-black py-2 rounded-md font-medium hover:bg-gray-100"
            >
              Quick Add
            </button>
          </div>
        </div>

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
            {[...new Set(product.variants.map((v) => v.color))].slice(0, 4).map((color) => (
              <span
                key={color}
                className="inline-flex items-center px-2 py-0.5 bg-secondary rounded text-xs"
              >
                {color}
              </span>
            ))}
            {product.variants.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{product.variants.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

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
    </Link>
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
