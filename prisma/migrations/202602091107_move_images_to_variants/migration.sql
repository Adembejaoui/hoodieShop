-- Move frontImageURL and backImageURL from Product to Variant
-- This migration removes the image columns from products table and adds them to variants table

-- Step 1: Add new columns to variants table (nullable first)
ALTER TABLE "variants" ADD COLUMN "frontImageURL" TEXT;
ALTER TABLE "variants" ADD COLUMN "backImageURL" TEXT;

-- Step 2: Copy data from products to variants for each color
-- This assumes each product has variants for Black, White, Gray colors
-- We'll map the product's frontImageURL to Black variants and backImageURL appropriately
UPDATE "variants" AS v
SET 
  "frontImageURL" = p."frontImageURL",
  "backImageURL" = p."backImageURL"
FROM "products" AS p
WHERE v."productId" = p."id"
  AND v."color" IN ('Black', 'White', 'Gray');

-- Step 3: Drop columns from products table
ALTER TABLE "products" DROP COLUMN "frontImageURL";
ALTER TABLE "products" DROP COLUMN "backImageURL";
