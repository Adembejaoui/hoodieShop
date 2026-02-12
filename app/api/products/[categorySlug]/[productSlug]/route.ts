import { NextResponse } from "next/server";
import prisma, { withRetry } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic';
export const revalidate = 60;

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
    const category = await withRetry(() => prisma.category.findUnique({
      where: { slug: categorySlug },
    })) as Prisma.CategoryGetPayload<null> | null;

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const includeOptions = {
      include: {
        category: true,
        colors: true,
        sizeStocks: true,
        variants: true,
      },
    } as const;

    // Then find the product by category and slug
    const product = await withRetry(() => prisma.product.findFirst({
      where: {
        slug: productSlug,
        categoryId: category.id,
      },
      ...includeOptions,
    })) as Prisma.ProductGetPayload<typeof includeOptions> | null;

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
      colors: product.colors.map((color: Prisma.ProductColorGetPayload<typeof includeOptions.include.colors>) => ({
        ...color,
      })),
      sizeStocks: product.sizeStocks.map((size: Prisma.ProductSizeStockGetPayload<typeof includeOptions.include.sizeStocks>) => ({
        ...size,
      })),
      variants: product.variants.map((variant: Prisma.VariantGetPayload<typeof includeOptions.include.variants>) => ({
        ...variant,
        price: Number(variant.price),
      })),
      _useNewFormat: useNewFormat,
    };

    return NextResponse.json(transformedProduct, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
