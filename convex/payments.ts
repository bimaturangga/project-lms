import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create payment
export const createPayment = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
    amount: v.number(),
    paymentMethod: v.string(),
    invoiceNumber: v.string(),
    proofUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert("payments", {
      userId: args.userId,
      courseId: args.courseId,
      amount: args.amount,
      status: "pending",
      paymentMethod: args.paymentMethod,
      invoiceNumber: args.invoiceNumber,
      proofUrl: args.proofUrl,
      createdAt: Date.now(),
    });
    return paymentId;
  },
});

// Get all payments
export const getAllPayments = query({
  handler: async (ctx) => {
    return await ctx.db.query("payments").order("desc").collect();
  },
});

// Get payments by user
export const getPaymentsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get payments by status
export const getPaymentsByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("rejected"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Verify payment
export const verifyPayment = mutation({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    // Create enrollment when payment is verified
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: payment.userId,
      courseId: payment.courseId,
      status: "active",
      progress: 0,
      enrolledAt: Date.now(),
    });

    // Update payment status
    await ctx.db.patch(args.paymentId, {
      status: "verified",
      verifiedAt: Date.now(),
      enrollmentId: enrollmentId,
    });

    return args.paymentId;
  },
});

// Reject payment
export const rejectPayment = mutation({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      status: "rejected",
    });
    return args.paymentId;
  },
});
