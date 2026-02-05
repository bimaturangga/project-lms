import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new review
export const createReview = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
    enrollmentId: v.id("enrollments"),
    rating: v.number(),
    review: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate rating is between 1-5
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if user has already reviewed this course
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId),
      )
      .first();

    let reviewId;

    if (existingReview) {
      // Update existing review instead of throwing error
      await ctx.db.patch(existingReview._id, {
        rating: args.rating,
        review: args.review,
        updatedAt: Date.now(),
      });
      reviewId = existingReview._id;
      console.log("✅ Review updated for course:", args.courseId);
    } else {
      // Create new review
      reviewId = await ctx.db.insert("reviews", {
        userId: args.userId,
        courseId: args.courseId,
        enrollmentId: args.enrollmentId,
        rating: args.rating,
        review: args.review,
        createdAt: Date.now(),
      });
      console.log("✅ Review created for course:", args.courseId);
    }

    // Update course average rating
    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await ctx.db.patch(args.courseId, {
      rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
    });

    return reviewId;
  },
});

// Get all reviews (for calculating rating stats across courses)
export const getAllReviews = query({
  handler: async (ctx) => {
    return await ctx.db.query("reviews").collect();
  },
});

// Get all reviews for a course
export const getReviewsByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .order("desc")
      .collect();

    // Get user details for each review
    const reviewsWithUser = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          userName: user?.name || "Anonymous",
          userAvatar: user?.avatar || null,
        };
      }),
    );

    return reviewsWithUser;
  },
});

// Get course average rating and count
export const getCourseRatingStats = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      const rating = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating]++;
      }
    });

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  },
});

// Check if user has already reviewed the course
export const hasUserReviewed = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db
      .query("reviews")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId),
      )
      .first();

    return review !== null;
  },
});

// Get user's review for a specific course
export const getUserReviewForCourse = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db
      .query("reviews")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", args.userId).eq("courseId", args.courseId),
      )
      .first();

    return review;
  },
});
