"use client";

import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Variant {
  color: string;
  size: string;
  price: number;
  stockQty: number;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  printPosition: "BACK" | "FRONT" | "BOTH";
  categoryId: string;
  frontImageURL: string;
  backImageURL: string;
  variants: Variant[];
}

const initialVariant: Variant = {
  color: "",
  size: "",
  price: 0,
  stockQty: 0,
};

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    basePrice: 0,
    printPosition: "BOTH",
    categoryId: "",
    frontImageURL: "",
    backImageURL: "",
    variants: [{ ...initialVariant }],
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) {
            setFormData((prev) => ({ ...prev, categoryId: data[0].id }));
          }
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    });
  };

  // Add a new variant
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { ...initialVariant }],
    });
  };

  // Remove a variant
  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      const newVariants = formData.variants.filter((_, i) => i !== index);
      setFormData({ ...formData, variants: newVariants });
    }
  };

  // Update a variant
  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: {
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            basePrice: formData.basePrice,
            printPosition: formData.printPosition,
            frontImageURL: formData.frontImageURL || null,
            backImageURL: formData.backImageURL || null,
            categoryId: formData.categoryId,
          },
          variants: formData.variants,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create product");
        return;
      }

      setSuccess("Product created successfully!");
      setFormData({
        name: "",
        slug: "",
        description: "",
        basePrice: 0,
        printPosition: "BOTH",
        categoryId: categories[0]?.id || "",
        frontImageURL: "",
        backImageURL: "",
        variants: [{ ...initialVariant }],
      });
    } catch (err) {
      setError("An error occurred while creating the product");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Admin - Products</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 text-green-500 p-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Basic Information</h2>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1 text-foreground">
                Product Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                placeholder="e.g., Monkey D. Luffy Hoodie"
                required
              />
            </div>

            <div className="mt-4">
              <label htmlFor="slug" className="block text-sm font-medium mb-1 text-foreground">
                Slug
              </label>
              <input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                placeholder="e.g., monkey-d-luffy-hoodie"
                required
              />
            </div>

            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-medium mb-1 text-foreground">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                rows={3}
                placeholder="Optional description"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="basePrice" className="block text-sm font-medium mb-1 text-foreground">
                Base Price ($)
              </label>
              <input
                id="basePrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                placeholder="0.00"
                required
              />
            </div>

            <div className="mt-4">
              <label htmlFor="category" className="block text-sm font-medium mb-1 text-foreground">
                Category
              </label>
              <select
                id="category"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label htmlFor="printPosition" className="block text-sm font-medium mb-1 text-foreground">
                Print Position
              </label>
              <select
                id="printPosition"
                value={formData.printPosition}
                onChange={(e) => setFormData({ ...formData, printPosition: e.target.value as "BACK" | "FRONT" | "BOTH" })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              >
                <option value="BOTH">Both (Front & Back)</option>
                <option value="FRONT">Front Only</option>
                <option value="BACK">Back Only</option>
              </select>
            </div>
          </div>

          {/* Images */}
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Images</h2>

            <div>
              <label htmlFor="frontImageURL" className="block text-sm font-medium mb-1 text-foreground">
                Front Image URL
              </label>
              <input
                id="frontImageURL"
                type="url"
                value={formData.frontImageURL}
                onChange={(e) => setFormData({ ...formData, frontImageURL: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                placeholder="https://example.com/front.jpg"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="backImageURL" className="block text-sm font-medium mb-1 text-foreground">
                Back Image URL
              </label>
              <input
                id="backImageURL"
                type="url"
                value={formData.backImageURL}
                onChange={(e) => setFormData({ ...formData, backImageURL: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                placeholder="https://example.com/back.jpg"
              />
            </div>

            {formData.frontImageURL && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-1 text-foreground">Front Preview:</p>
                <img
                  src={formData.frontImageURL}
                  alt="Front preview"
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Variants */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Variants</h2>
            <button
              type="button"
              onClick={addVariant}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              Add Variant
            </button>
          </div>

          <div className="space-y-4">
            {formData.variants.map((variant, index) => (
              <div key={index} className="flex flex-wrap gap-4 p-4 border rounded-md bg-muted/50">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-sm font-medium mb-1 text-foreground">Color</label>
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(e) => updateVariant(index, "color", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                    placeholder="e.g., Black"
                    required
                  />
                </div>
                <div className="flex-1 min-w-[80px]">
                  <label className="block text-sm font-medium mb-1 text-foreground">Size</label>
                  <select
                    value={variant.size}
                    onChange={(e) => updateVariant(index, "size", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                    required
                  >
                    <option value="">Select</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[100px]">
                  <label className="block text-sm font-medium mb-1 text-foreground">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, "price", parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="flex-1 min-w-[100px]">
                  <label className="block text-sm font-medium mb-1 text-foreground">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={variant.stockQty}
                    onChange={(e) => updateVariant(index, "stockQty", parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                    placeholder="0"
                    required
                  />
                </div>
                {formData.variants.length > 1 && (
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-md"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
