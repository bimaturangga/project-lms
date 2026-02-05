"use client";

import React, { useState } from "react";
import {
  Bell,
  X,
  Settings,
  User,
  BookOpen,
  CreditCard,
  Award,
  Users,
  Clock,
  Check,
  Trash2,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import styles from "./NotificationDropdown.module.css";

const iconMap = {
  Settings,
  User,
  BookOpen,
  CreditCard,
  Award,
  Users,
};

interface NotificationDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function NotificationDropdown({
  isOpen,
  onToggle,
}: NotificationDropdownProps) {
  const {
    unreadCount,
    recentNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleMarkAsRead = async (
    notificationId: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    await markAsRead({ notificationId: notificationId as any });
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead({});
  };

  const handleDeleteNotification = async (
    notificationId: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    await deleteNotification({ notificationId: notificationId as any });
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    return `${days} hari yang lalu`;
  };

  return (
    <>
      {/* Notification Button */}
      <div className={styles.notificationButton} onClick={onToggle}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className={styles.overlay} onClick={onToggle} />
          <div className={styles.dropdown}>
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <Bell size={18} />
                <span className={styles.title}>Notifikasi</span>
                {unreadCount > 0 && (
                  <span className={styles.count}>({unreadCount})</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  className={styles.markAllBtn}
                  onClick={handleMarkAllAsRead}
                >
                  <Check size={14} />
                  Tandai Semua Dibaca
                </button>
              )}
            </div>

            <div className={styles.content}>
              {recentNotifications.length === 0 ? (
                <div className={styles.empty}>
                  <Bell size={48} />
                  <p>Tidak ada notifikasi</p>
                  <span>Semua aktivitas akan muncul di sini</span>
                </div>
              ) : (
                <div className={styles.notificationList}>
                  {recentNotifications.map((notification) => {
                    const IconComponent =
                      iconMap[notification.icon as keyof typeof iconMap] ||
                      Bell;

                    return (
                      <div
                        key={notification._id}
                        className={`${styles.notificationItem} ${
                          !notification.isRead ? styles.unread : ""
                        }`}
                      >
                        <div className={styles.notificationContent}>
                          <div
                            className={styles.iconWrapper}
                            style={{
                              backgroundColor: `${notification.color}20`,
                            }}
                          >
                            <IconComponent
                              size={16}
                              color={notification.color}
                            />
                          </div>

                          <div className={styles.textContent}>
                            <h4 className={styles.notificationTitle}>
                              {notification.title}
                            </h4>
                            <p className={styles.notificationMessage}>
                              {notification.message}
                            </p>
                            <div className={styles.notificationMeta}>
                              <Clock size={12} />
                              <span>
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className={styles.actions}>
                          {!notification.isRead && (
                            <button
                              className={styles.actionBtn}
                              onClick={(e) =>
                                handleMarkAsRead(notification._id, e)
                              }
                              title="Tandai sudah dibaca"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            className={styles.actionBtn}
                            onClick={(e) =>
                              handleDeleteNotification(notification._id, e)
                            }
                            title="Hapus notifikasi"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {recentNotifications.length > 0 && (
              <div className={styles.footer}>
                <button className={styles.viewAllBtn}>
                  Lihat Semua Notifikasi
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
