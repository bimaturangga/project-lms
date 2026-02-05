"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "../auth.module.css";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  HiOutlineAcademicCap,
  HiOutlineMail,
  HiOutlineLockClosed,
} from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setLoading, setError, error, isLoading, clearError } =
    useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem("logoUrl");
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
  }, []);

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};

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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Get user from Convex
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login gagal");
      }

      setUser(data.user);

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login gagal. Periksa email dan password Anda.");
      setLoading(false);
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
          <h1 className={styles.authTitle}>Selamat Datang Kembali</h1>
          <p className={styles.authSubtitle}>
            Masuk ke akun Anda untuk melanjutkan belajar
          </p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form className={styles.authForm} onSubmit={handleSubmit}>
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
            placeholder="Masukkan password"
            leftIcon={<HiOutlineLockClosed size={18} />}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            error={formErrors.password}
            isRequired
          />

          <div className={styles.formRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) =>
                  setFormData({ ...formData, rememberMe: e.target.checked })
                }
              />
              Ingat saya
            </label>
            <Link href="/forgot-password" className={styles.forgotLink}>
              Lupa password?
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            className={styles.submitBtn}
          >
            Masuk
          </Button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Belum punya akun? <Link href="/register">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
