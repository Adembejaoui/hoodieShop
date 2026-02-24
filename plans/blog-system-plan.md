# Blog System Architecture Plan

## Overview
A blog system with rich content, SEO metadata, and scheduled publishing for the Hoodiz e-commerce platform.

## Database Schema

### New Models to Add

```prisma
// Blog Post Status Enum
enum PostStatus {
  DRAFT
  PUBLISHED
  SCHEDULED
  ARCHIVED
}

// Blog Post Model
model BlogPost {
  id              String        @id @default(cuid())
  title           String
  slug            String        @unique
  excerpt         String?       @db.Text
  content         String        @db.Text
  featuredImage   String?
  featuredImageAlt String?
  
  // SEO
  metaTitle       String?
  metaDescription String?
  
  // Author
  authorId        String
  author          User          @relation(fields: [authorId], references: [id])
  
  // Publishing
  status          PostStatus    @default(DRAFT)
  publishedAt     DateTime?
  scheduledAt     DateTime?
  
  // Reading time in minutes - calculated
  readingTime     Int           @default(5)
  
  // View count for analytics
  viewCount       Int           @default(0)
  
  // Timestamps
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([status])
  @@index([publishedAt])
  @@index([authorId])
  @@map("blog_posts")
}
```

### Update User Model

Add this relation to the existing User model:

```prisma
model User {
  // ... existing fields ...
  
  // Blog relations
  blogPosts     BlogPost[]
  
  // ... rest of model ...
}
```

## File Structure

```
app/
├── [lang]/
│   ├── blog/
│   │   ├── page.tsx                    # Blog list page
│   │   └── [slug]/
│   │       └── page.tsx                # Blog post detail page
│   └── admin/
│       └── dashboard/
│           └── blog/
│               └── page.tsx            # Manage posts

app/api/
├── blog/
│   ├── posts/
│   │   └── route.ts                   # GET posts, POST new post
│   └── posts/[id]/
│       └── route.ts                   # GET, PUT, DELETE single post

components/
├── blog/
│   ├── blog-card.tsx                  # Blog post card component
│   ├── blog-content.tsx               # Rich content renderer
│   └── blog-pagination.tsx            # Pagination component
```

## Features

### Blog Posts
- CRUD operations for posts
- Rich text content (HTML/Markdown)
- Featured image with alt text
- SEO metadata (title, description)
- Scheduled publishing
- Draft/Published/Archived states
- Reading time calculation
- View count tracking

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/blog/posts | List published posts |
| GET | /api/blog/posts/[slug] | Get single post by slug |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/blog/posts | List all posts |
| POST | /api/admin/blog/posts | Create post |
| PUT | /api/admin/blog/posts/[id] | Update post |
| DELETE | /api/admin/blog/posts/[id] | Delete post |

## Implementation Steps

1. Add Prisma schema models
2. Run migration
3. Create blog API routes
4. Create blog list page
5. Create blog post detail page
6. Create admin blog management page
7. Add blog to sitemap

## Notes

- All blog content should support i18n (English/French)
- Consider using a rich text editor like TipTap or Lexical for admin
- Add image optimization for featured images
