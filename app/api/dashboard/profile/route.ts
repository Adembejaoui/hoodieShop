import { NextRequest, NextResponse } from "next/server";
import prisma, { withRetry } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/dashboard/profile - Get user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await withRetry(() => prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        password: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
            wishlist: true,
          },
        },
      },
    })) as { id: string; name: string | null; email: string | null; image: string | null; phone: string | null; password: string | null; createdAt: Date; _count: { orders: number; addresses: number; wishlist: number } } | null;

    return NextResponse.json({ 
      user: user ? {
        ...user,
        hasPassword: !!user.password,
      } : null,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT /api/dashboard/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, image } = body;

    const updatedUser = await withRetry(() => prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        createdAt: true,
      },
    }));

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
