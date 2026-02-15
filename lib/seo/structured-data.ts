const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hoodiz.com';
const logoUrl = 'https://bhxnlnpksfyqrvojlsfi.supabase.co/storage/v1/object/public/images/logoHoodiz.jpeg';

// Organization Schema
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Hoodiz',
    description: 'Premium anime hoodies and merchandise. Wear the power of anime.',
    url: baseUrl,
    logo: logoUrl,
    image: `${baseUrl}/images/og-image.jpg`,
    telephone: '+1-555-123-4567',
    email: 'support@hoodiz.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Anime Street',
      addressLocality: 'New York',
      addressRegion: 'NY',
      postalCode: '10001',
      addressCountry: 'US',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    priceRange: '$$',
    paymentAccepted: 'Cash, Credit Card, PayPal',
    currenciesAccepted: 'USD',
    areaServed: {
      '@type': 'Place',
      name: 'Worldwide',
    },
    sameAs: [
      'https://facebook.com/hoodiz',
      'https://twitter.com/hoodiz',
      'https://instagram.com/hoodiz',
    ],
  };
}

// WebSite Schema with Search
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Hoodiz',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Product Schema
export function getProductSchema(product: {
  name: string;
  description?: string | null;
  basePrice: number | string;
  slug: string;
  categorySlug: string;
  image?: string | null;
  colors?: { color: string; frontImageURL?: string | null; backImageURL?: string | null }[];
  sizeStocks?: { size: string; stockQty: number }[];
}) {
  const price = typeof product.basePrice === 'string' 
    ? parseFloat(product.basePrice) 
    : product.basePrice;
  
  const image = product.colors?.[0]?.frontImageURL || product.image || `${baseUrl}/images/products/${product.slug}.jpg`;

  // Calculate availability based on stock
  const totalStock = product.sizeStocks?.reduce((sum, size) => sum + size.stockQty, 0) || 0;
  const availability = totalStock > 0 
    ? 'https://schema.org/InStock' 
    : 'https://schema.org/OutOfStock';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Premium ${product.name} hoodie from Hoodiz.`,
    url: `${baseUrl}/shop/${product.categorySlug}/${product.slug}`,
    image: image,
    brand: {
      '@type': 'Brand',
      name: 'Hoodiz',
    },
    sku: `${product.categorySlug}-${product.slug}`.toUpperCase(),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: price,
      highPrice: price,
      price: price,
      availability: availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Store',
        name: 'Hoodiz',
        url: baseUrl,
      },
    },
  };
}

// Breadcrumb Schema
export function getBreadcrumbSchema(breadcrumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

// Collection/Category Schema
export function getCollectionSchema(category: {
  name: string;
  slug: string;
  description?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description || `Browse our collection of ${category.name} hoodies and merchandise.`,
    url: `${baseUrl}/shop/${category.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: 0, // Will be updated dynamically
    },
  };
}

// Article Schema (for blog posts if you have them)
export function getArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedAt: string;
  author?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: article.url,
    image: article.image || `${baseUrl}/images/articles/${article.url.split('/').pop()}.jpg`,
    datePublished: article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author || 'Hoodiz Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Hoodiz',
      logo: {
        '@type': 'ImageObject',
        url: logoUrl,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

// FAQ Schema
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
