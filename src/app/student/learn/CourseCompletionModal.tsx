"use client";

import React, { useState } from "react";
import styles from "./completionModal.module.css";
import { X, Award, Star } from "lucide-react";

interface CourseCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => Promise<void>;
  courseName: string;
  existingReview?: {
    rating: number;
    review: string;
  } | null;
}

export default function CourseCompletionModal({
  isOpen,
  onClose,
  onSubmit,
  courseName,
  existingReview,
}: CourseCompletionModalProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState(existingReview?.review || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update state when existingReview changes
  React.useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReview(existingReview.review);
    }
  }, [existingReview]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Silakan berikan rating terlebih dahulu");
      return;
    }

    if (review.trim().length < 10) {
      alert("Ulasan minimal 10 karakter");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, review.trim());
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Gagal menyimpan ulasan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (r: number) => {
    const texts: Record<number, string> = {
      1: "Sangat Buruk",
      2: "Kurang Baik",
      3: "Cukup Baik",
      4: "Baik",
      5: "Sangat Baik",
    };
    return texts[r] || "Pilih rating";
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${isSubmitting ? styles.loading : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <div className={styles.iconWrapper}>
              <Award size={28} />
            </div>
            <h2 className={styles.title}>Selamat! 🎉</h2>
            <p className={styles.subtitle}>
              Anda telah menyelesaikan kursus <strong>{courseName}</strong>
            </p>
            <p className={styles.certificateNote}>
              {existingReview
                ? "✨ Sertifikat Anda sudah tersedia! Anda dapat mengupdate ulasan atau langsung melihat sertifikat."
                : "✨ Sertifikat Anda sudah tersedia! Berikan ulasan untuk mengklaimnya."}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Rating Section */}
        <div className={styles.ratingSection}>
          <p className={styles.sectionLabel}>
            Bagaimana pengalaman belajar Anda?
          </p>
          <div className={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`${styles.starBtn} ${displayRating >= star ? styles.active : ""}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                type="button"
              >
                <Star
                  size={36}
                  fill={displayRating >= star ? "#EAB308" : "transparent"}
                  color={displayRating >= star ? "#EAB308" : "#D1D5DB"}
                />
              </button>
            ))}
          </div>
          <p className={styles.ratingText}>
            {displayRating > 0
              ? getRatingText(displayRating)
              : "Klik bintang untuk memberi rating"}
          </p>
        </div>

        {/* Review Section */}
        <div className={styles.reviewSection}>
          <p className={styles.sectionLabel}>Tulis ulasan Anda</p>
          <textarea
            className={styles.textarea}
            placeholder="Bagikan pengalaman belajar Anda di kursus ini. Apa yang Anda sukai? Apa yang bisa ditingkatkan?"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            maxLength={500}
          />
          <p className={styles.charCount}>{review.length}/500 karakter</p>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || review.trim().length < 10}
          >
            <Award size={20} />
            {isSubmitting
              ? "Memproses..."
              : existingReview
                ? "Update & Lihat Sertifikat"
                : "Klaim Sertifikat"}
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            {existingReview ? "Tutup" : "Nanti saja"}
          </button>
        </div>
      </div>
    </div>
  );
}
