import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create course
export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    level: v.union(
      v.literal("Pemula"),
      v.literal("Menengah"),
      v.literal("Lanjutan"),
    ),
    price: v.number(),
    thumbnail: v.string(),
    instructor: v.string(),
    duration: v.string(),
    certificateTemplate: v.optional(v.string()),
    previewVideo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const courseId = await ctx.db.insert("courses", {
      ...args,
      totalStudents: 0,
      rating: 0,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return courseId;
  },
});

// Get all courses
export const getAllCourses = query({
  handler: async (ctx) => {
    return await ctx.db.query("courses").order("desc").collect();
  },
});

// Get published courses
export const getPublishedCourses = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();
  },
});

// Get course by ID
export const getCourseById = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.courseId);
  },
});

// Get courses by category
export const getCoursesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Update course
export const updateCourse = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    level: v.optional(
      v.union(
        v.literal("Pemula"),
        v.literal("Menengah"),
        v.literal("Lanjutan"),
      ),
    ),
    price: v.optional(v.number()),
    thumbnail: v.optional(v.string()),
    instructor: v.optional(v.string()),
    duration: v.optional(v.string()),
    certificateTemplate: v.optional(v.string()),
    previewVideo: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { courseId, ...updates } = args;
    await ctx.db.patch(courseId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return courseId;
  },
});

// Delete course
export const deleteCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.courseId);
  },
});

// Search courses
export const searchCourses = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allCourses = await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const searchLower = args.searchTerm.toLowerCase();
    return allCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.category.toLowerCase().includes(searchLower),
    );
  },
});
