import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create enrollment
export const createEnrollment = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: args.userId,
      courseId: args.courseId,
      status: "pending",
      progress: 0,
      enrolledAt: Date.now(),
    });
    return enrollmentId;
  },
});

// Get enrollments by user
export const getEnrollmentsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get all enrollments with calculated progress
export const getAllEnrollments = query({
  handler: async (ctx) => {
    const enrollments = await ctx.db.query("enrollments").order("desc").collect();

    // Calculate real progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get total lessons for this course
        const totalLessons = await ctx.db
          .query("lessons")
          .withIndex("by_course", (q) => q.eq("courseId", enrollment.courseId))
          .collect();

        // Get completed lessons for this enrollment
        const completedLessons = await ctx.db
          .query("lessonProgress")
          .withIndex("by_enrollment", (q) =>
            q.eq("enrollmentId", enrollment._id),
          )
          .filter((q) => q.eq(q.field("completed"), true))
          .collect();

        // Calculate progress percentage
        let calculatedProgress = enrollment.progress || 0;
        if (totalLessons.length > 0) {
          calculatedProgress = Math.round(
            (completedLessons.length / totalLessons.length) * 100,
          );
        }

        // Determine correct status based on progress
        let calculatedStatus = enrollment.status;
        if (calculatedProgress >= 100 && enrollment.status !== "completed") {
          calculatedStatus = "completed";
        }

        return {
          ...enrollment,
          progress: calculatedProgress,
          status: calculatedStatus,
        };
      }),
    );

    return enrollmentsWithProgress;
  },
});

// Get enrollments by user with course details
export const getEnrollmentsWithCourseByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get course details for each enrollment
    const enrollmentsWithCourse = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);

        // Calculate real progress based on completed lessons
        let calculatedProgress = enrollment.progress || 0;

        // Get total lessons for this course
        const totalLessons = await ctx.db
          .query("lessons")
          .withIndex("by_course", (q) => q.eq("courseId", enrollment.courseId))
          .collect();

        // Get completed lessons for this enrollment
        const completedLessons = await ctx.db
          .query("lessonProgress")
          .withIndex("by_enrollment", (q) =>
            q.eq("enrollmentId", enrollment._id),
          )
          .filter((q) => q.eq(q.field("completed"), true))
          .collect();

        // Calculate progress percentage
        if (totalLessons.length > 0) {
          calculatedProgress = Math.round(
            (completedLessons.length / totalLessons.length) * 100,
          );
        }

        return {
          ...enrollment,
          course,
          progress: calculatedProgress,
        };
      }),
    );

    return enrollmentsWithCourse;
  },
});

// Get all enrollments with user and course details (for admin)
export const getAllEnrollmentsWithDetails = query({
  handler: async (ctx) => {
    const enrollments = await ctx.db
      .query("enrollments")
      .order("desc")
      .collect();

    const enrollmentsWithDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        const user = await ctx.db.get(enrollment.userId);
        const course = await ctx.db.get(enrollment.courseId);
        return {
          ...enrollment,
          user,
          course,
        };
      }),
    );

    return enrollmentsWithDetails;
  },
});

// Update enrollment progress
export const updateEnrollmentProgress = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    const updates: any = { progress: args.progress };

    // Auto-complete and generate certificate saat progress 100%
    if (args.progress >= 100 && enrollment.status !== "completed") {
      updates.status = "completed";
      updates.completedAt = Date.now();

      // Auto-generate certificate
      try {
        // Check if course has certificate template
        const course = await ctx.db.get(enrollment.courseId);
        if (course && course.certificateTemplate) {
          // Generate certificate number
          const certificateNumber = `CERT-${Date.now()}-${enrollment.userId.slice(-6)}`;

          // Create certificate
          await ctx.db.insert("certificates", {
            userId: enrollment.userId,
            courseId: enrollment.courseId,
            enrollmentId: args.enrollmentId,
            certificateNumber,
            issuedAt: Date.now(),
            pdfUrl: course.certificateTemplate,
          });
        }
      } catch (error) {
        console.error("Failed to generate certificate:", error);
        // Continue even if certificate generation fails
      }
    }

    await ctx.db.patch(args.enrollmentId, updates);
    return args.enrollmentId;
  },
});

// Update enrollment status
export const updateEnrollmentStatus = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("pending"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.enrollmentId, {
      status: args.status,
    });
    return args.enrollmentId;
  },
});

// Recalculate and update enrollment progress based on completed lessons
export const recalculateEnrollmentProgress = mutation({
  args: {
    enrollmentId: v.optional(v.id("enrollments")),
  },
  handler: async (ctx, args) => {
    // If enrollmentId provided, recalculate that one, otherwise all
    const enrollments = args.enrollmentId
      ? [await ctx.db.get(args.enrollmentId)].filter(Boolean)
      : await ctx.db.query("enrollments").collect();

    const updated = [];

    for (const enrollment of enrollments) {
      if (!enrollment) continue;

      // Get total lessons for this course
      const totalLessons = await ctx.db
        .query("lessons")
        .withIndex("by_course", (q) => q.eq("courseId", enrollment.courseId))
        .collect();

      // Get completed lessons for this enrollment
      const completedLessons = await ctx.db
        .query("lessonProgress")
        .withIndex("by_enrollment", (q) => q.eq("enrollmentId", enrollment._id))
        .filter((q) => q.eq(q.field("completed"), true))
        .collect();

      // Calculate progress percentage
      let calculatedProgress = 0;
      if (totalLessons.length > 0) {
        calculatedProgress = Math.round(
          (completedLessons.length / totalLessons.length) * 100,
        );
      }

      // Only update if progress changed
      if (calculatedProgress !== enrollment.progress) {
        const updates: any = { progress: calculatedProgress };

        // Auto-complete if 100%
        if (calculatedProgress >= 100 && enrollment.status !== "completed") {
          updates.status = "completed";
          updates.completedAt = Date.now();
        }

        await ctx.db.patch(enrollment._id, updates);
        updated.push(enrollment._id);
      }
    }

    return {
      message: `Recalculated ${updated.length} enrollments`,
      updatedIds: updated,
    };
  },
});
