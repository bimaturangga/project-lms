import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDatabase = mutation({
  handler: async (ctx) => {
    // Create admin user
    const adminId = await ctx.db.insert("users", {
      name: "Admin User",
      email: "admin@edulearn.com",
      password: "admin123", // In production, this should be hashed
      role: "admin",
      createdAt: Date.now(),
    });

    // No sample courses - admin will create courses manually
    return {
      message: "Database seeded successfully with admin user only",
      adminId,
    };
  },
});

export const clearDatabase = mutation({
  handler: async (ctx) => {
    // Clear all tables
    const users = await ctx.db.query("users").collect();
    const courses = await ctx.db.query("courses").collect();
    const enrollments = await ctx.db.query("enrollments").collect();
    const payments = await ctx.db.query("payments").collect();
    const cart = await ctx.db.query("cart").collect();
    const settings = await ctx.db.query("settings").collect();

    await Promise.all([
      ...users.map((u) => ctx.db.delete(u._id)),
      ...courses.map((c) => ctx.db.delete(c._id)),
      ...enrollments.map((e) => ctx.db.delete(e._id)),
      ...payments.map((p) => ctx.db.delete(p._id)),
      ...cart.map((c) => ctx.db.delete(c._id)),
      ...settings.map((s) => ctx.db.delete(s._id)),
    ]);

    return { message: "Database cleared successfully" };
  },
});
