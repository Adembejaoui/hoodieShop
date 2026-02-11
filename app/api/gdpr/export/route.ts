import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// No validation schema needed - we get user from session

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to export your data' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Find user by ID (from session)
    const userIncludeOptions = {
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
        addresses: true,
        wishlist: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    } as const;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      ...userIncludeOptions,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Get user's orders
    const orderIncludeOptions = {
      include: {
        items: true,
        coupon: {
          select: {
            code: true,
            type: true,
            value: true,
          },
        },
      },
    } as const;

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      ...orderIncludeOptions,
      orderBy: { placedAt: 'desc' },
    });

    // Build export data
    const exportData = {
      exportMetadata: {
        generatedAt: new Date().toISOString(),
        dataSubject: user.email,
        dataController: 'Hoodie Legends',
      },
      personalData: {
        account: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        linkedAccounts: user.accounts.map((account: Prisma.AccountGetPayload<typeof userIncludeOptions.include.accounts>) => ({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        })),
        addresses: user.addresses.map((addr: Prisma.AddressGetPayload<typeof userIncludeOptions.include.addresses>) => ({
          name: addr.name,
          recipientName: addr.recipientName,
          streetAddress: addr.address,
          city: addr.city,
          postalCode: addr.postalCode,
          country: addr.country,
          phone: addr.phone,
          isDefault: addr.isDefault,
        })),
        wishlist: user.wishlist.map((item: Prisma.WishlistItemGetPayload<typeof userIncludeOptions.include.wishlist>) => ({
          productName: item.product.name,
          productSlug: item.product.slug,
          addedAt: item.createdAt.toISOString(),
        })),
        orders: orders.map((order: Prisma.OrderGetPayload<typeof orderIncludeOptions>) => ({
          orderNumber: order.orderNumber,
          status: order.status,
          items: order.items.map((item: Prisma.OrderItemGetPayload<typeof orderIncludeOptions.include.items>) => ({
            name: item.name,
            color: item.color,
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            totalPrice: item.totalPrice.toString(),
          })),
          subtotal: order.subtotal.toString(),
          shippingCost: order.shippingCost.toString(),
          discountAmount: order.discountAmount.toString(),
          totalPrice: order.totalPrice.toString(),
          shippingAddress: {
            name: order.shippingName,
            address: order.shippingAddress,
            city: order.shippingCity,
            postalCode: order.shippingPostalCode,
            country: order.shippingCountry,
          },
          placedAt: order.placedAt.toISOString(),
          coupon: order.coupon ? {
            code: order.coupon.code,
            type: order.coupon.type,
            value: order.coupon.value.toString(),
          } : null,
        })),
      },
      consentHistory: {
        note: 'Consent preferences are stored in encrypted cookies',
      },
    };

    return NextResponse.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data. Please try again later.' },
      { status: 500 }
    );
  }
}
