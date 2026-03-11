/**
 * app/category/[slug]/page.jsx
 * Server Component — no styled-jsx. Styles in globals.css.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug, getPosts, getCategories } from '@/lib/api';
import PostCard from '@/components/PostCard';

export const revalidate = 60;

export async function generateStaticParams() {
  const result = await getCategories({ perPage: 50 });
  return (result?.data || []).map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }) {
  const cat = await getCategoryBySlug(params.slug);
  return cat
    ? { title: `${cat.name} — AFRO News`, description: cat.description || `Browse ${cat.name} articles` }
    : {};
}

export default async function CategoryPage({ params, searchParams }) {
  const currentPage = Number(searchParams?.page) || 1;

  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const postsResult = await getPosts({
    category: category.id,
    perPage: 12,
    page: currentPage,
  });

  const posts = postsResult?.data || [];
  const totalPages = postsResult?.totalPages || 1;

  return (
    <main className="aan-main">
      <header className="category-header">
        <span className="category-tag">{category.name}</span>
        <h1 className="category-page-title">{category.name}</h1>
        {category.description && (
          <p className="category-description">{category.description}</p>
        )}
        <p className="category-count">
          {category.count} article{category.count !== 1 ? 's' : ''}
        </p>
      </header>

      {posts.length === 0 ? (
        <p>No posts found in this category.</p>
      ) : (
        <div className="category-grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="cat-pagination" aria-label="Category pagination">
          {currentPage > 1 && (
            <Link href={`/category/${params.slug}?page=${currentPage - 1}`} className="pagination-btn">
              ← Newer
            </Link>
          )}
          <span className="pagination-info">{currentPage} / {totalPages}</span>
          {currentPage < totalPages && (
            <Link href={`/category/${params.slug}?page=${currentPage + 1}`} className="pagination-btn">
              Older →
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
