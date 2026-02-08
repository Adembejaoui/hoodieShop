import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
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
      take: 200, // Limit results for performance
    });

    return NextResponse.json({ products }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
