import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/products - List all products with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const inStock = searchParams.get("inStock");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const color = searchParams.get("color");
    const size = searchParams.get("size");
    const printPosition = searchParams.get("printPosition");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (inStock === "true") {
      where.variants = {
        some: {
          stockQty: { gt: 0 },
        },
      };
    }

    if (printPosition) {
      where.printPosition = printPosition;
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice);
    }

    // Filter by color and size in variants
    if (color || size) {
      where.variants = {
        ...where.variants,
        some: {
          ...(where.variants?.some || {}),
          ...(color ? { color } : {}),
          ...(size ? { size } : {}),
        },
      };
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate total stock and extract unique colors/sizes
    const allColors = new Set<string>();
    const allSizes = new Set<string>();

    const productsWithStock = products.map((product) => {
      product.variants.forEach((variant) => {
        allColors.add(variant.color);
        allSizes.add(variant.size);
      });
      return {
        ...product,
        basePrice: Number(product.basePrice),
        totalStock: product.variants.reduce(
          (sum, variant) => sum + variant.stockQty,
          0
        ),
        variants: product.variants.map((variant) => ({
          ...variant,
          price: Number(variant.price),
        })),
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products: productsWithStock,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      colors: Array.from(allColors).sort(),
      sizes: Array.from(allSizes).sort(),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, basePrice, printPosition, categoryId, frontImageURL, backImageURL, variants } = body;

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug exists in the same category
    const existingProduct = await prisma.product.findFirst({
      where: {
        categoryId,
        slug,
      },
    });

    const finalSlug = existingProduct ? `${slug}-${Date.now()}` : slug;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        basePrice: parseFloat(basePrice),
        printPosition,
        categoryId,
        frontImageURL,
        backImageURL,
        slug: finalSlug,
        variants: variants
          ? {
              create: variants.map((variant: any) => ({
                color: variant.color,
                size: variant.size,
                price: parseFloat(variant.price) || parseFloat(basePrice),
                stockQty: variant.stockQty || 0,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
