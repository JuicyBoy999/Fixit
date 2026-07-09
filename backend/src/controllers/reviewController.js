import * as reviewModel from '../models/reviewModel.js';

const normalizeRating = (rating) => {
  const value = Number(rating);
  return Number.isInteger(value) && value >= 1 && value <= 5 ? value : null;
};

export const submitReview = async (req, res) => {
  const { bookingId, rating, body = '' } = req.body;
  const normalizedRating = normalizeRating(rating);

  if (!bookingId || !normalizedRating) {
    return res.status(400).json({ message: 'Booking ID and a 1-5 star rating are required' });
  }

  try {
    const review = await reviewModel.createReview({
      bookingId,
      customerId: req.user.id,
      rating: normalizedRating,
      body: body.trim(),
    });

    if (!review) {
      return res.status(400).json({ message: 'Reviews can only be submitted for your completed repairs with an assigned technician' });
    }

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'This booking already has a review' });
    }

    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const editReview = async (req, res) => {
  const { id } = req.params;
  const { rating, body = '' } = req.body;
  const normalizedRating = normalizeRating(rating);

  if (!normalizedRating) {
    return res.status(400).json({ message: 'A 1-5 star rating is required' });
  }

  try {
    const existingReview = await reviewModel.getReviewById(id);
    if (!existingReview || existingReview.customer_id !== req.user.id) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const updatedReview = await reviewModel.updateReviewWithinWindow({
      id,
      customerId: req.user.id,
      rating: normalizedRating,
      body: body.trim(),
    });

    if (!updatedReview) {
      return res.status(403).json({ message: 'Reviews can only be edited within 24 hours of submission' });
    }

    res.json({ message: 'Review updated successfully', review: updatedReview });
  } catch (error) {
    console.error('Error editing review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getReviewsByTechnician = async (req, res) => {
  try {
    const reviews = await reviewModel.getReviewsByTechnicianId(req.params.technicianId);
    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching technician reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
