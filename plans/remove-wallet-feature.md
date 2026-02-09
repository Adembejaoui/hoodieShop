# Plan: Remove Wallet/Store Credit Feature

## Summary
Remove the Wallet and WalletTransaction models from the Prisma schema since this feature is not being used.

## Models to Remove

### 1. Wallet Model (lines 316-328)
```prisma
model Wallet {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  balance     Decimal  @db.Decimal(10, 2) @default(0)
  currency    String   @default("USD")
  transactions WalletTransaction[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("wallets")
}
```

### 2. WalletTransaction Model (lines 331-345)
```prisma
model WalletTransaction {
  id          String   @id @default(cuid())
  walletId   String
  wallet     Wallet   @relation(fields: [walletId], references: [id], onDelete: Cascade)
  
  amount     Decimal  @db.Decimal(10, 2)
  type       String   // credit, debit
  description String?
  orderId    String?  // Linked order if applicable
  
  createdAt  DateTime @default(now())
  
  @@index([walletId])
  @@map("wallet_transactions")
}
```

### 3. Update User Model (line 30)
Remove: `wallet        Wallet?`

## Implementation Steps

1. **Edit prisma/schema.prisma**
   - Remove Wallet model (lines 315-328)
   - Remove WalletTransaction model (lines 330-345)
   - Remove `wallet Wallet?` from User model (line 30)

2. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

3. **Create and apply migration**
   ```bash
   npx prisma migrate dev --name remove_wallet_feature
   ```

## Database Tables to Drop

- `wallets`
- `wallet_transactions`

## Verification

After implementation:
- [ ] Run `npx prisma generate` successfully
- [ ] No wallet-related code errors
- [ ] Application runs without wallet-related errors
