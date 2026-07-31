import { useEffect, useMemo, useState } from 'react';
import { Button, EmptyState, LoadingSkeleton } from '../../components/shared';
import { listProductReviews } from '../../services/api/reviewService';
import type { Product, ProductReviewListResponse, Review } from '../../types';
import { RatingStars } from './RatingStars';

const PAGE_SIZE = 10;

function formatRelativeTime(value: string) {
  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) {
    return 'Recently';
  }

  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <RatingStars value={review.rating} size={15} />
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>{review.rating.toFixed(1)}</span>
          </div>
          {review.title ? (
            <h3 style={{ margin: '10px 0 0', fontSize: '18px', fontWeight: 600, color: '#111827' }}>
              {review.title}
            </h3>
          ) : null}
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF', fontFamily: "'Chakra Petch', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {formatRelativeTime(review.createdAt)}
        </p>
      </div>

      <p style={{ margin: '14px 0 0', fontSize: '14px', lineHeight: 1.8, color: '#4B5563' }}>
        {review.comment}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#111827', fontWeight: 600 }}>
          {review.customerName}
        </p>
        {review.verifiedPurchase ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '9999px', backgroundColor: 'rgba(17,24,39,0.06)', color: '#111827', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Chakra Petch', sans-serif" }}>
            Verified Purchase
          </span>
        ) : null}
      </div>
    </article>
  );
}

export function CustomerReviewsSection({ product }: { product: Product }) {
  const [page, setPage] = useState(1);
  const [reviewResponse, setReviewResponse] = useState<ProductReviewListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setPage(1);
  }, [product.id]);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await listProductReviews(product.id, page, PAGE_SIZE);
        if (!isMounted) {
          return;
        }
        setReviewResponse(response);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setReviewResponse(null);
        setErrorMessage(error instanceof Error ? error.message : 'Customer reviews could not be loaded right now.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadReviews();

    return () => {
      isMounted = false;
    };
  }, [page, product.id]);

  const reviews = reviewResponse?.data || [];
  const pagination = reviewResponse?.pagination;
  const summary = useMemo(() => ({
    averageRating: Number(reviewResponse?.summary?.averageRating ?? product.averageRating ?? product.rating ?? 0),
    reviewCount: Number(reviewResponse?.summary?.reviewCount ?? product.reviewCount ?? 0),
  }), [product.averageRating, product.rating, product.reviewCount, reviewResponse?.summary?.averageRating, reviewResponse?.summary?.reviewCount]);

  return (
    <section style={{ marginTop: '72px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: "'Chakra Petch', sans-serif" }}>
          Customer Reviews
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <RatingStars value={summary.averageRating} size={18} />
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>{summary.averageRating > 0 ? summary.averageRating.toFixed(1) : '0.0'}</span>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>({summary.reviewCount} Review{summary.reviewCount === 1 ? '' : 's'})</span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton rows={5} />
          <LoadingSkeleton rows={5} />
        </div>
      ) : errorMessage ? (
        <EmptyState title="Unable to load reviews" description={errorMessage} />
      ) : reviews.length === 0 ? (
        <EmptyState title="No reviews yet." description="Verified customer reviews will appear here after completed purchases." />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
          {pagination && pagination.totalPages > 1 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button type="button" variant="secondary" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={!pagination.hasPreviousPage}>
                  Previous
                </Button>
                <Button type="button" variant="secondary" onClick={() => setPage((current) => current + 1)} disabled={!pagination.hasNextPage}>
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
