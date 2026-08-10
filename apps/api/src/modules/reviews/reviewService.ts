import { prisma } from '../../infrastructure/database/prisma';

export class ReviewService {
  /**
   * Leave a review & rating for another campus student (prevents self-reviews)
   */
  async createReview(reviewerId: string, revieweeId: string, rating: number, comment: string) {
    if (reviewerId === revieweeId) {
      throw new Error('You cannot write a review for yourself.');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5.');
    }

    const reviewee = await prisma.user.findUnique({ where: { id: revieweeId } });
    if (!reviewee) {
      throw new Error('Target student profile not found.');
    }

    const review = await prisma.review.create({
      data: {
        reviewerId,
        revieweeId,
        rating: Math.round(rating),
        comment
      },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } }
      }
    });

    return review;
  }

  /**
   * Get all reviews received by a user
   */
  async getUserReviews(userId: string) {
    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true, badges: true } }
      }
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

    return {
      reviews,
      totalCount: reviews.length,
      averageRating: parseFloat(averageRating.toFixed(1))
    };
  }
}

export const reviewService = new ReviewService();
