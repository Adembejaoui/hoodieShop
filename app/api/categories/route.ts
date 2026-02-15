import { NextRequest, NextResponse } from "next/server";
import prisma, { withRetry } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET /api/categories - List all categories
export async function GET() {
  try {
    const categories = await withRetry(() => prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }));

    // No caching - always return fresh data
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, imageURL } = body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug exists
    const existingCategory = await withRetry(() => prisma.category.findUnique({
      where: { slug },
    }));

    const finalSlug = existingCategory ? `${slug}-${Date.now()}` : slug;

    const category = await withRetry(() => prisma.category.create({
      data: {
        name,
        description,
        imageURL,
        slug: finalSlug,
      },
    }));

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
