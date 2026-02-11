import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: { products: [], categories: [] } });
    }

    const productIncludeOptions = {
      include: {
        category: true,
        colors: { take: 1 },
      },
    } as const;

    // Search products
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      ...productIncludeOptions,
      take: limit,
    });

    // Search categories
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
    });

    return NextResponse.json({
      results: {
        products: products.map((p: Prisma.ProductGetPayload<typeof productIncludeOptions>) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category.name,
          categorySlug: p.category.slug,
          price: Number(p.basePrice),
          image: p.colors[0]?.frontImageURL,
        })),
        categories: categories.map((c: Prisma.CategoryGetPayload<{}>) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        })),
      },
    });
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json(
      { error: "Search failed", results: { products: [], categories: [] } },
      { status: 500 }
    );
  }
}
