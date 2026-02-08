import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/variants/[productId] - Get all variants for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const variants = await prisma.variant.findMany({
      where: { productId },
      orderBy: [
        { color: "asc" },
        { size: "asc" },
      ],
    });

    // Group variants by color
    const groupedByColor = variants.reduce((acc: any, variant: any) => {
      if (!acc[variant.color]) {
        acc[variant.color] = [];
      }
      acc[variant.color].push(variant);
      return acc;
    }, {});

    return NextResponse.json({ variants, groupedByColor });
  } catch (error) {
    console.error("Error fetching variants:", error);
    return NextResponse.json(
      { error: "Failed to fetch variants" },
      { status: 500 }
    );
  }
}

// POST /api/variants/[productId] - Add a variant to a product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await request.json();
    const { color, size, price, stockQty } = body;

    // Check if variant already exists
    const existingVariant = await prisma.variant.findFirst({
      where: {
        productId,
        color,
        size,
      },
    });

    if (existingVariant) {
      return NextResponse.json(
        { error: "Variant with this color and size already exists" },
        { status: 400 }
      );
    }

    const variant = await prisma.variant.create({
      data: {
        productId,
        color,
        size,
        price: parseFloat(price),
        stockQty: stockQty || 0,
      },
    });

    return NextResponse.json({ variant });
  } catch (error) {
    console.error("Error creating variant:", error);
    return NextResponse.json(
      { error: "Failed to create variant" },
      { status: 500 }
    );
  }
}

// PUT /api/variants/[productId] - Bulk update variants
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await params; // Consume params
    const body = await request.json();
    const { variants } = body;

    // Use transaction to update all variants
    const updatedVariants = await prisma.$transaction(
      variants.map((variant: any) =>
        prisma.variant.update({
          where: { id: variant.id },
          data: {
            price: variant.price ? parseFloat(variant.price) : undefined,
            stockQty: variant.stockQty,
          },
        })
      )
    );

    return NextResponse.json({ variants: updatedVariants });
  } catch (error) {
    console.error("Error updating variants:", error);
    return NextResponse.json(
      { error: "Failed to update variants" },
      { status: 500 }
    );
  }
}

// DELETE /api/variants/[productId] - Delete a variant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await params; // Consume params
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get("variantId");

    if (!variantId) {
      return NextResponse.json(
        { error: "Variant ID is required" },
        { status: 400 }
      );
    }

    await prisma.variant.delete({
      where: { id: variantId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting variant:", error);
    return NextResponse.json(
      { error: "Failed to delete variant" },
      { status: 500 }
    );
  }
}
