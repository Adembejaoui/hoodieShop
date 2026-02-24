'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  ArrowLeft, Save, Eye, Calendar, Clock,
  Image, FileText, Loader2
} from 'lucide-react';
import { Link } from '@/i18n/routing';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  status: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  readingTime: number;
}

export default function BlogEditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    featuredImageAlt: '',
    metaTitle: '',
    metaDescription: '',
    status: 'DRAFT',
    scheduledAt: '',
  });

  const fetchPost = useCallback(async () => {
    if (isNew) return;

    try {
      const response = await fetch(`/api/blog/posts/${params.id}`);
      if (response.ok) {
        const post: BlogPost = await response.json();
        setFormData({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || '',
          content: post.content,
          featuredImage: post.featuredImage || '',
          featuredImageAlt: post.featuredImageAlt || '',
          metaTitle: post.metaTitle || '',
          metaDescription: post.metaDescription || '',
          status: post.status,
          scheduledAt: post.scheduledAt ? post.scheduledAt.slice(0, 16) : '',
        });
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  }, [isNew, params.id]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    }));
  };

  const handleSave = async (publish: boolean = false) => {
    setSaving(true);

    try {
      const data = {
        ...formData,
        status: publish ? 'PUBLISHED' : formData.status,
        publishedAt: publish ? new Date().toISOString() : undefined,
      };

      const url = isNew ? '/api/blog/posts' : `/api/blog/posts/${params.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const savedPost = await response.json();
        if (isNew) {
          router.push(`/admin/dashboard/blog/${savedPost.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setSaving(false);
    }
  };

  // Calculate reading time
  const readingTime = Math.max(1, Math.ceil(formData.content.split(/\s+/).length / 200));

  if (status === 'loading' || session?.user?.role !== 'ADMIN' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard/blog"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? 'New Post' : 'Edit Post'}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {readingTime} min read
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-card border border-border rounded-lg p-4">
            <input
              type="text"
              placeholder="Post title..."
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Slug */}
          <div className="bg-card border border-border rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              placeholder="post-url-slug"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-card border border-border rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Excerpt</label>
            <textarea
              placeholder="Brief description for SEO and previews..."
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Content */}
          <div className="bg-card border border-border rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Content (HTML)</label>
            <textarea
              placeholder="Write your post content in HTML..."
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              rows={20}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-4">Status</h3>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Featured Image */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Featured Image
            </h3>
            <input
              type="text"
              placeholder="Image URL"
              value={formData.featuredImage}
              onChange={(e) => setFormData((prev) => ({ ...prev, featuredImage: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-2"
            />
            <input
              type="text"
              placeholder="Alt text"
              value={formData.featuredImageAlt}
              onChange={(e) => setFormData((prev) => ({ ...prev, featuredImageAlt: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formData.featuredImage && (
              <img
                src={formData.featuredImage}
                alt={formData.featuredImageAlt || 'Featured'}
                className="mt-4 w-full aspect-video object-cover rounded-lg"
              />
            )}
          </div>

          {/* SEO */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Meta Title</label>
                <input
                  type="text"
                  placeholder="SEO title (defaults to post title)"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Meta Description</label>
                <textarea
                  placeholder="SEO description (defaults to excerpt)"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </h3>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
