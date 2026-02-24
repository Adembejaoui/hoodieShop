import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Post status type
type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';

// GET /api/blog/posts - List blog posts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as PostStatus | null;
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    // Only show published posts for non-admin users
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';
    
    if (!isAdmin) {
      where.status = 'PUBLISHED';
      where.publishedAt = { lte: new Date() };
    } else if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get posts with pagination
    const [posts, totalCount] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: skip + limit < totalCount,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST /api/blog/posts - Create a new blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      featuredImageAlt,
      metaTitle,
      metaDescription,
      status = 'DRAFT',
      scheduledAt,
    } = body;

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }

    // Calculate reading time (average 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Set publishedAt if status is PUBLISHED
    const publishedAt = status === 'PUBLISHED' ? new Date() : null;

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        featuredImageAlt,
        metaTitle,
        metaDescription,
        status: status as PostStatus,
        authorId: session.user.id,
        readingTime,
        publishedAt,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
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

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
