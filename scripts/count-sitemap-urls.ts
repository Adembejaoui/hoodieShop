/**
 * Script to count total URLs in the sitemap
 * Run with: npx tsx scripts/count-sitemap-urls.ts
 */

import "dotenv/config";
import prisma from "../lib/prisma";

async function countSitemapUrls() {
  console.log("📊 Counting sitemap URLs...\n");

  // Count categories
  const categoryCount = await prisma.category.count();
  console.log(`📁 Categories: ${categoryCount}`);

  // Count products
  const productCount = await prisma.product.count();
  console.log(`👕 Products: ${productCount}`);

  // Calculate URLs
  const locales = 2; // en, fr
  const staticPages = 7; // home, shop, about, contact, cart, privacy, terms

  const staticUrls = staticPages * locales;
  const categoryUrls = categoryCount * locales;
  const productUrls = productCount * locales;

  const totalUrls = staticUrls + categoryUrls + productUrls;

  console.log("\n📈 Sitemap URL Breakdown:");
  console.log("─".repeat(40));
  console.log(`  Static pages:    ${staticUrls} URLs (${staticPages} pages × ${locales} locales)`);
  console.log(`  Category pages:  ${categoryUrls} URLs (${categoryCount} categories × ${locales} locales)`);
  console.log(`  Product pages:   ${productUrls} URLs (${productCount} products × ${locales} locales)`);
  console.log("─".repeat(40));
  console.log(`  TOTAL:           ${totalUrls} URLs`);
  console.log("\n✅ Done!");

  await prisma.$disconnect();
}

countSitemapUrls().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
