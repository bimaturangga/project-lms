"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import styles from "./Sidebar.module.css";
import Image from "next/image";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  History,
  Settings,
  Users,
  User,
  CreditCard,
  BarChart3,
  FileText,
  X,
  Headset,
} from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

const studentSections: SidebarSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/student/dashboard",
        icon: <LayoutDashboard />,
      },
      { label: "Kursus Saya", href: "/student/my-courses", icon: <BookOpen /> },
    ],
  },
  {
    title: "Pembelajaran",
    items: [
      {
        label: "Jelajahi Kursus",
        href: "/student/explore",
        icon: <GraduationCap />,
      },
      { label: "Sertifikat", href: "/student/certificates", icon: <Award /> },
      {
        label: "Progress Belajar",
        href: "/student/progress",
        icon: <BarChart3 />,
      },
    ],
  },
  {
    title: "Pengaturan",
    items: [{ label: "Profil", href: "/student/profile", icon: <Settings /> }],
  },
];

const adminSections: SidebarSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: <LayoutDashboard />,
      },
    ],
  },
  {
    title: "Manajemen",
    items: [
      { label: "Pengguna", href: "/admin/users", icon: <Users /> },
      { label: "Kursus", href: "/admin/courses", icon: <BookOpen /> },
      { label: "Pembayaran", href: "/admin/payments", icon: <CreditCard /> },
    ],
  },
  {
    title: "Laporan",
    items: [
      { label: "Analytics", href: "/admin/reports", icon: <BarChart3 /> },
    ],
  },
  {
    title: "Pengaturan",
    items: [
      { label: "Profil", href: "/admin/profile", icon: <User /> },
      { label: "Konfigurasi", href: "/admin/settings", icon: <Settings /> },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [isSupportModalOpen, setIsSupportModalOpen] = React.useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem("logoUrl");
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
  }, []);

  const sections = user?.role === "admin" ? adminSections : studentSections;

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        {/* Logo Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo"
                width={140}
                height={40}
                className={styles.logoImage}
                priority
              />
            ) : (
              <Image
                src="/logo.svg"
                alt="EduLearn"
                width={140}
                height={40}
                className={styles.logoImage}
                priority
              />
            )}
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`${styles.nav} scrollbar-hide`}>
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={styles.navSection}>
              {section.title && (
                <h3 className={styles.navTitle}>{section.title}</h3>
              )}
              <div className={styles.navList}>
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Support Card */}
        <div className={styles.support}>
          <div className={styles.supportInner}>
            <div className={styles.supportText}>
              <p className={styles.supportTitle}>Support Center</p>
              <button
                onClick={() => setIsSupportModalOpen(true)}
                className={styles.supportLink}
              >
                Butuh bantuan?
              </button>
            </div>
            <div className={styles.supportIcon}>
              <Headset size={24} />
            </div>
          </div>
        </div>
      </aside>

      {/* Support Modal */}
      {isSupportModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsSupportModalOpen(false)}
        >
          <div
            className={styles.supportModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Hubungi Kami</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setIsSupportModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Tim support kami siap membantu Anda melalui WhatsApp.
              </p>
              <div className={styles.whatsappInfo}>
                <Headset size={48} className={styles.whatsappIcon} />
                <p className={styles.whatsappNumber}>+62 812-3456-7890</p>
                <p className={styles.whatsappDesc}>
                  Jam operasional: Senin - Jumat, 09:00 - 17:00 WIB
                </p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <a
                href="https://wa.me/6281234567890?text=Halo,%20saya%20butuh%20bantuan%20terkait%20EduLearn"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
                onClick={() => setIsSupportModalOpen(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Hubungi via WA
              </a>
              <button
                className={styles.cancelBtn}
                onClick={() => setIsSupportModalOpen(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
