export interface Product {
  id: string
  name: string
  price: number
  image: string
  imageBack?: string
  printType: 'front' | 'back' | 'both'
  badge?: string
  rating: number
  reviews: number
  series: string
  sizes: string[]
  colors: string[]
  description: string
  inStock: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  image: string
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Sakura Blossom Hoodie',
    price: 79.99,
    image: '',
    imageBack: '',
    printType: 'both',
    badge: 'New',
    rating: 4.8,
    reviews: 234,
    series: 'Cherry Blossom',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Pink', 'Purple', 'Black'],
    description: 'Premium cotton hoodie featuring elegant cherry blossom artwork. Perfect for any anime fan.',
    inStock: true,
  },
  {
    id: '2',
    name: 'Midnight Samurai Hoodie',
    price: 89.99,
    image: '',
    printType: 'front',
    badge: 'Limited',
    rating: 4.9,
    reviews: 456,
    series: 'Samurai Soul',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy', 'Red'],
    description: 'Bold samurai-inspired design with intricate embroidery. Limited edition drop.',
    inStock: true,
  },
  {
    id: '3',
    name: 'Dragon Legacy Hoodie',
    price: 84.99,
    image: '',
    imageBack: '',
    printType: 'both',
    badge: 'Hot',
    rating: 4.7,
    reviews: 189,
    series: 'Dragon Tales',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Gold', 'Silver', 'Black'],
    description: 'Majestic dragon artwork with metallic accents. Ultra-soft premium cotton blend.',
    inStock: true,
  },
  {
    id: '4',
    name: 'Neon Cyberpunk Hoodie',
    price: 94.99,
    image: '',
    printType: 'back',
    badge: 'Trending',
    rating: 4.6,
    reviews: 312,
    series: 'Cyber Drift',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Neon Pink', 'Cyan', 'Purple'],
    description: 'Futuristic cyberpunk design with glow-in-the-dark elements. Perfect for night vibes.',
    inStock: true,
  },
  {
    id: '5',
    name: 'Mystical Phoenix Hoodie',
    price: 99.99,
    image: '',
    imageBack: '',
    printType: 'both',
    badge: 'Exclusive',
    rating: 5.0,
    reviews: 178,
    series: 'Phoenix Rising',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Red', 'Orange', 'Gold'],
    description: 'Exclusive phoenix design with embroidered fire details. Premium collector edition.',
    inStock: true,
  },
  {
    id: '6',
    name: 'Ocean Serenity Hoodie',
    price: 74.99,
    image: '',
    printType: 'front',
    badge: 'Limited',
    rating: 4.5,
    reviews: 145,
    series: 'Blue Waves',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Ocean Blue', 'Teal', 'White'],
    description: 'Serene ocean-inspired artwork perfect for chill vibes. Comfortable and breathable.',
    inStock: true,
  },
]

export const categories: Category[] = [
  {
    id: '1',
    name: 'Cherry Blossom',
    slug: 'cherry-blossom',
    image: 'https://pmsy56qp4f.ufs.sh/f/kX9qmKHfPtiXWCG6VHgmOFcARHaUMWT6kqr1w7S0bN29Yxji',
  },
  {
    id: '2',
    name: 'Samurai Soul',
    slug: 'samurai-soul',
    image: 'https://pmsy56qp4f.ufs.sh/f/kX9qmKHfPtiXWCG6VHgmOFcARHaUMWT6kqr1w7S0bN29Yxji',
  },
  {
    id: '3',
    name: 'Dragon Tales',
    slug: 'dragon-tales',
    image: 'https://pmsy56qp4f.ufs.sh/f/kX9qmKHfPtiXWCG6VHgmOFcARHaUMWT6kqr1w7S0bN29Yxji',
  },
  {
    id: '4',
    name: 'Cyber Drift',
    slug: 'cyber-drift',
    image: 'https://pmsy56qp4f.ufs.sh/f/kX9qmKHfPtiXWCG6VHgmOFcARHaUMWT6kqr1w7S0bN29Yxji',
  },
]

export const benefits = [
  {
    icon: '🧵',
    title: 'Premium Cotton',
    description: '100% premium cotton blend for maximum comfort',
  },
  {
    icon: '⚡',
    title: 'Fast Delivery',
    description: 'Free shipping , delivered in 3-5 days',
  },
  {
    icon: '🎨',
    title: 'Limited Drops',
    description: 'Exclusive designs available for limited time only',
  },
  {
    icon: '💎',
    title: 'Premium Quality',
    description: 'Hand-stitched details and premium embroidery',
  },
]

export const dashboardStats = {
  totalOrders: 1243,
  totalProducts: 48,
  totalUsers: 5234,
  revenue: 125430,
  ordersTrend: 12.5,
  usersTrend: 8.3,
  revenueTrend: 15.2,
}

export const dashboardProducts = [
  {
    id: '1',
    name: 'Sakura Blossom Hoodie',
    series: 'Cherry Blossom',
    price: 79.99,
    stock: 234,
    sales: 1203,
    status: 'Active',
  },
  {
    id: '2',
    name: 'Midnight Samurai Hoodie',
    series: 'Samurai Soul',
    price: 89.99,
    stock: 123,
    sales: 890,
    status: 'Active',
  },
  {
    id: '3',
    name: 'Dragon Legacy Hoodie',
    series: 'Dragon Tales',
    price: 84.99,
    stock: 45,
    sales: 567,
    status: 'Low Stock',
  },
  {
    id: '4',
    name: 'Neon Cyberpunk Hoodie',
    series: 'Cyber Drift',
    price: 94.99,
    stock: 0,
    sales: 423,
    status: 'Out of Stock',
  },
  {
    id: '5',
    name: 'Mystical Phoenix Hoodie',
    series: 'Phoenix Rising',
    price: 99.99,
    stock: 89,
    sales: 234,
    status: 'Active',
  },
  {
    id: '6',
    name: 'Ocean Serenity Hoodie',
    series: 'Blue Waves',
    price: 74.99,
    stock: 156,
    sales: 198,
    status: 'Active',
  },
]
