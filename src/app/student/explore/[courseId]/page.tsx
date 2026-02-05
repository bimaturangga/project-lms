"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Sidebar, TopHeader } from "@/components/layout";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { Id } from "../../../../../convex/_generated/dataModel";
import styles from "./detail.module.css";
import {
  Star,
  ArrowLeft,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  ShieldCheck,
  Play,
  Zap,
  Layout,
  Database,
  Code2,
  Check,
  MessageSquare,
} from "lucide-react";

export default function CourseDetail({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);
  const { user } = useAuthStore();
  const router = useRouter();

  const { courseId: courseIdParam } = use(params);
  const courseId = courseIdParam as Id<"courses">;

  // Fetch course data from Convex
  const courseData = useQuery(api.courses.getCourseById, { courseId });

  // Check if user is already enrolled
  const userEnrollments = useQuery(
    api.enrollments.getEnrollmentsByUser,
    user ? { userId: user._id as Id<"users"> } : "skip",
  );

  const isEnrolled = userEnrollments?.some(
    (enrollment) => enrollment.courseId === courseId,
  );

  // Fetch reviews for this course
  const courseReviews = useQuery(api.reviews.getReviewsByCourse, { courseId });
  const ratingStats = useQuery(api.reviews.getCourseRatingStats, { courseId });

  const handleAddToCart = () => {
    if (courseData) {
      addToCart({
        _id: courseData._id,
        title: courseData.title,
        instructor: courseData.instructor,
        price: courseData.price,
        thumbnail: courseData.thumbnail,
      });
      setShowSuccessModal(true);
    }
  };

  const handleBuyNow = () => {
    if (courseData) {
      router.push(`/student/payment/${courseData._id}`);
    }
  };

  if (!courseData) {
    return (
      <div className={styles.layout}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className={styles.main}>
          <TopHeader
            title="Detail Kursus"
            onMenuClick={() => setIsSidebarOpen(true)}
          />
          <div className={styles.content}>
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Memuat detail kursus...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      "bahasa-china": "Bahasa China",
      programming: "Programming",
      design: "Design",
      business: "Business",
      marketing: "Marketing",
    };
    return (
      categoryMap[category] ||
      category
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  const getLevelDisplayName = (level: string) => {
    const levelMap: Record<string, string> = {
      Pemula: "Pemula",
      Menengah: "Menengah",
      Lanjutan: "Lanjutan",
    };
    return levelMap[level] || level;
  };

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.main}>
        <div className={styles.content}>
          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <Link href="/student/explore" className={styles.backLink}>
              <ArrowLeft size={16} />
              Kembali ke Katalog
            </Link>
          </div>

          <div className={styles.headerSection}>
            <h1 className={styles.title}>{courseData.title}</h1>
          </div>

          <div className={styles.detailGrid}>
            {/* Main Content (Left) */}
            <div className={styles.mainContent}>
              {/* Hero Media */}
              <div className={styles.heroMedia}>
                {courseData.previewVideo ? (
                  // Check if it's a YouTube URL
                  courseData.previewVideo.includes("youtube.com") ||
                    courseData.previewVideo.includes("youtu.be") ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${courseData.previewVideo.includes("youtu.be")
                          ? courseData.previewVideo.split("/").pop()
                          : new URLSearchParams(
                            new URL(courseData.previewVideo).search
                          ).get("v")
                        }`}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={courseData.previewVideo}
                      controls
                      poster={courseData.thumbnail}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    >
                      Browser Anda tidak mendukung video tag.
                    </video>
                  )
                ) : (
                  <>
                    <img
                      src={courseData.thumbnail || "/placeholder-course.jpg"}
                      alt={courseData.title}
                      className={styles.heroImage}
                    />
                    <div className={styles.playOverlay}>
                      <Play size={32} className={styles.playIcon} fill="white" />
                    </div>
                  </>
                )}
              </div>

              {/* Course Description and Meta */}
              <div style={{ marginTop: "24px", marginBottom: "32px" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--foreground)",
                    }}
                  >
                    <Star
                      size={16}
                      fill="var(--warning)"
                      color="var(--warning)"
                    />
                    {ratingStats?.averageRating || courseData.rating || 5.0}
                  </div>
                  <span style={{ fontSize: "14px", color: "var(--secondary)" }}>
                    ({ratingStats?.totalReviews || courseData.totalStudents?.toLocaleString() || 0} {ratingStats?.totalReviews ? "ulasan" : "students"})
                  </span>
                  <span style={{ fontSize: "14px", color: "var(--secondary)" }}>
                    •
                  </span>
                  <span
                    style={{ fontSize: "14px", color: "var(--foreground)" }}
                  >
                    {getLevelDisplayName(courseData.level)}
                  </span>
                  <span style={{ fontSize: "14px", color: "var(--secondary)" }}>
                    •
                  </span>
                  <span
                    style={{ fontSize: "14px", color: "var(--foreground)" }}
                  >
                    {getCategoryDisplayName(courseData.category)}
                  </span>
                </div>

                <p className={styles.subtitle}>{courseData.description}</p>
              </div>

              {/* Course Info */}
              <section>
                <h2 className={styles.sectionTitle}>Informasi Kursus</h2>
                <div className={styles.keypointsGrid}>
                  <div className={styles.keypointCard}>
                    <div className={styles.keypointHeader}>
                      <div className={styles.keypointIconWrapper}>
                        <Clock size={20} />
                      </div>
                      <h3 className={styles.keypointTitle}>Durasi</h3>
                    </div>
                    <p className={styles.keypointDesc}>{courseData.duration}</p>
                  </div>
                  <div className={styles.keypointCard}>
                    <div className={styles.keypointHeader}>
                      <div className={styles.keypointIconWrapper}>
                        <BookOpen size={20} />
                      </div>
                      <h3 className={styles.keypointTitle}>Level</h3>
                    </div>
                    <p className={styles.keypointDesc}>
                      {getLevelDisplayName(courseData.level)}
                    </p>
                  </div>
                  <div className={styles.keypointCard}>
                    <div className={styles.keypointHeader}>
                      <div className={styles.keypointIconWrapper}>
                        <Award size={20} />
                      </div>
                      <h3 className={styles.keypointTitle}>Sertifikat</h3>
                    </div>
                    <p className={styles.keypointDesc}>
                      {courseData.certificateTemplate
                        ? "Ya, tersedia sertifikat"
                        : "Tidak tersedia sertifikat"}
                    </p>
                  </div>
                  <div className={styles.keypointCard}>
                    <div className={styles.keypointHeader}>
                      <div className={styles.keypointIconWrapper}>
                        <Zap size={20} />
                      </div>
                      <h3 className={styles.keypointTitle}>Kategori</h3>
                    </div>
                    <p className={styles.keypointDesc}>
                      {getCategoryDisplayName(courseData.category)}
                    </p>
                  </div>
                </div>
              </section>

              {/* Instructor */}
              <section>
                <h2 className={styles.sectionTitle}>Instruktur</h2>
                <div className={styles.instructorCard}>
                  <div className={styles.instructorInfo}>
                    <h3 className={styles.instructorName}>
                      {courseData.instructor}
                    </h3>
                    <p className={styles.instructorRole}>Instruktur Kursus</p>
                    <p className={styles.instructorBio}>
                      Instruktur berpengalaman yang akan membimbing Anda dalam
                      menguasai materi kursus ini.
                    </p>
                  </div>
                </div>
              </section>

              {/* Reviews Section */}
              <section className={styles.reviewsSection}>
                <div className={styles.reviewsHeader}>
                  <h2 className={styles.sectionTitle}>Ulasan Siswa</h2>
                  <div className={styles.reviewsStats}>
                    <div className={styles.avgRating}>
                      <Star size={24} fill="#EAB308" />
                      {ratingStats?.averageRating || courseData.rating || 5.0}
                    </div>
                    <span className={styles.totalReviews}>
                      ({ratingStats?.totalReviews || 0} ulasan)
                    </span>
                  </div>
                </div>

                <div className={styles.reviewsList}>
                  {courseReviews && courseReviews.length > 0 ? (
                    courseReviews.slice(0, 5).map((review) => (
                      <div key={review._id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                          <img
                            src={
                              review.userAvatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName)}&background=random`
                            }
                            alt={review.userName}
                            className={styles.reviewerAvatar}
                          />
                          <div className={styles.reviewerInfo}>
                            <h4 className={styles.reviewerName}>
                              {review.userName}
                            </h4>
                            <span className={styles.reviewDate}>
                              {new Date(review.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className={styles.reviewRating}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                fill={review.rating >= star ? "#EAB308" : "transparent"}
                                color={review.rating >= star ? "#EAB308" : "#D1D5DB"}
                              />
                            ))}
                          </div>
                        </div>
                        <p className={styles.reviewText}>{review.review}</p>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyReviews}>
                      <MessageSquare size={48} />
                      <p>Belum ada ulasan untuk kursus ini</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Sticky Sidebar (Right) */}
            <div className={styles.sidebarWrapper}>
              <div className={styles.purchaseCard}>
                <div className={styles.purchaseHeader}>
                  <div className={styles.priceLabel}>Investasi Belajar</div>
                  <div className={styles.price}>
                    {formatPrice(courseData.price)}
                  </div>
                </div>

                <div className={styles.actionButtons}>
                  {isEnrolled ? (
                    <Link
                      href={`/student/learn/${courseId}`}
                      className={styles.btnPrimary}
                    >
                      <Play size={16} />
                      Lanjut Belajar
                    </Link>
                  ) : (
                    <>
                      <button
                        className={styles.btnPrimary}
                        onClick={handleBuyNow}
                      >
                        Gabung Kelas Sekarang
                      </button>
                      <button
                        className={styles.btnOutline}
                        onClick={handleAddToCart}
                      >
                        Tambahkan ke Keranjang
                      </button>
                    </>
                  )}
                </div>

                <div className={styles.benefitList}>
                  <div className={styles.benefitItem}>
                    <CheckCircle2 size={16} className={styles.checkIcon} />
                    <span>Akses materi selamanya</span>
                  </div>
                  <div className={styles.benefitItem}>
                    <CheckCircle2 size={16} className={styles.checkIcon} />
                    <span>Video pembelajaran berkualitas</span>
                  </div>
                  {courseData.certificateTemplate && (
                    <div className={styles.benefitItem}>
                      <CheckCircle2 size={16} className={styles.checkIcon} />
                      <span>Sertifikat kelulusan</span>
                    </div>
                  )}
                  <div className={styles.benefitItem}>
                    <CheckCircle2 size={16} className={styles.checkIcon} />
                    <span>Dukungan instruktur</span>
                  </div>
                </div>

                <div style={{ marginTop: "24px", textAlign: "center" }}>
                  <p style={{ fontSize: "12px", color: "var(--secondary)" }}>
                    <ShieldCheck
                      size={14}
                      style={{
                        display: "inline",
                        marginRight: "4px",
                        verticalAlign: "text-bottom",
                      }}
                    />
                    Garansi 30 Hari Uang Kembali
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowSuccessModal(false)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalIconWrapper}>
                <Check size={32} />
              </div>
              <h3 className={styles.modalTitle}>Berhasil!</h3>
              <p className={styles.modalText}>
                Berhasil memasukkan ke keranjang.
              </p>
              <button
                className={styles.modalBtn}
                onClick={() => setShowSuccessModal(false)}
              >
                Oke, Mengerti
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
