import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const revalidate = 60;

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
    const products = await prisma.product.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
    });

    // Transform products
    const productsWithFormat = products.map((product) => ({
      ...product,
      basePrice: Number(product.basePrice),
      _useNewFormat: product.colors.length > 0 && product.sizeStocks.length > 0,
    }));

    return NextResponse.json(
      { products: productsWithFormat },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
