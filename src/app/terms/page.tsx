"use client";

import React from "react";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlineDocumentText } from "react-icons/hi";

export default function TermsPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "0",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "1rem 2rem",
          position: "sticky",
          top: "0",
          zIndex: "10",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <HiOutlineDocumentText size={24} color="#2563eb" />
            <div>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "#1e293b",
                  margin: "0",
                  lineHeight: "1.3",
                }}
              >
                Syarat dan Ketentuan
              </h1>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#64748b",
                  margin: "0.25rem 0 0 0",
                }}
              >
                Platform Pembelajaran Online EduLearn
              </p>
            </div>
          </div>

          <Link
            href="/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "9999px", // var(--radius-full)
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.15s ease-in-out", // var(--transition-fast)
              border: "none",
              backgroundColor: "#2563eb", // var(--primary)
              color: "white",
              boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
              textDecoration: "none",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#1d4ed8"; // var(--primary-hover)
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#2563eb"; // var(--primary)
            }}
          >
            <HiOutlineArrowLeft size={18} />
            Kembali ke Pendaftaran
          </Link>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "2rem",
              lineHeight: "1.7",
              color: "#374151",
            }}
          >
            {/* Section 1 */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#2563eb",
                  }}
                ></div>
                <h2
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    margin: "0",
                  }}
                >
                  1. Penerimaan Syarat
                </h2>
              </div>
              <p style={{ margin: "0", color: "#475569" }}>
                Dengan mengakses dan menggunakan platform EduLearn, Anda
                menyetujui untuk terikat dengan syarat dan ketentuan ini.
              </p>
            </div>

            {/* Section 2 */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#2563eb",
                  }}
                ></div>
                <h2
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    margin: "0",
                  }}
                >
                  2. Pendaftaran Akun
                </h2>
              </div>
              <ul
                style={{
                  margin: "0",
                  paddingLeft: "1.25rem",
                  color: "#475569",
                }}
              >
                <li style={{ marginBottom: "0.5rem" }}>
                  Anda harus berusia minimal 13 tahun untuk membuat akun
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Informasi yang Anda berikan harus akurat dan lengkap
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Anda bertanggung jawab menjaga kerahasiaan akun dan kata sandi
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#2563eb",
                  }}
                ></div>
                <h2
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    margin: "0",
                  }}
                >
                  3. Penggunaan Platform
                </h2>
              </div>
              <ul
                style={{
                  margin: "0",
                  paddingLeft: "1.25rem",
                  color: "#475569",
                }}
              >
                <li style={{ marginBottom: "0.5rem" }}>
                  Menggunakan platform hanya untuk tujuan yang sah
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Tidak membagikan konten yang melanggar hukum atau tidak pantas
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Menghormati hak kekayaan intelektual
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Tidak melakukan aktivitas yang dapat merusak sistem
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#2563eb",
                  }}
                ></div>
                <h2
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    margin: "0",
                  }}
                >
                  4. Kursus dan Konten
                </h2>
              </div>
              <ul
                style={{
                  margin: "0",
                  paddingLeft: "1.25rem",
                  color: "#475569",
                }}
              >
                <li style={{ marginBottom: "0.5rem" }}>
                  Konten kursus dilindungi hak cipta
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Akses kursus berlaku seumur hidup setelah pembelian
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Kami berhak mengupdate atau memodifikasi konten
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Sertifikat dapat diunduh setelah menyelesaikan kursus
                </li>
              </ul>
            </div>

            {/* Section 5 */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#2563eb",
                  }}
                ></div>
                <h2
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    margin: "0",
                  }}
                >
                  5. Pembayaran dan Refund
                </h2>
              </div>
              <ul
                style={{
                  margin: "0",
                  paddingLeft: "1.25rem",
                  color: "#475569",
                }}
              >
                <li style={{ marginBottom: "0.5rem" }}>
                  Semua pembayaran harus dilakukan sebelum akses diberikan
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Refund dapat dilakukan dalam 7 hari dengan syarat tertentu
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Harga dapat berubah sewaktu-waktu
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Kami tidak bertanggung jawab atas kesalahan pembayaran pihak
                  ketiga
                </li>
              </ul>
            </div>

            {/* Section 6 */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#2563eb",
                  }}
                ></div>
                <h2
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    margin: "0",
                  }}
                >
                  6. Privasi dan Data
                </h2>
              </div>
              <ul
                style={{
                  margin: "0",
                  paddingLeft: "1.25rem",
                  color: "#475569",
                }}
              >
                <li style={{ marginBottom: "0.5rem" }}>
                  Kami menghormati privasi Anda sesuai Kebijakan Privasi
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Data akan digunakan untuk meningkatkan layanan
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Kami tidak menjual data pribadi kepada pihak ketiga
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Anda dapat menghapus akun kapan saja
                </li>
              </ul>
            </div>

            {/* Section 7 */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#2563eb",
                  }}
                ></div>
                <h2
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    margin: "0",
                  }}
                >
                  7. Batasan Tanggung Jawab
                </h2>
              </div>
              <p style={{ margin: "0", color: "#475569" }}>
                EduLearn tidak bertanggung jawab atas kerugian tidak langsung,
                insidental, atau konsekuensial yang timbul dari penggunaan
                platform ini.
              </p>
            </div>

            {/* Section 8 */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "2rem",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#2563eb",
                  }}
                ></div>
                <h2
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    margin: "0",
                  }}
                >
                  8. Perubahan Syarat
                </h2>
              </div>
              <p style={{ margin: "0", color: "#475569" }}>
                Kami berhak mengubah syarat dan ketentuan ini kapan saja.
                Perubahan akan diberitahukan melalui email atau notifikasi di
                platform.
              </p>
            </div>

            {/* Footer */}
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                backgroundColor: "#f1f5f9",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#64748b",
                  margin: "0",
                }}
              >
                Terakhir diperbarui: 5 Februari 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
