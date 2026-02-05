"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useNotifications } from "@/hooks/useNotifications";
import styles from "../auth.module.css";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import {
  HiOutlineAcademicCap,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
} from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setLoading, setError, error, isLoading, clearError } =
    useAuthStore();
  const { createUserNotification } = useNotifications();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
  }>({});
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem("logoUrl");
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
  }, []);

  const validateForm = () => {
    const errors: typeof formErrors = {};

    if (!formData.name) {
      errors.name = "Nama wajib diisi";
    } else if (formData.name.length < 3) {
      errors.name = "Nama minimal 3 karakter";
    }

    if (!formData.email) {
      errors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      errors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      errors.password = "Password minimal 6 karakter";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Password tidak cocok";
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = "Anda harus menyetujui syarat dan ketentuan";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registrasi gagal");
      }

      setUser(data.user);

      // Create notification for successful registration
      try {
        await createUserNotification(
          `User baru ${formData.name} (${formData.email}) telah berhasil mendaftar ke platform.`,
          data.user._id,
          {
            action: "create",
            entity: "user",
            newValue: formData.email,
          },
        );
      } catch (notifError) {
        console.error("Failed to create notification:", notifError);
      }

      router.push("/student/dashboard");
    } catch (err: any) {
      setError(err.message || "Registrasi gagal. Silakan coba lagi.");
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.logo}>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo"
                width={160}
                height={45}
                className={styles.logoImage}
                priority
              />
            ) : (
              <Image
                src="/logo.svg"
                alt="EduLearn"
                width={160}
                height={45}
                className={styles.logoImage}
                priority
              />
            )}
          </Link>
          <h1 className={styles.authTitle}>Buat Akun Baru</h1>
          <p className={styles.authSubtitle}>
            Mulai perjalanan belajar Anda bersama kami
          </p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <Input
            label="Nama Lengkap"
            type="text"
            placeholder="Masukkan nama lengkap"
            leftIcon={<HiOutlineUser size={18} />}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            isRequired
          />

          <Input
            label="Email"
            type="email"
            placeholder="nama@email.com"
            leftIcon={<HiOutlineMail size={18} />}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            error={formErrors.email}
            isRequired
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimal 6 karakter"
            leftIcon={<HiOutlineLockClosed size={18} />}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            error={formErrors.password}
            isRequired
          />

          <Input
            label="Konfirmasi Password"
            type="password"
            placeholder="Ulangi password"
            leftIcon={<HiOutlineLockClosed size={18} />}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            error={formErrors.confirmPassword}
            isRequired
          />

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) =>
                setFormData({ ...formData, agreeTerms: e.target.checked })
              }
            />
            Saya menyetujui{" "}
            <Link href="/terms" className={styles.termsLink} target="_blank">
              Syarat & Ketentuan
            </Link>
          </label>
          {formErrors.agreeTerms && (
            <span
              style={{ color: "var(--error-600)", fontSize: "var(--text-xs)" }}
            >
              {formErrors.agreeTerms}
            </span>
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            className={styles.submitBtn}
          >
            Daftar
          </Button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Sudah punya akun? <Link href="/login">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
