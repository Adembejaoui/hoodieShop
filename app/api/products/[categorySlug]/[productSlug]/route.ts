import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    categorySlug: string;
    productSlug: string;
  }>;
}

// GET single product by category slug and product slug
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { categorySlug, productSlug } = await params;

    // First find the category by slug
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Then find the product by category and slug
    const product = await prisma.product.findFirst({
      where: {
        slug: productSlug,
        categoryId: category.id,
      },
      include: {
        category: true,
        colors: true,
        sizeStocks: true,
        variants: true, // Kept for backward compatibility
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if using new simplified format (colors + sizeStocks) or legacy (variants)
    const useNewFormat = product.colors.length > 0 && product.sizeStocks.length > 0;

    // Transform the response to convert Decimal to number
    const transformedProduct = {
      ...product,
      basePrice: Number(product.basePrice),
      colors: product.colors.map((color) => ({
        ...color,
      })),
      sizeStocks: product.sizeStocks.map((size) => ({
        ...size,
      })),
      variants: product.variants.map((variant) => ({
        ...variant,
        price: Number(variant.price),
      })),
      _useNewFormat: useNewFormat,
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
