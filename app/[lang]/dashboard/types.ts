// Dashboard Types

export interface OrderItem {
  id: string;
  name: string;
  color: string;
  size: string;
  printPosition: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalPrice: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  trackingNumber: string | null;
  placedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  email: string;
  phone: string | null;
  couponCode: string | null;
  items: OrderItem[];
}

export interface Address {
  id: string;
  name: string;
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    basePrice: number;
    printPosition: string;
    category: {
      name: string;
      slug: string;
    };
    colors: Array<{
      id: string;
      color: string;
      frontImageURL: string | null;
      backImageURL: string | null;
    }>;
    sizeStocks: Array<{
      id: string;
      size: string;
      stockQty: number;
    }>;
    variants: Array<{
      id: string;
      color: string;
      size: string;
      price: number;
      stockQty: number;
      frontImageURL: string | null;
      backImageURL: string | null;
    }>;
    totalStock?: number;
    _useNewFormat?: boolean;
  };
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  phone: string | null;
  hasPassword: boolean;
  createdAt: string;
  _count: {
    orders: number;
    addresses: number;
    wishlist: number;
  };
}

export interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export type TabType = "orders" | "addresses" | "wishlist" | "profile";

export interface AddressFormData {
  name: string;
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileFormData {
  name: string;
  phone: string;
}