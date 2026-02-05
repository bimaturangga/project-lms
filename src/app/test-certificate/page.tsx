"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import styles from "./test-certificate.module.css";

export default function TestCertificatePage() {
  const [formData, setFormData] = useState({
    studentName: "John Doe",
    courseName: "Full Stack Web Development",
    certificateNumber: `CERT-${Date.now()}-ABC123`,
    instructorName: "Jane Smith",
    duration: "40 jam",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);

      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate certificate");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${formData.certificateNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert("Sertifikat berhasil diunduh!");
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Gagal generate sertifikat. Cek console untuk detail.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>🎓 Test Certificate Generator</h1>
        <p className={styles.subtitle}>
          Testing halaman untuk generate sertifikat PDF
        </p>

        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label>Nama Student</label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              placeholder="Masukkan nama student"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Nama Kursus</label>
            <input
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              placeholder="Masukkan nama kursus"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Certificate Number</label>
            <input
              type="text"
              name="certificateNumber"
              value={formData.certificateNumber}
              onChange={handleChange}
              placeholder="Certificate number"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Nama Instructor</label>
            <input
              type="text"
              name="instructorName"
              value={formData.instructorName}
              onChange={handleChange}
              placeholder="Nama instructor"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Durasi Kursus</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 40 jam"
            />
          </div>

          <button
            className={styles.generateBtn}
            onClick={handleGeneratePDF}
            disabled={isGenerating}
          >
            <Download size={20} />
            {isGenerating ? "Generating..." : "Generate & Download PDF"}
          </button>
        </div>

        <div className={styles.note}>
          <h3>📝 Notes:</h3>
          <ul>
            <li>Halaman ini untuk testing certificate generation</li>
            <li>PDF akan otomatis terdownload setelah generate</li>
            <li>
              Certificate menggunakan template dari CertificateTemplate.tsx
            </li>
            <li>Edit template untuk customize design</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
