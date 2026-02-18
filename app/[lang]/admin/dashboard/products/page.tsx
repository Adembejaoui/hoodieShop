"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
  availableSizes: string[];
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
  sizeStocks: [],
  availableSizes: [],
};

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default function ProductsPage() {
  const t = useTranslations("admin");
  
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
      // Use cache: 'no-store' to always get fresh data (important for Vercel deployments)
      const response = await fetch("/api/admin/products", { cache: 'no-store' });
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
      // Use cache: 'no-store' to always get fresh data (important for Vercel deployments)
      const res = await fetch("/api/categories", { cache: 'no-store' });
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
      sizeStocks: [],
      availableSizes: [],
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
        availableSizes: product.sizeStocks
          .filter((s) => s.stockQty > 0)
          .map((s) => s.size),
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
        availableSizes: [...new Set(product.variants.filter((v) => v.stockQty > 0).map((v) => v.size))],
      });
    }

    setError(null);
    setSuccess(null);
    setIsSidebarOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(t("confirmDeleteProduct"))) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productId));
        setSuccess(t("productDeleted"));
      } else {
        const data = await response.json();
        setError(data.error || t("deleteFailed"));
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setError(t("deleteFailed"));
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

  // Size management
  const toggleSize = (size: string) => {
    const newAvailableSizes = formData.availableSizes.includes(size)
      ? formData.availableSizes.filter((s) => s !== size)
      : [...formData.availableSizes, size];
    setFormData({ ...formData, availableSizes: newAvailableSizes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate that all colors have both images
    const missingImages: string[] = [];
    formData.colors.forEach((color, index) => {
      const colorName = color.color || `${t("color")} ${index + 1}`;
      if (!color.frontImageURL) {
        missingImages.push(`${colorName} - ${t("frontImage")}`);
      }
      if (!color.backImageURL) {
        missingImages.push(`${colorName} - ${t("backImage")}`);
      }
    });
    
    if (missingImages.length > 0) {
      setError(`${t("uploadRequiredImages")}:\n${missingImages.join('\n')}`);
      return;
    }
    
    // Validate that at least one size is selected
    if (formData.availableSizes.length === 0) {
      setError(t("selectAtLeastOneSize"));
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Generate sizeStocks from availableSizes
      const generatedSizeStocks = formData.availableSizes.map((size) => ({
        size,
        stockQty: 10, // Default stock for available sizes
      }));

      const payload = {
        product: {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          basePrice: formData.basePrice,
          categoryId: formData.categoryId,
          printPosition: formData.printPosition,
        },
        colors: formData.colors.filter((c) => c.color.trim() !== ""),
        sizeStocks: generatedSizeStocks,
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
          setError(data.error || t("createFailed"));
          return;
        }

        setSuccess(t("productCreated"));
        fetchProducts();
      } else {
        const res = await fetch(`/api/admin/products/${selectedProduct?.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || t("updateFailed"));
          return;
        }

        setSuccess(t("productUpdated"));
        fetchProducts();
      }

      setIsSidebarOpen(false);
    } catch (err) {
      setError(t("errorOccurred"));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("products")} ({products.length})</h2>
        <Button onClick={handleAddProduct}>
          <Plus className="w-4 h-4 mr-2" />
          {t("addProduct")}
        </Button>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("noProducts")}</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4">{t("product")}</th>
                <th className="text-left py-3 px-4">{t("category")}</th>
                <th className="text-left py-3 px-4">{t("colors")}</th>
                <th className="text-left py-3 px-4">{t("sizes")}</th>
                <th className="text-left py-3 px-4">{t("price")}</th>
                <th className="text-left py-3 px-4">{t("stock")}</th>
                <th className="text-left py-3 px-4">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const totalStock = getTotalStock(product);
                const colors = product._useNewFormat
                  ? product.colors
                  : [...new Set(product.variants.map((v) => v.color))];
                const sizes = product._useNewFormat
                  ? product.sizeStocks.filter((ss) => ss.stockQty > 0)
                  : product.variants.filter((v) => v.stockQty > 0);

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
                        {sizes.slice(0, 4).map((s, i) => {
                          const sizeName = typeof s === "string" ? s : s.size;
                          const sizeStock = product._useNewFormat
                            ? product.sizeStocks.find((ss) => ss.size === sizeName)
                            : product.variants.find((v) => v.size === sizeName);
                          const stockQty = sizeStock?.stockQty || 0;
                          const isAvailable = stockQty > 0;
                          return (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded text-xs ${
                                isAvailable
                                  ? "bg-green-500/20 text-green-500"
                                  : "bg-red-500/20 text-red-500 line-through"
                              }`}
                            >
                              {sizeName}
                            </span>
                          );
                        })}
                        {sizes.length > 4 && (
                          <span className="text-xs text-muted-foreground">
                            +{sizes.length - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {Number(product.basePrice).toFixed(2)} DT
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
                {sidebarMode === "add" ? t("addProduct") : t("editProduct")}
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
                <h4 className="font-medium">{t("basicInformation")}</h4>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("name")}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-black text-white"
                    placeholder={t("productNamePlaceholder")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("slug")}</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md bg-black text-white"
                    placeholder={t("productSlugPlaceholder")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("description")}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md bg-black text-white"
                    rows={3}
                    placeholder={t("descriptionPlaceholder")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("basePrice")} (DT)
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
                      {t("category")}
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md bg-black text-white"
                      required
                    >
                      <option value="">{t("selectCategory")}</option>
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))
                      ) : (
                        <option value="">{t("noCategoriesAvailable")}</option>
                      )}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("printPosition")}
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
                    <option value="BOTH">{t("bothFrontBack")}</option>
                    <option value="FRONT">{t("frontOnly")}</option>
                    <option value="BACK">{t("backOnly")}</option>
                  </select>
                </div>
              </div>

              {/* Colors Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{t("colorsWithImages")}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addColor}
                  >
                    <Plus className="w-4 h-4 mr-1" /> {t("addColor")}
                  </Button>
                </div>
              
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-md">
                  <p className="text-sm text-blue-400">
                    <strong>{t("required")}:</strong> {t("colorImageRequirement")}
                  </p>
                </div>

                <div className="space-y-4">
                  {formData.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex flex-wrap gap-3 p-4 border rounded-md bg-muted/50"
                    >
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium mb-1">
                          {t("colorName")}
                        </label>
                        <input
                          type="text"
                          value={color.color}
                          onChange={(e) =>
                            updateColor(index, "color", e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded-md bg-black text-white"
                          placeholder={t("colorNamePlaceholder")}
                          required
                        />
                      </div>

                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium mb-1">
                          {t("frontImage")} <span className="text-red-500">*</span>
                        </label>
                        <DelayedImageUpload
                          value={color.frontImageURL || ""}
                          onChange={(url) =>
                            updateColor(index, "frontImageURL", url)
                          }
                        />
                        {!color.frontImageURL && (
                          <p className="text-xs text-red-400 mt-1">{t("required")}</p>
                        )}
                      </div>

                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium mb-1">
                          {t("backImage")} <span className="text-red-500">*</span>
                        </label>
                        <DelayedImageUpload
                          value={color.backImageURL || ""}
                          onChange={(url) =>
                            updateColor(index, "backImageURL", url)
                          }
                        />
                        {!color.backImageURL && (
                          <p className="text-xs text-red-400 mt-1">{t("required")}</p>
                        )}
                      </div>

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
                <h4 className="font-medium">{t("availableSizes")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t("selectAvailableSizes")}
                </p>

                <div className="flex flex-wrap gap-3">
                  {SIZES.map((size) => {
                    const isAvailable = formData.availableSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`w-12 h-12 rounded-md border-2 font-medium transition-all ${
                          isAvailable
                            ? "border-green-500 bg-green-500/20 text-green-500"
                            : "border-gray-600 bg-gray-800 text-gray-400 opacity-50"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                <div className="text-sm text-muted-foreground">
                  {t("selected")}: {formData.availableSizes.length} {t("sizes")}
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
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("saving")}
                    </>
                  ) : sidebarMode === "add" ? (
                    t("createProduct")
                  ) : (
                    t("updateProduct")
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