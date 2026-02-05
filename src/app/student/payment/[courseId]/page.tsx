"use client";

import React, { useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { Sidebar, TopHeader } from "@/components/layout";
import styles from "./payment.module.css";
import { Upload, FileText, CheckCircle, Check } from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function PaymentPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuthStore();
  const { items: cartItems, clearCart: clearCartStore } = useCartStore();

  const { courseId } = use(params);
  const isCartCheckout = courseId === "cart-checkout";

  // Fetch course data from database
  const coursesData = useQuery(api.courses.getAllCourses) || [];

  // Mutations
  const createPayment = useMutation(api.payments.createPayment);
  const clearCart = useMutation(api.cart.clearCart);

  // Logic determination
  let checkoutItems: any[] = [];
  let totalPrice = 0;

  if (isCartCheckout) {
    // Use cart store items directly
    checkoutItems = cartItems.map((item) => ({
      _id: item._id,
      title: item.title,
      price: item.price,
      image: item.thumbnail,
    }));
    totalPrice = checkoutItems.reduce((sum, item) => sum + item.price, 0);
  } else {
    const course = coursesData.find((c) => c._id === courseId);
    if (course) {
      checkoutItems = [
        {
          _id: course._id,
          title: course.title,
          price: course.price,
          image: course.thumbnail,
        },
      ];
      totalPrice = course.price;
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Convert to base64 (compressed)
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const reader = new FileReader();
      reader.onloadend = () => {
        if (file.type.startsWith("image/")) {
          img.onload = () => {
            const maxSize = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxSize) {
                height *= maxSize / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width *= maxSize / height;
                height = maxSize;
              }
            }

            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);

            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
            setProofUrl(compressedBase64);
          };
          img.src = reader.result as string;
        } else {
          // For PDF, just store as is (truncated for safety)
          setProofUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile || !user?._id) return;

    setIsSubmitting(true);

    try {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Create payment for each course
      for (const item of checkoutItems) {
        await createPayment({
          userId: user._id as Id<"users">,
          courseId: item._id as Id<"courses">,
          amount: item.price,
          paymentMethod: "Bank Transfer - BCA",
          invoiceNumber,
          proofUrl: proofUrl,
        });
      }

      // Clear cart if cart checkout
      if (isCartCheckout && user?._id) {
        await clearCart({ userId: user._id as Id<"users"> });
        clearCartStore();
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert("Gagal mengirim bukti pembayaran. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.main}>
        <TopHeader
          title="Pembayaran"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>Selesaikan Pembayaran</h1>
            <p className={styles.subtitle}>
              Transfer sesuai nominal dan upload bukti pembayaran Anda.
            </p>
          </div>

          <div className={styles.paymentGrid}>
            {/* Summary Card (Order matters for mobile usually, but keeping structure) */}

            {/* Payment Form */}
            <div className={styles.formCard}>
              <div className={styles.bankInfo}>
                <h3 className={styles.bankTitle}>Transfer Bank / E-Wallet</h3>
                <div className={styles.bankDetails}>
                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Bank BCA</span>
                    <span className={styles.bankValue}>123 456 7890</span>
                  </div>
                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Nama Penerima</span>
                    <span className={styles.bankValue}>
                      PT EduLearn Indonesia
                    </span>
                  </div>
                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Nominal Transfer</span>
                    <span
                      className={styles.bankValue}
                      style={{ color: "var(--primary)", fontSize: "18px" }}
                    >
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Upload Bukti Transfer</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />

                {!selectedFile ? (
                  <div
                    className={styles.uploadZone}
                    onClick={handleUploadClick}
                  >
                    <Upload size={32} className={styles.uploadIcon} />
                    <div>
                      <p className={styles.uploadText}>
                        Klik untuk upload foto/PDF
                      </p>
                      <p className={styles.uploadSubtext}>Maksimal 2MB</p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.filePreview}>
                    <FileText size={24} color="var(--primary)" />
                    <span className={styles.fileName}>{selectedFile.name}</span>
                    <CheckCircle size={20} color="var(--success)" />
                  </div>
                )}
              </div>

              <button
                className={styles.submitBtn}
                disabled={!selectedFile || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Mengirim..." : "Kirim Bukti Pembayaran"}
              </button>
            </div>

            {/* Summary */}
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Ringkasan Pesanan</h3>
              {checkoutItems.map((item, idx) => (
                <div key={idx} className={styles.courseItem}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className={styles.courseThumb}
                  />
                  <div className={styles.courseInfo}>
                    <h4 className={styles.courseTitle}>{item.title}</h4>
                    <p className={styles.coursePrice}>
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}

              <div className={styles.totalRow}>
                <span>Total Tagihan</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => {
              setShowSuccessModal(false);
              router.push("/student/dashboard");
            }}
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
                Bukti pembayaran berhasil diupload! Admin akan memverifikasi
                dalam 1x24 jam.
              </p>
              <button
                className={styles.modalBtn}
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/student/dashboard");
                }}
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
