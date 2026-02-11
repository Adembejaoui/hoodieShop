import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  // Verify admin from session (middleware already validated)
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden", message: "Admin access required" },
      { status: 403 }
    );
  }
  
  try {
    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
      }),
      prisma.order.count({
        where: { status: "PENDING" },
      }),
      prisma.user.count({
        where: { role: "CUSTOMER" },
      }),
      prisma.product.count(),
      prisma.variant.findMany({
        where: { stockQty: { lt: 20 } },
        select: { id: true },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.totalPrice) || 0,
        pendingOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts: lowStockProducts.length,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
