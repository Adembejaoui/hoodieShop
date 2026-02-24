'use client';

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {/* Render HTML content safely */}
      <div 
        dangerouslySetInnerHTML={{ __html: content }}
        className="blog-content"
      />
    </div>
  );
}
