import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { reviewService } from '../modules/reviews/reviewService';

export async function createReview(req: AuthenticatedRequest, res: Response) {
  try {
    const reviewerId = req.user!.id;
    const { revieweeId, rating, comment } = req.body;

    if (!revieweeId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'revieweeId, rating (1-5), and comment are required.' });
    }

    const review = await reviewService.createReview(reviewerId, revieweeId, parseFloat(rating), comment);
    return res.status(201).json({
      success: true,
      message: 'Review posted successfully.',
      review
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function getUserReviews(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req.params;
    const result = await reviewService.getUserReviews(userId);
    return res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
