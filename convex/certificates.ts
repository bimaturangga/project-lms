import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate certificate saat course selesai
export const generateCertificate = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
    enrollmentId: v.id("enrollments"),
  },
  handler: async (ctx, args) => {
    console.log("Generating certificate for:", args);

    // Check if certificate already exists
    const existingCertificate = await ctx.db
      .query("certificates")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("courseId"), args.courseId),
        ),
      )
      .first();

    if (existingCertificate) {
      console.log("Certificate already exists:", existingCertificate._id);
      return existingCertificate._id;
    }

    // Get course info for certificate template
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      console.error("Course not found:", args.courseId);
      throw new Error("Course not found");
    }

    // Update enrollment status to completed
    try {
      await ctx.db.patch(args.enrollmentId, {
        status: "completed",
        progress: 100,
        completedAt: Date.now(),
      });
      console.log("Enrollment marked as completed");
    } catch (error) {
      console.error("Failed to update enrollment:", error);
    }

    // Generate unique certificate number
    const certificateNumber = `CERT-${Date.now()}-${args.userId.slice(-6)}`;

    // Create certificate
    const certificateId = await ctx.db.insert("certificates", {
      userId: args.userId,
      courseId: args.courseId,
      enrollmentId: args.enrollmentId,
      certificateNumber,
      issuedAt: Date.now(),
      pdfUrl: course.certificateTemplate, // Use template from course
    });

    console.log("Certificate created:", certificateId);
    return certificateId;
  },
});

// Get certificates by user
export const getCertificatesByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get certificates by user with course details
export const getCertificatesWithCourseByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const certificates = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get course details for each certificate
    const certificatesWithCourse = await Promise.all(
      certificates.map(async (cert) => {
        const course = await ctx.db.get(cert.courseId);
        return {
          ...cert,
          course,
        };
      }),
    );

    return certificatesWithCourse;
  },
});

// Get certificate by number
export const getCertificateByNumber = query({
  args: { certificateNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("certificates")
      .withIndex("by_certificate_number", (q) =>
        q.eq("certificateNumber", args.certificateNumber),
      )
      .first();
  },
});

// Get all certificates
export const getAllCertificates = query({
  handler: async (ctx) => {
    return await ctx.db.query("certificates").order("desc").collect();
  },
});
