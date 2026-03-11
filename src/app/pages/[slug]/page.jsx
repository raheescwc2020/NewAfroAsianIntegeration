/**
 * app/pages/[slug]/page.jsx
 * Renders any WordPress Page (About, Contact, Privacy Policy, etc.)
 * - NO styled-jsx (Server Component — it is not allowed)
 * - Inline fetcher with hardcoded fallback URL
 * - All styles live in globals.css under section 17
 */

import { notFound } from 'next/navigation';
import parse from 'html-react-parser';
import { decodeHtml, formatDate } from '@/lib/api';

export const revalidate = 300;

// ─── Inline fetcher ───────────────────────────────────────────────────────────

const WP_BASE =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  'http://localhost:10004/wp-json/wp/v2';

async function fetchPage(slug) {
  try {
    const url = `${WP_BASE}/pages?slug=${encodeURIComponent(slug)}&_embed=true`;
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error(`[PagesPage] fetchPage("${slug}") failed:`, err.message);
    return null;
  }
}

async function fetchAllPageSlugs() {
  try {
    const res = await fetch(
      `${WP_BASE}/pages?per_page=50&status=publish&_fields=slug`,
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
  return fetchAllPageSlugs();
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const page = await fetchPage(params.slug);
  if (!page) return { title: 'Page Not Found' };
  return {
    title: decodeHtml(page.title?.rendered || ''),
    description: decodeHtml(
      (page.excerpt?.rendered || page.content?.rendered || '')
        .replace(/<[^>]+>/g, '')
        .slice(0, 160)
    ),
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WordPressPage({ params }) {
  const page = await fetchPage(params.slug);
  if (!page) notFound();

  const content = decodeHtml(page.content?.rendered || '');

  return (
    <main className="aan-main">
      <article className="aan-article-container wp-page">

        <header className="page-header">
          <h1 className="aan-article-headline">
            {parse(page.title?.rendered || '')}
          </h1>
          <div className="page-meta">
            Last updated:{' '}
            <time dateTime={page.modified}>{formatDate(page.modified)}</time>
          </div>
        </header>

        <div className="aan-article-body wp-page-body">
          {parse(content)}
        </div>

      </article>
    </main>
  );
}
