import { NextRequest, NextResponse } from "next/server";
import prisma, { withRetry } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "100");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { shippingName: { contains: search, mode: "insensitive" } },
      ];
    }

    const includeOptions = {
      include: {
        items: true,
      },
      orderBy: {
        placedAt: "desc" as const,
      },
      take: limit,
    };

    const orders = await withRetry(() => prisma.order.findMany({
      where,
      ...includeOptions,
    })) as Prisma.OrderGetPayload<typeof includeOptions>[];

    // Transform orders to include customerName and total
    const transformedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.shippingName || order.email || "Guest",
      email: order.email,
      total: Number(order.totalPrice),
      status: order.status,
      createdAt: order.placedAt.toISOString(),
      items: order.items,
    }));

    return NextResponse.json({ orders: transformedOrders }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15',
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
