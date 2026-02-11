"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, Loader2 } from "lucide-react";

interface SearchResult {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    categorySlug: string;
    price: number;
    image: string | null;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export function AutocompleteInput() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(data.results);
          setIsOpen(true);
        } catch (error) {
          console.error("Search error:", error);
          setResults({ products: [], categories: [] });
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setResults(null);
      setIsOpen(false);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearSearch = () => {
    setQuery("");
    setResults(null);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full md:w-80">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
        <input
          type="text"
          placeholder="Search products, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
        {loading && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 animate-spin" />
        )}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-white/50 hover:text-white" />
          </button>
        )}
      </div>

      {isOpen && results && (results.products.length > 0 || results.categories.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-black border border-white/20 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {/* Categories */}
          {results.categories.length > 0 && (
            <div className="p-2 border-b border-white/10">
              <p className="text-xs text-purple-400 px-2 py-1 font-medium uppercase tracking-wide">Categories</p>
              {results.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop/${category.slug}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-2 px-2 py-2 hover:bg-white/10 rounded transition-colors"
                >
                  <span className="text-white">{category.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Products */}
          {results.products.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-purple-400 px-2 py-1 font-medium uppercase tracking-wide">Products</p>
              {results.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.categorySlug}/${product.slug}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 px-2 py-2 hover:bg-white/10 rounded transition-colors"
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{product.name}</p>
                    <p className="text-sm text-purple-400">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
