/**
 * app/posts/[slug]/page.jsx
 * Dynamic post page — Server Component.
 *
 * Fixes applied:
 * - params is now awaited (required in Next.js 15+)
 * - Added 10s timeout to fetch so slow WP responses don't hang silently
 * - Better error logging so you can see exactly what fails
 * - Hardcoded fallback WP URL in case env var is missing
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import parse from 'html-react-parser';
import {
  getFeaturedImage,
  getAuthorName,
  formatDate,
  decodeHtml,
  getPostCategories,
  getPostTags,
} from '@/lib/api';
import Comments from '@/components/Comments';

export const revalidate = 60;

// ─── Config ───────────────────────────────────────────────────────────────────

const WP_BASE =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  'http://localhost:10004/wp-json/wp/v2';

// ─── Fetcher with timeout ─────────────────────────────────────────────────────

async function fetchPost(slug) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const url = `${WP_BASE}/posts?slug=${encodeURIComponent(slug)}&_embed=true&status=publish`;
    console.log(`[PostPage] Fetching: ${url}`);

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timer);

    if (!res.ok) {
      console.error(`[PostPage] API responded ${res.status} for slug: "${slug}"`);
      return null;
    }

    const data = await res.json();
    console.log(`[PostPage] API returned ${data.length} result(s) for slug: "${slug}"`);

    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`[PostPage] No post found for slug: "${slug}"`);
      return null;
    }

    return data[0];
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error(`[PostPage] Fetch timed out for slug: "${slug}"`);
    } else {
      console.error(`[PostPage] fetchPost failed:`, err.message);
    }
    return null;
  }
}

async function fetchAllSlugs() {
  try {
    const res = await fetch(
      `${WP_BASE}/posts?per_page=100&status=publish&_fields=slug`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.map((p) => ({ slug: p.slug })) : [];
  } catch {
    return [];
  }
}

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return fetchAllSlugs();
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { slug } = await params; // await params for Next.js 15+
  const post = await fetchPost(slug);
  if (!post) return { title: 'Post Not Found' };

  const title = decodeHtml(post.title?.rendered || '');
  const description = decodeHtml(
    (post.excerpt?.rendered || '').replace(/<[^>]+>/g, '').slice(0, 160)
  );
  const image = getFeaturedImage(post);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : [],
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.modified,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PostPage({ params }) {
  const { slug } = await params; // await params for Next.js 15+
  const post = await fetchPost(slug);

  if (!post) {
    console.error(`[PostPage] Rendering notFound() for slug: "${slug}"`);
    notFound();
  }

  const featuredImage = getFeaturedImage(post);
  const author = getAuthorName(post);
  const date = formatDate(post.date);
  const categories = getPostCategories(post);
  const tags = getPostTags(post);
  const primaryCat = categories[0];
  const customFields = post.meta || post.acf || {};
  const hasCustomFields = Object.values(customFields).some(
    (v) => v !== null && v !== '' && v !== false
  );

  const content = decodeHtml(post.content?.rendered || '');

  return (
    <main className="wp-post-page">
      <article className="aan-article-container">

        {/* Category */}
        {primaryCat && (
          <Link href={`/category/${primaryCat.slug}`} className="aan-category">
            {primaryCat.name}
          </Link>
        )}

        {/* Title */}
        <h1 className="aan-article-headline">
          {parse(post.title?.rendered || '')}
        </h1>

        {/* Byline */}
        <div className="aan-byline-row">
          <span className="aan-author">By {author}</span>
          <span aria-hidden="true">•</span>
          <time dateTime={post.date} className="aan-date">{date}</time>
          {post.modified && post.modified !== post.date && (
            <>
              <span aria-hidden="true">•</span>
              <span className="aan-updated">
                Updated {formatDate(post.modified)}
              </span>
            </>
          )}
        </div>

        {/* Hero image */}
        {featuredImage && (
          <div className="aan-hero-wrapper">
            <img
              src={featuredImage}
              alt={decodeHtml(post.title?.rendered || '')}
              className="aan-hero-img"
            />
          </div>
        )}

        {/* Custom fields panel */}
        {hasCustomFields && (
          <div className="custom-fields-panel">
            <span className="aan-callout-title">Article Details</span>
            <dl className="custom-fields-list">
              {Object.entries(customFields).map(([key, value]) =>
                value ? (
                  <div key={key} className="custom-field-row">
                    <dt className="custom-field-key">
                      {key
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </dt>
                    <dd className="custom-field-value">
                      {typeof value === 'object'
                        ? JSON.stringify(value)
                        : String(value)}
                    </dd>
                  </div>
                ) : null
              )}
            </dl>
          </div>
        )}

        {/* Article body */}
        <div className="aan-article-body">
          {content ? parse(content) : (
            <p style={{ color: '#888' }}>No content available.</p>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="article-tags" aria-label="Tags">
            <span className="tags-label">Tags:</span>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="article-tag"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Comments */}
        <Comments postId={post.id} />

      </article>
    </main>
  );
}
