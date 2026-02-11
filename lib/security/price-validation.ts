/**
 * Server-Side Price Validation Utility
 * 
 * Ensures prices are calculated server-side to prevent client manipulation
 */

import prisma from '@/lib/prisma';

/**
 * Validate and calculate item prices from database
 * Prevents price manipulation from client
 */
export async function validateAndCalculatePrices(
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number; // Client-provided price (untrusted)
  }>
): Promise<{
  valid: boolean;
  error?: string;
  validatedItems?: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number; // Server-validated price
    totalPrice: number;
  }>;
}> {
  const productIds = items.map((item) => item.productId);
  
  // Fetch actual product prices from database
  interface ProductInfo {
    id: string;
    basePrice: any;
    name: string;
  }
  
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
    select: {
      id: true,
      basePrice: true,
      name: true,
    },
  }) as ProductInfo[];
  
  // Create a map for quick lookup
  const productMap = new Map<string, ProductInfo>(
    products.map((p) => [p.id, p])
  );
  
  // Validate each item
  const validatedItems = [];
  
  for (const item of items) {
    const product = productMap.get(item.productId);
    
    if (!product) {
      return {
        valid: false,
        error: `Product not found: ${item.productId}`,
      };
    }
    
    const serverPrice = Number(product.basePrice);
    
    // Validate price is reasonable (within 100% of actual price)
    // This allows for some variance in pricing logic but prevents major manipulation
    const priceVariance = Math.abs(serverPrice - item.price) / serverPrice;
    if (priceVariance > 1) {
      console.warn(`Price manipulation detected for product ${item.productId}: client=${item.price}, server=${serverPrice}`);
      return {
        valid: false,
        error: `Invalid price for product: ${product.name}`,
      };
    }
    
    validatedItems.push({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: serverPrice,
      totalPrice: serverPrice * item.quantity,
    });
  }
  
  // Calculate subtotal
  const subtotal = validatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  
  return {
    valid: true,
    validatedItems,
  };
}

/**
 * Validate coupon discount
 */
export async function validateCoupon(
  couponCode: string,
  calculatedSubtotal: number
): Promise<{
  valid: boolean;
  coupon?: {
    id: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minOrderAmount?: number;
    maxUses?: number;
    usedCount: number;
  };
  error?: string;
  discountAmount?: number;
}> {
  if (!couponCode) {
    return { valid: false };
  }
  
  const coupon = await prisma.coupon.findFirst({
    where: {
      code: couponCode.toUpperCase(),
      active: true,
    },
  });
  
  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code' };
  }
  
  // Check expiration
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, error: 'Coupon has expired' };
  }
  
  // Check minimum order amount
  if (coupon.minOrderAmount && calculatedSubtotal < Number(coupon.minOrderAmount)) {
    return {
      valid: false,
      error: `Minimum order amount of ${coupon.minOrderAmount} required for this coupon`,
    };
  }
  
  // Check max uses
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: 'Coupon usage limit reached' };
  }
  
  // Calculate discount
  let discountAmount = 0;
  if (coupon.type === 'PERCENTAGE') {
    discountAmount = (calculatedSubtotal * Number(coupon.value)) / 100;
  } else {
    discountAmount = Number(coupon.value);
  }
  
  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type as 'PERCENTAGE' | 'FIXED',
      value: Number(coupon.value),
      minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : undefined,
      maxUses: coupon.maxUses || undefined,
      usedCount: coupon.usedCount,
    },
    discountAmount,
  };
}

/**
 * Validate shipping cost
 * Adjust based on order value or other business rules
 */
export function validateShippingCost(
  subtotal: number,
  providedShippingCost: number
): {
  valid: boolean;
  actualShippingCost: number;
  error?: string;
} {
  // Free shipping for orders over €50
  const FREE_SHIPPING_THRESHOLD = 50;
  const STANDARD_SHIPPING_COST = 5.99;
  
  const actualShippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
  
  if (providedShippingCost !== actualShippingCost) {
    console.warn(`Shipping cost manipulation detected: client=${providedShippingCost}, server=${actualShippingCost}`);
    return {
      valid: false,
      actualShippingCost,
      error: 'Invalid shipping cost',
    };
  }
  
  return {
    valid: true,
    actualShippingCost,
  };
}

/**
 * Calculate total price server-side
 */
export function calculateTotalPrice(
  subtotal: number,
  discountAmount: number,
  shippingCost: number
): number {
  return Math.max(0, subtotal - discountAmount + shippingCost);
}
