'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  Plus, Search, Edit, Trash2, Eye, Calendar, 
  Clock, FileText, ChevronLeft, ChevronRight,
  MoreVertical, Check, X, AlertCircle
} from 'lucide-react';
import { Link } from '@/i18n/routing';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  publishedAt: string | null;
  readingTime: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AdminBlogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('admin');
  const tBlog = useTranslations('blog');

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; post: BlogPost | null }>({
    open: false,
    post: null,
  });

  const fetchPosts = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/api/blog/posts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleDelete = async () => {
    if (!deleteModal.post) return;

    try {
      const response = await fetch(`/api/blog/posts/${deleteModal.post.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter((p) => p.id !== deleteModal.post!.id));
        setDeleteModal({ open: false, post: null });
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      PUBLISHED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      ARCHIVED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.DRAFT}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (status === 'loading' || session?.user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Manage your blog posts</p>
        </div>
        <Link
          href="/admin/dashboard/blog/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mb-4" />
            <p>No posts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Author</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Published</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Views</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium line-clamp-1">{post.title}</p>
                        <p className="text-sm text-muted-foreground">{post.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(post.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {post.author.image ? (
                          <img
                            src={post.author.image}
                            alt={post.author.name || ''}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs">
                              {post.author.name?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                        <span className="text-sm">{post.author.name || 'Anonymous'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDate(post.publishedAt)}</td>
                    <td className="px-4 py-3 text-sm">{post.viewCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          target="_blank"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/dashboard/blog/${post.id}`}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ open: true, post })}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
              {pagination.totalCount} posts
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchPosts(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchPosts(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <h2 className="text-lg font-semibold">Delete Post</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete "{deleteModal.post?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, post: null })}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
