// Helper functions for sending notifications based on user preferences

// import { api } from "../convex/_generated/api";

export const NotificationTypes = {
  COURSE_CREATED: {
    type: "course" as const,
    preferenceType: "newLessons" as const,
    icon: "📚",
    color: "#4f46e5",
  },
  COURSE_UPDATED: {
    type: "course" as const,
    preferenceType: "courseUpdates" as const,
    icon: "🔄",
    color: "#0891b2",
  },
  PROMOTION: {
    type: "system" as const,
    preferenceType: "promotions" as const,
    icon: "🎉",
    color: "#dc2626",
  },
} as const;

// Example usage functions that can be called from other parts of the application

export const notificationExamples = {
  // Call this when a new course is created
  onCourseCreated: async (
    courseTitle: string,
    courseId: string,
    sendNotification: any,
  ) => {
    await sendNotification({
      title: "Kursus Baru Tersedia!",
      message: `Kursus "${courseTitle}" telah tersedia untuk dipelajari`,
      type: NotificationTypes.COURSE_CREATED.type,
      icon: NotificationTypes.COURSE_CREATED.icon,
      color: NotificationTypes.COURSE_CREATED.color,
      preferenceType: NotificationTypes.COURSE_CREATED.preferenceType,
      relatedId: courseId,
      metadata: {
        action: "create",
        entity: "course",
        newValue: courseTitle,
      },
    });
  },

  // Call this when a course is updated
  onCourseUpdated: async (
    courseTitle: string,
    courseId: string,
    updateDetails: string,
    sendNotification: any,
  ) => {
    await sendNotification({
      title: "Kursus Diperbarui",
      message: `Kursus "${courseTitle}" telah diperbarui: ${updateDetails}`,
      type: NotificationTypes.COURSE_UPDATED.type,
      icon: NotificationTypes.COURSE_UPDATED.icon,
      color: NotificationTypes.COURSE_UPDATED.color,
      preferenceType: NotificationTypes.COURSE_UPDATED.preferenceType,
      relatedId: courseId,
      metadata: {
        action: "update",
        entity: "course",
        newValue: updateDetails,
      },
    });
  },

  // Call this when there's a promotion
  onPromotion: async (
    promotionTitle: string,
    promotionDetails: string,
    sendNotification: any,
  ) => {
    await sendNotification({
      title: promotionTitle,
      message: promotionDetails,
      type: NotificationTypes.PROMOTION.type,
      icon: NotificationTypes.PROMOTION.icon,
      color: NotificationTypes.PROMOTION.color,
      preferenceType: NotificationTypes.PROMOTION.preferenceType,
      metadata: {
        action: "create",
        entity: "promotion",
        newValue: promotionTitle,
      },
    });
  },
};
