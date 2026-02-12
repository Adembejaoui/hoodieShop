import { NextRequest, NextResponse } from "next/server";
import prisma, { withRetry } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/dashboard/addresses - Get user's addresses
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await withRetry(() => prisma.user.findUnique({
      where: { email: session.user.email },
    })) as { id: string } | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get default address first, then all addresses
    const defaultAddress = await withRetry(() => prisma.address.findFirst({
      where: { userId: user.id, isDefault: true },
    }));

    const addresses = await withRetry(() => prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: "desc" },
    }));

    return NextResponse.json({
      defaultAddress,
      addresses,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// POST /api/dashboard/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await withRetry(() => prisma.user.findUnique({
      where: { email: session.user.email },
    })) as { id: string } | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, recipientName, phone, address, city, postalCode, country, isDefault } = body;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await withRetry(() => prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      }));
    }

    const newAddress = await withRetry(() => prisma.address.create({
      data: {
        userId: user.id,
        name,
        recipientName,
        phone,
        address,
        city,
        postalCode,
        country,
        isDefault: isDefault || false,
      },
    }));

    return NextResponse.json({ address: newAddress });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}

// PUT /api/dashboard/addresses - Update address
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await withRetry(() => prisma.user.findUnique({
      where: { email: session.user.email },
    })) as { id: string } | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { id, name, recipientName, phone, address, city, postalCode, country, isDefault } = body;

    // If setting as default, unset other defaults first
    if (isDefault) {
      await withRetry(() => prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      }));
    }

    const updatedAddress = await withRetry(() => prisma.address.update({
      where: { id, userId: user.id },
      data: {
        name,
        recipientName,
        phone,
        address,
        city,
        postalCode,
        country,
        isDefault: isDefault || false,
      },
    }));

    return NextResponse.json({ address: updatedAddress });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboard/addresses - Delete address
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await withRetry(() => prisma.user.findUnique({
      where: { email: session.user.email },
    })) as { id: string } | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 });
    }

    await withRetry(() => prisma.address.delete({
      where: { id, userId: user.id },
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
