/**
 * components/Comments.jsx
 * "use client" is required — this component handles user interaction.
 * All styles in globals.css under .comments-* and .comment-*
 */

'use client';

import { useState } from 'react';
import { useComments } from '@/hooks/useWordPress';
import { formatDate } from '@/lib/api';

// ─── Single Comment ───────────────────────────────────────────────────────────

function Comment({ comment, depth = 0, onReply, allComments }) {
  const [showReply, setShowReply] = useState(false);
  const children = allComments.filter((c) => c.parent === comment.id);
  const avatar = comment.author_avatar_urls?.['48'];

  return (
    <div
      className={`comment-item comment-depth-${depth}`}
      style={{ marginLeft: depth > 0 ? `${Math.min(depth * 24, 72)}px` : 0 }}
      id={`comment-${comment.id}`}
    >
      <div className="comment-header">
        {avatar ? (
          <img src={avatar} alt={comment.author_name} className="comment-avatar" />
        ) : (
          <div className="comment-avatar comment-avatar-placeholder">
            {(comment.author_name || 'A')[0].toUpperCase()}
          </div>
        )}
        <div className="comment-meta">
          <span className="comment-author">{comment.author_name}</span>
          <time className="comment-date" dateTime={comment.date}>
            {formatDate(comment.date)}
          </time>
        </div>
      </div>

      <div
        className="comment-body"
        dangerouslySetInnerHTML={{ __html: comment.content?.rendered || '' }}
      />

      <button className="comment-reply-btn" onClick={() => setShowReply((v) => !v)}>
        {showReply ? 'Cancel' : 'Reply'}
      </button>

      {showReply && (
        <CommentForm
          parentId={comment.id}
          onSubmit={async (data) => {
            await onReply(data);
            setShowReply(false);
          }}
          compact
        />
      )}

      {children.map((child) => (
        <Comment
          key={child.id}
          comment={child}
          depth={depth + 1}
          onReply={onReply}
          allComments={allComments}
        />
      ))}
    </div>
  );
}

// ─── Comment Form ─────────────────────────────────────────────────────────────

function CommentForm({ parentId = 0, onSubmit, compact = false }) {
  const [form, setForm] = useState({ authorName: '', authorEmail: '', content: '' });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim() || !form.authorName.trim()) return;
    setStatus('submitting');
    try {
      await onSubmit({ ...form, parentId });
      setForm({ authorName: '', authorEmail: '', content: '' });
      setStatus('success');
      setTimeout(() => setStatus(null), 4000);
    } catch {
      setStatus('error');
    }
  };

  return (
    <form className={`comment-form${compact ? ' comment-form--compact' : ''}`} onSubmit={handleSubmit}>
      {!compact && <h3 className="comment-form-title">Leave a Comment</h3>}

      {status === 'success' && (
        <p className="comment-status comment-status--success">
          ✓ Your comment has been submitted and is awaiting moderation.
        </p>
      )}
      {status === 'error' && (
        <p className="comment-status comment-status--error">
          Something went wrong. Please try again.
        </p>
      )}

      <div className="comment-form-row">
        <input
          name="authorName" type="text"
          placeholder={compact ? 'Name *' : 'Your Name *'}
          required value={form.authorName}
          onChange={handleChange}
          className="comment-input"
        />
        {!compact && (
          <input
            name="authorEmail" type="email"
            placeholder="Email (not published)"
            value={form.authorEmail}
            onChange={handleChange}
            className="comment-input"
          />
        )}
      </div>

      <textarea
        name="content"
        placeholder="Write a comment…"
        required
        value={form.content}
        onChange={handleChange}
        className="comment-textarea"
        rows={compact ? 3 : 5}
      />

      <button type="submit" className="comment-submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Submitting…' : compact ? 'Reply' : 'Post Comment'}
      </button>
    </form>
  );
}

// ─── Main Comments Component ──────────────────────────────────────────────────

export default function Comments({ postId }) {
  const { comments, loading, error, submit } = useComments(postId);
  const topLevel = comments.filter((c) => c.parent === 0);

  return (
    <section className="comments-section" aria-label="Comments">
      <h2 className="comments-heading">
        {loading ? 'Comments' : `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
      </h2>

      {loading && <p className="comments-loading">Loading comments…</p>}
      {error && <p className="comments-error">Could not load comments.</p>}
      {!loading && comments.length === 0 && (
        <p className="comments-empty">Be the first to comment.</p>
      )}

      <div className="comments-list">
        {topLevel.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            depth={0}
            onReply={(data) => submit({ ...data })}
            allComments={comments}
          />
        ))}
      </div>

      <div className="comments-form-wrapper">
        <CommentForm onSubmit={submit} />
      </div>
    </section>
  );
}
