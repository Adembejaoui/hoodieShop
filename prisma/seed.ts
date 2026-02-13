import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Anime Hoodies',
        slug: 'anime-hoodies',
        description: 'Hoodies featuring popular anime series',
        imageURL: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Gaming Hoodies',
        slug: 'gaming-hoodies',
        description: 'Hoodies for gaming enthusiasts',
        imageURL: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Minimalist',
        slug: 'minimalist',
        description: 'Simple and clean hoodie designs',
        imageURL: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create products for each category
  const products = await Promise.all([
    // Anime Hoodies products
    prisma.product.create({
      data: {
        name: 'Dragon Ball Z Hoodie',
        slug: 'dragon-ball-z-hoodie',
        description: 'Official Dragon Ball Z design hoodie',
        basePrice: 59.99,
        printPosition: 'BOTH',
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Naruto Ultimate Hoodie',
        slug: 'naruto-ultimate-hoodie',
        description: 'Ninja village exclusive design',
        basePrice: 64.99,
        printPosition: 'BOTH',
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'One Piece Treasure Hoodie',
        slug: 'one-piece-treasure-hoodie',
        description: 'Sail the seas with this design',
        basePrice: 59.99,
        printPosition: 'FRONT',
        categoryId: categories[0].id,
      },
    }),
    // Gaming Hoodies products
    prisma.product.create({
      data: {
        name: 'Gamer Life Hoodie',
        slug: 'gamer-life-hoodie',
        description: 'For serious gamers',
        basePrice: 49.99,
        printPosition: 'BOTH',
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Retro Gaming Hoodie',
        slug: 'retro-gaming-hoodie',
        description: 'Pixel art gaming nostalgia',
        basePrice: 54.99,
        printPosition: 'BACK',
        categoryId: categories[1].id,
      },
    }),
    // Minimalist products
    prisma.product.create({
      data: {
        name: 'Simple Logo Hoodie',
        slug: 'simple-logo-hoodie',
        description: 'Clean and minimal design',
        basePrice: 44.99,
        printPosition: 'FRONT',
        categoryId: categories[2].id,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create some coupons
  await Promise.all([
    prisma.coupon.create({
      data: {
        code: 'WELCOME10',
        description: '10% off your first order',
        type: 'PERCENTAGE',
        value: 10,
        minOrderAmount: 30,
        active: true,
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'HOODIE25',
        description: '25% off hoodies',
        type: 'PERCENTAGE',
        value: 25,
        minOrderAmount: 50,
        active: true,
      },
    }),
  ]);

  console.log('✅ Created coupons');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
