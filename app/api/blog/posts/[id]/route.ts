import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/blog/posts/[id] - Get a single blog post by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try to find by ID first, then by slug
    const post = await prisma.blogPost.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
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
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user can view this post
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';
    
    if (post.status !== 'PUBLISHED' && !isAdmin) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment view count for published posts
    if (post.status === 'PUBLISHED') {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT /api/blog/posts/[id] - Update a blog post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      status,
      scheduledAt,
    } = body;

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if new slug conflicts with another post
    if (slug && slug !== existingPost.slug) {
      const slugConflict = await prisma.blogPost.findUnique({
        where: { slug },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Calculate reading time if content changed
    let readingTime = existingPost.readingTime;
    if (content) {
      const wordCount = content.split(/\s+/).length;
      readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    // Handle publishedAt
    let publishedAt = existingPost.publishedAt;
    if (status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
      publishedAt = new Date();
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        featuredImageAlt,
        metaTitle,
        metaDescription,
        status,
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

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/posts/[id] - Delete a blog post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
