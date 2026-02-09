import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/admin/categories/[id] - Update a category
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, imageURL } = body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug exists (excluding current category)
    const existingCategory = await prisma.category.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    const finalSlug = existingCategory ? `${slug}-${Date.now()}` : slug;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        imageURL,
        slug: finalSlug,
      },
    });

    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] - Delete a category
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category has products
    const categoryWithProducts = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (categoryWithProducts && categoryWithProducts._count.products > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with existing products. Remove products first." },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
