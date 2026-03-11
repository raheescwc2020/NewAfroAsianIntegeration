'use client';

/**
 * components/NavMenu.jsx
 *
 * Matches the exact AfroAsian News header design:
 *   - Centered logo (triangle SVG + wordmark + tagline)
 *   - Full-width nav bar: HOME + all WP categories + Search
 *   - "More ▾" overflow dropdown if categories exceed visible space
 *   - Mobile hamburger drawer
 *
 * Drop into:  components/NavMenu.jsx
 * Add CSS:    paste navmenu.css into globals.css
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

/* ─── Config ────────────────────────────────────────────────────────────── */
const WP_BASE =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  'http://localhost:10004/wp-json/wp/v2';

/* ─── Hook: fetch WP categories ─────────────────────────────────────────── */
function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${WP_BASE}/categories?per_page=50&hide_empty=true&orderby=count&order=desc`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { categories, loading };
}

/* ─── Logo pyramid mark ─────────────────────────────────────────────────── */
function LogoMark({ size = 56 }) {
  return (
    <svg width={size} height={Math.round(size * 0.86)} viewBox="0 0 56 48" fill="none" aria-hidden="true">
      <polygon points="28,2 54,46 2,46"  fill="#7A5C10" />
      <polygon points="28,10 46,42 10,42" fill="#B8841E" />
      <polygon points="28,18 38,38 18,38" fill="#D4A030" />
      <polygon points="28,2 54,46 28,38"  fill="#8F6A15" opacity="0.55" />
      <polygon points="28,2 28,38 2,46"   fill="#C49428" opacity="0.35" />
    </svg>
  );
}

/* ─── Overflow "More" dropdown ──────────────────────────────────────────── */
function MoreDropdown({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div className="aan-more-wrap" ref={ref}>
      <button
        className={`aan-nav-link${open ? ' aan-nav-link--active' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        MORE
        <svg
          className={`aan-chevron${open ? ' aan-chevron--up' : ''}`}
          width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true"
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="aan-more-menu" role="menu">
          {items.map(cat => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              role="menuitem"
              className={`aan-more-item${
                pathname === `/category/${cat.slug}` ? ' aan-more-item--active' : ''
              }`}
            >
              {cat.name.toUpperCase()}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Search ─────────────────────────────────────────────────────────────── */
function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function submit(e) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form className="aan-search" onSubmit={submit} role="search">
      <input
        className="aan-search-input"
        type="search"
        placeholder="Search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        aria-label="Search articles"
      />
      <button type="submit" className="aan-search-btn" aria-label="Search">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}

/* ─── Mobile Drawer ──────────────────────────────────────────────────────── */
function MobileDrawer({ categories, open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [catsOpen, setCatsOpen] = useState(false);

  useEffect(() => { onClose(); }, [pathname]);
  useEffect(() => { if (!open) { setQuery(''); setCatsOpen(false); } }, [open]);

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) { router.push(`/search?q=${encodeURIComponent(query.trim())}`); onClose(); }
  }

  return (
    <>
      <div
        className={`aan-backdrop${open ? ' aan-backdrop--on' : ''}`}
        onClick={onClose} aria-hidden="true"
      />
      <nav
        className={`aan-drawer${open ? ' aan-drawer--open' : ''}`}
        aria-label="Mobile menu" aria-modal="true"
      >
        {/* Head */}
        <div className="aan-drawer-head">
          <Link href="/" className="aan-drawer-brand" onClick={onClose}>
            <LogoMark size={28} />
            <span>AFROASIANNEWS</span>
          </Link>
          <button className="aan-drawer-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <form className="aan-drawer-search" onSubmit={handleSearch}>
          <input
            type="search" placeholder="Search articles…"
            value={query} onChange={e => setQuery(e.target.value)}
            className="aan-drawer-search-inp"
          />
          <button type="submit" aria-label="Search">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </form>

        {/* Links */}
        <div className="aan-drawer-body">
          <Link href="/" className={`aan-drawer-link${pathname === '/' ? ' aan-drawer-link--on' : ''}`}>
            HOME
          </Link>

          <hr className="aan-drawer-divider" />

          <button
            className="aan-drawer-link aan-drawer-link--toggle"
            onClick={() => setCatsOpen(v => !v)}
            aria-expanded={catsOpen}
          >
            CATEGORIES
            <svg className={`aan-chevron${catsOpen ? ' aan-chevron--up' : ''}`}
              width="9" height="9" viewBox="0 0 10 10" fill="none">
              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {catsOpen && (
            <div className="aan-drawer-cats">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className={`aan-drawer-cat${
                    pathname === `/category/${cat.slug}` ? ' aan-drawer-cat--on' : ''
                  }`}
                >
                  {cat.name}
                  <span className="aan-drawer-cat-count">{cat.count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export default function NavMenu() {
  const { categories, loading } = useCategories();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Show up to MAX_INLINE categories inline; rest go into "More ▾"
  const MAX_INLINE = 7;
  const inline   = categories.slice(0, MAX_INLINE);
  const overflow = categories.slice(MAX_INLINE);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header className="aan-header">

      {/* ── Centered logo ─────────────────────────────────────────────── */}
      <div className="aan-topbar">
        <Link href="/" className="aan-logo" aria-label="AfroAsian News — Home">
          <LogoMark size={52} />
          <div className="aan-logo-copy">
            <span className="aan-logo-name">AFROASIANNEWS</span>
            <span className="aan-logo-tagline">BRIDGING CONTINENTS</span>
          </div>
        </Link>
      </div>

      {/* ── Nav bar ───────────────────────────────────────────────────── */}
      <div className="aan-navbar">
        <div className="aan-navbar-inner">

          {/* Desktop nav */}
          <nav className="aan-nav" aria-label="Primary">
            <Link
              href="/"
              className={`aan-nav-link${pathname === '/' ? ' aan-nav-link--active' : ''}`}
            >
              HOME
            </Link>

            {!loading && inline.map(cat => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`aan-nav-link${
                  pathname === `/category/${cat.slug}` ? ' aan-nav-link--active' : ''
                }`}
              >
                {cat.name.toUpperCase()}
              </Link>
            ))}

            {loading && (
              <span className="aan-nav-skeleton" aria-label="Loading categories">
                <span /><span /><span /><span />
              </span>
            )}

            {!loading && overflow.length > 0 && <MoreDropdown items={overflow} />}
          </nav>

          {/* Desktop search */}
          <div className="aan-nav-right">
            <SearchBar />
          </div>

          {/* Hamburger */}
          <button
            className={`aan-hamburger${mobileOpen ? ' aan-hamburger--open' : ''}`}
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span /><span /><span />
          </button>

        </div>
      </div>

      {/* Mobile */}
      <MobileDrawer
        categories={categories}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

    </header>
  );
}
