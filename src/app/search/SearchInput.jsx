/**
 * app/search/SearchInput.jsx
 * Client component: the interactive search bar on the search results page.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function SearchInput({ initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-page-form" role="search">
      <div className="search-page-input-wrapper">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles, topics, authors…"
          className="search-page-input"
          aria-label="Search"
          autoFocus
        />
        <button type="submit" className="search-page-btn" aria-label="Search">
          <SearchIcon />
          <span>Search</span>
        </button>
      </div>

      <style jsx>{`
        .search-page-form { width: 100%; max-width: 560px; }
        .search-page-input-wrapper { display: flex; border: 2px solid #111; background: #fff; }
        .search-page-input {
          flex: 1; padding: 14px 16px; font-size: 16px;
          border: none; outline: none; font-family: inherit;
          background: transparent;
        }
        .search-page-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 14px 20px; background: #111; color: #fff;
          border: none; cursor: pointer; font-size: 14px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em;
          font-family: inherit; transition: background 0.2s;
          white-space: nowrap;
        }
        .search-page-btn:hover { background: #0B5ED7; }
      `}</style>
    </form>
  );
}
