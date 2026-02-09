import { PrismaClient, PrintPosition } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

// Hoodie image URLs provided by user - base print URLs
const BACK_PRINT_URLS = [
  "https://pmsy56qp4f.ufs.sh/f/kX9qmKHfPtiXlE9xUfhZvWGhS9aQkE6PqrjZLeisIRyz3Twp",
  "https://pmsy56qp4f.ufs.sh/f/kX9qmKHfPtiXtXAm5YgycTtoMk6NZBOJ0m1iQUlXvdIEV7Rn",
  "https://pmsy56qp4f.ufs.sh/f/kX9qmKHfPtiX9EQsel4u2Ph3iDKexW1pAwsFTCG8dUvJEtyf",
];

const FRONT_PRINT_URLS = [
  "https://pmsy56qp4f.ufs.sh/f/kX9qmKHfPtiXhop25RlKrjNIE7C4zYk3tPl6VOT8DcWwvAGh",
  "https://pmsy56qp4f.ufs.sh/f/kX9qmKHfPtiXEes6HwkGHFcC7sTIztnmLAkPMOE953beurVo",
  "https://pmsy56qp4f.ufs.sh/f/kX9qmKHfPtiXb4YzzBSqKC9uwdsS37l5t8kWmIUGa0TVL4yv",
];

// Hoodie base color images - different colors of hoodies
// Using the same print URLs from FRONT_PRINT_URLS and BACK_PRINT_URLS
const HOODIE_BASE_URLS: Record<string, { front: string; back: string }> = {
  Black: {
    front: FRONT_PRINT_URLS[0],
    back: BACK_PRINT_URLS[0],
  },
  White: {
    front: FRONT_PRINT_URLS[1],
    back: BACK_PRINT_URLS[1],
  },
  Gray: {
    front: FRONT_PRINT_URLS[2],
    back: BACK_PRINT_URLS[2],
  },
};

// Seed data structure
const categories = [
  {
    name: "One Piece",
    slug: "one-piece",
    description: "One Piece anime merchandise",
    imageURL:
      "https://pmsy56qp4f.ufs.sh/f/kX9qmKHfPtiXPGhe5LNoIcbTR4VlDapMhvOtuG1PjrJg8iwd",
  },
  {
    name: "Naruto",
    slug: "naruto",
    description: "Naruto anime merchandise",
    imageURL:
      "https://pmsy56qp4f.ufs.sh/f/kX9qmKHfPtiXrZQ2qCdhJmugwfAHdlMV2rFjzcBt497PLZix",
  },
  {
    name: "Demon Slayer",
    slug: "demon-slayer",
    description: "Demon Slayer anime merchandise",
    imageURL:
      "https://pmsy56qp4f.ufs.sh/f/kX9qmKHfPtiXWCG6VHgmOFcARHaUMWT6kqr1w7S0bN29Yxji",
  },
  {
    name: "Attack on Titan",
    slug: "attack-on-titan",
    description: "Attack on Titan anime merchandise",
    imageURL:
      "https://pmsy56qp4f.ufs.sh/f/kX9qmKHfPtiXPGhe5LNoIcbTR4VlDapMhvOtuG1PjrJg8iwd",
  },
  {
    name: "My Hero Academia",
    slug: "my-hero-academia",
    description: "My Hero Academia anime merchandise",
    imageURL:
      "https://pmsy56qp4f.ufs.sh/f/kX9qmKHfPtiXrZQ2qCdhJmugwfAHdlMV2rFjzcBt497PLZix",
  },
];

// Products for each category with user-provided hoodie URLs
// Note: Print images are now assigned per variant (per color)
const productsData: Record<
  string,
  Array<{
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    printPosition: PrintPosition;
  }>
> = {
  "one-piece": [
    {
      name: "Luffy Gear 5 Hoodie",
      slug: "luffy-gear-5-hoodie",
      description: "Premium hoodie featuring Luffy's Gear 5 transformation",
      basePrice: 79.99,
      printPosition: "BOTH",
    },
    {
      name: "Zoro Bandana Hoodie",
      slug: "zoro-bandana-hoodie",
      description: "Hoodie with Zoro's iconic green bandana design",
      basePrice: 69.99,
      printPosition: "FRONT",
    },
    {
      name: "Sanji Cooking Hoodie",
      slug: "sanji-cooking-hoodie",
      description: "Hoodie featuring Sanji's cooking theme",
      basePrice: 69.99,
      printPosition: "BOTH",
    },
    {
      name: "Pirate Skull Hoodie",
      slug: "pirate-skull-hoodie",
      description: "Classic pirate skull and crossbones design",
      basePrice: 59.99,
      printPosition: "BACK",
    },
  ],
  "naruto": [
    {
      name: "Naruto Rasengan Hoodie",
      slug: "naruto-rasengan-hoodie",
      description: "Hoodie featuring Naruto's iconic Rasengan",
      basePrice: 79.99,
      printPosition: "BOTH",
    },
    {
      name: "Sasuke Sharingan Hoodie",
      slug: "sasuke-sharingan-hoodie",
      description: "Hoodie with Sasuke's Sharingan design",
      basePrice: 69.99,
      printPosition: "FRONT",
    },
    {
      name: "Akatsuki Cloud Hoodie",
      slug: "akatsuki-cloud-hoodie",
      description: "Akatsuki cloud design hoodie",
      basePrice: 89.99,
      printPosition: "BOTH",
    },
    {
      name: "Itachi Uchiha Hoodie",
      slug: "itachi-uchiha-hoodie",
      description: "Hoodie with Itachi's Uchiha crest",
      basePrice: 79.99,
      printPosition: "BOTH",
    },
  ],
  "demon-slayer": [
    {
      name: "Tanjiro Hinokami Hoodie",
      slug: "tanjiro-hinokami-hoodie",
      description: "Hoodie featuring Tanjiro's Hinokami Kagura",
      basePrice: 79.99,
      printPosition: "BOTH",
    },
    {
      name: "Zenitsu Thunder Hoodie",
      slug: "zenitsu-thunder-hoodie",
      description: "Hoodie with Zenitsu's lightning bolt",
      basePrice: 69.99,
      printPosition: "FRONT",
    },
    {
      name: "Nezuko Demon Hoodie",
      slug: "nezuko-demon-hoodie",
      description: "Hoodie with Nezuko's bamboo muzzle design",
      basePrice: 74.99,
      printPosition: "BOTH",
    },
    {
      name: "Water Breathing Hoodie",
      slug: "water-breathing-hoodie",
      description: "Water breathing pattern hoodie",
      basePrice: 64.99,
      printPosition: "BACK",
    },
  ],
  "attack-on-titan": [
    {
      name: "Survey Corps Hoodie",
      slug: "survey-corps-hoodie",
      description: "Hoodie featuring the Survey Corps wings",
      basePrice: 79.99,
      printPosition: "BOTH",
    },
    {
      name: "Eren Founding Hoodie",
      slug: "eren-founding-hoodie",
      description: "Hoodie with Eren's founding titan form",
      basePrice: 89.99,
      printPosition: "BOTH",
    },
    {
      name: "Levi Ackerman Hoodie",
      slug: "levi-ackerman-hoodie",
      description: "Hoodie featuring Levi's survey corps uniform",
      basePrice: 79.99,
      printPosition: "FRONT",
    },
    {
      name: "Titan Shifters Hoodie",
      slug: "titan-shifters-hoodie",
      description: "Hoodie with titan shifter emblem",
      basePrice: 74.99,
      printPosition: "BOTH",
    },
  ],
  "my-hero-academia": [
    {
      name: "All Might Symbol Hoodie",
      slug: "all-might-symbol-hoodie",
      description: "Hoodie featuring All Might's hero symbol",
      basePrice: 79.99,
      printPosition: "BOTH",
    },
    {
      name: "Midoriya Deku Hoodie",
      slug: "midoriya-deku-hoodie",
      description: "Hoodie with Midoriya's Plus Ultra design",
      basePrice: 69.99,
      printPosition: "BOTH",
    },
    {
      name: "Bakugo Explosion Hoodie",
      slug: "bakugo-explosion-hoodie",
      description: "Hoodie featuring Bakugo's explosion quirk",
      basePrice: 69.99,
      printPosition: "FRONT",
    },
    {
      name: "Todoroki Half-Cold Hoodie",
      slug: "todoroki-half-cold-hoodie",
      description: "Hoodie with Todoroki's dual quirk design",
      basePrice: 74.99,
      printPosition: "BOTH",
    },
  ],
};

// Size and color variants for hoodies with print images per color
const sizeVariantData = [
  { color: "Black", size: "S", priceModifier: 0, stockQty: 10, frontImageURL: HOODIE_BASE_URLS["Black"].front, backImageURL: HOODIE_BASE_URLS["Black"].back },
  { color: "Black", size: "M", priceModifier: 0, stockQty: 15, frontImageURL: HOODIE_BASE_URLS["Black"].front, backImageURL: HOODIE_BASE_URLS["Black"].back },
  { color: "Black", size: "L", priceModifier: 0, stockQty: 12, frontImageURL: HOODIE_BASE_URLS["Black"].front, backImageURL: HOODIE_BASE_URLS["Black"].back },
  { color: "Black", size: "XL", priceModifier: 5, stockQty: 8, frontImageURL: HOODIE_BASE_URLS["Black"].front, backImageURL: HOODIE_BASE_URLS["Black"].back },
  { color: "Black", size: "XXL", priceModifier: 5, stockQty: 5, frontImageURL: HOODIE_BASE_URLS["Black"].front, backImageURL: HOODIE_BASE_URLS["Black"].back },
  { color: "White", size: "S", priceModifier: 0, stockQty: 8, frontImageURL: HOODIE_BASE_URLS["White"].front, backImageURL: HOODIE_BASE_URLS["White"].back },
  { color: "White", size: "M", priceModifier: 0, stockQty: 12, frontImageURL: HOODIE_BASE_URLS["White"].front, backImageURL: HOODIE_BASE_URLS["White"].back },
  { color: "White", size: "L", priceModifier: 0, stockQty: 10, frontImageURL: HOODIE_BASE_URLS["White"].front, backImageURL: HOODIE_BASE_URLS["White"].back },
  { color: "White", size: "XL", priceModifier: 5, stockQty: 6, frontImageURL: HOODIE_BASE_URLS["White"].front, backImageURL: HOODIE_BASE_URLS["White"].back },
  { color: "White", size: "XXL", priceModifier: 5, stockQty: 4, frontImageURL: HOODIE_BASE_URLS["White"].front, backImageURL: HOODIE_BASE_URLS["White"].back },
  { color: "Gray", size: "S", priceModifier: 0, stockQty: 6, frontImageURL: HOODIE_BASE_URLS["Gray"].front, backImageURL: HOODIE_BASE_URLS["Gray"].back },
  { color: "Gray", size: "M", priceModifier: 0, stockQty: 10, frontImageURL: HOODIE_BASE_URLS["Gray"].front, backImageURL: HOODIE_BASE_URLS["Gray"].back },
  { color: "Gray", size: "L", priceModifier: 0, stockQty: 8, frontImageURL: HOODIE_BASE_URLS["Gray"].front, backImageURL: HOODIE_BASE_URLS["Gray"].back },
  { color: "Gray", size: "XL", priceModifier: 5, stockQty: 5, frontImageURL: HOODIE_BASE_URLS["Gray"].front, backImageURL: HOODIE_BASE_URLS["Gray"].back },
];

// Sample coupons for testing
const coupons = [
  {
    code: "WELCOME10",
    description: "10% off your first order",
    type: "PERCENTAGE" as const,
    value: 10,
    minOrderAmount: 50,
    maxUses: 100,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  },
  {
    code: "FLAT20",
    description: "$20 off orders over $100",
    type: "FIXED" as const,
    value: 20,
    minOrderAmount: 100,
    maxUses: 50,
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
  },
];

async function main() {
  console.log("🌱 Starting seed...");

  try {
    // Clean up existing data
    console.log("🧹 Cleaning up existing data...");
    await prisma.variant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    // Create categories
    console.log("📁 Creating categories...");
    const createdCategories = await Promise.all(
      categories.map((category) =>
        prisma.category.create({
          data: category,
        })
      )
    );
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create products and variants for each category
    for (const category of createdCategories) {
      const categoryProducts = productsData[category.slug];

      if (!categoryProducts) {
        console.warn(`⚠️ No products found for category: ${category.slug}`);
        continue;
      }

      console.log(
        `🎨 Creating products for ${category.name}...`
      );

      // Assign print images based on category index
      const categoryIndex = createdCategories.findIndex(c => c.id === category.id);
      const frontPrint = FRONT_PRINT_URLS[categoryIndex % FRONT_PRINT_URLS.length];
      const backPrint = BACK_PRINT_URLS[categoryIndex % BACK_PRINT_URLS.length];

      for (const productData of categoryProducts) {
        const product = await prisma.product.create({
          data: {
            name: productData.name,
            slug: productData.slug,
            description: productData.description,
            basePrice: productData.basePrice,
            printPosition: productData.printPosition,
            categoryId: category.id,
          },
        });

        // Create variants with print images per color
        const variants = sizeVariantData.map((variant) => ({
          productId: product.id,
          color: variant.color,
          size: variant.size,
          price: productData.basePrice + variant.priceModifier,
          stockQty: variant.stockQty,
          // Use base hoodie color images with print overlays
          frontImageURL: variant.frontImageURL,
          backImageURL: variant.backImageURL,
        }));

        await prisma.variant.createMany({
          data: variants,
        });

        console.log(`  ✅ Created product: ${product.name}`);
      }
    }

    // Create coupons
    console.log("🏷️ Creating coupons...");
    for (const coupon of coupons) {
      await prisma.coupon.upsert({
        where: { code: coupon.code },
        update: {},
        create: {
          code: coupon.code,
          description: coupon.description,
          type: coupon.type,
          value: coupon.value,
          minOrderAmount: coupon.minOrderAmount,
          maxUses: coupon.maxUses,
          expiresAt: coupon.expiresAt,
        },
      });
      console.log(`  ✅ Created/updated coupon: ${coupon.code}`);
    }

    console.log("🎉 Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
