/**
 * app/page.jsx
 * Homepage — Server Component.
 * Shows latest posts with image, short excerpt, and "Read More" button.
 */

import Link from 'next/link';
import {
  getFeaturedImage,
  getAuthorName,
  formatDate,
  decodeHtml,
} from '@/lib/api';

export const revalidate = 60;

const WP_BASE =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  'http://localhost:10004/wp-json/wp/v2';

async function fetchFromWP(endpoint, params = {}) {
  try {
    const url = new URL(`${WP_BASE}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch (err) {
    console.error(`[HomePage] fetchFromWP("${endpoint}") failed:`, err.message);
    return [];
  }
}

// ─── Hero featured post ───────────────────────────────────────────────────────

function FeaturedPost({ post }) {
  if (!post) return null;
  const image = getFeaturedImage(post);
  const title = decodeHtml(post.title?.rendered || '');
  const excerpt = decodeHtml(
    (post.excerpt?.rendered || '').replace(/<[^>]+>/g, '').slice(0, 220)
  );
  const cat = post._embedded?.['wp:term']?.[0]?.[0];

  return (
    <div className="featured-post">
      {image && (
        <Link href={`/posts/${post.slug}`} className="featured-post-image-link">
          <div className="featured-post-image-wrapper">
            <img src={image} alt={title} className="featured-post-image" />
          </div>
        </Link>
      )}
      <div className="featured-post-body">
        {cat && (
          <Link href={`/category/${cat.slug}`} className="category-tag">{cat.name}</Link>
        )}
        <h1 className="featured-post-title">
          <Link href={`/posts/${post.slug}`}>{title}</Link>
        </h1>
        {excerpt && <p className="featured-post-excerpt">{excerpt}…</p>}
        <div className="featured-post-meta">
          <span>By {getAuthorName(post)}</span>
          <span aria-hidden="true">•</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
        <Link href={`/posts/${post.slug}`} className="read-more-btn">
          Read Full Story →
        </Link>
      </div>
    </div>
  );
}

// ─── Article card with Read More ──────────────────────────────────────────────

function ArticleCard({ post }) {
  if (!post) return null;
  const image = getFeaturedImage(post);
  const title = decodeHtml(post.title?.rendered || '');
  const excerpt = decodeHtml(
    (post.excerpt?.rendered || '').replace(/<[^>]+>/g, '').slice(0, 130)
  );
  const cat = post._embedded?.['wp:term']?.[0]?.[0];

  return (
    <article className="article-card">
      {image && (
        <Link href={`/posts/${post.slug}`} className="article-card-img-link">
          <div className="article-card-img-wrapper">
            <img src={image} alt={title} className="article-card-img" />
          </div>
        </Link>
      )}
      <div className="article-card-body">
        {cat && (
          <Link href={`/category/${cat.slug}`} className="article-card-category">
            {cat.name}
          </Link>
        )}
        <h2 className="article-card-title">
          <Link href={`/posts/${post.slug}`}>{title}</Link>
        </h2>
        {excerpt && <p className="article-card-excerpt">{excerpt}…</p>}
        <div className="article-card-footer">
          <div className="article-card-meta">
            <span>By {getAuthorName(post)}</span>
            <span aria-hidden="true"> • </span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
          <Link href={`/posts/${post.slug}`} className="article-card-read-more">
            Read More →
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [posts, categories] = await Promise.all([
    fetchFromWP('/posts', { per_page: 13, _embed: true, status: 'publish', orderby: 'date', order: 'desc' }),
    fetchFromWP('/categories', { per_page: 20, hide_empty: true, orderby: 'count', order: 'desc' }),
  ]);

  if (posts.length === 0) {
    return (
      <main className="aan-main">
        <div className="homepage-empty">
          <h1>Welcome to Afro Asian News</h1>
          <p>Make sure your WordPress site is running at <strong>{WP_BASE.replace('/wp/v2', '')}</strong></p>
        </div>
      </main>
    );
  }

  const [featured, ...rest] = posts;
  const mainGrid = rest.slice(0, 8);
  const sidebarPosts = rest.slice(8, 12);

  return (
    <main className="aan-main homepage">

      <FeaturedPost post={featured} />

      <hr className="section-divider" aria-hidden="true" />

      <div className="homepage-layout">

        <section className="homepage-grid" aria-label="Latest articles">
          <h2 className="section-heading">Latest Articles</h2>
          <div className="articles-grid">
            {mainGrid.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        <aside className="homepage-sidebar" aria-label="Sidebar">
          {categories.length > 0 && (
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">Browse Topics</h3>
              <ul className="category-list">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/category/${cat.slug}`} className="category-list-item">
                      <span>{cat.name}</span>
                      <span className="cat-count">{cat.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sidebarPosts.length > 0 && (
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">Also Reading</h3>
              <div className="sidebar-mini-posts">
                {sidebarPosts.map((post) => {
                  const img = getFeaturedImage(post);
                  const t = decodeHtml(post.title?.rendered || '');
                  return (
                    <Link key={post.id} href={`/posts/${post.slug}`} className="sidebar-mini-post">
                      {img && (
                        <div className="sidebar-mini-img-wrapper">
                          <img src={img} alt={t} className="sidebar-mini-img" />
                        </div>
                      )}
                      <div className="sidebar-mini-body">
                        <span className="sidebar-mini-title">{t}</span>
                        <span className="sidebar-mini-date">{formatDate(post.date)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

      </div>
    </main>
  );
}
