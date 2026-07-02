import { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function canEditReview(createdAt) {
  if (!createdAt) return false;

  const createdTime = new Date(createdAt).getTime();
  return Date.now() - createdTime <= 24 * 60 * 60 * 1000;
}

export default function ReviewForm({ repair, onSaved }) {
  const existingReview = Boolean(repair.review_id);
  const editAllowed = useMemo(
    () => existingReview && canEditReview(repair.review_created_at),
    [existingReview, repair.review_created_at]
  );

  const [rating, setRating] = useState(repair.review_rating || 0);
  const [body, setBody] = useState(repair.review_body || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setRating(repair.review_rating || 0);
    setBody(repair.review_body || '');
    setError('');
  }, [repair.review_id, repair.review_rating, repair.review_body]);

  if (repair.status !== 'completed' || !repair.technician_id) {
    return null;
  }

  const formDisabled = existingReview && !editAllowed;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!rating) {
      setError('Choose a star rating before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        existingReview ? `${API_URL}/api/reviews/${repair.review_id}` : `${API_URL}/api/reviews`,
        {
          method: existingReview ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingId: repair.id,
            rating,
            body,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save review');
      }

      onSaved(repair.id, data.review);
    } catch (err) {
      setError(err.message || 'Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="rh-review-form" onSubmit={handleSubmit}>
      <div className="rh-review-head">
        <div>
          <strong>{existingReview ? 'Your review' : 'Review this repair'}</strong>
          <span>
            {existingReview
              ? editAllowed ? 'Editable for 24 hours after submission' : 'Edit window closed'
              : 'Share a rating for your completed service'}
          </span>
        </div>
      </div>

      <div className="rh-stars" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            className={star <= rating ? 'rh-star rh-star-active' : 'rh-star'}
            onClick={() => setRating(star)}
            disabled={formDisabled || submitting}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            key={star}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Optional: tell others how the repair went..."
        disabled={formDisabled || submitting}
      />

      {repair.review_edited_at && (
        <p className="rh-review-note">Edited {new Date(repair.review_edited_at).toLocaleString()}</p>
      )}

      {error && <p className="rh-review-error">{error}</p>}

      {!formDisabled && (
        <button className="rh-primary rh-review-submit" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : existingReview ? 'Save Edit' : 'Submit Review'}
        </button>
      )}
    </form>
  );
}
