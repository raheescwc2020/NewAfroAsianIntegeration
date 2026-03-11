'use client';

/**
 * hooks/useWordPress.js
 * Client-side hooks for live search, comments, pagination, etc.
 * All hooks fail silently — network errors never crash the page.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const WP_API = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
const WP_BASE = WP_API ? WP_API.replace('/wp/v2', '') : '';

// ─── Generic client fetcher ───────────────────────────────────────────────────

async function clientFetch(endpoint, params = {}) {
  if (!WP_API) throw new Error('NEXT_PUBLIC_WORDPRESS_API_URL is not set');

  const url = new URL(`${WP_API}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  });

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const total = res.headers.get('X-WP-Total');
  const totalPages = res.headers.get('X-WP-TotalPages');
  const data = await res.json();

  return {
    data,
    total: total ? Number(total) : (Array.isArray(data) ? data.length : 1),
    totalPages: totalPages ? Number(totalPages) : 1,
  };
}

// ─── useNavMenu ───────────────────────────────────────────────────────────────
/**
 * Fetches WordPress navigation menu items by menu slug.
 * Requires the "WP REST API V2 Menus" plugin.
 *
 * IMPORTANT: Fails silently — if the plugin endpoint is unreachable,
 * Header.jsx falls back to FALLBACK_NAV automatically. Never crashes.
 *
 * @param {string} menuSlug - e.g. 'primary-menu'
 * @returns {{ items: Array, loading: boolean }}
 */
export function useNavMenu(menuSlug) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false); // default false — don't block render

  useEffect(() => {
    if (!menuSlug || !WP_BASE) return;

    let cancelled = false;
    setLoading(true);

    // Use AbortController so we can cancel if component unmounts
    const controller = new AbortController();

    fetch(`${WP_BASE}/menus/v1/menus/${menuSlug}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Menu fetch failed: ${res.status}`);
        return res.json();
      })
      .then((menu) => {
        if (!cancelled && menu?.items) {
          setItems(menu.items);
        }
      })
      .catch((err) => {
        // Silently ignore — Header will use FALLBACK_NAV
        if (err.name !== 'AbortError') {
          console.warn(`[useNavMenu] Could not load menu "${menuSlug}". Using fallback nav.`, err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [menuSlug]);

  return { items, loading };
}

// ─── useSearch ────────────────────────────────────────────────────────────────
/**
 * Debounced live search across all WP content types.
 *
 * @param {string} query - Search term
 * @param {{ debounceMs?: number, perPage?: number }} options
 * @returns {{ results: Array, loading: boolean, error: string|null }}
 */
export function useSearch(query, { debounceMs = 400, perPage = 8 } = {}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const result = await clientFetch('/search', {
          search: query.trim(),
          type: 'post',
          subtype: 'any',
          per_page: perPage,
          _embed: true,
        });
        setResults(result.data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timerRef.current);
  }, [query, perPage, debounceMs]);

  return { results, loading, error };
}

// ─── usePosts ─────────────────────────────────────────────────────────────────
/**
 * Paginated posts with optional category/tag filtering.
 *
 * @param {{ category?: number, tag?: number, perPage?: number }} options
 * @returns {{ posts: Array, loading: boolean, error: string|null, page: number, setPage: Function, totalPages: number }}
 */
export function usePosts({ category, tag, perPage = 10 } = {}) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    clientFetch('/posts', {
      page,
      per_page: perPage,
      categories: category,
      tags: tag,
      _embed: true,
      status: 'publish',
    })
      .then(({ data, totalPages: tp }) => {
        if (!cancelled) {
          setPosts(data || []);
          setTotalPages(tp || 1);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setPosts([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [page, category, tag, perPage]);

  return { posts, loading, error, page, setPage, totalPages };
}

// ─── useComments ──────────────────────────────────────────────────────────────
/**
 * Fetch and submit comments for a specific post.
 *
 * @param {number} postId
 * @returns {{ comments: Array, loading: boolean, submitting: boolean, error: string|null, submit: Function, refetch: Function }}
 */
export function useComments(postId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const result = await clientFetch('/comments', {
        post: postId,
        status: 'approve',
        per_page: 50,
        orderby: 'date',
        order: 'asc',
      });
      setComments(result.data || []);
      setError(null);
    } catch (err) {
      console.warn('[useComments] Could not load comments:', err.message);
      setError(err.message);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const submit = useCallback(async ({
    authorName,
    authorEmail,
    content,
    parentId = 0,
  }) => {
    if (!WP_API) throw new Error('WordPress API URL is not configured.');
    setSubmitting(true);
    try {
      const res = await fetch(`${WP_API}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: postId,
          author_name: authorName,
          author_email: authorEmail || '',
          content,
          parent: parentId,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || `Failed to submit [${res.status}]`);
      }
      await fetchComments(); // Refresh comment list
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [postId, fetchComments]);

  return { comments, loading, submitting, error, submit, refetch: fetchComments };
}

// ─── useCategories ────────────────────────────────────────────────────────────
/**
 * Fetch all non-empty categories.
 *
 * @returns {{ categories: Array, loading: boolean }}
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientFetch('/categories', { per_page: 100, hide_empty: true })
      .then(({ data }) => setCategories(data || []))
      .catch((err) => console.warn('[useCategories]', err.message))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
