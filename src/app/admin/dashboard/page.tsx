"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar, TopHeader } from "@/components/layout";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import styles from "./dashboard.module.css";
import DateRangeModal from "./DateRangeModal";
import {
  Users,
  BookOpen,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  Plus,
  UserPlus,
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Calendar,
} from "lucide-react";

const quickActions = [
  {
    label: "Tambah User",
    icon: <UserPlus size={24} />,
    href: "/admin/users",
  },
  {
    label: "Tambah Kursus",
    icon: <Plus size={24} />,
    href: "/admin/courses/new",
  },
  {
    label: "Lihat Laporan",
    icon: <FileText size={24} />,
    href: "/admin/reports",
  },
  {
    label: "Kelola Kursus",
    icon: <BookOpen size={24} />,
    href: "/admin/courses",
  },
];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [dateRangeLabel, setDateRangeLabel] = useState("Last 30 Days");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Fetch real data from Convex
  const allUsers = useQuery(api.users.getAllUsers);
  const allCourses = useQuery(api.courses.getAllCourses);
  const allEnrollments = useQuery(api.enrollments.getAllEnrollments);
  const allPayments = useQuery(api.payments.getAllPayments);

  // Debug logging
  console.log("Dashboard Debug:", {
    users: allUsers?.length || 0,
    courses: allCourses?.length || 0,
    enrollments: allEnrollments?.length || 0,
    payments: allPayments?.length || 0,
  });

  // Loading state
  if (
    allUsers === undefined ||
    allCourses === undefined ||
    allEnrollments === undefined ||
    allPayments === undefined
  ) {
    return (
      <div className={styles.layout}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className={styles.main}>
          <TopHeader
            title="Dashboard Admin"
            onMenuClick={() => setIsSidebarOpen(true)}
          />
          <div className={styles.content}>
            <div
              style={{
                textAlign: "center",
                padding: "4rem",
                fontSize: "1.2rem",
              }}
            >
              Memuat dashboard...
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Calculate real statistics
  const totalStudents =
    allUsers?.filter((u) => u.role === "student").length || 0;
  const totalCourses = allCourses?.length || 0;
  const pendingPayments =
    allPayments?.filter((p) => p.status === "pending").length || 0;
  const verifiedPayments =
    allPayments?.filter((p) => p.status === "verified") || [];
  const totalRevenue = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);

  // Calculate completion statistics
  const completedEnrollments =
    allEnrollments?.filter((e) => e.status === "completed") || [];
  const activeEnrollments =
    allEnrollments?.filter((e) => e.status === "active") || [];
  const totalEnrollments = allEnrollments?.length || 0;
  const completionRate =
    totalEnrollments > 0
      ? Math.round((completedEnrollments.length / totalEnrollments) * 100)
      : 0;

  // Average progress across all enrollments
  const totalProgress =
    allEnrollments?.reduce((sum, e) => sum + (e.progress || 0), 0) || 0;
  const avgProgress =
    totalEnrollments > 0 ? Math.round(totalProgress / totalEnrollments) : 0;

  // Calculate growth metrics (comparing with hypothetical last period)
  // Since we don't have historical data, we'll show actual counts instead of percentages
  const adminCount = allUsers?.filter((u) => u.role === "admin").length || 0;
  const publishedCourses =
    allCourses?.filter((c) => c.status === "published").length || 0;
  const draftCourses =
    allCourses?.filter((c) => c.status === "draft").length || 0;

  // Recent enrollments (last 5) - sorted by date
  const recentEnrollments =
    allEnrollments
      ?.slice()
      .sort((a, b) => b.enrolledAt - a.enrolledAt)
      .slice(0, 5)
      .map((enrollment) => {
        const student = allUsers?.find((u) => u._id === enrollment.userId);
        const course = allCourses?.find((c) => c._id === enrollment.courseId);

        // Map enrollment status correctly
        let displayStatus: "completed" | "active" | "pending" = "pending";
        if (
          enrollment.status === "completed" ||
          (enrollment.progress || 0) >= 100
        ) {
          displayStatus = "completed";
        } else if (enrollment.status === "active") {
          displayStatus = "active";
        }

        return {
          id: enrollment._id,
          name: student?.name || "Unknown Student",
          avatar:
            student?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.name || "U")}&background=random`,
          course: course?.title || "Unknown Course",
          status: displayStatus,
          progress: enrollment.progress || 0,
          date: new Date(enrollment.enrolledAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          }),
        };
      }) || [];

  // Top courses by enrollment count
  const topCourses =
    allCourses
      ?.map((course) => {
        const enrollmentCount =
          allEnrollments?.filter((e) => e.courseId === course._id).length || 0;
        const coursePayments =
          allPayments?.filter(
            (p) => p.courseId === course._id && p.status === "verified",
          ) || [];
        const revenue = coursePayments.reduce((sum, p) => sum + p.amount, 0);
        return {
          id: course._id,
          title: course.title,
          thumbnail:
            course.thumbnail ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=120&fit=crop",
          enrollments: enrollmentCount,
          revenue: `Rp ${(revenue / 1000).toFixed(0)}K`,
        };
      })
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5) || [];

  // Dynamic stats based on real data
  const dynamicStats = [
    {
      label: "Total Siswa",
      value: totalStudents.toString(),
      trend: adminCount > 0 ? `${adminCount} admin` : "Tidak ada admin",
      trendUp: true,
      subtext: `Total student terdaftar`,
      icon: <Users size={24} />,
      color: "green",
    },
    {
      label: "Total Kursus",
      value: totalCourses.toString(),
      trend: `${publishedCourses} published`,
      trendUp: publishedCourses > 0,
      subtext: draftCourses > 0 ? `${draftCourses} draft` : "Kursus tersedia",
      icon: <BookOpen size={24} />,
      color: "blue",
    },
    {
      label: "Pendapatan",
      value: `Rp ${(totalRevenue / 1000000).toFixed(1)} Jt`,
      trend:
        verifiedPayments.length > 0
          ? `${verifiedPayments.length} transaksi`
          : "Belum ada transaksi",
      trendUp: totalRevenue > 0,
      subtext: `Dari ${verifiedPayments.length} transaksi`,
      icon: <DollarSign size={24} />,
      color: "yellow",
    },
    {
      label: "Rate Completion",
      value: `${completionRate}%`,
      trend: `${completedEnrollments.length} selesai`,
      trendUp: completionRate >= 50,
      subtext: `Dari ${totalEnrollments} enrollment`,
      icon: <CheckCircle2 size={24} />,
      color: "green",
    },
    {
      label: "Rata-rata Progress",
      value: `${avgProgress}%`,
      trend:
        totalEnrollments > 0
          ? `${totalEnrollments} enrollment`
          : "Belum ada enrollment",
      trendUp: avgProgress >= 50,
      subtext:
        activeEnrollments.length > 0
          ? `${activeEnrollments.length} aktif, ${completedEnrollments.length} selesai`
          : "Progress semua kursus",
      icon: <TrendingUp size={24} />,
      color: "blue",
    },
    {
      label: "Pembayaran Pending",
      value: pendingPayments.toString(),
      trend: `${verifiedPayments.length} verified`,
      trendUp: pendingPayments === 0,
      subtext:
        verifiedPayments.length > 0
          ? `${verifiedPayments.length} verified`
          : "Perlu verifikasi",
      icon: <Clock size={24} />,
      color: "grey",
    },
  ];

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.main}>
        <TopHeader
          title="Admin Dashboard"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>
          {/* Header Section */}
          <div className={styles.headerSection}>
            <div className={styles.headerText}>
              <h1>Selamat Datang, {user?.name || "Admin"}! 👋</h1>
              <p>Berikut ringkasan platform untuk periode saat ini.</p>
            </div>
            <div className={styles.headerActions}>
              <Link href="/admin/courses/new" className={styles.headerButton}>
                <Plus size={20} />
                <span>Tambah Kursus</span>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            {dynamicStats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={styles.statIconLabel}>
                    <div className={`${styles.statIcon} ${styles[stat.color]}`}>
                      {stat.icon}
                    </div>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                  <span
                    className={`${styles.statTrend} ${stat.trendUp ? styles.up : styles.down}`}
                  >
                    {stat.trendUp ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    {stat.trend}
                  </span>
                </div>
                <p className={styles.statValue}>{stat.value}</p>
                <p className={styles.statSubtext}>{stat.subtext}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Aksi Cepat</h2>
            <div className={styles.quickActions}>
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={styles.actionCard}
                >
                  <div className={styles.actionIcon}>{action.icon}</div>
                  <span className={styles.actionLabel}>{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Two Column Grid */}
          <div className={styles.twoColumn}>
            {/* Recent Enrollments */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Pendaftaran Terbaru</h3>
                <Link href="/admin/enrollments" className={styles.cardLink}>
                  Lihat Semua <ArrowRight size={16} />
                </Link>
              </div>
              <div>
                {recentEnrollments.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem 1rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Users
                      size={48}
                      style={{ margin: "0 auto 1rem", opacity: 0.3 }}
                    />
                    <p>Belum ada pendaftaran</p>
                  </div>
                ) : (
                  recentEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className={styles.tableItem}>
                      <img
                        src={enrollment.avatar}
                        alt={enrollment.name}
                        className={styles.avatar}
                      />
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>
                          {enrollment.name}
                          <span
                            className={`${styles.badge} ${styles[enrollment.status]}`}
                          >
                            {enrollment.status === "completed" ? (
                              <CheckCircle2 size={12} />
                            ) : enrollment.status === "active" ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <AlertCircle size={12} />
                            )}
                            {enrollment.status === "completed"
                              ? "Selesai"
                              : enrollment.status === "active"
                                ? "Aktif"
                                : "Pending"}
                          </span>
                        </div>
                        <p className={styles.userMeta}>{enrollment.course}</p>
                      </div>
                      <span className={styles.itemDate}>{enrollment.date}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Courses */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Kursus Terpopuler</h3>
                <Link href="/admin/courses" className={styles.cardLink}>
                  Lihat Semua <ArrowRight size={16} />
                </Link>
              </div>
              <div>
                {topCourses.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem 1rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <BookOpen
                      size={48}
                      style={{ margin: "0 auto 1rem", opacity: 0.3 }}
                    />
                    <p>Belum ada kursus</p>
                  </div>
                ) : (
                  topCourses.map((course) => (
                    <div key={course.id} className={styles.courseItem}>
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className={styles.courseThumbnail}
                      />
                      <div className={styles.courseInfo}>
                        <h4 className={styles.courseTitle}>{course.title}</h4>
                        <p className={styles.courseEnrollments}>
                          {course.enrollments.toLocaleString()} pendaftaran
                        </p>
                      </div>
                      <div className={styles.courseRevenue}>
                        <p className={styles.revenueAmount}>{course.revenue}</p>
                        <p className={styles.revenueLabel}>Revenue</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
