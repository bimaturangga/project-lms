"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar, TopHeader } from "@/components/layout";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import styles from "./explore.module.css";
import { Star, Search, GraduationCap } from "lucide-react";

const categories = [
  { id: "all", label: "Semua Kursus" },
  { id: "bahasa-china", label: "Bahasa China" },
  { id: "bahasa-turki", label: "Bahasa Turki" },
];

export default function ExploreCourses() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch courses from database
  const allCourses = useQuery(api.courses.getPublishedCourses);

  // Fetch all reviews to calculate accurate ratings
  const allReviews = useQuery(api.reviews.getAllReviews);

  // Calculate rating stats per course
  const courseRatingStats = React.useMemo(() => {
    if (!allReviews) return new Map();

    const stats = new Map<
      string,
      { averageRating: number; reviewCount: number }
    >();

    // Group reviews by courseId
    const reviewsByCourse = allReviews.reduce(
      (acc, review) => {
        const courseId = review.courseId;
        if (!acc[courseId]) {
          acc[courseId] = [];
        }
        acc[courseId].push(review);
        return acc;
      },
      {} as Record<string, typeof allReviews>,
    );

    // Calculate stats for each course
    Object.entries(reviewsByCourse).forEach(([courseId, reviews]) => {
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / reviews.length;
      stats.set(courseId, {
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
      });
    });

    return stats;
  }, [allReviews]);

  // Filter courses based on category and search
  const filteredCourses =
    allCourses?.filter((course) => {
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }) || [];

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.main}>
        <TopHeader
          title="Jelajahi Kursus"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>
          <div className={styles.headerSection}>
            <h1 className={styles.title}>Temukan Kursus Terbaik Untukmu</h1>
            <p className={styles.subtitle}>
              Tingkatkan skill dengan mentor berpengalaman di industri.
            </p>
          </div>

          {/* Search Bar */}
          <div className={styles.searchSection}>
            <div className={styles.searchContainer}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Cari kelas, skill, atau mentor..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filterSection}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.filterBtn} ${selectedCategory === cat.id ? styles.active : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className={styles.courseGrid}>
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div key={course._id} className={styles.courseCard}>
                  <div className={styles.cardImageWrapper}>
                    <img
                      src={
                        course.thumbnail ||
                        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=340&fit=crop"
                      }
                      alt={course.title}
                      className={styles.cardImage}
                    />
                    {course.status === "published" && (
                      <div className={`${styles.badge} ${styles.new}`}>
                        Published
                      </div>
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{course.title}</h3>
                    <p className={styles.cardInstructor}>{course.instructor}</p>

                    <div className={styles.rating}>
                      <Star size={14} className={styles.starIcon} />
                      {(() => {
                        const stats = courseRatingStats.get(course._id);
                        if (!stats || stats.reviewCount === 0) {
                          return (
                            <>
                              <span>Belum ada rating</span>
                            </>
                          );
                        }
                        return (
                          <>
                            <span>{stats.averageRating.toFixed(1)}</span>
                            <span className={styles.ratingCount}>
                              ({stats.reviewCount})
                            </span>
                          </>
                        );
                      })()}
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.price}>
                        Rp {course.price.toLocaleString("id-ID")}
                      </span>
                      <Link
                        href={`/student/explore/${course._id}`}
                        className={styles.enrollButton}
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "4rem 2rem",
                  color: "var(--text-secondary)",
                }}
              >
                <GraduationCap
                  size={64}
                  style={{ margin: "0 auto 1.5rem", opacity: 0.3 }}
                />
                <h3
                  style={{
                    marginBottom: "0.5rem",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                  }}
                >
                  Belum ada kursus tersedia
                </h3>
                <p style={{ fontSize: "0.95rem" }}>
                  {searchQuery
                    ? `Tidak ada kursus yang ditemukan untuk "${searchQuery}"`
                    : "Kursus akan segera hadir"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
