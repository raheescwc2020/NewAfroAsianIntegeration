/**
 * lib/api.js
 * Central WordPress REST API client.
 *
 * Set this in your .env.local:
 *   NEXT_PUBLIC_WORDPRESS_API_URL=http://localhost:10004/wp-json/wp/v2
 *
 * For production:
 *   NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
 */

// ─── Base URL Setup ───────────────────────────────────────────────────────────

const WP_API = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

if (!WP_API) {
  console.warn(
    '[api.js] WARNING: NEXT_PUBLIC_WORDPRESS_API_URL is not set in .env.local.\n' +
    'Add this line to your .env.local file:\n' +
    'NEXT_PUBLIC_WORDPRESS_API_URL=http://localhost:10004/wp-json/wp/v2'
  );
}

// WP_BASE is the root URL without /wp/v2 — used for menus plugin endpoints
// e.g. http://localhost:10004/wp-json
const WP_BASE = WP_API ? WP_API.replace('/wp/v2', '') : '';

// ─── Generic Fetcher ──────────────────────────────────────────────────────────

/**
 * Internal fetch wrapper for all WP REST API calls.
 * Returns { data, totalPages, total } or null on failure.
 *
 * @param {string} endpoint  - e.g. '/posts', '/pages', '/categories'
 * @param {object} params    - Query parameters as key/value pairs
 * @param {object} options   - Extra fetch options (method, body, headers)
 * @returns {Promise<{data: any, totalPages: number, total: number} | null>}
 */
async function wpFetch(endpoint, params = {}, options = {}) {
  if (!WP_API) {
    console.error('[api.js] Cannot fetch — NEXT_PUBLIC_WORDPRESS_API_URL is not defined.');
    return null;
  }

  try {
    const url = new URL(`${WP_API}${endpoint}`);

    // Append query params — skip undefined/null values
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });

    const res = await fetch(url.toString(), {
      next: { revalidate: 60 }, // ISR: cache for 60 seconds, then revalidate
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!res.ok) {
      console.error(`[api.js] WP API error [${res.status}] → ${url.toString()}`);
      return null;
    }

    const totalPages = res.headers.get('X-WP-TotalPages');
    const total = res.headers.get('X-WP-Total');
    const data = await res.json();

    return {
      data,
      totalPages: totalPages ? Number(totalPages) : 1,
      total: total ? Number(total) : (Array.isArray(data) ? data.length : 1),
    };
  } catch (error) {
    console.error(`[api.js] Fetch failed for "${endpoint}":`, error.message);
    return null;
  }
}

// ─── POSTS ────────────────────────────────────────────────────────────────────

/**
 * Get a paginated list of posts.
 *
 * @param {object} options
 * @param {number} options.page       - Page number (default: 1)
 * @param {number} options.perPage    - Posts per page (default: 10)
 * @param {number} options.category   - Category ID to filter by
 * @param {number} options.tag        - Tag ID to filter by
 * @param {string} options.search     - Search query string
 * @param {string} options.orderby    - Sort field (default: 'date')
 * @param {string} options.order      - Sort direction: 'asc' | 'desc' (default: 'desc')
 * @param {string} options.status     - Post status (default: 'publish')
 * @returns {Promise<{data: Array, totalPages: number, total: number} | null>}
 */
export async function getPosts({
  page = 1,
  perPage = 10,
  category,
  tag,
  search,
  orderby = 'date',
  order = 'desc',
  status = 'publish',
} = {}) {
  return wpFetch('/posts', {
    _embed: true,
    page,
    per_page: perPage,
    categories: category,
    tags: tag,
    search,
    orderby,
    order,
    status,
  });
}

/**
 * Get a single post by its slug.
 *
 * @param {string} slug - The post slug
 * @returns {Promise<object|null>} Single post object or null
 */
export async function getPostBySlug(slug) {
  if (!slug) return null;
  const result = await wpFetch('/posts', { slug, _embed: true });
  return result?.data?.[0] || null;
}

/**
 * Get a single post by its numeric ID.
 *
 * @param {number} id - The post ID
 * @returns {Promise<object|null>} Single post object or null
 */
export async function getPostById(id) {
  if (!id) return null;
  const result = await wpFetch(`/posts/${id}`, { _embed: true });
  return result?.data || null;
}

// ─── PAGES ────────────────────────────────────────────────────────────────────

/**
 * Get a paginated list of WordPress pages.
 *
 * @param {object} options
 * @param {number} options.page    - Page number (default: 1)
 * @param {number} options.perPage - Items per page (default: 10)
 * @returns {Promise<{data: Array, totalPages: number, total: number} | null>}
 */
export async function getPages({ page = 1, perPage = 10 } = {}) {
  return wpFetch('/pages', { _embed: true, page, per_page: perPage });
}

/**
 * Get a single WordPress page by its slug.
 *
 * @param {string} slug - The page slug
 * @returns {Promise<object|null>} Single page object or null
 */
export async function getPageBySlug(slug) {
  if (!slug) return null;
  const result = await wpFetch('/pages', { slug, _embed: true });
  return result?.data?.[0] || null;
}

// ─── NAVIGATION MENUS ────────────────────────────────────────────────────────
// Requires plugin: https://wordpress.org/plugins/wp-rest-api-v2-menus/
// After installing, menus are available at: /wp-json/menus/v1/menus

/**
 * Get all registered WordPress navigation menus.
 * Requires the "WP REST API V2 Menus" plugin.
 *
 * @returns {Promise<Array>} Array of menu objects
 */
export async function getMenus() {
  if (!WP_BASE) return [];
  try {
    const res = await fetch(`${WP_BASE}/menus/v1/menus`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('[api.js] getMenus failed:', error.message);
    return [];
  }
}

/**
 * Get a single navigation menu by its slug.
 * Requires the "WP REST API V2 Menus" plugin.
 *
 * @param {string} slug - The menu slug (e.g. 'primary-menu')
 * @returns {Promise<object|null>} Menu object with items, or null
 */
export async function getMenuBySlug(slug) {
  if (!slug || !WP_BASE) return null;
  try {
    const res = await fetch(`${WP_BASE}/menus/v1/menus/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`[api.js] getMenuBySlug("${slug}") failed:`, error.message);
    return null;
  }
}

/**
 * Get all items for a specific menu by menu ID.
 * Requires the "WP REST API V2 Menus" plugin.
 *
 * @param {number|string} menuId - The menu ID
 * @returns {Promise<Array>} Array of menu item objects
 */
export async function getMenuItems(menuId) {
  if (!menuId || !WP_BASE) return [];
  try {
    const res = await fetch(`${WP_BASE}/menus/v1/menus/${menuId}/items`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error(`[api.js] getMenuItems(${menuId}) failed:`, error.message);
    return [];
  }
}

// ─── COMMENTS ────────────────────────────────────────────────────────────────

/**
 * Get approved comments for a specific post.
 *
 * @param {object} options
 * @param {number} options.postId  - The post ID to fetch comments for
 * @param {number} options.page    - Page number (default: 1)
 * @param {number} options.perPage - Comments per page (default: 20)
 * @returns {Promise<{data: Array, totalPages: number, total: number} | null>}
 */
export async function getComments({ postId, page = 1, perPage = 20 } = {}) {
  if (!postId) return null;
  return wpFetch('/comments', {
    post: postId,
    page,
    per_page: perPage,
    status: 'approve',
    orderby: 'date',
    order: 'asc',
  });
}

/**
 * Submit a new comment to a post.
 * Comments go into pending status by default (require WP admin approval).
 *
 * @param {object} options
 * @param {number} options.postId      - The post ID
 * @param {string} options.authorName  - Commenter's display name
 * @param {string} options.authorEmail - Commenter's email (not shown publicly)
 * @param {string} options.content     - Comment text
 * @param {number} options.parentId    - Parent comment ID for replies (default: 0)
 * @returns {Promise<object>} The newly created comment object
 * @throws {Error} If the submission fails
 */
export async function submitComment({
  postId,
  authorName,
  authorEmail,
  content,
  parentId = 0,
}) {
  if (!WP_API) throw new Error('WordPress API URL is not configured.');
  if (!postId || !authorName || !content) {
    throw new Error('postId, authorName, and content are required.');
  }

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
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.message || `Comment submission failed [${res.status}]`);
  }

  return res.json();
}

// ─── CATEGORIES & TAGS (TERMS) ───────────────────────────────────────────────

/**
 * Get all post categories.
 *
 * @param {object} options
 * @param {number}  options.perPage   - Max categories to return (default: 100)
 * @param {boolean} options.hideEmpty - Exclude empty categories (default: true)
 * @returns {Promise<{data: Array, totalPages: number, total: number} | null>}
 */
export async function getCategories({ perPage = 100, hideEmpty = true } = {}) {
  return wpFetch('/categories', {
    per_page: perPage,
    hide_empty: hideEmpty,
    orderby: 'count',
    order: 'desc',
  });
}

/**
 * Get all post tags.
 *
 * @param {object} options
 * @param {number}  options.perPage   - Max tags to return (default: 100)
 * @param {boolean} options.hideEmpty - Exclude empty tags (default: true)
 * @returns {Promise<{data: Array, totalPages: number, total: number} | null>}
 */
export async function getTags({ perPage = 100, hideEmpty = true } = {}) {
  return wpFetch('/tags', {
    per_page: perPage,
    hide_empty: hideEmpty,
  });
}

/**
 * Get a single category by its slug.
 *
 * @param {string} slug - The category slug
 * @returns {Promise<object|null>} Category object or null
 */
export async function getCategoryBySlug(slug) {
  if (!slug) return null;
  const result = await wpFetch('/categories', { slug });
  return result?.data?.[0] || null;
}

/**
 * Get a single tag by its slug.
 *
 * @param {string} slug - The tag slug
 * @returns {Promise<object|null>} Tag object or null
 */
export async function getTagBySlug(slug) {
  if (!slug) return null;
  const result = await wpFetch('/tags', { slug });
  return result?.data?.[0] || null;
}

// ─── CUSTOM POST TYPES ────────────────────────────────────────────────────────

/**
 * Get posts from any custom post type.
 * The CPT must be registered with show_in_rest: true in functions.php.
 *
 * @param {string} postType          - The CPT rest_base slug (e.g. 'events')
 * @param {object} options
 * @param {number} options.page      - Page number (default: 1)
 * @param {number} options.perPage   - Items per page (default: 10)
 * @param {string} options.orderby   - Sort field (default: 'date')
 * @param {string} options.order     - Sort direction (default: 'desc')
 * @returns {Promise<{data: Array, totalPages: number, total: number} | null>}
 *
 * @example
 * // Fetch events
 * const events = await getCustomPosts('events', { perPage: 5 });
 */
export async function getCustomPosts(postType, {
  page = 1,
  perPage = 10,
  orderby = 'date',
  order = 'desc',
  ...rest
} = {}) {
  if (!postType) return null;
  return wpFetch(`/${postType}`, {
    _embed: true,
    page,
    per_page: perPage,
    orderby,
    order,
    ...rest,
  });
}

/**
 * Get a single custom post type item by its slug.
 *
 * @param {string} postType - The CPT rest_base slug (e.g. 'events')
 * @param {string} slug     - The item slug
 * @returns {Promise<object|null>} Single CPT item or null
 */
export async function getCustomPostBySlug(postType, slug) {
  if (!postType || !slug) return null;
  const result = await wpFetch(`/${postType}`, { slug, _embed: true });
  return result?.data?.[0] || null;
}

// ─── CUSTOM FIELDS (ACF / Native Meta) ───────────────────────────────────────
// Native meta: fields must be registered with show_in_rest: true in functions.php
// ACF: requires the "ACF to REST API" plugin

/**
 * Get all custom meta fields for a specific post.
 * Only returns fields registered with show_in_rest: true.
 *
 * @param {number} postId - The post ID
 * @returns {Promise<object>} Object of meta key/value pairs, or empty object
 */
export async function getPostMeta(postId) {
  if (!postId) return {};
  const result = await wpFetch(`/posts/${postId}`, { context: 'edit' });
  return result?.data?.meta || result?.data?.acf || {};
}

/**
 * Get ACF fields for any post type item.
 * Requires the "ACF to REST API" plugin.
 *
 * @param {string} postType - The post type (e.g. 'posts', 'events')
 * @param {number} postId   - The item ID
 * @returns {Promise<object>} ACF fields object, or empty object
 */
export async function getAcfFields(postType, postId) {
  if (!postType || !postId) return {};
  const result = await wpFetch(`/${postType}/${postId}`, { _embed: true });
  return result?.data?.acf || {};
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────

/**
 * Search across all content types.
 * Uses the native WP REST API /search endpoint.
 *
 * @param {object} options
 * @param {string} options.query   - The search term (required)
 * @param {string} options.type    - Content type: 'post' | 'term' | 'post-format' (default: 'post')
 * @param {number} options.page    - Page number (default: 1)
 * @param {number} options.perPage - Results per page (default: 10)
 * @returns {Promise<{data: Array, totalPages: number, total: number} | null>}
 */
export async function searchContent({
  query,
  type = 'post',
  page = 1,
  perPage = 10,
} = {}) {
  if (!query || query.trim().length < 2) return { data: [], totalPages: 0, total: 0 };
  return wpFetch('/search', {
    search: query.trim(),
    type,
    subtype: 'any',
    page,
    per_page: perPage,
    _embed: true,
  });
}

// ─── MEDIA ────────────────────────────────────────────────────────────────────

/**
 * Get a single media item by its ID.
 *
 * @param {number} mediaId - The media attachment ID
 * @returns {Promise<object|null>} Media object with source_url, sizes, etc.
 */
export async function getMedia(mediaId) {
  if (!mediaId) return null;
  const result = await wpFetch(`/media/${mediaId}`, {});
  return result?.data || null;
}

/**
 * Get a paginated list of all media items.
 *
 * @param {object} options
 * @param {number} options.page    - Page number (default: 1)
 * @param {number} options.perPage - Items per page (default: 20)
 * @returns {Promise<{data: Array, totalPages: number, total: number} | null>}
 */
export async function getMediaLibrary({ page = 1, perPage = 20 } = {}) {
  return wpFetch('/media', { page, per_page: perPage, orderby: 'date', order: 'desc' });
}

// ─── USERS / AUTHORS ──────────────────────────────────────────────────────────

/**
 * Get a single author/user by their ID.
 *
 * @param {number} authorId - The user ID
 * @returns {Promise<object|null>} User object with name, avatar_urls, description, etc.
 */
export async function getAuthor(authorId) {
  if (!authorId) return null;
  const result = await wpFetch(`/users/${authorId}`, {});
  return result?.data || null;
}

/**
 * Get all registered authors/users.
 *
 * @param {number} perPage - Max users to return (default: 20)
 * @returns {Promise<{data: Array, totalPages: number, total: number} | null>}
 */
export async function getAuthors({ perPage = 20 } = {}) {
  return wpFetch('/users', { per_page: perPage, who: 'authors' });
}

// ─── UTILITY HELPERS ─────────────────────────────────────────────────────────

/**
 * Extract the featured image URL from an embedded post object.
 *
 * @param {object} post - A WordPress post object with _embedded data
 * @returns {string|null} The full image URL, or null if not set
 */
export function getFeaturedImage(post) {
  return post?._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
}

/**
 * Extract featured image in a specific size.
 *
 * @param {object} post - A WordPress post object with _embedded data
 * @param {string} size - Image size: 'thumbnail' | 'medium' | 'large' | 'full'
 * @returns {string|null} The sized image URL, or falls back to source_url
 */
export function getFeaturedImageBySize(post, size = 'large') {
  const media = post?._embedded?.['wp:featuredmedia']?.[0];
  return (
    media?.media_details?.sizes?.[size]?.source_url ||
    media?.source_url ||
    null
  );
}

/**
 * Extract the author's display name from an embedded post object.
 *
 * @param {object} post - A WordPress post object with _embedded data
 * @returns {string} Author name, or 'Staff Writer' as fallback
 */
export function getAuthorName(post) {
  return post?._embedded?.author?.[0]?.name || 'Staff Writer';
}

/**
 * Extract the author's avatar URL from an embedded post object.
 *
 * @param {object} post - A WordPress post object with _embedded data
 * @returns {string|null} Avatar URL (96px preferred), or null
 */
export function getAuthorAvatar(post) {
  const avatarSizes = post?._embedded?.author?.[0]?.avatar_urls;
  return avatarSizes?.['96'] || avatarSizes?.['48'] || avatarSizes?.['24'] || null;
}

/**
 * Extract the author's bio/description from an embedded post object.
 *
 * @param {object} post - A WordPress post object with _embedded data
 * @returns {string} Author description, or empty string
 */
export function getAuthorBio(post) {
  return post?._embedded?.author?.[0]?.description || '';
}

/**
 * Extract the primary category from an embedded post object.
 *
 * @param {object} post - A WordPress post object with _embedded data
 * @returns {object|null} First category term object, or null
 */
export function getPrimaryCategory(post) {
  return post?._embedded?.['wp:term']?.[0]?.[0] || null;
}

/**
 * Extract all categories from an embedded post object.
 *
 * @param {object} post - A WordPress post object with _embedded data
 * @returns {Array} Array of category term objects
 */
export function getPostCategories(post) {
  return post?._embedded?.['wp:term']?.[0] || [];
}

/**
 * Extract all tags from an embedded post object.
 *
 * @param {object} post - A WordPress post object with _embedded data
 * @returns {Array} Array of tag term objects
 */
export function getPostTags(post) {
  return post?._embedded?.['wp:term']?.[1] || [];
}

/**
 * Decode common HTML entities in a string.
 * Use this on post titles, excerpts, and any field that may contain encoded chars.
 *
 * @param {string} html - String potentially containing HTML entities
 * @returns {string} Decoded plain text string
 */
export function decodeHtml(html = '') {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8220;/g, '\u201C') // "
    .replace(/&#8221;/g, '\u201D') // "
    .replace(/&#8216;/g, '\u2018') // '
    .replace(/&#8217;/g, '\u2019') // '
    .replace(/&#8211;/g, '\u2013') // –
    .replace(/&#8212;/g, '\u2014') // —
    .replace(/&#8230;/g, '\u2026') // …
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&rdquo;/g, '\u201D');
}

/**
 * Format a WordPress date string into a human-readable date.
 *
 * @param {string} dateStr - ISO date string from WordPress (e.g. '2024-01-15T10:30:00')
 * @param {object} options - Intl.DateTimeFormat options (optional)
 * @returns {string} Formatted date string (e.g. 'January 15, 2024')
 */
export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

/**
 * Strip all HTML tags from a string — useful for generating meta descriptions.
 *
 * @param {string} html - HTML string to strip
 * @returns {string} Plain text string
 */
export function stripHtml(html = '') {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate a plain-text excerpt from a post.
 * Strips HTML, decodes entities, and trims to a max character length.
 *
 * @param {object} post       - WordPress post object
 * @param {number} maxLength  - Max characters (default: 160)
 * @returns {string} Plain text excerpt
 */
export function getExcerpt(post, maxLength = 160) {
  const raw = post?.excerpt?.rendered || post?.content?.rendered || '';
  const clean = decodeHtml(stripHtml(raw));
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
}

/**
 * Build a canonical URL for a post or page.
 *
 * @param {object} post     - WordPress post/page object
 * @param {string} siteUrl  - Your Next.js site URL (e.g. 'https://afroasiannews.com')
 * @returns {string} Full canonical URL
 */
export function getPostUrl(post, siteUrl = '') {
  if (!post) return siteUrl;
  const base = siteUrl.replace(/\/$/, '');
  if (post.type === 'page') return `${base}/pages/${post.slug}`;
  return `${base}/posts/${post.slug}`;
}
