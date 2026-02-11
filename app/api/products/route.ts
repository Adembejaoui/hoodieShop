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
      where.OR = [
        {
          variants: {
            some: { stockQty: { gt: 0 } },
          },
        },
        {
          sizeStocks: {
            some: { stockQty: { gt: 0 } },
          },
        },
      ];
    }

    if (printPosition) {
      where.printPosition = printPosition;
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice);
    }

    // Filter by color (check both variants and colors tables for compatibility)
    if (color) {
      where.OR = [
        ...(where.OR || []),
        {
          variants: {
            some: { color },
          },
        },
        {
          colors: {
            some: { color },
          },
        },
      ];
    }

    // Filter by size (check both variants and sizeStocks tables for compatibility)
    if (size) {
      where.OR = [
        ...(where.OR || []),
        {
          variants: {
            some: { size },
          },
        },
        {
          sizeStocks: {
            some: { size },
          },
        },
      ];
    }

    // Get paginated products with filters and count
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          colors: true,
          sizeStocks: true,
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

    // Extract unique colors and sizes from paginated products
    const allColors = new Set<string>();
    const allSizes = new Set<string>();

    products.forEach((product) => {
      // Get colors from new format
      product.colors.forEach((c) => {
        allColors.add(c.color);
      });

      // Get sizes from new format
      product.sizeStocks.forEach((s) => {
        allSizes.add(s.size);
      });

      // Also get from legacy format (variants)
      product.variants.forEach((variant) => {
        allColors.add(variant.color);
        allSizes.add(variant.size);
      });
    });

    // Transform products
    const productsWithStock = products.map((product) => {
      // Check if using new format
      const useNewFormat = product.colors.length > 0 && product.sizeStocks.length > 0;

      // Calculate total stock based on format
      let totalStock = 0;
      if (useNewFormat) {
        totalStock = product.sizeStocks.reduce((sum, s) => sum + s.stockQty, 0);
      } else {
        totalStock = product.variants.reduce((sum, v) => sum + v.stockQty, 0);
      }

      return {
        ...product,
        basePrice: Number(product.basePrice),
        totalStock,
        colors: product.colors,
        sizeStocks: product.sizeStocks,
        variants: product.variants.map((variant) => ({
          ...variant,
          price: Number(variant.price),
        })),
        _useNewFormat: useNewFormat,
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
      { error: error instanceof Error ? error.message : "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle new format with colors and sizeStocks
    const productData = body.product || body;
    const { name, description, basePrice, printPosition, categoryId } = productData;
    const colors = body.colors;
    const sizeStocks = body.sizeStocks;
    const useNewFormat: boolean = body.useNewFormat;

    // Validate required fields
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

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

    // Build the create data based on format
    const createData: any = {
      name,
      description,
      basePrice,
      printPosition: printPosition || "BOTH",
      categoryId,
      slug: finalSlug,
    };

    // Add colors if using new format
    if (useNewFormat && colors && colors.length > 0) {
      createData.colors = {
        create: colors.map((c: any) => ({
          color: c.color,
          frontImageURL: c.frontImageURL || null,
          backImageURL: c.backImageURL || null,
        })),
      };
    }

    // Add sizeStocks if using new format
    if (useNewFormat && sizeStocks && sizeStocks.length > 0) {
      createData.sizeStocks = {
        create: sizeStocks.map((s: any) => ({
          size: s.size,
          stockQty: s.stockQty || 0,
        })),
      };
    }

    // Legacy format: create variants
    const legacyVariants = body.variants;
    if (!useNewFormat && legacyVariants && legacyVariants.length > 0) {
      createData.variants = {
        create: legacyVariants.map((v: any) => ({
          color: v.color,
          size: v.size,
          price: v.price ?? basePrice,
          stockQty: v.stockQty || 0,
          frontImageURL: v.frontImageURL || null,
          backImageURL: v.backImageURL || null,
        })),
      };
    }

    const product = await prisma.product.create({
      data: createData,
      include: {
        category: true,
        colors: true,
        sizeStocks: true,
        variants: true,
      },
    });

    // Transform response
    const transformedProduct = {
      ...product,
      basePrice: Number(product.basePrice),
      colors: product.colors,
      sizeStocks: product.sizeStocks,
      variants: product.variants.map((v: any) => ({
        ...v,
        price: Number(v.price),
      })),
      _useNewFormat: useNewFormat,
    };

    return NextResponse.json(transformedProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
