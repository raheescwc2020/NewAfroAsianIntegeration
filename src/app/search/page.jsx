/**
 * app/search/page.jsx
 * Server Component — no styled-jsx. Styles in globals.css.
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { searchContent, getPostBySlug, getPageBySlug } from '@/lib/api';
import PostCard from '@/components/PostCard';
import SearchInput from './SearchInput';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const q = searchParams?.q || '';
  return { title: q ? `Search: ${q} — AFRO News` : 'Search — AFRO News' };
}

async function SearchResults({ query, page }) {
  if (!query || query.trim().length < 2) {
    return <p className="search-prompt">Enter a search term above to find articles.</p>;
  }

  const perPage = 12;
  const result = await searchContent({ query: query.trim(), page, perPage });
  const results = result?.data || [];
  const totalPages = result?.totalPages || 1;
  const total = result?.total || 0;

  // Hydrate search results into full post objects for PostCard
  const fullPosts = await Promise.all(
    results.map(async (item) => {
      try {
        if (item.subtype === 'page') return await getPageBySlug(item.slug);
        return await getPostBySlug(item.slug);
      } catch {
        return null;
      }
    })
  );

  const validPosts = fullPosts.filter(Boolean);

  return (
    <div>
      <p className="search-count">
        {total > 0
          ? `${total} result${total !== 1 ? 's' : ''} for "${query}"`
          : `No results found for "${query}"`}
      </p>

      {validPosts.length > 0 ? (
        <div className="search-results-grid">
          {validPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="search-no-results">
          <p>Try a different search term, or browse by category.</p>
          <Link href="/" className="search-back-link">← Back to Home</Link>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="search-pagination" aria-label="Search pagination">
          {page > 1 && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
              className="pagination-btn"
            >
              ← Previous
            </Link>
          )}
          <span className="pagination-info">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
              className="pagination-btn"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

export default function SearchPage({ searchParams }) {
  const query = searchParams?.q || '';
  const page = Number(searchParams?.page) || 1;

  return (
    <main className="aan-main">
      <div className="search-page-header">
        <h1 className="search-page-title">
          {query ? 'Search results' : 'Search'}
        </h1>
        <SearchInput initialQuery={query} />
      </div>

      <Suspense fallback={<p className="search-loading-state">Searching…</p>}>
        <SearchResults query={query} page={page} />
      </Suspense>
    </main>
  );
}
