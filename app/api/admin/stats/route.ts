import { NextResponse } from "next/server";
import prisma, { withRetry } from "@/lib/prisma";
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
      withRetry(() => prisma.order.count()) as Promise<number>,
      withRetry(() => prisma.order.aggregate({
        _sum: { totalPrice: true },
      })) as Promise<{ _sum: { totalPrice: bigint | null } }>,
      withRetry(() => prisma.order.count({
        where: { status: "PENDING" },
      })) as Promise<number>,
      withRetry(() => prisma.user.count({
        where: { role: "CUSTOMER" },
      })) as Promise<number>,
      withRetry(() => prisma.product.count()) as Promise<number>,
      withRetry(() => prisma.variant.findMany({
        where: { stockQty: { lt: 20 } },
        select: { id: true },
      })) as Promise<{ id: string }[]>,
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
