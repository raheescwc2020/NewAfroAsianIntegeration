'use client';

/**
 * components/Header.jsx
 * NO styled-jsx anywhere — all styles live in globals.css
 * This fixes the hydration mismatch (jsx-xxxxxxxx class names)
 */

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearch, useNavMenu } from '@/hooks/useWordPress';
import { decodeHtml } from '@/lib/api';

// ─── Icons ────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// ─── Search Dropdown ──────────────────────────────────────────────────────────

function SearchDropdown({ query, onClose }) {
  const { results, loading } = useSearch(query, { debounceMs: 300 });
  const router = useRouter();

  if (!query || query.length < 2) return null;

  return (
    <div className="search-dropdown" role="listbox">
      {loading && (
        <div className="search-dropdown-item search-loading">
          Searching…
        </div>
      )}
      {!loading && results.length === 0 && (
        <div className="search-dropdown-item search-empty">
          No results for <strong>"{query}"</strong>
        </div>
      )}
      {!loading && results.map((item) => (
        <Link
          key={item.id}
          href={`/${item.subtype === 'page' ? 'pages' : 'posts'}/${item.slug}`}
          className="search-dropdown-item"
          onClick={onClose}
          role="option"
        >
          <span className="search-item-type">{item.subtype || item.type}</span>
          <span className="search-item-title">{decodeHtml(item.title)}</span>
        </Link>
      ))}
      {!loading && results.length > 0 && (
        <button
          className="search-dropdown-item search-see-all"
          onClick={() => {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            onClose();
          }}
        >
          See all results for "{query}" →
        </button>
      )}
    </div>
  );
}

// ─── Desktop Search ───────────────────────────────────────────────────────────

function DesktopSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={wrapperRef} className="aan-search-wrapper">
      <form className="aan-mini-search" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          aria-label="Search"
        />
        <button type="submit" aria-label="Submit search">
          <SearchIcon />
        </button>
      </form>
      {open && (
        <SearchDropdown
          query={query}
          onClose={() => { setOpen(false); setQuery(''); }}
        />
      )}
    </div>
  );
}

// ─── Fallback nav items (used if WP Menus plugin not installed) ───────────────

const FALLBACK_NAV = [
  { id: 1, label: 'Home', url: '/' },
  { id: 2, label: 'Policy', url: '/category/policy' },
  { id: 3, label: 'Diplomacy', url: '/category/diplomacy' },
  { id: 4, label: 'Economy', url: '/category/economy' },
  { id: 5, label: 'Opinion', url: '/category/opinion' },
  { id: 6, label: 'Events', url: '/category/events' },
];

// ─── Header ───────────────────────────────────────────────────────────────────

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const router = useRouter();

  const { items: wpNavItems } = useNavMenu('primary-menu');
  const navItems = wpNavItems.length > 0 ? wpNavItems : FALLBACK_NAV;

  const closeAll = () => {
    setMobileOpen(false);
    setMobileSearchOpen(false);
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (mobileQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(mobileQuery.trim())}`);
      closeAll();
      setMobileQuery('');
    }
  };

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header className="aan-masthead-wrapper">

      {/* Logo */}
      <div className="aan-logo-panel">
        <div className="aan-container centered-logo">
          <Link href="/" onClick={closeAll}>
            <img
              src="/assets/AFRO_LOGOOO.png"
              alt="AFRO News"
              className="aan-logo-img"
            />
          </Link>
        </div>
      </div>

      {/* Nav strip */}
      <div className="aan-nav-panel">
        <div className="aan-container nav-flex-wrapper">

          {/* Hamburger */}
          <button
            className="aan-menu-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          {/* Navigation */}
          <nav
            className={`aan-nav${mobileOpen ? ' mobile-active' : ''}`}
            aria-label="Main navigation"
          >
            {/* Mobile search inside nav drawer */}
            <form
              className="mobile-only mobile-search-container"
              onSubmit={handleMobileSearch}
              style={{ display: mobileOpen ? 'flex' : 'none' }}
            >
              <input
                type="text"
                placeholder="Search articles…"
                value={mobileQuery}
                onChange={(e) => setMobileQuery(e.target.value)}
                aria-label="Mobile search"
              />
              <button type="submit"><SearchIcon /></button>
            </form>

            {/* Nav links */}
            {navItems.map((item) => {
              const href = item.url
                ? item.url.replace(/^https?:\/\/[^/]+/, '')
                : `/${item.slug || ''}`;
              return (
                <Link
                  key={item.id || item.label}
                  href={href}
                  className="nav-item"
                  onClick={closeAll}
                >
                  {item.label || item.title?.rendered || item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop search */}
          <DesktopSearch />

          {/* Mobile search toggle button */}
          <button
            className="aan-mobile-search-toggle"
            onClick={() => { setMobileSearchOpen((v) => !v); setMobileOpen(false); }}
            aria-label="Search"
          >
            <SearchIcon />
          </button>

        </div>

        {/* Mobile inline search bar */}
        {mobileSearchOpen && (
          <div className="mobile-search-bar">
            <form className="mobile-search-container" onSubmit={handleMobileSearch}>
              <input
                type="text"
                placeholder="Search…"
                value={mobileQuery}
                onChange={(e) => setMobileQuery(e.target.value)}
                autoFocus
                aria-label="Search"
              />
              <button type="submit"><SearchIcon /></button>
            </form>
          </div>
        )}
      </div>

    </header>
  );
}
