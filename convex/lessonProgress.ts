import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mark lesson as completed
export const markLessonCompleted = mutation({
  args: {
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    enrollmentId: v.id("enrollments"),
    watchTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if progress already exists
    const existing = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_and_lesson", (q) =>
        q.eq("userId", args.userId).eq("lessonId", args.lessonId),
      )
      .first();

    let progressId;
    if (existing) {
      // Update existing progress
      await ctx.db.patch(existing._id, {
        completed: true,
        completedAt: Date.now(),
        watchTime: args.watchTime,
      });
      progressId = existing._id;
    } else {
      // Create new progress record
      progressId = await ctx.db.insert("lessonProgress", {
        userId: args.userId,
        lessonId: args.lessonId,
        enrollmentId: args.enrollmentId,
        completed: true,
        completedAt: Date.now(),
        watchTime: args.watchTime,
      });
    }

    // Auto-update enrollment progress and generate certificate if course completed
    await updateEnrollmentProgressAndCheckCompletion(ctx, args.enrollmentId);

    return progressId;
  },
});

// Helper function to update enrollment progress and auto-generate certificate
async function updateEnrollmentProgressAndCheckCompletion(
  ctx: any,
  enrollmentId: any,
) {
  const enrollment = await ctx.db.get(enrollmentId);
  if (!enrollment) return;

  // Get total lessons for this course
  const totalLessons = await ctx.db
    .query("lessons")
    .withIndex("by_course", (q: any) => q.eq("courseId", enrollment.courseId))
    .collect();

  if (totalLessons.length === 0) return;

  // Get completed lessons for this enrollment
  const completedLessons = await ctx.db
    .query("lessonProgress")
    .withIndex("by_enrollment", (q: any) => q.eq("enrollmentId", enrollmentId))
    .filter((q: any) => q.eq(q.field("completed"), true))
    .collect();

  // Calculate progress percentage
  const calculatedProgress = Math.round(
    (completedLessons.length / totalLessons.length) * 100,
  );

  // Update enrollment progress
  const updates: any = { progress: calculatedProgress };

  // Auto-complete and generate certificate if all lessons completed
  if (calculatedProgress >= 100 && enrollment.status !== "completed") {
    updates.status = "completed";
    updates.completedAt = Date.now();

    // Check if certificate already exists
    const existingCertificate = await ctx.db
      .query("certificates")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("userId"), enrollment.userId),
          q.eq(q.field("courseId"), enrollment.courseId),
        ),
      )
      .first();

    // Auto-generate certificate if not exists
    if (!existingCertificate) {
      try {
        const certificateNumber = `CERT-${Date.now()}-${enrollment.userId.slice(-6)}`;

        await ctx.db.insert("certificates", {
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          enrollmentId: enrollmentId,
          certificateNumber,
          issuedAt: Date.now(),
          pdfUrl: "", // Will be generated on-demand
        });

        console.log(
          `✅ Certificate auto-generated for user ${enrollment.userId}`,
        );

        // Send notification about certificate
        try {
          const course = await ctx.db.get(enrollment.courseId);
          await ctx.db.insert("notifications", {
            userId: enrollment.userId,
            type: "certificate",
            title: "🎓 Sertifikat Tersedia!",
            message: `Selamat! Anda telah menyelesaikan kursus "${course?.title}". Sertifikat Anda sudah tersedia untuk diunduh.`,
            isRead: false,
            createdAt: Date.now(),
            link: "/student/certificates",
          });
        } catch (notifError) {
          console.error("Failed to send notification:", notifError);
        }
      } catch (error) {
        console.error("❌ Failed to auto-generate certificate:", error);
      }
    }
  }

  await ctx.db.patch(enrollmentId, updates);
}

// Get lesson progress for user
export const getLessonProgress = query({
  args: {
    userId: v.id("users"),
    enrollmentId: v.id("enrollments"),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("lessonProgress")
      .withIndex("by_enrollment", (q) =>
        q.eq("enrollmentId", args.enrollmentId),
      )
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    return progress;
  },
});

// Get completed lessons for course
export const getCompletedLessonsForCourse = query({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    // Get all lessons for the course
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const lessonIds = lessons.map((l) => l._id);

    // Get progress for these lessons
    const progressRecords = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("completed"), true))
      .collect();

    const completedLessonIds = progressRecords
      .filter((p) => lessonIds.includes(p.lessonId))
      .map((p) => p.lessonId);

    return {
      totalLessons: lessons.length,
      completedLessons: completedLessonIds.length,
      completedLessonIds,
      isAllCompleted:
        completedLessonIds.length === lessons.length && lessons.length > 0,
    };
  },
});

// Get all lesson progress for user
export const getAllLessonProgressByUser = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (args.userId) {
      // Filter by user if userId provided
      const progress = await ctx.db
        .query("lessonProgress")
        .withIndex("by_user", (q: any) => q.eq("userId", args.userId!))
        .filter((q: any) => q.eq(q.field("completed"), true))
        .collect();

      return progress;
    } else {
      // Return all progress for admin
      const progress = await ctx.db
        .query("lessonProgress")
        .filter((q: any) => q.eq(q.field("completed"), true))
        .collect();

      return progress;
    }
  },
});
