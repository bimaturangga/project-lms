"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Sidebar, TopHeader } from "@/components/layout";
import { useAuthStore } from "@/stores/authStore";
import { Id } from "../../../../convex/_generated/dataModel";
import styles from "./my-courses.module.css";
import { BookOpen, Clock, Play, CheckCircle2, Search } from "lucide-react";

type FilterType = "all" | "in_progress" | "completed" | "active";

export default function MyCoursesPage() {
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  // Get user enrollments with course details
  const enrollmentsData = useQuery(
    api.enrollments.getEnrollmentsWithCourseByUser,
    user ? { userId: user._id as Id<"users"> } : "skip",
  );

  const enrolledCourses = enrollmentsData || [];

  const filteredCourses = enrolledCourses.filter((enrollment: any) => {
    if (filter === "all") return true;
    return enrollment.status === filter;
  });

  const filters: { label: string; value: FilterType }[] = [
    { label: "Semua Kursus", value: "all" },
    { label: "Aktif", value: "active" },
    { label: "Selesai", value: "completed" },
  ];

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.main}>
        <TopHeader
          title="Kursus Saya"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>
          {/* Header */}
          <div className={styles.headerSection}>
            <div className={styles.headerText}>
              <h1>Kursus Saya</h1>
              <p>Lanjutkan belajar atau lihat kursus yang sudah selesai</p>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filters}>
            {filters.map((f) => (
              <button
                key={f.value}
                className={`${styles.filterBtn} ${filter === f.value ? styles.active : ""}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Courses Grid */}
          {filteredCourses.length > 0 ? (
            <div className={styles.coursesGrid}>
              {filteredCourses.map((enrollment) => (
                <div key={enrollment._id} className={styles.courseCard}>
                  <div className={styles.courseThumbnail}>
                    <img
                      src={
                        enrollment.course?.thumbnail ||
                        "/placeholder-course.png"
                      }
                      alt={enrollment.course?.title || "Course"}
                    />
                    <span
                      className={`${styles.courseStatus} ${enrollment.status === "completed" ? styles.completed : styles.inProgress}`}
                    >
                      {enrollment.status === "completed" ? "Selesai" : "Aktif"}
                    </span>
                  </div>

                  <div className={styles.courseContent}>
                    <span className={styles.courseCategory}>
                      {enrollment.course?.category || "Kursus"}
                    </span>
                    <h3 className={styles.courseTitle}>
                      {enrollment.course?.title}
                    </h3>
                    <p className={styles.courseInstructor}>
                      oleh {enrollment.course?.instructor}
                    </p>

                    {/* Progress */}
                    <div className={styles.progressSection}>
                      <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>
                          Progress: {enrollment.progress || 0}%
                        </span>
                        <span className={styles.progressPercent}>
                          {enrollment.progress || 0}%
                        </span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={`${styles.progressFill} ${(enrollment.progress || 0) === 100 ? styles.complete : ""}`}
                          style={{ width: `${enrollment.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.courseFooter}>
                      <div className={styles.courseMeta}>
                        <span className={styles.metaItem}>
                          <Clock size={14} />
                          {enrollment.course?.duration || "Duration N/A"}
                        </span>
                      </div>
                      <Link
                        href={`/student/learn/${enrollment.courseId}`}
                        className={`${styles.continueBtn} ${(enrollment.progress || 0) >= 100 ? styles.completed : ""}`}
                      >
                        {(enrollment.progress || 0) >= 100 ? (
                          <>
                            <CheckCircle2 size={16} />
                            Selesai
                          </>
                        ) : (
                          <>
                            <Play size={16} />
                            Lanjut
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <BookOpen size={40} />
              </div>
              <h3 className={styles.emptyTitle}>Belum ada kursus</h3>
              <p className={styles.emptyText}>
                Anda belum mengikuti kursus apapun. Jelajahi katalog kursus
                kami!
              </p>
              <Link href="/student/explore" className={styles.browseBtn}>
                <Search size={20} />
                Jelajahi Kursus
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
