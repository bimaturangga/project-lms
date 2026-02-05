import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get cart items by user
export const getCartByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get course details for each cart item
    const cartWithCourses = await Promise.all(
      cartItems.map(async (item) => {
        const course = await ctx.db.get(item.courseId);
        return {
          ...item,
          course,
        };
      }),
    );

    return cartWithCourses;
  },
});

// Add to cart
export const addToCart = mutation({
  args: {
    userId: v.id("users"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    // Check if already in cart
    const existing = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .first();

    if (existing) {
      throw new Error("Course already in cart");
    }

    const cartId = await ctx.db.insert("cart", {
      userId: args.userId,
      courseId: args.courseId,
      addedAt: Date.now(),
    });

    return cartId;
  },
});

// Remove from cart
export const removeFromCart = mutation({
  args: { cartId: v.id("cart") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.cartId);
  },
});

// Clear cart
export const clearCart = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    await Promise.all(cartItems.map((item) => ctx.db.delete(item._id)));
  },
});

// Get cart count
export const getCartCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return cartItems.length;
  },
});
