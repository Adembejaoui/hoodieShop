"use client";

import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartContext, CartItem } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Truck, FileText, CheckCircle, Lock, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes: string;
}

interface UserAddress {
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

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useContext(CartContext)!;
  const router = useRouter();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<ShippingInfo>>({});
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Fetch user's saved addresses if logged in
    if (session?.user?.email) {
      fetchSavedAddresses();
    }
  }, [session]);

  // Fetch saved addresses from API
  const fetchSavedAddresses = async () => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch("/api/dashboard/addresses");
      if (response.ok) {
        const data = await response.json();
        setSavedAddresses(data.addresses || []);
        
        // Auto-fill with default address if available
        if (data.defaultAddress) {
          fillAddressFromSaved(data.defaultAddress);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Fill shipping info from saved address
  const fillAddressFromSaved = (address: UserAddress) => {
    const [firstName, ...lastNameParts] = address.recipientName.split(" ");
    setShippingInfo((prev) => ({
      ...prev,
      firstName,
      lastName: lastNameParts.join(" ") || "",
      email: session?.user?.email || prev.email,
      phone: address.phone,
      address: address.address,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
    }));
    setSelectedAddressId(address.id);
  };

  // Handle selecting a saved address
  const handleSelectAddress = (address: UserAddress) => {
    fillAddressFromSaved(address);
  };

  if (!mounted) return null;

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Add some items to your cart before checking out.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your order. You will receive a confirmation email shortly.
            <br />
            Your order will be delivered to the address you provided.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingInfo> = {};

    if (!shippingInfo.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!shippingInfo.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!shippingInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!shippingInfo.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!shippingInfo.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!shippingInfo.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!shippingInfo.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }
    if (!shippingInfo.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.id,
          name: item.name,
          color: item.color,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          printPosition: item.printPosition,
        })),
        shippingInfo,
        subtotal,
        discountAmount: couponDiscount,
        couponCode: appliedCoupon?.code,
        paymentMethod: "pay_on_delivery",
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        clearCart();
        setIsSuccess(true);
      } else {
        throw new Error("Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ShippingInfo]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    setCouponError("");

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });

      const data = await response.json();

      // Handle unauthorized (not logged in)
      if (response.status === 401 && data.errorCode === "UNAUTHORIZED") {
        setCouponError("Please log in to apply coupon codes");
        setIsValidatingCoupon(false);
        return;
      }

      if (response.ok && data.valid) {
        setCouponDiscount(data.coupon.discountAmount);
        setAppliedCoupon({ code: couponCode.toUpperCase(), discount: data.coupon.discountAmount });
        setCouponError("");
      } else {
        setCouponError(data.error || "Invalid coupon code");
        setCouponDiscount(0);
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setAppliedCoupon(null);
    setCouponError("");
  };

  const total = subtotal - couponDiscount;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground mt-2">
            Complete your order - Pay on Delivery
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? "border-destructive" : ""}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? "border-destructive" : ""}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      className={errors.email ? "border-destructive" : ""}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? "border-destructive" : ""}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Address
                </h2>
                
                {/* Saved Addresses Selector */}
                {session?.user && savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <Label className="mb-2 block">Saved Addresses</Label>
                    {isLoadingAddress ? (
                      <p className="text-sm text-muted-foreground">Loading addresses...</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {savedAddresses.map((address) => (
                          <button
                            key={address.id}
                            type="button"
                            onClick={() => handleSelectAddress(address)}
                            className={`p-3 border rounded-lg text-left transition-colors ${
                              selectedAddressId === address.id
                                ? "border-primary bg-primary/5"
                                : "hover:border-muted-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <p className="font-medium text-sm">{address.name}</p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate ml-6">
                              {address.address}, {address.city}
                            </p>
                            {address.isDefault && (
                              <span className="text-xs text-primary ml-6">Default</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      Or fill in a new address below
                    </p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      className={errors.address ? "border-destructive" : ""}
                      placeholder="123 Main Street"
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        className={errors.city ? "border-destructive" : ""}
                        placeholder="New York"
                      />
                      {errors.city && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={handleInputChange}
                        className={errors.postalCode ? "border-destructive" : ""}
                        placeholder="10001"
                      />
                      {errors.postalCode && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleInputChange}
                        className={errors.country ? "border-destructive" : ""}
                        placeholder="United States"
                      />
                      {errors.country && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.country}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={shippingInfo.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      placeholder="Special delivery instructions..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Notice */}
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-2">Payment Method: Pay on Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  You will pay for your order when it is delivered to your address.
                  No payment information is required at this time.
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-card rounded-lg border p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium line-clamp-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.color} / {item.size}
                      </p>
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Coupon Input */}
              {!appliedCoupon ? (
                <div className="mb-4">
                  <Label htmlFor="couponCode">Coupon Code</Label>
                  {session?.user ? (
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="couponCode"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError("");
                        }}
                        placeholder="Enter coupon code"
                        className={couponError ? "border-destructive" : ""}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), validateCoupon())}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={validateCoupon}
                        disabled={isValidatingCoupon || !couponCode.trim()}
                      >
                        {isValidatingCoupon ? "..." : "Apply"}
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-1 p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm">
                          <Link href="/login" className="text-primary hover:underline font-medium">
                            Log in
                          </Link>{" "}
                          to apply coupon codes
                        </span>
                      </div>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-sm text-destructive mt-1">{couponError}</p>
                  )}
                </div>
              ) : (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {appliedCoupon.code} applied
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    -${appliedCoupon.discount.toFixed(2)} discount
                  </p>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Delivery Information</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Delivery within 5-7 business days</li>
                  <li>• Pay cash or card upon delivery</li>
                  <li>• You will receive SMS notifications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
