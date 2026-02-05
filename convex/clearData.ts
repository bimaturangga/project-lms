import { mutation } from "./_generated/server";

// Clear all courses from database
export const clearAllCourses = mutation({
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect();

    for (const course of courses) {
      await ctx.db.delete(course._id);
    }

    return { deletedCount: courses.length };
  },
});

// Clear all data (use with caution!)
export const clearAllData = mutation({
  handler: async (ctx) => {
    // Clear courses
    const courses = await ctx.db.query("courses").collect();
    for (const course of courses) {
      await ctx.db.delete(course._id);
    }

    // Clear enrollments
    const enrollments = await ctx.db.query("enrollments").collect();
    for (const enrollment of enrollments) {
      await ctx.db.delete(enrollment._id);
    }

    // Clear payments
    const payments = await ctx.db.query("payments").collect();
    for (const payment of payments) {
      await ctx.db.delete(payment._id);
    }

    // Clear certificates
    const certificates = await ctx.db.query("certificates").collect();
    for (const certificate of certificates) {
      await ctx.db.delete(certificate._id);
    }

    return {
      courses: courses.length,
      enrollments: enrollments.length,
      payments: payments.length,
      certificates: certificates.length,
    };
  },
});
