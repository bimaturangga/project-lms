import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create lesson
export const createLesson = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    videoUrl: v.optional(v.string()),
    duration: v.number(), // in minutes
    order: v.number(),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lessonId = await ctx.db.insert("lessons", {
      ...args,
      createdAt: Date.now(),
    });
    return lessonId;
  },
});

// Get lessons by course
export const getLessonsByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    // Sort by order field
    return lessons.sort((a, b) => a.order - b.order);
  },
});

// Get all lessons
export const getAllLessons = query({
  handler: async (ctx) => {
    return await ctx.db.query("lessons").collect();
  },
});

// Get lesson by ID
export const getLessonById = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lessonId);
  },
});

// Update lesson
export const updateLesson = mutation({
  args: {
    lessonId: v.id("lessons"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    order: v.optional(v.number()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { lessonId, ...updates } = args;
    await ctx.db.patch(lessonId, updates);
    return lessonId;
  },
});

// Delete lesson
export const deleteLesson = mutation({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.lessonId);
  },
});

// Get course with lessons
export const getCourseWithLessons = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) return null;

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    // Sort by order field
    const sortedLessons = lessons.sort((a, b) => a.order - b.order);

    return {
      ...course,
      lessons: sortedLessons,
    };
  },
});
