import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useNotifications = () => {
  const createNotification = useMutation(api.notifications.createNotification);
  const getUnreadCount = useQuery(api.notifications.getUnreadCount, {});
  const getRecentNotifications = useQuery(
    api.notifications.getRecentNotifications,
    {},
  );
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);

  // Helper function to create different types of notifications
  const createSystemNotification = async (message: string, metadata?: any) => {
    await createNotification({
      title: "Perubahan Sistem",
      message,
      type: "system",
      icon: "Settings",
      color: "#3b82f6",
      metadata,
    });
  };

  const createUserNotification = async (
    message: string,
    userId?: string,
    metadata?: any,
  ) => {
    await createNotification({
      title: "Aktivitas User",
      message,
      type: "user",
      icon: "User",
      color: "#10b981",
      userId: userId as any,
      metadata,
    });
  };

  const createCourseNotification = async (
    message: string,
    courseId?: string,
    metadata?: any,
  ) => {
    await createNotification({
      title: "Aktivitas Kursus",
      message,
      type: "course",
      icon: "BookOpen",
      color: "#f59e0b",
      relatedId: courseId,
      metadata,
    });
  };

  const createPaymentNotification = async (
    message: string,
    paymentId?: string,
    metadata?: any,
  ) => {
    await createNotification({
      title: "Transaksi Pembayaran",
      message,
      type: "payment",
      icon: "CreditCard",
      color: "#8b5cf6",
      relatedId: paymentId,
      metadata,
    });
  };

  const createCertificateNotification = async (
    message: string,
    userId?: string,
    metadata?: any,
  ) => {
    await createNotification({
      title: "Sertifikat",
      message,
      type: "certificate",
      icon: "Award",
      color: "#f97316",
      userId: userId as any,
      metadata,
    });
  };

  const createEnrollmentNotification = async (
    message: string,
    userId?: string,
    metadata?: any,
  ) => {
    await createNotification({
      title: "Pendaftaran Kursus",
      message,
      type: "enrollment",
      icon: "Users",
      color: "#06b6d4",
      userId: userId as any,
      metadata,
    });
  };

  return {
    // Queries
    unreadCount: getUnreadCount ?? 0,
    recentNotifications: getRecentNotifications ?? [],

    // Mutations
    markAsRead,
    markAllAsRead,
    deleteNotification,

    // Helpers
    createSystemNotification,
    createUserNotification,
    createCourseNotification,
    createPaymentNotification,
    createCertificateNotification,
    createEnrollmentNotification,
  };
};
