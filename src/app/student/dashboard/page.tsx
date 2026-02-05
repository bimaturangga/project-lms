"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar, TopHeader } from "@/components/layout";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import styles from "./dashboard.module.css";
import {
  BarChart,
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  Award,
  Users,
  Play,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch real data from Convex
  const enrollments = useQuery(
    api.enrollments.getEnrollmentsWithCourseByUser,
    user?._id ? { userId: user._id } : "skip",
  );
  const certificates = useQuery(
    api.certificates.getCertificatesWithCourseByUser,
    user?._id ? { userId: user._id } : "skip",
  );

  // Calculate statistics
  const activeEnrollments =
    enrollments?.filter((e) => e.status === "active") || [];
  const completedEnrollments =
    enrollments?.filter((e) => e.status === "completed") || [];

  const totalProgress =
    enrollments?.reduce((sum, e) => sum + (e.progress || 0), 0) || 0;
  const avgProgress =
    enrollments && enrollments.length > 0
      ? Math.round(totalProgress / enrollments.length)
      : 0;

  const stats = [
    {
      label: "Kursus Aktif",
      value: activeEnrollments.length,
      icon: <BookOpen size={24} />,
      color: "#3b82f6",
      bgColor: "#eff6ff",
    },
    {
      label: "Kursus Selesai",
      value: completedEnrollments.length,
      icon: <Trophy size={24} />,
      color: "#10b981",
      bgColor: "#ecfdf5",
    },
    {
      label: "Sertifikat",
      value: certificates?.length || 0,
      icon: <Award size={24} />,
      color: "#f59e0b",
      bgColor: "#fefbeb",
    },
    {
      label: "Rata-rata Progress",
      value: `${avgProgress}%`,
      icon: <TrendingUp size={24} />,
      color: "#8b5cf6",
      bgColor: "#f3f4f6",
    },
  ];

  const recentCertificates = certificates?.slice(0, 3) || [];

  // Helper functions for stats display
  const getStatColorClass = (color: string) => {
    switch (color) {
      case "#3b82f6":
        return styles.blue;
      case "#10b981":
        return styles.green;
      case "#f59e0b":
        return styles.yellow;
      case "#8b5cf6":
        return styles.purple;
      default:
        return styles.blue;
    }
  };

  const getStatSubtext = (label: string, value: any) => {
    switch (label) {
      case "Kursus Aktif":
        return value === 1
          ? "kursus sedang dipelajari"
          : "kursus sedang dipelajari";
      case "Kursus Selesai":
        return value === 1
          ? "kursus telah diselesaikan"
          : "kursus telah diselesaikan";
      case "Sertifikat":
        return value === 1 ? "sertifikat diraih" : "sertifikat diraih";
      case "Rata-rata Progress":
        return "dari seluruh kursus";
      default:
        return "";
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className={styles.main}>
        <TopHeader
          title="Dashboard Student"
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <div className={styles.content}>
          {/* Header Section */}
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <h1>
                Selamat datang, {user?.name?.split(" ")[0] || "Student"}! 👋
              </h1>
              <p className={styles.subtitle}>
                Pantau progress pembelajaran dan pencapaian Anda.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={styles.statIconLabel}>
                    <div
                      className={`${styles.statIcon} ${getStatColorClass(stat.color)}`}
                    >
                      {stat.icon}
                    </div>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statSubtext}>
                    {getStatSubtext(stat.label, stat.value)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className={styles.twoColumn}>
            {/* Progress Overview */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <BarChart size={20} style={{ marginRight: "8px" }} />
                  Progress Overview
                </h2>
                <Link href="/student/my-courses" className={styles.cardLink}>
                  Lihat Semua <ArrowRight size={16} />
                </Link>
              </div>
              <div className={styles.cardContent}>
                {enrollments && enrollments.length > 0 ? (
                  <div className={styles.progressList}>
                    {enrollments.slice(0, 4).map((enrollment: any) => (
                      <div key={enrollment._id} className={styles.courseItem}>
                        <div className={styles.courseAvatar}>
                          <BookOpen size={20} />
                        </div>
                        <div className={styles.courseInfo}>
                          <h4 className={styles.courseTitle}>
                            {enrollment.course?.title || "Course"}
                          </h4>
                          <div className={styles.progressBar}>
                            <div className={styles.progressTrack}>
                              <div
                                className={styles.progressFill}
                                style={{
                                  width: `${enrollment.progress || 0}%`,
                                }}
                              />
                            </div>
                            <span className={styles.progressText}>
                              {enrollment.progress || 0}%
                            </span>
                          </div>
                        </div>
                        <div className={styles.statusBadge}>
                          {enrollment.progress >= 100 ? (
                            <CheckCircle2 size={16} color="#10b981" />
                          ) : (
                            <Clock size={16} color="#f59e0b" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyStateCard}>
                    <div className={styles.emptyStateIcon}>
                      <BookOpen size={32} />
                    </div>
                    <div className={styles.emptyStateContent}>
                      <h3 className={styles.emptyStateTitle}>
                        Belum ada kursus
                      </h3>
                      <p className={styles.emptyStateText}>
                        Mulai belajar dengan mendaftar kursus pertama Anda
                      </p>
                      <Link
                        href="/student/explore"
                        className={styles.emptyStateButton}
                      >
                        Jelajahi Kursus
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className={styles.sidebar}>
              {/* Recent Certificates */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>
                    <Award size={20} style={{ marginRight: "8px" }} />
                    Sertifikat Terbaru
                  </h2>
                  <Link
                    href="/student/certificates"
                    className={styles.cardLink}
                  >
                    Lihat Semua <ArrowRight size={16} />
                  </Link>
                </div>
                <div className={styles.cardContent}>
                  {recentCertificates.length > 0 ? (
                    <div className={styles.certificateList}>
                      {recentCertificates.map((cert: any) => (
                        <div key={cert._id} className={styles.tableItem}>
                          <div className={styles.certificateAvatar}>
                            <Award size={20} />
                          </div>
                          <div className={styles.certificateInfo}>
                            <h4 className={styles.certificateTitle}>
                              {cert.course?.title || "Course"}
                            </h4>
                            <p className={styles.certificateDate}>
                              {new Date(cert.issuedAt).toLocaleDateString(
                                "id-ID",
                              )}
                            </p>
                          </div>
                          <a
                            href={cert.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.downloadButton}
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyStateCard}>
                      <div className={styles.emptyStateIcon}>
                        <Award size={32} />
                      </div>
                      <div className={styles.emptyStateContent}>
                        <h3 className={styles.emptyStateTitle}>
                          Belum ada sertifikat
                        </h3>
                        <p className={styles.emptyStateText}>
                          Selesaikan kursus untuk mendapatkan sertifikat
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>
                    <Clock size={20} style={{ marginRight: "8px" }} />
                    Aktivitas Terakhir
                  </h2>
                </div>
                <div className={styles.cardContent}>
                  {enrollments && enrollments.length > 0 ? (
                    <div className={styles.activityList}>
                      {enrollments.slice(0, 3).map((enrollment: any) => (
                        <div key={enrollment._id} className={styles.tableItem}>
                          <div className={styles.activityAvatar}>
                            <BookOpen size={20} />
                          </div>
                          <div className={styles.activityInfo}>
                            <h4 className={styles.activityTitle}>
                              {enrollment.course?.title || "Course"}
                            </h4>
                            <p className={styles.activityDesc}>
                              Progress: {enrollment.progress || 0}%
                            </p>
                          </div>
                          <div className={styles.activityTime}>
                            {new Date(enrollment.enrolledAt).toLocaleDateString(
                              "id-ID",
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyStateCard}>
                      <div className={styles.emptyStateIcon}>
                        <Clock size={32} />
                      </div>
                      <div className={styles.emptyStateContent}>
                        <h3 className={styles.emptyStateTitle}>
                          Belum ada aktivitas
                        </h3>
                        <p className={styles.emptyStateText}>
                          Aktivitas belajar Anda akan muncul di sini
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
