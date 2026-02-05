"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import { Sidebar, TopHeader } from "@/components/layout";
import styles from "./certificates.module.css";
import { generateCertificatePDF } from "@/lib/certificateGenerator";
import {
  Award,
  Download,
  Share2,
  Eye,
  Calendar,
  BookOpen,
  Search,
  TrendingUp,
  Clock,
  Copy,
  Check,
  X,
  Linkedin,
  Twitter,
} from "lucide-react";

export default function CertificatesPage() {
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharingCert, setSharingCert] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Fetch user's certificates with course details
  const certificates = useQuery(
    api.certificates.getCertificatesWithCourseByUser,
    user?._id ? { userId: user._id } : "skip",
  );

  // Fetch user's completed courses for claimable certificates
  const enrollments = useQuery(
    api.enrollments.getEnrollmentsByUser,
    user?._id ? { userId: user._id } : "skip",
  );

  // Filter certificates based on search
  const filteredCertificates =
    certificates?.filter(
      (cert) =>
        cert.certificateNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        cert.course?.title.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  // Calculate stats
  const totalCertificates = certificates?.length || 0;

  // Completed courses = courses that have certificates
  const completedCoursesCount = certificates?.length || 0;

  // Get enrollments with "completed" status
  const completedEnrollments =
    enrollments?.filter((enrollment) => enrollment.status === "completed") ||
    [];

  // Claimable certificates = completed enrollments without certificates yet
  const claimableCertificates = completedEnrollments.filter((enrollment) => {
    return !certificates?.some((cert) => cert.courseId === enrollment.courseId);
  });

  // Download certificate as PDF
  const handleDownloadCertificate = async (
    certificateId: string,
    certificateNumber: string,
  ) => {
    try {
      setIsDownloading(certificateId);

      console.log(
        "Fetching certificate data:",
        certificateId,
        "for user:",
        user?._id,
      );

      // Find certificate in local data
      const certificate = certificates?.find(
        (cert) => cert._id === certificateId,
      );

      if (!certificate || !certificate.course) {
        throw new Error("Certificate or course data not found");
      }

      // Fetch settings for theme color and logo
      const settingsResponse = await fetch("/api/certificates/settings");
      let themeColor = "#2563eb";
      let logoUrl = undefined;

      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        themeColor = settings.themeColor || "#2563eb";
        logoUrl = settings.logoUrl;
      }

      // Format completion date
      const completionDate = new Date(certificate.issuedAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );

      console.log("Generating PDF in browser...");

      // Generate PDF directly in browser
      const pdf = generateCertificatePDF({
        studentName: user?.name || "Student",
        courseName: certificate.course.title,
        completionDate: completionDate,
        certificateNumber: certificate.certificateNumber,
        instructorName: certificate.course.instructor,
        duration: certificate.course.duration,
        themeColor: themeColor,
        logoUrl: logoUrl,
      });

      console.log("PDF generated successfully, downloading...");

      // Download PDF
      pdf.save(`certificate-${certificateNumber}.pdf`);

      console.log("Download complete!");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Gagal mengunduh sertifikat: ${errorMessage}`);
    } finally {
      setIsDownloading(null);
    }
  };

  // Share certificate
  const handleShareCertificate = async (cert: any) => {
    const shareText = `🎓 Saya baru saja menyelesaikan "${cert.course?.title}" di platform Edu Learn!\n\nSertifikat: ${cert.certificateNumber}\nTanggal: ${new Date(cert.issuedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
    const shareUrl = window.location.origin + window.location.pathname;

    // Try Web Share API first (mobile-friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Sertifikat - ${cert.course?.title}`,
          text: shareText,
          url: shareUrl,
        });
        console.log("Certificate shared successfully");
        return;
      } catch (error) {
        console.log("Share cancelled or failed:", error);
      }
    }

    // Fallback: Show share modal
    setSharingCert(cert);
    setShareModalOpen(true);
  };

  // Copy share text to clipboard
  const handleCopyShareText = () => {
    if (!sharingCert) return;

    const shareText = `🎓 Saya baru saja menyelesaikan "${sharingCert.course?.title}" di platform Edu Learn!\n\nSertifikat: ${sharingCert.certificateNumber}\nTanggal: ${new Date(sharingCert.issuedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}\n\n${window.location.origin}/student/certificates`;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Share to social media
  const handleShareToLinkedIn = () => {
    if (!sharingCert) return;
    const text = `Saya baru saja menyelesaikan "${sharingCert.course?.title}" di platform Edu Learn!`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + "/student/certificates")}`;
    window.open(url, "_blank");
  };

  const handleShareToTwitter = () => {
    if (!sharingCert) return;
    const text = `🎓 Saya baru saja menyelesaikan "${sharingCert.course?.title}" di platform Edu Learn!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin + "/student/certificates")}`;
    window.open(url, "_blank");
  };

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.main}>
        <TopHeader
          title="Sertifikat"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>
          {/* Header */}
          <div className={styles.headerSection}>
            <div className={styles.headerText}>
              <h1>Sertifikat Saya</h1>
              <p>Lihat dan unduh sertifikat kursus yang telah selesai</p>
            </div>
            <div className={styles.headerActions}>
              <div className={styles.searchBox}>
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Cari sertifikat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          {certificates !== undefined && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={styles.statIconLabel}>
                    <div className={`${styles.statIcon} ${styles.blue}`}>
                      <Award size={20} />
                    </div>
                  </div>
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{certificates.length}</div>
                  <div className={styles.statLabel}>Total Sertifikat</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={styles.statIconLabel}>
                    <div className={`${styles.statIcon} ${styles.green}`}>
                      <TrendingUp size={20} />
                    </div>
                  </div>
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>
                    {completedCoursesCount}
                  </div>
                  <div className={styles.statLabel}>Kursus Selesai</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={styles.statIconLabel}>
                    <div className={`${styles.statIcon} ${styles.yellow}`}>
                      <Clock size={20} />
                    </div>
                  </div>
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>
                    {claimableCertificates.length}
                  </div>
                  <div className={styles.statLabel}>Dapat Diklaim</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={styles.statIconLabel}>
                    <div className={`${styles.statIcon} ${styles.blue}`}>
                      <Calendar size={20} />
                    </div>
                  </div>
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>
                    {certificates.length > 0
                      ? new Date(
                          Math.max(
                            ...certificates.map((c) =>
                              new Date(c.issuedAt).getTime(),
                            ),
                          ),
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })
                      : "-"}
                  </div>
                  <div className={styles.statLabel}>Sertifikat Terbaru</div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {certificates === undefined ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Award size={40} />
              </div>
              <h3 className={styles.emptyTitle}>Memuat sertifikat...</h3>
            </div>
          ) : (
            <>
              {/* Section Title */}
              {filteredCertificates.length > 0 && (
                <div className={styles.sectionHeader}>
                  <h2>Sertifikat Tersedia</h2>
                  <p>{filteredCertificates.length} sertifikat</p>
                </div>
              )}

              {/* Certificates Grid */}
              {filteredCertificates.length > 0 ? (
                <div className={styles.certificatesGrid}>
                  {filteredCertificates.map((cert) => (
                    <div key={cert._id} className={styles.certificateCard}>
                      <div className={styles.certificatePreview}>
                        <div className={styles.certificateBadge}>
                          <Award size={48} />
                        </div>
                        <div className={styles.certificateOverlay}>
                          <button
                            className={styles.overlayBtn}
                            onClick={() =>
                              handleDownloadCertificate(
                                cert._id,
                                cert.certificateNumber,
                              )
                            }
                            disabled={isDownloading === cert._id}
                          >
                            {isDownloading === cert._id ? (
                              <Eye size={20} />
                            ) : (
                              <Download size={20} />
                            )}
                          </button>
                          <button
                            className={styles.overlayBtn}
                            onClick={() => handleShareCertificate(cert)}
                            title="Bagikan Sertifikat"
                          >
                            <Share2 size={20} />
                          </button>
                        </div>
                      </div>

                      <div className={styles.certificateContent}>
                        <h3 className={styles.certificateTitle}>
                          {cert.course?.title || "Course Title"}
                        </h3>
                        <div className={styles.certificateMeta}>
                          <span className={styles.metaItem}>
                            <BookOpen size={14} />
                            {cert.course?.instructor || "Instructor"}
                          </span>
                          <span className={styles.metaItem}>
                            <Calendar size={14} />
                            {new Date(cert.issuedAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <p className={styles.certificateId}>
                          ID: {cert.certificateNumber}
                        </p>
                        <div className={styles.certificateActions}>
                          <button
                            className={`${styles.actionBtn} ${styles.primary}`}
                            onClick={() =>
                              handleDownloadCertificate(
                                cert._id,
                                cert.certificateNumber,
                              )
                            }
                            disabled={isDownloading === cert._id}
                          >
                            <Download size={16} />
                            {isDownloading === cert._id
                              ? "Mengunduh..."
                              : "Unduh PDF"}
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.secondary}`}
                            onClick={() => handleShareCertificate(cert)}
                          >
                            <Share2 size={16} />
                            Bagikan
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Award size={40} />
                  </div>
                  <h3 className={styles.emptyTitle}>Belum ada sertifikat</h3>
                  <p className={styles.emptyText}>
                    Selesaikan kursus untuk mendapatkan sertifikat!
                  </p>
                  <Link href="/student/my-courses" className={styles.browseBtn}>
                    <Search size={20} />
                    Lihat Kursus
                  </Link>
                </div>
              )}

              {/* Claimable Certificates Section */}
              {claimableCertificates.length > 0 && (
                <div className={styles.claimableSection}>
                  <h2>Sertifikat yang Dapat Diklaim</h2>
                  <div className={styles.claimableGrid}>
                    {claimableCertificates.map((enrollment) => (
                      <div
                        key={enrollment._id}
                        className={styles.claimableCard}
                      >
                        <Award size={32} />
                        <h3>Kursus Selesai!</h3>
                        <p>Anda dapat mengklaim sertifikat untuk kursus ini</p>
                        <button className={styles.claimBtn}>
                          Klaim Sertifikat
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Share Modal */}
      {shareModalOpen && sharingCert && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShareModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Bagikan Sertifikat</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setShareModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.certInfo}>
                <Award size={32} className={styles.certIcon} />
                <div>
                  <h4>{sharingCert.course?.title}</h4>
                  <p>ID: {sharingCert.certificateNumber}</p>
                </div>
              </div>

              <div className={styles.shareOptions}>
                <button
                  className={styles.shareOption}
                  onClick={handleCopyShareText}
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  <span>{copied ? "Tersalin!" : "Salin Teks"}</span>
                </button>

                <button
                  className={styles.shareOption}
                  onClick={handleShareToLinkedIn}
                >
                  <Linkedin size={20} />
                  <span>LinkedIn</span>
                </button>

                <button
                  className={styles.shareOption}
                  onClick={handleShareToTwitter}
                >
                  <Twitter size={20} />
                  <span>Twitter</span>
                </button>
              </div>

              <div className={styles.sharePreview}>
                <p className={styles.previewLabel}>Preview:</p>
                <p className={styles.previewText}>
                  🎓 Saya baru saja menyelesaikan "{sharingCert.course?.title}"
                  di platform Edu Learn!
                  <br />
                  <br />
                  Sertifikat: {sharingCert.certificateNumber}
                  <br />
                  Tanggal:{" "}
                  {new Date(sharingCert.issuedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
