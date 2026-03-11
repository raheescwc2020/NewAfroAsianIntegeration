/**
 * app/page.jsx
 * Homepage — Server Component.
 * Matches the NewsPortal design: breaking ticker, wide featured hero,
 * article cards (image + category + title + excerpt + author + date + Read More),
 * category filter sidebar, mini sidebar posts, newsletter CTA.
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

// ─── Breaking Ticker (static; swap for live data as desired) ─────────────────

function BreakingTicker({ posts }) {
  // Use first 4 post titles as ticker items, fallback to placeholder
  const items = posts.length > 0
    ? posts.slice(0, 4).map((p) => decodeHtml(p.title?.rendered || ''))
    : ['Welcome to Afro Asian News — your source for Policy, Diplomacy, and Economy coverage.'];

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="breaking-ticker">
      <span className="breaking-ticker-label">Breaking</span>
      <div className="breaking-ticker-track-wrapper">
        <div className="breaking-ticker-track">
          {doubled.map((text, i) => (
            <span key={i} className="breaking-ticker-item">
              {text}
              <span className="breaking-ticker-sep" aria-hidden="true">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Featured Hero Post ───────────────────────────────────────────────────────

function FeaturedPost({ post }) {
  if (!post) return null;
  const image = getFeaturedImage(post);
  const title = decodeHtml(post.title?.rendered || '');
  const excerpt = decodeHtml(
    (post.excerpt?.rendered || '').replace(/<[^>]+>/g, '').slice(0, 240)
  );
  const cat = post._embedded?.['wp:term']?.[0]?.[0];

  // Always render a two-column layout: image LEFT, content RIGHT.
  // If WP has no featured image, show a branded placeholder so the
  // grid never collapses to a single column.
  return (
    <article className="featured-hero">

      {/* ── LEFT: image column (always rendered) ── */}
      <Link href={`/posts/${post.slug}`} className="featured-hero-img-link">
        <div className="featured-hero-img-wrapper">
          {image ? (
            <img src={image} alt={title} className="featured-hero-img" />
          ) : (
            /* Branded placeholder when no featured image is set in WP */
            <div className="featured-hero-img-placeholder" aria-hidden="true">
              <span className="featured-hero-placeholder-logo">AFRO ASIAN NEWS</span>
            </div>
          )}
        </div>
      </Link>

      {/* ── RIGHT: content column ── */}
      <div className="featured-hero-body">
        {cat && (
          <Link href={`/category/${cat.slug}`} className="featured-hero-category">
            {cat.name}
          </Link>
        )}
        <h1 className="featured-hero-title">
          <Link href={`/posts/${post.slug}`}>{title}</Link>
        </h1>
        {excerpt && (
          <p className="featured-hero-excerpt">{excerpt}…</p>
        )}
        <div className="featured-hero-meta">
          <span className="featured-hero-author">By {getAuthorName(post)}</span>
          <span aria-hidden="true" className="featured-hero-sep">·</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
        <Link href={`/posts/${post.slug}`} className="featured-hero-btn">
          Read Full Story →
        </Link>
      </div>
    </article>
  );
}

// ─── Article Card ─────────────────────────────────────────────────────────────

function ArticleCard({ post }) {
  if (!post) return null;
  const image = getFeaturedImage(post);
  const title = decodeHtml(post.title?.rendered || '');
  const excerpt = decodeHtml(
    (post.excerpt?.rendered || '').replace(/<[^>]+>/g, '').slice(0, 140)
  );
  const cat = post._embedded?.['wp:term']?.[0]?.[0];

  return (
    <article className="article-card">
      {image && (
        <Link href={`/posts/${post.slug}`} className="article-card-img-link">
          <div className="article-card-img-wrapper">
            <img src={image} alt={title} className="article-card-img" loading="lazy" />
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
        {excerpt && (
          <p className="article-card-excerpt">{excerpt}…</p>
        )}
        <div className="article-card-footer">
          <div className="article-card-meta">
            <span>By {getAuthorName(post)}</span>
            <span aria-hidden="true" className="article-card-sep"> · </span>
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

// ─── Sidebar: Mini post row ───────────────────────────────────────────────────

function SidebarMiniPost({ post }) {
  const img = getFeaturedImage(post);
  const title = decodeHtml(post.title?.rendered || '');
  const cat = post._embedded?.['wp:term']?.[0]?.[0];

  return (
    <Link href={`/posts/${post.slug}`} className="sidebar-mini-post">
      {img && (
        <div className="sidebar-mini-img-wrapper">
          <img src={img} alt={title} className="sidebar-mini-img" loading="lazy" />
        </div>
      )}
      <div className="sidebar-mini-body">
        {cat && (
          <span className="sidebar-mini-category">{cat.name}</span>
        )}
        <span className="sidebar-mini-title">{title}</span>
        <span className="sidebar-mini-date">{formatDate(post.date)}</span>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [posts, categories] = await Promise.all([
    fetchFromWP('/posts', {
      per_page: 13,
      _embed: true,
      status: 'publish',
      orderby: 'date',
      order: 'desc',
    }),
    fetchFromWP('/categories', {
      per_page: 20,
      hide_empty: true,
      orderby: 'count',
      order: 'desc',
    }),
  ]);

  if (posts.length === 0) {
    return (
      <main className="aan-main">
        <div className="homepage-empty">
          <h1>Welcome to Afro Asian News</h1>
          <p>
            Make sure your WordPress site is running at{' '}
            <strong>{WP_BASE.replace('/wp/v2', '')}</strong>
          </p>
        </div>
      </main>
    );
  }

  const [featured, ...rest] = posts;
  const mainGrid = rest.slice(0, 8);
  const sidebarPosts = rest.slice(8, 12);

  return (
    <main className="aan-main homepage">

      {/* Breaking Ticker */}
      {/* <BreakingTicker posts={posts} /> */}

      {/* Featured Hero */}
      <FeaturedPost post={featured} />

      <hr className="section-divider" aria-hidden="true" />

      {/* Main two-column layout */}
      <div className="homepage-layout">

        {/* Left: article grid */}
        <section className="homepage-grid" aria-label="Latest articles">
          <h2 className="section-heading">Latest Articles</h2>
          <div className="articles-grid">
            {mainGrid.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>

          {/* Load-more pagination */}
          <div className="homepage-pagination">
            <Link href="/archive" className="load-more-btn">
              Load More
            </Link>
          </div>
        </section>

        {/* Right: sidebar */}
        <aside className="homepage-sidebar" aria-label="Sidebar">

          {/* Also Reading */}
          {sidebarPosts.length > 0 && (
            <div className="sidebar-widget">
              <h3 className="sidebar-widget-title">Must Read</h3>
              <div className="sidebar-mini-posts">
                {sidebarPosts.map((post) => (
                  <SidebarMiniPost key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* Browse Topics */}
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

          {/* Newsletter CTA */}
          <div className="sidebar-newsletter">
            <span className="sidebar-newsletter-label">Newsletter</span>
            <p className="sidebar-newsletter-heading">
              Stay informed on Africa's most critical stories.
            </p>
            <p className="sidebar-newsletter-sub">
              Weekly briefings on policy, diplomacy, and economics. No noise.
            </p>
            <form className="sidebar-newsletter-form" action="/newsletter" method="POST">
              <input
                type="email"
                name="email"
                placeholder="Your email address"
                className="sidebar-newsletter-input"
                required
                aria-label="Email address"
              />
              <button type="submit" className="sidebar-newsletter-btn">
                Subscribe
              </button>
            </form>
          </div>

        </aside>
      </div>
    </main>
  );
}
