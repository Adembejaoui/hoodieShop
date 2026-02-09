import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { product, colors, sizeStocks, useNewFormat } = body;

    // Update product basic info
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        basePrice: product.basePrice,
        printPosition: product.printPosition,
        categoryId: product.categoryId,
      },
    });

    // Handle new format: colors and sizeStocks
    if (useNewFormat) {
      // Delete existing colors and sizeStocks
      await prisma.productColor.deleteMany({
        where: { productId: id },
      });

      await prisma.productSizeStock.deleteMany({
        where: { productId: id },
      });

      // Create new colors
      if (colors && colors.length > 0) {
        await prisma.productColor.createMany({
          data: colors.map((c: { color: string; frontImageURL?: string | null; backImageURL?: string | null }) => ({
            productId: id,
            color: c.color,
            frontImageURL: c.frontImageURL || null,
            backImageURL: c.backImageURL || null,
          })),
        });
      }

      // Create new sizeStocks
      if (sizeStocks && sizeStocks.length > 0) {
        await prisma.productSizeStock.createMany({
          data: sizeStocks.map((s: { size: string; stockQty?: number }) => ({
            productId: id,
            size: s.size,
            stockQty: s.stockQty || 0,
          })),
        });
      }
    } else {
      // Legacy format: handle variants
      const variants = body.variants;

      // Delete existing variants
      await prisma.variant.deleteMany({
        where: { productId: id },
      });

      // Create new variants
      if (variants && variants.length > 0) {
        await prisma.variant.createMany({
          data: variants.map((variant: { color: string; size: string; price: number; stockQty: number; frontImageURL?: string; backImageURL?: string }) => ({
            productId: id,
            color: variant.color,
            size: variant.size,
            price: variant.price,
            stockQty: variant.stockQty,
            frontImageURL: variant.frontImageURL || null,
            backImageURL: variant.backImageURL || null,
          })),
        });
      }
    }

    // Fetch and return updated product with all relations
    const productWithRelations = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        colors: true,
        sizeStocks: true,
        variants: true,
      },
    });

    return NextResponse.json({
      product: {
        ...productWithRelations,
        basePrice: Number(productWithRelations?.basePrice),
        _useNewFormat: useNewFormat,
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete product (colors, sizeStocks, and variants will be deleted due to cascade)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
