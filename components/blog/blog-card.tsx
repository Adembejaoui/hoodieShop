import { Link } from '@/i18n/routing';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface BlogPost {
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
  author: Author;
}

interface BlogCardProps {
  post: BlogPost;
  lang: string;
}

export function BlogCard({ post, lang }: BlogCardProps) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <article className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
      {/* Featured Image */}
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="aspect-video relative overflow-hidden bg-muted">
          {post.featuredImage ? (
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 via-primary/10 to-secondary/20">
              <span className="text-6xl font-bold text-primary/20 group-hover:scale-110 transition-transform duration-500">
                {post.title.charAt(0)}
              </span>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Read more indicator */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <span className="text-white text-sm font-medium">Read article</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6">
        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          {formattedDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary/70" />
              {formattedDate}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary/70" />
            {post.readingTime} min read
          </span>
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-muted-foreground line-clamp-2 mb-5 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Author & Read more */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            {post.author.image ? (
              <img
                src={post.author.image}
                alt={post.author.name || 'Author'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
            <span className="text-sm font-medium">
              HOODIZ
            </span>
          </div>
          
          <Link 
            href={`/blog/${post.slug}`}
            className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 hover:gap-2"
          >
            Read
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
