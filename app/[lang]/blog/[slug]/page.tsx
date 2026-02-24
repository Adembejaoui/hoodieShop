import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';
import { baseUrl, locales } from '@/lib/config';
import { Calendar, Clock, User, Eye, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { BlogContent } from '@/components/blog/blog-content';

interface BlogPostPageProps {
  params: Promise<{ lang: string; slug: string }>;
}

// Generate static params for all published posts
export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
    },
    select: { slug: true },
  });

  const params: { lang: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const post of posts) {
      params.push({ lang: locale, slug: post.slug });
    }
  }
  return params;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { lang, slug } = await params;

  const post = await prisma.blogPost.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!post) {
    return {
      title: 'Post not found',
    };
  }

  const languageAlternates: Record<string, string> = {};
  for (const locale of locales) {
    languageAlternates[locale] = `${baseUrl}/${locale}/blog/${slug}`;
  }

  const metaTitle = post.metaTitle || post.title;
  const metaDescription = post.metaDescription || post.excerpt || '';

  return {
    title: metaTitle,
    description: metaDescription,
    authors: [{ name: post.author.name || 'Anonymous' }],
    alternates: {
      canonical: `${baseUrl}/${lang}/blog/${slug}`,
      languages: languageAlternates,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'article',
      url: `${baseUrl}/${lang}/blog/${slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name || 'Anonymous'],
      images: post.featuredImage
        ? [
            {
              url: post.featuredImage,
              width: 1200,
              height: 630,
              alt: post.featuredImageAlt || post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { lang, slug } = await params;

  const post = await prisma.blogPost.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // Increment view count
  await prisma.blogPost.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  });

  const t = await getTranslations({ locale: lang, namespace: 'blog' });

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  // JSON-LD structured data for article
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    image: post.featuredImage || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name || 'Anonymous',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Hoodiz Tunisia',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/${lang}/blog/${slug}`,
    },
  };

  return (
    <article className="min-h-screen bg-background">
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Hero Section with animated gradient */}
      <header className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-zinc-500/10 animate-gradient" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative container mx-auto px-4 max-w-4xl py-16 md:py-24">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 animate-fade-in">
            <Link href={`/${lang}`} className="hover:text-primary transition-colors duration-300">
              {t('home')}
            </Link>
            <span className="text-primary/50">/</span>
            <Link href={`/${lang}/blog`} className="hover:text-primary transition-colors duration-300">
              {t('blog')}
            </Link>
            <span className="text-primary/50">/</span>
            <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-slide-up">
            <Sparkles className="w-4 h-4" />
            <span>Featured Article</span>
          </div>

          {/* Title with gradient text effect */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-slide-up animation-delay-100">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
              {post.title}
            </span>
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl animate-slide-up animation-delay-200">
              {post.excerpt}
            </p>
          )}

          {/* Meta info with modern design */}
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground animate-slide-up animation-delay-300">
            {/* Author */}
            <div className="flex items-center gap-3 group">
              <div className="relative">
                {post.author.image ? (
                  <img
                    src={post.author.image}
                    alt={post.author.name || 'Author'}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  HOODIZ
                </p>
                <p className="text-sm">Author</p>
              </div>
            </div>

            <div className="h-8 w-px bg-border hidden sm:block" />

            {/* Date */}
            {formattedDate && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{formattedDate}</span>
              </div>
            )}

            {/* Reading time */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{post.readingTime} {t('minRead')}</span>
            </div>

            {/* View count */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{post.viewCount} {t('views')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image with parallax effect */}
      {post.featuredImage && (
        <div className="relative -mt-4 mb-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 group">
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent z-10" />
              <img
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content with modern styling */}
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="relative">
          {/* Decorative element */}
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full hidden lg:block" />
          
          <BlogContent content={post.content} />
        </div>
      </div>

      {/* Back to blog with modern button */}
      <div className="container mx-auto px-4 max-w-4xl pb-16">
        <Link
          href={`/blog`}
          className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all duration-300 font-medium"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          {t('backToBlog')}
        </Link>
      </div>
    </article>
  );
}
