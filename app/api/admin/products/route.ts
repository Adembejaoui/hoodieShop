import { NextResponse } from "next/server";
import prisma, { withRetry } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// Admin routes should never be cached - always return fresh data
export const dynamic = 'force-dynamic';

export async function GET() {
  // Verify admin from session (middleware already validates)
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden", message: "Admin access required" },
      { status: 403 }
    );
  }
  
  try {
    // Fetch products with related data
    const includeOptions = {
      include: {
        category: true,
        colors: true,
        sizeStocks: true,
        variants: {
          select: {
            id: true,
            color: true,
            size: true,
            stockQty: true,
            price: true,
          },
        },
      },
    } as const;

    const products = await withRetry(() => prisma.product.findMany({
      ...includeOptions,
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
    })) as Prisma.ProductGetPayload<typeof includeOptions>[];

    // Transform products
    const productsWithFormat = products.map((product: Prisma.ProductGetPayload<typeof includeOptions>) => ({
      ...product,
      basePrice: Number(product.basePrice),
      _useNewFormat: product.colors.length > 0 && product.sizeStocks.length > 0,
    }));

    // No caching for admin routes - always return fresh data
    return NextResponse.json({ products: productsWithFormat });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
