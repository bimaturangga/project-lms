"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sidebar, TopHeader } from "@/components/layout";
import { useAuthStore } from "@/stores/authStore";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { getInitials } from "@/lib/utils";
import styles from "./profile.module.css";
import {
  Camera,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Shield,
  Settings,
  Key,
  Check,
  Eye,
  EyeOff,
  Bell,
} from "lucide-react";

export default function AdminProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch admin statistics
  const allUsers = useQuery(api.users.getAllUsers);
  const allCourses = useQuery(api.courses.getAllCourses);
  const allPayments = useQuery(api.payments.getAllPayments);

  // Mutations
  const updateUserProfile = useMutation(api.users.updateUser);
  const updateUserPassword = useMutation(api.users.updatePassword);
  const updateNotificationPrefs = useMutation(
    api.users.updateNotificationPreferences,
  );

  // Form data
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    bio: user?.bio || "",
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    courseUpdates: user?.notificationPreferences?.courseUpdates ?? true,
    newLessons: user?.notificationPreferences?.newLessons ?? true,
    promotions: user?.notificationPreferences?.promotions ?? false,
  });

  // Sync state with user changes
  useEffect(() => {
    if (user) {
      setAvatarUrl(user.avatar || "");
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        bio: user.bio || "",
      });

      // Update notification preferences
      setNotifications({
        courseUpdates: user.notificationPreferences?.courseUpdates ?? true,
        newLessons: user.notificationPreferences?.newLessons ?? true,
        promotions: user.notificationPreferences?.promotions ?? false,
      });
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi file
    if (!file.type.startsWith("image/")) {
      alert("Pilih file gambar yang valid");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      alert("Ukuran file maksimal 5MB");
      return;
    }

    try {
      // Compress dan resize image
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = async () => {
        // Resize to max 400x400 untuk avatar
        const maxSize = 400;
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

        // Convert to base64 dengan kompresi quality 0.7
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setAvatarUrl(compressedBase64);

        // Update ke database jika user ada
        if (user?._id) {
          await updateUserProfile({
            userId: user._id,
            avatar: compressedBase64,
          });

          // Update local state
          setUser({ ...user, avatar: compressedBase64 });
        }
      };

      // Read file as data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Gagal upload avatar");
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!user?._id) {
        alert("User ID tidak ditemukan.");
        return;
      }

      await updateUserProfile({
        userId: user._id,
        name: formData.name,
        bio: formData.bio || undefined,
      });

      alert("Profile berhasil diperbarui");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Gagal memperbarui profile");
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?._id) {
      alert("User ID tidak ditemukan.");
      return;
    }

    try {
      await updateUserProfile({
        userId: user._id,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        avatar: avatarUrl,
      });

      // Update local user state
      setUser({
        ...user,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        avatar: avatarUrl,
      });

      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Gagal memperbarui profil.");
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Password baru dan konfirmasi password tidak cocok.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password baru minimal 6 karakter.");
      return;
    }

    try {
      await updateUserPassword({
        userId: user!._id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Gagal mengubah password. Periksa password saat ini Anda.");
    }
  };

  // Calculate stats

  const totalCourses = allCourses?.length || 0;
  const totalStudents =
    allUsers?.filter((u) => u.role === "student").length || 0;
  const totalTransactions = allPayments?.length || 0;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleNotification = async (key: keyof typeof notifications) => {
    const newPreferences = { ...notifications, [key]: !notifications[key] };
    setNotifications(newPreferences);

    // Save to database
    if (user?._id) {
      try {
        await updateNotificationPrefs({
          userId: user._id,
          preferences: newPreferences,
        });
      } catch (error) {
        console.error("Failed to update notification preferences:", error);
        // Revert state on error
        setNotifications(notifications);
      }
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className={styles.main}>
        <TopHeader title="Profil" onMenuClick={() => setIsSidebarOpen(true)} />
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.headerSection}>
            <div className={styles.headerText}>
              <h1>Pengaturan Profil</h1>
              <p>Kelola informasi akun dan pengaturan administrator</p>
            </div>
          </div>

          <div className={styles.contentGrid}>
            {/* Profile Card */}
            <div className={styles.profileCard}>
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className={styles.avatarImage}
                    />
                  ) : (
                    getInitials(formData.name)
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: "none" }}
                  />
                  <button
                    className={styles.avatarEdit}
                    onClick={handleAvatarClick}
                    type="button"
                  >
                    <Camera size={16} />
                  </button>
                </div>
                <h2 className={styles.profileName}>{formData.name}</h2>
                <p className={styles.profileEmail}>{formData.email}</p>
                <span className={styles.profileBadge}>
                  <Shield size={14} />
                  Administrator
                </span>
              </div>

              <div className={styles.profileStats}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{totalCourses}</div>
                  <div className={styles.statLabel}>Courses</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{totalStudents}</div>
                  <div className={styles.statLabel}>Students</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{totalTransactions}</div>
                  <div className={styles.statLabel}>Transactions</div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Personal Info */}
              <div className={styles.settingsSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Informasi Pribadi</h3>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Nama Lengkap</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        disabled
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Nomor Telepon</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        placeholder="Masukkan nomor telepon"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Lokasi</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        placeholder="Masukkan lokasi"
                      />
                    </div>
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.formLabel}>Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className={`${styles.formInput} ${styles.formTextarea}`}
                      placeholder="Ceritakan tentang diri Anda"
                      rows={3}
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className={styles.saveButton}
                    >
                      <Save size={16} />
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className={styles.settingsSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Notifikasi</h3>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.toggleRow}>
                    <div className={styles.toggleInfo}>
                      <div className={styles.toggleTitle}>Pembaruan Kursus</div>
                      <div className={styles.toggleDesc}>
                        Notifikasi ketika ada pembaruan konten kursus
                      </div>
                    </div>
                    <div
                      className={`${styles.toggle} ${notifications.courseUpdates ? styles.active : ""}`}
                      onClick={() => toggleNotification("courseUpdates")}
                    >
                      <div className={styles.toggleKnob} />
                    </div>
                  </div>
                  <div className={styles.toggleRow}>
                    <div className={styles.toggleInfo}>
                      <div className={styles.toggleTitle}>Pelajaran Baru</div>
                      <div className={styles.toggleDesc}>
                        Notifikasi ketika ada pelajaran baru
                      </div>
                    </div>
                    <div
                      className={`${styles.toggle} ${notifications.newLessons ? styles.active : ""}`}
                      onClick={() => toggleNotification("newLessons")}
                    >
                      <div className={styles.toggleKnob} />
                    </div>
                  </div>
                  <div className={styles.toggleRow}>
                    <div className={styles.toggleInfo}>
                      <div className={styles.toggleTitle}>Promosi</div>
                      <div className={styles.toggleDesc}>
                        Notifikasi tentang diskon dan penawaran spesial
                      </div>
                    </div>
                    <div
                      className={`${styles.toggle} ${notifications.promotions ? styles.active : ""}`}
                      onClick={() => toggleNotification("promotions")}
                    >
                      <div className={styles.toggleKnob} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className={styles.settingsSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Keamanan</h3>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.securityItem}>
                    <div className={styles.securityInfo}>
                      <h4>Password</h4>
                      <p>Ubah password untuk meningkatkan keamanan akun</p>
                    </div>
                    <button
                      type="button"
                      className={styles.securityButton}
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <Key size={16} />
                      Ubah Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Ubah Password</h3>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePasswordChange}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Password Saat Ini</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className={styles.input}
                    placeholder="Masukkan password saat ini"
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password Baru</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className={styles.input}
                    placeholder="Masukkan password baru"
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Konfirmasi Password Baru</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={styles.input}
                    placeholder="Konfirmasi password baru"
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                >
                  Batal
                </button>
                <button type="submit" className={styles.saveBtn}>
                  <Key size={16} />
                  Ubah Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className={styles.successOverlay}>
          <div className={styles.successModal}>
            <div className={styles.successIcon}>
              <Check size={24} />
            </div>
            <h3>Berhasil!</h3>
            <p>Profil telah berhasil diperbarui.</p>
          </div>
        </div>
      )}
    </div>
  );
}
