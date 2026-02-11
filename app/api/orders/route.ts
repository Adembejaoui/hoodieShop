import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Types for the order request
interface OrderItemInput {
  productId: string;
  variantId: string;
  name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  printPosition: string;
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes: string;
}

interface OrderRequest {
  items: OrderItemInput[];
  shippingInfo: ShippingInfo;
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
}

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json();

    // Check if user is logged in
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // Check if user is blocked (if logged in)
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isBlocked: true, email: true },
      });
      
      if (user?.isBlocked) {
        return NextResponse.json(
          { error: "Your account has been blocked. You cannot place orders." },
          { status: 403 }
        );
      }
    }

    // Validate required fields
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "No items in order" },
        { status: 400 }
      );
    }

    if (!body.shippingInfo) {
      return NextResponse.json(
        { error: "Shipping information is required" },
        { status: 400 }
      );
    }

    // Validate shipping info
    const { firstName, lastName, email, phone, address, city, postalCode, country } = body.shippingInfo;
    
    if (!firstName || !lastName || !email || !phone || !address || !city || !postalCode || !country) {
      return NextResponse.json(
        { error: "All required shipping fields must be provided" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Calculate totals
    const subtotal = Number(body.subtotal);
    const discountAmount = Number(body.discountAmount || 0);
    const shippingCost = 0; // Free shipping for now
    const totalPrice = subtotal - discountAmount + shippingCost;

    // Validate coupon if provided
    let couponId: string | undefined;
    let finalDiscountAmount = discountAmount;

    if (body.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: body.couponCode.toUpperCase(),
          active: true,
        },
      });

      if (coupon) {
        // Check expiration
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
          return NextResponse.json(
            { error: "Coupon has expired" },
            { status: 400 }
          );
        }

        // Check minimum order amount
        if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
          return NextResponse.json(
            { error: `Minimum order amount of ${coupon.minOrderAmount} required for this coupon` },
            { status: 400 }
          );
        }

        // Check max uses
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          return NextResponse.json(
            { error: "Coupon usage limit reached" },
            { status: 400 }
          );
        }

        couponId = coupon.id;

        // Calculate discount
        if (coupon.type === "PERCENTAGE") {
          finalDiscountAmount = (subtotal * Number(coupon.value)) / 100;
        } else {
          finalDiscountAmount = Number(coupon.value);
        }
      }
    }

    // Create order with transaction
    const order = await prisma.$transaction(async (tx: any) => {
      // Create order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id || null,
          email,
          phone: phone || null,
          shippingName: `${firstName} ${lastName}`,
          shippingAddress: address,
          shippingCity: city,
          shippingPostalCode: postalCode,
          shippingCountry: country,
          subtotal,
          shippingCost,
          discountAmount: finalDiscountAmount,
          totalPrice: subtotal - finalDiscountAmount + shippingCost,
          paymentMethod: "pay_on_delivery",
          paymentStatus: "pending",
          status: "PENDING",
          notes: body.shippingInfo.notes || null,
          couponId,
          couponCode: body.couponCode?.toUpperCase(),
          items: {
            create: body.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId || item.productId,
              name: item.name,
              color: item.color,
              size: item.size,
              printPosition: item.printPosition,
              unitPrice: item.price,
              quantity: item.quantity,
              totalPrice: item.price * item.quantity,
            })),
          },
        },
      });

      // Update stock for each item
      for (const item of body.items) {
        const variant = await tx.variant.findFirst({
          where: {
            productId: item.productId,
            color: item.color,
            size: item.size,
          },
        });

        if (variant) {
          await tx.variant.update({
            where: { id: variant.id },
            data: {
              stockQty: variant.stockQty - item.quantity,
            },
          });
        }
      }

      // Update coupon usage count
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: {
            usedCount: { increment: 1 },
          },
        });
      }

      return createdOrder;
    });

    // Return success response
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: "Order placed successfully",
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}

// GET - List orders (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          coupon: true,
        },
        orderBy: {
          placedAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + orders.length < total,
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
