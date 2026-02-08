# Order Models Upgrade Plan

## Analysis of Your Proposed Models

### Current Proposed Schema:

```prisma
model Order {
  id String @id @default(cuid())
  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId String? // null for guest
  items OrderItem[]
  coupon Coupon? @relation(fields: [couponId], references: [id])
  couponId String?
  totalPrice Decimal @db.Decimal(10,2)
  status OrderStatus
  placedAt DateTime @default(now())
}

model OrderItem {
  id String @id @default(cuid())
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId String
  variant Variant @relation(fields: [variantId], references: [id])
  variantId String
  quantity Int
  unitPrice Decimal @db.Decimal(10,2)
}

enum OrderStatus { PENDING SHIPPED DELIVERED CANCELLED }

model Coupon {
  id String @id @default(cuid())
  code String @unique
  type DiscountType
  value Decimal @db.Decimal(10,2)
  expiresAt DateTime?
  active Boolean @default(true)
  orders Order[]
}

enum DiscountType { PERCENTAGE FIXED }
```

## Recommended Upgrades

### 1. Order Model - Add These Fields:

| Field | Type | Reason |
|-------|------|--------|
| `orderNumber` | String @unique | Human-readable ID for customers |
| `email` | String | Contact for guest orders |
| `phone` | String? | Delivery contact |
| `shippingName` | String | Recipient name |
| `shippingAddress` | String | Full address |
| `shippingCity` | String | City |
| `shippingPostalCode` | String | Postal code |
| `shippingCountry` | String | Country |
| `subtotal` | Decimal | Item total before discounts |
| `shippingCost` | Decimal @default(0) | Shipping fees |
| `discountAmount` | Decimal @default(0) | Coupon discount |
| `paymentMethod` | String @default("pay_on_delivery") | Record payment type |
| `paymentStatus` | String @default("pending") | Track payment |
| `trackingNumber` | String? | Shipment tracking |
| `notes` | String? @db.Text | Customer instructions |
| `adminNotes` | String? @db.Text | Internal notes |
| `couponCode` | String? | Store code reference |
| `updatedAt` | DateTime @updatedAt | Audit trail |
| `shippedAt` | DateTime? | Ship date |
| `deliveredAt` | DateTime? | Delivery date |

### 2. OrderItem Model - Add These Fields:

| Field | Type | Reason |
|-------|------|--------|
| `name` | String | Product name at purchase |
| `color` | String | Variant color |
| `size` | String | Variant size |
| `printPosition` | String | Print location |
| `totalPrice` | Decimal | Line item total |

### 3. Coupon Model - Add These Fields:

| Field | Type | Reason |
|-------|------|--------|
| `description` | String? | Coupon details |
| `minOrderAmount` | Decimal? | Minimum order value |
| `maxUses` | Int? | Total usage limit |
| `maxUsesPerUser` | Int @default(1) | Per-user limit |
| `startsAt` | DateTime? | Activation date |
| `usedCount` | Int @default(0) | Track usage |
| `updatedAt` | DateTime @updatedAt | Audit trail |

### 4. New Enum Values:

```prisma
enum OrderStatus {
  PENDING
  PROCESSING     // Added: Order being prepared
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED       // Added: For refunds
}
```

## Recommended Full Schema

```prisma
// Order Status Enum
enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

// Discount Type Enum
enum DiscountType {
  PERCENTAGE
  FIXED
}

// Order Model
model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  userId          String?
  user            User?       @relation(fields: [userId], references: [id], onDelete: SetNull)

  // Contact info
  email           String
  phone           String?

  // Shipping address
  shippingName    String
  shippingAddress String
  shippingCity    String
  shippingPostalCode String
  shippingCountry String

  // Pricing
  subtotal        Decimal     @db.Decimal(10, 2)
  shippingCost    Decimal     @db.Decimal(10, 2) @default(0)
  discountAmount  Decimal     @db.Decimal(10, 2) @default(0)
  totalPrice      Decimal     @db.Decimal(10, 2)

  // Payment
  paymentMethod   String      @default("pay_on_delivery")
  paymentStatus   String      @default("pending")

  // Status
  status          OrderStatus @default(PENDING)
  trackingNumber  String?
  notes           String?     @db.Text
  adminNotes      String?     @db.Text

  // Coupon
  couponId        String?
  coupon          Coupon?     @relation(fields: [couponId], references: [id])
  couponCode      String?

  // Relations
  items           OrderItem[]

  // Timestamps
  placedAt        DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  shippedAt       DateTime?
  deliveredAt     DateTime?

  @@index([userId])
  @@index([email])
  @@index([orderNumber])
  @@map("orders")
}

// Order Item Model
model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  // Product details
  productId   String
  variantId   String
  name        String
  color       String
  size        String
  printPosition String

  // Pricing
  unitPrice   Decimal  @db.Decimal(10, 2)
  quantity    Int
  totalPrice  Decimal  @db.Decimal(10, 2)

  createdAt   DateTime @default(now())

  @@index([orderId])
  @@map("order_items")
}

// Coupon Model
model Coupon {
  id          String       @id @default(cuid())
  code        String       @unique
  description String?
  type        DiscountType
  value       Decimal      @db.Decimal(10, 2)

  // Constraints
  minOrderAmount Decimal?  @db.Decimal(10, 2)
  maxUses        Int?
  maxUsesPerUser Int?      @default(1)

  // Validity
  startsAt    DateTime?
  expiresAt   DateTime?
  active      Boolean     @default(true)
  usedCount   Int         @default(0)

  // Relations
  orders      Order[]

  // Timestamps
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([code])
  @@index([active])
  @@map("coupons")
}
```

## Key Benefits of These Upgrades

1. **Better Customer Experience**: Order numbers are customer-friendly
2. **Complete Records**: All shipping info stored for reference
3. **Audit Trail**: Timestamps track order lifecycle
4. **Flexibility**: Easy to add payment methods later
5. **Marketing**: Coupon tracking and limits
6. **Support**: Notes for customer service
7. **Analytics**: Track shipping costs and discounts

## Migration Steps

1. Add models to `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_order_models`
3. Update checkout API to save orders
4. Update cart context to clear after order
5. Add coupon validation endpoint
