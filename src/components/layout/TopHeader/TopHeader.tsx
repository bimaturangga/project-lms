"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useThemeStore } from "@/stores/themeStore";
import { getInitials } from "@/lib/utils";
import NotificationDropdown from "../NotificationDropdown";
import styles from "./TopHeader.module.css";
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  ArrowLeft,
  ShoppingCart,
  Moon,
  Sun,
} from "lucide-react";

interface TopHeaderProps {
  title: string;
  onMenuClick?: () => void;
  showBackButton?: boolean;
}

export default function TopHeader({
  title,
  onMenuClick,
  showBackButton,
}: TopHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const cartStore = useCartStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-notification-dropdown]")) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isNotificationOpen]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push("/login");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <header className={styles.header}>
      {/* Mobile Menu Button or Back Button */}
      {showBackButton ? (
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={24} />
        </button>
      ) : onMenuClick ? (
        <button className={styles.menuButton} onClick={onMenuClick}>
          <Menu size={24} />
        </button>
      ) : null}

      {/* Page Title */}
      <h2 className={styles.title}>{title}</h2>

      {/* Actions */}
      <div className={styles.actions}>
        {user?.role !== "admin" && (
          <Link href="/student/cart" className={styles.iconButton}>
            <ShoppingCart size={24} />
            {cartStore.count > 0 && (
              <span className={styles.badge}>{cartStore.count}</span>
            )}
          </Link>
        )}

        {/* Notification Dropdown */}
        <div style={{ position: "relative" }} data-notification-dropdown>
          <NotificationDropdown
            isOpen={isNotificationOpen}
            onToggle={() => setIsNotificationOpen(!isNotificationOpen)}
          />
        </div>

        {/* Theme Toggle */}
        <button
          className={styles.iconButton}
          onClick={toggleTheme}
          title={theme === "light" ? "Dark Mode" : "Light Mode"}
        >
          {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
        </button>

        {/* User Profile */}
        <div className={styles.userSection} ref={dropdownRef}>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user?.name || "User"}</p>
            <p className={styles.userRole}>
              {user?.role === "admin" ? "Administrator" : "Student"}
            </p>
          </div>
          <button
            className={styles.avatar}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className={styles.avatarImage}
              />
            ) : (
              getInitials(user?.name || "U")
            )}
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className={styles.dropdown}>
              <Link
                href={
                  user?.role === "admin" ? "/admin/profile" : "/student/profile"
                }
                onClick={() => setIsDropdownOpen(false)}
                className={styles.dropdownItem}
              >
                <User size={16} />
                Profil Saya
              </Link>
              <div className={styles.dropdownDivider} />
              <button
                onClick={handleLogout}
                className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
              >
                <LogOut size={16} />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
