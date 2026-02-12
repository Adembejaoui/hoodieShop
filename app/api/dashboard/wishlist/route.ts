import { NextRequest, NextResponse } from "next/server";
import prisma, { withRetry } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET /api/dashboard/wishlist - List user wishlist
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const includeOptions = {
      include: {
        product: {
          include: {
            category: true,
            variants: true,
            colors: true,
            sizeStocks: true,
          },
        },
      },
    } as const;

    const wishlist = await withRetry(() => prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      ...includeOptions,
      orderBy: { createdAt: "desc" },
    })) as Prisma.WishlistItemGetPayload<typeof includeOptions>[];

    // Transform data
    const wishlistWithDetails = wishlist.map((item: Prisma.WishlistItemGetPayload<typeof includeOptions>) => ({
      id: item.id,
      product: {
        ...item.product,
        basePrice: Number(item.product.basePrice),
        variants: item.product.variants.map((v) => ({
          ...v,
          price: Number(v.price),
        })),
        colors: item.product.colors,
        sizeStocks: item.product.sizeStocks,
        _useNewFormat: item.product.colors.length > 0 && item.product.sizeStocks.length > 0,
      },
      addedAt: item.createdAt,
    }));

    return NextResponse.json({ wishlist: wishlistWithDetails });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/wishlist - Add product to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId } = body;

    // Check if already in wishlist
    const existingItem = await withRetry(() => prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    }));

    if (existingItem) {
      return NextResponse.json(
        { error: "Product already in wishlist" },
        { status: 400 }
      );
    }

    const wishlistItem = await withRetry(() => prisma.wishlistItem.create({
      data: {
        userId: session.user.id,
        productId,
      },
      include: {
        product: {
          include: {
            category: true,
            variants: true,
          },
        },
      },
    })) as any;

    return NextResponse.json({ 
      wishlistItem: {
        ...wishlistItem,
        product: {
          ...wishlistItem.product,
          basePrice: Number(wishlistItem.product.basePrice),
        },
      },
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboard/wishlist - Remove product from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const wishlistItemId = searchParams.get("id");

    if (!productId && !wishlistItemId) {
      return NextResponse.json(
        { error: "Product ID or Wishlist Item ID is required" },
        { status: 400 }
      );
    }

    if (wishlistItemId) {
      await withRetry(() => prisma.wishlistItem.delete({
        where: { id: wishlistItemId },
      }));
    } else {
      await withRetry(() => prisma.wishlistItem.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: productId!,
          },
        },
      }));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
