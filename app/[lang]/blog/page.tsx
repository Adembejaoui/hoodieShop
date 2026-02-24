import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';
import { baseUrl, locales } from '@/lib/config';
import { BlogCard } from '@/components/blog/blog-card';

interface BlogPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
}

// Blog post type for the component
interface BlogPostWithAuthor {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  readingTime: number;
  viewCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'blog' });

  const languageAlternates: Record<string, string> = {};
  for (const locale of locales) {
    languageAlternates[locale] = `${baseUrl}/${locale}/blog`;
  }

  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    alternates: {
      canonical: `${baseUrl}/${lang}/blog`,
      languages: languageAlternates,
    },
    openGraph: {
      title: t('pageTitle'),
      description: t('pageDescription'),
      type: 'website',
      url: `${baseUrl}/${lang}/blog`,
    },
  };
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { lang } = await params;
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1');
  const limit = 9;
  const skip = (page - 1) * limit;

  const t = await getTranslations({ locale: lang, namespace: 'blog' });

  // Fetch published posts
  const [posts, totalCount] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
      },
      skip,
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }) as Promise<BlogPostWithAuthor[]>,
    prisma.blogPost.count({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: new Date() },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Animated Gradient */}
      <section className="relative overflow-hidden py-20 md:py-28">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/10 animate-gradient" />
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Blog & News</span>
            </div>
            
            {/* Title with gradient text */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
              {t('title')}
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-slide-up animation-delay-200">
              {t('subtitle')}
            </p>
            
            {/* Decorative line */}
            <div className="mt-10 flex justify-center animate-fade-in animation-delay-300">
              <div className="w-24 h-1 rounded-full bg-gradient-to-r from-primary to-secondary" />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted))_1px,transparent_0)] bg-[size:40px_40px] opacity-30" />
        
        <div className="container mx-auto px-4 relative z-10">
          {posts.length === 0 ? (
            <div className="text-center py-24 animate-fade-in">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-xl text-muted-foreground">
                {t('noPosts')}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post: BlogPostWithAuthor, index: number) => (
                  <div 
                    key={post.id} 
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <BlogCard post={post} lang={lang} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-16 animate-fade-in">
                  {page > 1 && (
                    <Link
                      href={`/${lang}/blog?page=${page - 1}`}
                      className="group flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                    >
                      <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      {t('previous')}
                    </Link>
                  )}
                  
                  <div className="flex items-center gap-2 px-4">
                    <span className="text-lg font-medium">{page}</span>
                    <span className="text-muted-foreground">{t('of')}</span>
                    <span className="text-lg font-medium">{totalPages}</span>
                  </div>
                  
                  {page < totalPages && (
                    <Link
                      href={`/${lang}/blog?page=${page + 1}`}
                      className="group flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                    >
                      {t('next')}
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
