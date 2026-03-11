/**
 * components/PostCard.jsx
 * Reusable card — all styles in globals.css under .post-card
 */

import Link from 'next/link';
import { getFeaturedImage, getAuthorName, formatDate, decodeHtml } from '@/lib/api';

export default function PostCard({ post, size = 'default' }) {
  if (!post) return null;

  const image = getFeaturedImage(post);
  const author = getAuthorName(post);
  const date = formatDate(post.date);
  const title = decodeHtml(post.title?.rendered || '');
  const excerpt = decodeHtml(
    (post.excerpt?.rendered || '')
      .replace(/<[^>]+>/g, '')
      .replace(/\[&hellip;\]/g, '…')
      .trim()
  );

  const postType = post.type || 'post';
  const href = postType === 'page' ? `/pages/${post.slug}` : `/posts/${post.slug}`;
  const categories = post._embedded?.['wp:term']?.[0] || [];
  const primaryCat = categories[0];

  return (
    <article className={`post-card post-card--${size}`}>
      {image && (
        <Link href={href} className="post-card-image-link" tabIndex={-1} aria-hidden="true">
          <div className="post-card-image-wrapper">
            <img src={image} alt={title} className="post-card-image" loading="lazy" />
          </div>
        </Link>
      )}
      <div className="post-card-body">
        {primaryCat && (
          <Link href={`/category/${primaryCat.slug}`} className="post-card-category">
            {primaryCat.name}
          </Link>
        )}
        <h2 className="post-card-title">
          <Link href={href}>{title}</Link>
        </h2>
        {size !== 'compact' && excerpt && (
          <p className="post-card-excerpt">
            {excerpt.slice(0, 160)}{excerpt.length > 160 ? '…' : ''}
          </p>
        )}
        <div className="post-card-meta">
          <span className="post-card-author">By {author}</span>
          <span className="post-card-sep" aria-hidden="true">•</span>
          <time dateTime={post.date} className="post-card-date">{date}</time>
        </div>
      </div>
    </article>
  );
}
