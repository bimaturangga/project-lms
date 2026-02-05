import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create notification
export const createNotification = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("system"),
      v.literal("user"),
      v.literal("course"),
      v.literal("payment"),
      v.literal("certificate"),
      v.literal("enrollment"),
    ),
    icon: v.string(),
    color: v.string(),
    userId: v.optional(v.id("users")),
    relatedId: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        action: v.string(),
        entity: v.string(),
        oldValue: v.optional(v.string()),
        newValue: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

// Get all notifications (for admin)
export const getAllNotifications = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 50, offset = 0 } = args;

    return await ctx.db.query("notifications").order("desc").paginate({
      cursor: null,
      numItems: limit,
    });
  },
});

// Get unread notifications count
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const notifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return notifications.length;
  },
});

// Get recent notifications for dropdown
export const getRecentNotifications = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit = 10 } = args;

    return await ctx.db.query("notifications").order("desc").take(limit);
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.notificationId, {
      isRead: true,
    });
  },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        isRead: true,
      });
    }

    return unreadNotifications.length;
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.notificationId);
  },
});

// Clear all notifications
export const clearAllNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    const notifications = await ctx.db.query("notifications").collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    return notifications.length;
  },
});

// Send notification to users based on their preferences
export const sendNotificationToUsers = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("system"),
      v.literal("user"),
      v.literal("course"),
      v.literal("payment"),
      v.literal("certificate"),
      v.literal("enrollment"),
    ),
    icon: v.string(),
    color: v.string(),
    preferenceType: v.union(
      v.literal("courseUpdates"),
      v.literal("newLessons"),
      v.literal("promotions"),
    ),
    relatedId: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        action: v.string(),
        entity: v.string(),
        oldValue: v.optional(v.string()),
        newValue: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Get all users who have this notification type enabled
    const users = await ctx.db.query("users").collect();
    const notificationIds = [];

    for (const user of users) {
      const preferences = user.notificationPreferences;

      // Check if user has this type of notification enabled
      const shouldNotify = preferences?.[args.preferenceType] ?? true;

      if (shouldNotify) {
        const notificationId = await ctx.db.insert("notifications", {
          title: args.title,
          message: args.message,
          type: args.type,
          icon: args.icon,
          color: args.color,
          userId: user._id,
          relatedId: args.relatedId,
          metadata: args.metadata,
          isRead: false,
          createdAt: Date.now(),
        });
        notificationIds.push(notificationId);
      }
    }

    return notificationIds;
  },
});
