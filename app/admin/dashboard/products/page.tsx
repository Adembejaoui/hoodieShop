"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DelayedImageUpload } from "@/components/supabase/delayed-upload-button";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

// Types
interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  description: string | null;
  printPosition: string;
  category: { id: string; name: string };
  colors: ProductColor[];
  sizeStocks: ProductSizeStock[];
  variants: Variant[];
  _useNewFormat?: boolean;
}

interface ProductColor {
  id?: string;
  color: string;
  frontImageURL: string | null;
  backImageURL: string | null;
}

interface ProductSizeStock {
  id?: string;
  size: string;
  stockQty: number;
}

interface Variant {
  id?: string;
  color: string;
  size: string;
  stockQty: number;
  price: number;
  frontImageURL: string | null;
  backImageURL: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  printPosition: "BACK" | "FRONT" | "BOTH";
  categoryId: string;
  colors: ProductColor[];
  sizeStocks: ProductSizeStock[];
}

const initialColor: ProductColor = {
  color: "",
  frontImageURL: null,
  backImageURL: null,
};

const initialSizeStock: ProductSizeStock = {
  size: "",
  stockQty: 0,
};

const initialFormData: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  basePrice: 0,
  printPosition: "BOTH",
  categoryId: "",
  colors: [{ ...initialColor }],
  sizeStocks: [{ ...initialSizeStock }],
};

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [useNewFormat, setUseNewFormat] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const getTotalStock = (product: Product) => {
    if (product._useNewFormat) {
      return product.sizeStocks.reduce((sum, s) => sum + s.stockQty, 0);
    }
    return product.variants.reduce((sum, v) => sum + v.stockQty, 0);
  };

  const handleAddProduct = () => {
    setSidebarMode("add");
    setSelectedProduct(null);
    setUseNewFormat(true);
    setFormData({
      ...initialFormData,
      categoryId: categories[0]?.id || "",
      colors: [{ ...initialColor }],
      sizeStocks: SIZES.map((size) => ({ size, stockQty: 0 })),
    });
    setError(null);
    setSuccess(null);
    setIsSidebarOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSidebarMode("edit");
    setSelectedProduct(product);
    setUseNewFormat(product._useNewFormat || false);

    if (product._useNewFormat) {
      // New format
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        basePrice: Number(product.basePrice),
        printPosition: product.printPosition as "BACK" | "FRONT" | "BOTH",
        categoryId: product.category.id,
        colors: product.colors.map((c) => ({
          id: c.id,
          color: c.color,
          frontImageURL: c.frontImageURL,
          backImageURL: c.backImageURL,
        })),
        sizeStocks: product.sizeStocks.map((s) => ({
          id: s.id,
          size: s.size,
          stockQty: s.stockQty,
        })),
      });
    } else {
      // Legacy format - convert to new format
      const uniqueColors = [...new Set(product.variants.map((v) => v.color))];
      const colorStocks: Record<string, number> = {};
      product.variants.forEach((v) => {
        if (!colorStocks[v.color]) {
          colorStocks[v.color] = 0;
        }
        colorStocks[v.color] += v.stockQty;
      });

      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        basePrice: Number(product.basePrice),
        printPosition: product.printPosition as "BACK" | "FRONT" | "BOTH",
        categoryId: product.category.id,
        colors: uniqueColors.map((color) => {
          const variant = product.variants.find((v) => v.color === color);
          return {
            color,
            frontImageURL: variant?.frontImageURL || null,
            backImageURL: variant?.backImageURL || null,
          };
        }),
        sizeStocks: SIZES.map((size) => {
          const variant = product.variants.find((v) => v.size === size);
          return {
            size,
            stockQty: variant?.stockQty || 0,
          };
        }),
      });
    }

    setError(null);
    setSuccess(null);
    setIsSidebarOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productId));
        setSuccess("Product deleted successfully");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Failed to delete product");
    }
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    });
  };

  // Color management
  const addColor = () => {
    setFormData({
      ...formData,
      colors: [...formData.colors, { ...initialColor }],
    });
  };

  const removeColor = (index: number) => {
    if (formData.colors.length > 1) {
      const newColors = formData.colors.filter((_, i) => i !== index);
      setFormData({ ...formData, colors: newColors });
    }
  };

  const updateColor = (
    index: number,
    field: keyof ProductColor,
    value: string | null
  ) => {
    const newColors = [...formData.colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setFormData({ ...formData, colors: newColors });
  };

  // Size stock management
  const updateSizeStock = (size: string, stockQty: number) => {
    const newSizeStocks = formData.sizeStocks.map((s) =>
      s.size === size ? { ...s, stockQty } : s
    );
    setFormData({ ...formData, sizeStocks: newSizeStocks });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const payload = {
        product: {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          basePrice: formData.basePrice,
          printPosition: formData.printPosition,
          categoryId: formData.categoryId,
        },
        colors: formData.colors.filter((c) => c.color.trim() !== ""),
        sizeStocks: formData.sizeStocks.filter((s) => s.size !== ""),
        useNewFormat: true,
      };

      if (sidebarMode === "add") {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to create product");
          return;
        }

        setSuccess("Product created successfully!");
        fetchProducts();
      } else {
        const res = await fetch(`/api/admin/products/${selectedProduct?.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to update product");
          return;
        }

        setSuccess("Product updated successfully!");
        fetchProducts();
      }

      setIsSidebarOpen(false);
    } catch (err) {
      setError("An error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Products ({products.length})</h2>
        <Button onClick={handleAddProduct}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4">Product</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">Colors</th>
                <th className="text-left py-3 px-4">Sizes</th>
                <th className="text-left py-3 px-4">Price</th>
                <th className="text-left py-3 px-4">Stock</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const totalStock = getTotalStock(product);
                const colors = product._useNewFormat
                  ? product.colors
                  : [...new Set(product.variants.map((v) => v.color))];
                const sizes = product._useNewFormat
                  ? product.sizeStocks
                  : [...new Set(product.variants.map((v) => v.size))];

                return (
                  <tr key={product.id} className="border-b hover:bg-muted/25">
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {product.category.name}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {colors.slice(0, 3).map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-secondary rounded text-xs flex items-center gap-1"
                          >
                            <span
                              className="w-3 h-3 rounded-full border"
                              style={{
                                backgroundColor:
                                  typeof c === "string"
                                    ? c.toLowerCase()
                                    : c.color.toLowerCase(),
                              }}
                            />
                            {typeof c === "string" ? c : c.color}
                          </span>
                        ))}
                        {colors.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{colors.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {sizes.slice(0, 4).map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-secondary rounded text-xs"
                          >
                            {typeof s === "string" ? s : s.size}
                          </span>
                        ))}
                        {sizes.length > 4 && (
                          <span className="text-xs text-muted-foreground">
                            +{sizes.length - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      ${Number(product.basePrice).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          totalStock < 20 ? "text-red-500 font-medium" : ""
                        }
                      >
                        {totalStock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Sidebar */}
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-background shadow-lg z-50 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold">
                {sidebarMode === "add" ? "Add Product" : "Edit Product"}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 text-green-500 p-3 rounded">
                  {success}
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-medium">Basic Information</h4>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-black text-white"
                    placeholder="e.g., Monkey D. Luffy Hoodie"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md bg-black text-white"
                    placeholder="e.g., monkey-d-luffy-hoodie"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md bg-black text-white"
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Base Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.basePrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          basePrice: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md bg-black text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md bg-black text-white"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))
                      ) : (
                        <option value="">No categories available</option>
                      )}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Print Position
                  </label>
                  <select
                    value={formData.printPosition}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        printPosition: e.target.value as
                          | "BACK"
                          | "FRONT"
                          | "BOTH",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md bg-black text-white"
                  >
                    <option value="BOTH">Both (Front & Back)</option>
                    <option value="FRONT">Front Only</option>
                    <option value="BACK">Back Only</option>
                  </select>
                </div>
              </div>

              {/* Colors Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Colors (with Images)</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addColor}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Color
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex flex-wrap gap-3 p-4 border rounded-md bg-muted/50"
                    >
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium mb-1">
                          Color Name
                        </label>
                        <input
                          type="text"
                          value={color.color}
                          onChange={(e) =>
                            updateColor(index, "color", e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded-md bg-black text-white"
                          placeholder="Black, White, Navy..."
                          required
                        />
                      </div>

                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium mb-1">
                          Front Image
                        </label>
                        <DelayedImageUpload
                          value={color.frontImageURL || ""}
                          onChange={(url) =>
                            updateColor(index, "frontImageURL", url)
                          }
                        />
                      </div>

                      {/* Show Back Image only if printPosition is not FRONT */}
                      {formData.printPosition !== "FRONT" && (
                        <div className="flex-1 min-w-[120px]">
                          <label className="block text-xs font-medium mb-1">
                            Back Image
                          </label>
                          <DelayedImageUpload
                            value={color.backImageURL || ""}
                            onChange={(url) =>
                              updateColor(index, "backImageURL", url)
                            }
                          />
                        </div>
                      )}

                      <div className="w-full flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeColor(index)}
                          disabled={formData.colors.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Size Stock Section */}
              <div className="space-y-4">
                <h4 className="font-medium">Size Stock</h4>
                <p className="text-sm text-muted-foreground">
                  Set stock quantity for each size. All colors will have these
                  sizes available.
                </p>

                <div className="grid grid-cols-4 gap-3">
                  {SIZES.map((size) => {
                    const sizeStock = formData.sizeStocks.find(
                      (s) => s.size === size
                    );
                    return (
                      <div key={size} className="p-3 border rounded-md">
                        <label className="block text-sm font-medium mb-1">
                          {size}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={sizeStock?.stockQty || 0}
                          onChange={(e) =>
                            updateSizeStock(size, parseInt(e.target.value) || 0)
                          }
                          className="w-full px-3 py-2 border rounded-md bg-black text-white"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="text-sm text-muted-foreground">
                  Total stock:{" "}
                  {formData.sizeStocks.reduce((sum, s) => sum + s.stockQty, 0)}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : sidebarMode === "add" ? (
                    "Create Product"
                  ) : (
                    "Update Product"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
