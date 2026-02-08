"use client";

import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageURL: string | null;
  _count: {
    products: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    imageURL: "",
  });

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create category");
        return;
      }

      setSuccess("Category created successfully!");
      setFormData({ name: "", slug: "", description: "", imageURL: "" });
      fetchCategories();
    } catch (err) {
      setError("An error occurred while creating the category");
      console.error(err);
    }
  };

  // Generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Admin - Categories</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Create Category Form */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Add New Category</h2>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1 text-foreground">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                placeholder="e.g., One Piece"
                required
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium mb-1 text-foreground">
                Slug
              </label>
              <input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                placeholder="e.g., one-piece"
                required
              />
            </div>

            <div>
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

            <div>
              <label htmlFor="imageURL" className="block text-sm font-medium mb-1 text-foreground">
                Image URL
              </label>
              <input
                id="imageURL"
                type="url"
                value={formData.imageURL}
                onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {formData.imageURL && (
              <div>
                <p className="text-sm font-medium mb-1 text-foreground">Preview:</p>
                <img
                  src={formData.imageURL}
                  alt="Category preview"
                  className="w-24 h-24 object-cover rounded border"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/80"
            >
              Create Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Existing Categories</h2>

          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-muted-foreground">No categories yet.</p>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50"
                >
                  {category.imageURL && (
                    <img
                      src={category.imageURL}
                      alt={category.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">/{category.slug}</p>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {category.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {category._count.products} products
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
