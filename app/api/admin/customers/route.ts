import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      include: {
        orders: {
          select: {
            id: true,
            totalPrice: true,
            placedAt: true,
          },
          orderBy: {
            placedAt: "desc",
          },
          take: 10,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit results for performance
    });

    return NextResponse.json({ customers }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
