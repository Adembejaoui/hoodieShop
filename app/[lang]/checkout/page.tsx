"use client";

import { useState, useEffect, useContext, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CartContext, CartItem } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Truck, FileText, CheckCircle, Lock, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

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

function CheckoutContent() {
  const { items, subtotal, clearCart } = useContext(CartContext)!;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const t = useTranslations("checkout");
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
  const [hasLoadedAddresses, setHasLoadedAddresses] = useState(false);
  const urlQuantity = searchParams ? parseInt(searchParams.get("quantity") || "1", 10) : 1;

  // Update email when session changes
  useEffect(() => {
    if (session?.user?.email && !shippingInfo.email) {
      setShippingInfo((prev) => ({
        ...prev,
        email: session.user.email || "",
      }));
    }
  }, [session?.user?.email, shippingInfo.email]);

  // Log URL quantity for debugging
  useEffect(() => {
    if (searchParams && searchParams.get("quantity")) {
      console.log("Quantity from URL:", urlQuantity);
    }
  }, [searchParams, urlQuantity]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch saved addresses when session is available
  useEffect(() => {
    if (session?.user?.email && !hasLoadedAddresses) {
      fetchSavedAddresses();
    }
  }, [session?.user?.email, hasLoadedAddresses]);

  // Fetch saved addresses from API
  const fetchSavedAddresses = async () => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch("/api/dashboard/addresses");
      if (response.ok) {
        const data = await response.json();
        const addresses = data.addresses || [];
        setSavedAddresses(addresses);
        setHasLoadedAddresses(true);
        
        // Auto-fill with default address if available
        const defaultAddress = data.defaultAddress || addresses.find((a: UserAddress) => a.isDefault);
        if (defaultAddress) {
          // Use setTimeout to ensure state updates properly
          setTimeout(() => {
            fillAddressFromSaved(defaultAddress);
          }, 0);
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
    const userEmail = session?.user?.email || "";
    
    setShippingInfo({
      firstName: firstName || "",
      lastName: lastNameParts.join(" ") || "",
      email: userEmail,
      phone: address.phone || "",
      address: address.address || "",
      city: address.city || "",
      postalCode: address.postalCode || "",
      country: address.country || "",
      notes: "",
    });
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
          <h1 className="text-2xl font-bold mb-4">{t("emptyCart.title")}</h1>
          <p className="text-muted-foreground mb-6">
            {t("emptyCart.description")}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("emptyCart.continueShopping")}
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
          <h1 className="text-3xl font-bold mb-4">{t("success.title")}</h1>
          <p className="text-muted-foreground mb-8">
            {t("success.description")}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t("success.continueShopping")}
          </Link>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingInfo> = {};

    if (!shippingInfo.firstName.trim()) {
      newErrors.firstName = t("validation.firstNameRequired");
    }
    if (!shippingInfo.lastName.trim()) {
      newErrors.lastName = t("validation.lastNameRequired");
    }
    if (!shippingInfo.email.trim()) {
      newErrors.email = t("validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      newErrors.email = t("validation.emailInvalid");
    }
    if (!shippingInfo.phone.trim()) {
      newErrors.phone = t("validation.phoneRequired");
    }
    if (!shippingInfo.address.trim()) {
      newErrors.address = t("validation.addressRequired");
    }
    if (!shippingInfo.city.trim()) {
      newErrors.city = t("validation.cityRequired");
    }
    if (!shippingInfo.postalCode.trim()) {
      newErrors.postalCode = t("validation.postalCodeRequired");
    }
    if (!shippingInfo.country.trim()) {
      newErrors.country = t("validation.countryRequired");
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
        const data = await response.json();
        alert(data.error || t("errors.orderFailed"));
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert(t("errors.orderFailed"));
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
        setCouponError(t("coupon.loginRequired"));
        setIsValidatingCoupon(false);
        return;
      }

      if (response.ok && data.valid) {
        setCouponDiscount(data.coupon.discountAmount);
        setAppliedCoupon({ code: couponCode.toUpperCase(), discount: data.coupon.discountAmount });
        setCouponError("");
      } else {
        setCouponError(data.error || t("coupon.invalid"));
        setCouponDiscount(0);
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError(t("coupon.validationFailed"));
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
            {t("backToCart")}
          </Link>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("subtitle")}
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
                  {t("contactInfo.title")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t("contactInfo.firstName")} *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? "border-destructive" : ""}
                      placeholder={t("contactInfo.firstNamePlaceholder")}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t("contactInfo.lastName")} *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? "border-destructive" : ""}
                      placeholder={t("contactInfo.lastNamePlaceholder")}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">{t("contactInfo.email")} *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      className={errors.email ? "border-destructive" : ""}
                      placeholder={t("contactInfo.emailPlaceholder")}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("contactInfo.phone")} *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? "border-destructive" : ""}
                      placeholder={t("contactInfo.phonePlaceholder")}
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
                  {t("shippingAddress.title")}
                </h2>
                
                {/* Saved Addresses Selector */}
                {session?.user && savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <Label className="mb-2 block">{t("shippingAddress.savedAddresses")}</Label>
                    {isLoadingAddress ? (
                      <p className="text-sm text-muted-foreground">{t("shippingAddress.loadingAddresses")}</p>
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
                              <span className="text-xs text-primary ml-6">{t("shippingAddress.default")}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {t("shippingAddress.orFillNew")}
                    </p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">{t("shippingAddress.streetAddress")} *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      className={errors.address ? "border-destructive" : ""}
                      placeholder={t("shippingAddress.streetPlaceholder")}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">{t("shippingAddress.city")} *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        className={errors.city ? "border-destructive" : ""}
                        placeholder={t("shippingAddress.cityPlaceholder")}
                      />
                      {errors.city && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="postalCode">{t("shippingAddress.postalCode")} *</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={handleInputChange}
                        className={errors.postalCode ? "border-destructive" : ""}
                        placeholder={t("shippingAddress.postalCodePlaceholder")}
                      />
                      {errors.postalCode && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="country">{t("shippingAddress.country")} *</Label>
                      <Input
                        id="country"
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleInputChange}
                        className={errors.country ? "border-destructive" : ""}
                        placeholder={t("shippingAddress.countryPlaceholder")}
                      />
                      {errors.country && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.country}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">{t("shippingAddress.orderNotes")}</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={shippingInfo.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      placeholder={t("shippingAddress.orderNotesPlaceholder")}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Notice */}
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold mb-2">{t("payment.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("payment.description")}
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("placingOrder") : t("placeOrder")}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-card rounded-lg border p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">{t("orderSummary.title")}</h2>

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
                      <p className="text-sm">{t("orderSummary.quantity")}: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {(item.price * item.quantity).toFixed(2)} DT
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Coupon Input */}
              {!appliedCoupon ? (
                <div className="mb-4">
                  <Label htmlFor="couponCode">{t("coupon.title")}</Label>
                  {session?.user ? (
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="couponCode"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError("");
                        }}
                        placeholder={t("coupon.placeholder")}
                        className={couponError ? "border-destructive" : ""}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), validateCoupon())}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={validateCoupon}
                        disabled={isValidatingCoupon || !couponCode.trim()}
                      >
                        {isValidatingCoupon ? "..." : t("coupon.apply")}
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-1 p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm">
                          <Link href="/auth" className="text-primary hover:underline font-medium">
                            {t("coupon.login")}
                          </Link>{" "}
                          {t("coupon.toApply")}
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
                        {appliedCoupon.code} {t("coupon.applied")}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      {t("coupon.remove")}
                    </button>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    -{appliedCoupon.discount.toFixed(2)} DT {t("coupon.discount")}
                  </p>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("orderSummary.subtotal")}</span>
                  <span>{subtotal.toFixed(2)} DT</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t("orderSummary.discount")}</span>
                    <span>-{couponDiscount.toFixed(2)} DT</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("orderSummary.shipping")}</span>
                  <span className="text-green-600">{t("orderSummary.free")}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>{t("orderSummary.total")}</span>
                  <span>{total.toFixed(2)} DT</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">{t("deliveryInfo.title")}</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>· {t("deliveryInfo.days")}</li>
                  <li>· {t("deliveryInfo.payOnDelivery")}</li>
                  <li>· {t("deliveryInfo.smsNotifications")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  return (
    <Suspense fallback={<div className="min-h-screen bg-background py-12 flex items-center justify-center"><p>{t("loading")}</p></div>}>
      <CheckoutContent />
    </Suspense>
  );
}