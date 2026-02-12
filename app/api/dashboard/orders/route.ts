import { NextRequest, NextResponse } from "next/server";
import prisma, { withRetry } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = { userId: session.user.id };
    
    if (status && status !== "all") {
      where.status = status;
    }

    const [orders, totalCount] = await Promise.all([
      withRetry(() => prisma.order.findMany({
        where,
        include: {
          items: true,
          coupon: true,
        },
        orderBy: {
          placedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      })) as Promise<any[]>,
      withRetry(() => prisma.order.count({ where })) as Promise<number>,
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Transform orders to include all necessary fields
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      totalPrice: order.totalPrice,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      discountAmount: order.discountAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      placedAt: order.placedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      shippingName: order.shippingName,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingPostalCode: order.shippingPostalCode,
      shippingCountry: order.shippingCountry,
      email: order.email,
      phone: order.phone,
      couponCode: order.couponCode,
      items: order.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        color: item.color,
        size: item.size,
        printPosition: item.printPosition,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    }));

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
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
