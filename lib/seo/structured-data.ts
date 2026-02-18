import { baseUrl, logoUrl, businessInfo } from '@/lib/config';

// Organization Schema
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: businessInfo.name,
    description: businessInfo.description,
    url: baseUrl,
    logo: logoUrl,
    image: `${baseUrl}/images/og-image.jpg`,
    telephone: businessInfo.phone,
    email: businessInfo.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: businessInfo.address.street,
      addressLocality: businessInfo.address.city,
      postalCode: businessInfo.address.postalCode,
      addressCountry: businessInfo.address.countryCode,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    priceRange: businessInfo.priceRange,
    paymentAccepted: 'Cash, Credit Card, PayPal',
    currenciesAccepted: businessInfo.currency,
    areaServed: {
      '@type': 'Place',
      name: 'Tunisia',
    },
    sameAs: [
      businessInfo.socialLinks.facebook,
      businessInfo.socialLinks.twitter,
      businessInfo.socialLinks.instagram,
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
  locale?: string;
}) {
  const price = typeof product.basePrice === 'string' 
    ? parseFloat(product.basePrice) 
    : product.basePrice;
  
  const image = product.colors?.[0]?.frontImageURL || product.image || `${baseUrl}/images/products/${product.slug}.jpg`;
  const locale = product.locale || 'en';

  // Calculate availability based on stock
  const totalStock = product.sizeStocks?.reduce((sum, size) => sum + size.stockQty, 0) || 0;
  const availability = totalStock > 0 
    ? 'https://schema.org/InStock' 
    : 'https://schema.org/OutOfStock';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Premium ${product.name} hoodie from ${businessInfo.name}.`,
    url: `${baseUrl}/${locale}/product/${product.categorySlug}/${product.slug}`,
    image: image,
    brand: {
      '@type': 'Brand',
      name: businessInfo.name,
    },
    sku: `${product.categorySlug}-${product.slug}`.toUpperCase(),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: businessInfo.currency,
      lowPrice: price,
      highPrice: price,
      price: price,
      availability: availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Store',
        name: businessInfo.name,
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
  locale?: string;
}) {
  const locale = category.locale || 'en';
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description || `Browse our collection of ${category.name} hoodies and merchandise.`,
    url: `${baseUrl}/${locale}/product/${category.slug}`,
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
      name: article.author || `${businessInfo.name} Team`,
    },
    publisher: {
      '@type': 'Organization',
      name: businessInfo.name,
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
