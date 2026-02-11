import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json();

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({}, { status: 200 });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        price: true,
        name: true,
        slug: true,
      },
    });

    // Return as a map for easy lookup
    const priceMap: Record<string, { price: number; name: string; slug: string }> = {};
    products.forEach((product: { id: string; price: any; name: string; slug: string }) => {
      priceMap[product.id] = {
        price: Number(product.price),
        name: product.name,
        slug: product.slug,
      };
    });

    return NextResponse.json({ prices: priceMap });
  } catch (error) {
    console.error("Error fetching product prices:", error);
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}
