import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Modal } from '../../components/shared';
import type { CommerceOrderProduct } from '../../types';

export interface WriteReviewSubmitInput {
  rating: number;
  title: string;
  comment: string;
}

export function WriteReviewModal({
  open,
  item,
  onClose,
  onSubmit,
  isSubmitting = false,
}: {
  open: boolean;
  item: CommerceOrderProduct | null;
  onClose: () => void;
  onSubmit: (input: WriteReviewSubmitInput) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open) {
      setRating(5);
      setTitle('');
      setComment('');
      setErrorMessage('');
      return;
    }

    setRating(5);
    setTitle('');
    setComment('');
    setErrorMessage('');
  }, [item?.id, open]);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setErrorMessage('Comment is required.');
      return;
    }

    setErrorMessage('');
    await onSubmit({
      rating,
      title: title.trim(),
      comment: comment.trim(),
    });
  };

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => undefined : onClose}
      title="Write Review"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <div>
          <p className="m-0 text-sm font-semibold text-neutral-950">{item?.productName || 'Product Review'}</p>
          <p className="mt-1 text-sm text-neutral-500">{item?.variantName || 'Verified purchase'}</p>
        </div>

        <div className="grid gap-2">
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: "'Chakra Petch', sans-serif" }}>
            Rating
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {Array.from({ length: 5 }).map((_, index) => {
              const starValue = index + 1;
              const isActive = starValue <= rating;
              return (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => setRating(starValue)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'inline-flex',
                  }}
                  aria-label={`Set rating to ${starValue}`}
                >
                  <Star size={24} className={isActive ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'} />
                </button>
              );
            })}
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{rating}.0</span>
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-neutral-900" htmlFor="review-title">
            Title (optional)
          </label>
          <input
            id="review-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
            placeholder="Excellent quality"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-neutral-900" htmlFor="review-comment">
            Comment
          </label>
          <textarea
            id="review-comment"
            rows={5}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
            placeholder="Share your product experience..."
          />
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
