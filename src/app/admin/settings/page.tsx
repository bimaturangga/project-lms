"use client";

import React, { useState } from "react";
import { Sidebar, TopHeader } from "@/components/layout";
import { useNotifications } from "@/hooks/useNotifications";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import styles from "./settings.module.css";
import {
  Palette,
  Image,
  Save,
  RotateCcw,
  X,
  CheckCircle,
  AlertTriangle,
  Upload,
  Headset,
} from "lucide-react";

export default function SettingsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#165dff");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bankName, setBankName] = useState("Bank BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("PT EduLearn Indonesia");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"save" | "reset">("save");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { createSystemNotification } = useNotifications();
  const updateSetting = useMutation(api.settings.updateSetting);
  const allSettings = useQuery(api.settings.getAllSettings);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Harap upload file gambar (PNG, JPG, JPEG)");
        return;
      }

      setIsUploading(true);
      setLogoFile(file);

      try {
        // Upload file to server
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload gagal");
        }

        const data = await response.json();
        setLogoUrl(data.url);
      } catch (error) {
        console.error("Error uploading logo:", error);
        alert("Gagal mengupload logo. Silakan coba lagi.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSaveSettings = async () => {
    setIsProcessing(true);

    try {
      // Save to Convex database
      await updateSetting({
        key: "themeColor",
        value: primaryColor,
      });

      if (logoUrl) {
        await updateSetting({
          key: "logoUrl",
          value: logoUrl,
        });
      }

      // Save bank account settings
      await updateSetting({
        key: "bankName",
        value: bankName,
      });

      await updateSetting({
        key: "accountNumber",
        value: accountNumber,
      });

      await updateSetting({
        key: "accountHolder",
        value: accountHolder,
      });

      // Save support center settings
      await updateSetting({
        key: "whatsappNumber",
        value: whatsappNumber,
      });

      await updateSetting({
        key: "operatingHours",
        value: operatingHours,
      });

      // Update CSS variables
      document.documentElement.style.setProperty("--primary", primaryColor);

      // Calculate lighter and darker variations
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : null;
      };

      const rgb = hexToRgb(primaryColor);
      if (rgb) {
        document.documentElement.style.setProperty(
          "--primary-light",
          `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
        );
        document.documentElement.style.setProperty(
          "--primary-hover",
          `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`,
        );
      }

      // Also save to localStorage for immediate UI update
      localStorage.setItem("primaryColor", primaryColor);
      if (logoUrl) {
        localStorage.setItem("logoUrl", logoUrl);
      }

      // Create notification
      try {
        await createSystemNotification(
          `Konfigurasi sistem berhasil disimpan. Warna tema diubah ke ${primaryColor}${logoUrl ? " dan logo telah diperbarui" : ""}.`,
          {
            action: "update",
            entity: "system_config",
            oldValue: "#165dff",
            newValue: primaryColor,
          },
        );
      } catch (error) {
        console.error("Failed to create notification:", error);
      }

      setIsProcessing(false);
      setShowModal(false);

      // Show success notification
      const notification = document.createElement("div");
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      `;
      notification.textContent = "✓ Pengaturan berhasil disimpan!";
      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Gagal menyimpan pengaturan. Silakan coba lagi.");
      setIsProcessing(false);
      setShowModal(false);
    }
  };

  const handleResetSettings = async () => {
    setIsProcessing(true);

    setTimeout(async () => {
      const defaultColor = "#165dff";
      setPrimaryColor(defaultColor);
      setLogoUrl("");
      setLogoFile(null);
      setBankName("Bank BCA");
      setAccountNumber("");
      setAccountHolder("PT EduLearn Indonesia");
      setWhatsappNumber("");
      setOperatingHours("");

      try {
        // Reset in Convex database
        await updateSetting({
          key: "themeColor",
          value: defaultColor,
        });
        await updateSetting({
          key: "logoUrl",
          value: "",
        });
      } catch (error) {
        console.error("Error resetting settings:", error);
      }

      // Reset CSS variables
      document.documentElement.style.setProperty("--primary", defaultColor);
      document.documentElement.style.setProperty(
        "--primary-light",
        "rgba(22, 93, 255, 0.1)",
      );
      document.documentElement.style.setProperty("--primary-hover", "#0047e1");

      // Clear localStorage
      localStorage.removeItem("primaryColor");
      localStorage.removeItem("logoUrl");

      // Create notification
      try {
        await createSystemNotification(
          "Konfigurasi sistem telah direset ke pengaturan default. Semua perubahan tema dan logo telah dibatalkan.",
          {
            action: "reset",
            entity: "system_config",
            oldValue: primaryColor,
            newValue: defaultColor,
          },
        );
      } catch (error) {
        console.error("Failed to create notification:", error);
      }

      setIsProcessing(false);
      setShowModal(false);

      // Show success notification
      const notification = document.createElement("div");
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f59e0b;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
      `;
      notification.textContent = "↻ Pengaturan telah direset ke default!";
      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    }, 1000);
  };

  const handleSaveClick = () => {
    setModalType("save");
    setShowModal(true);
  };

  const handleResetClick = () => {
    setModalType("reset");
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (modalType === "save") {
      handleSaveSettings();
    } else {
      handleResetSettings();
    }
  };

  // Load settings from Convex on mount
  React.useEffect(() => {
    if (allSettings) {
      const themeColor = allSettings.themeColor || "#165dff";
      const logo = allSettings.logoUrl || "";
      const bank = allSettings.bankName || "Bank BCA";
      const accNumber = allSettings.accountNumber || "";
      const accHolder = allSettings.accountHolder || "PT EduLearn Indonesia";
      const whatsapp = allSettings.whatsappNumber || "";
      const opHours = allSettings.operatingHours || "";

      setPrimaryColor(themeColor);
      setLogoUrl(logo);
      setBankName(bank);
      setAccountNumber(accNumber);
      setAccountHolder(accHolder);
      setWhatsappNumber(whatsapp);
      setOperatingHours(opHours);

      // Update CSS variables
      document.documentElement.style.setProperty("--primary", themeColor);

      // Also save to localStorage for immediate access
      localStorage.setItem("primaryColor", themeColor);
      if (logo) {
        localStorage.setItem("logoUrl", logo);
      }
    }

    // Fallback to localStorage if Convex not loaded yet
    const savedColor = localStorage.getItem("primaryColor");
    const savedLogo = localStorage.getItem("logoUrl");

    if (savedColor && !allSettings) {
      setPrimaryColor(savedColor);
      document.documentElement.style.setProperty("--primary", savedColor);
    }
    if (savedLogo && !allSettings) {
      setLogoUrl(savedLogo);
    }
  }, [allSettings]);

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.main}>
        <TopHeader
          title="Konfigurasi"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <h1>Konfigurasi Dashboard</h1>
              <p className={styles.subtitle}>
                Sesuaikan tampilan dashboard sesuai kebutuhan Anda
              </p>
            </div>
          </div>

          {/* Settings Cards */}
          <div className={styles.settingsGrid}>
            {/* Color Settings */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleWrapper}>
                  <Palette size={20} className={styles.cardIcon} />
                  <h2 className={styles.cardTitle}>Warna Tema</h2>
                </div>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.cardDescription}>
                  Pilih warna utama untuk dashboard Anda
                </p>

                <div className={styles.colorPickerWrapper}>
                  <label className={styles.label}>Warna Utama</label>
                  <div className={styles.colorInputGroup}>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className={styles.colorInput}
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className={styles.colorTextInput}
                      placeholder="#165dff"
                    />
                  </div>
                </div>

                <div className={styles.colorPreview}>
                  <p className={styles.previewLabel}>Preview:</p>
                  <div className={styles.previewButtons}>
                    <button
                      className={styles.previewButton}
                      style={{ backgroundColor: primaryColor }}
                    >
                      Primary Button
                    </button>
                    <button
                      className={styles.previewButtonOutline}
                      style={{ borderColor: primaryColor, color: primaryColor }}
                    >
                      Outline Button
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Settings */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleWrapper}>
                  <Image size={20} className={styles.cardIcon} />
                  <h2 className={styles.cardTitle}>Logo Dashboard</h2>
                </div>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.cardDescription}>
                  Upload logo untuk dashboard Anda (maksimal 2MB)
                </p>

                <div className={styles.logoUploadWrapper}>
                  <label className={styles.label}>Upload Logo</label>
                  <div className={styles.uploadArea}>
                    {logoUrl ? (
                      <div className={styles.logoPreview}>
                        <img
                          src={logoUrl}
                          alt="Logo Preview"
                          className={styles.logoImage}
                        />
                        <button
                          className={styles.removeLogoBtn}
                          onClick={() => {
                            setLogoUrl("");
                            setLogoFile(null);
                          }}
                        >
                          Hapus Logo
                        </button>
                      </div>
                    ) : (
                      <label className={styles.uploadLabel}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className={styles.fileInput}
                          disabled={isUploading}
                        />
                        <div className={styles.uploadPlaceholder}>
                          {isUploading ? (
                            <>
                              <Upload
                                size={48}
                                className={styles.uploadingIcon}
                              />
                              <p>Mengupload...</p>
                              <span>Mohon tunggu</span>
                            </>
                          ) : (
                            <>
                              <Image size={48} />
                              <p>Klik untuk upload logo</p>
                              <span>PNG, JPG (Max 5MB)</span>
                            </>
                          )}
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Account Settings */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleWrapper}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.cardIcon}
                  >
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  <h2 className={styles.cardTitle}>Rekening Bank</h2>
                </div>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.cardDescription}>
                  Atur informasi rekening bank untuk pembayaran siswa
                </p>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Nama Bank</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className={styles.textInput}
                    placeholder="contoh: Bank BCA, Bank Mandiri"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Nomor Rekening</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className={styles.textInput}
                    placeholder="contoh: 1234567890"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Nama Penerima</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className={styles.textInput}
                    placeholder="contoh: PT EduLearn Indonesia"
                  />
                </div>

                <div className={styles.bankPreview}>
                  <p className={styles.previewLabel}>Preview:</p>
                  <div className={styles.bankPreviewCard}>
                    <div className={styles.bankPreviewRow}>
                      <span className={styles.bankPreviewLabel}>Bank</span>
                      <span className={styles.bankPreviewValue}>
                        {bankName || "Bank BCA"}
                      </span>
                    </div>
                    <div className={styles.bankPreviewRow}>
                      <span className={styles.bankPreviewLabel}>
                        No. Rekening
                      </span>
                      <span className={styles.bankPreviewValue}>
                        {accountNumber || "123 456 7890"}
                      </span>
                    </div>
                    <div className={styles.bankPreviewRow}>
                      <span className={styles.bankPreviewLabel}>
                        Nama Penerima
                      </span>
                      <span className={styles.bankPreviewValue}>
                        {accountHolder || "PT EduLearn Indonesia"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Center Settings */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleWrapper}>
                  <Headset size={20} className={styles.cardIcon} />
                  <h2 className={styles.cardTitle}>Support Center</h2>
                </div>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.cardDescription}>
                  Atur informasi kontak support untuk siswa
                </p>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Nomor WhatsApp</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className={styles.textInput}
                    placeholder="contoh: +62 812-3456-7890 atau 6281234567890"
                  />
                  <p className={styles.inputHint}>
                    Format: +62 812-3456-7890 (untuk tampilan) atau
                    6281234567890 (untuk link WhatsApp)
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Jam Operasional</label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    className={styles.textInput}
                    placeholder="contoh: Senin - Jumat, 09:00 - 17:00 WIB"
                  />
                </div>

                <div className={styles.supportPreview}>
                  <p className={styles.previewLabel}>Preview:</p>
                  <div className={styles.supportPreviewCard}>
                    <div className={styles.supportPreviewIcon}>
                      <Headset size={32} />
                    </div>
                    <p className={styles.supportPreviewNumber}>
                      {whatsappNumber || "+62 812-3456-7890"}
                    </p>
                    <p className={styles.supportPreviewHours}>
                      {operatingHours || "Senin - Jumat, 09:00 - 17:00 WIB"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button className={styles.resetButton} onClick={handleResetClick}>
              <RotateCcw size={18} />
              Reset ke Default
            </button>
            <button className={styles.saveButton} onClick={handleSaveClick}>
              <Save size={18} />
              Simpan Perubahan
            </button>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                {modalType === "save" ? (
                  <CheckCircle size={24} color="#10b981" />
                ) : (
                  <AlertTriangle size={24} color="#f59e0b" />
                )}
              </div>
              <h3 className={styles.modalTitle}>
                {modalType === "save"
                  ? "Konfirmasi Simpan"
                  : "Konfirmasi Reset"}
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                {modalType === "save"
                  ? "Apakah Anda yakin ingin menyimpan perubahan konfigurasi ini?"
                  : "Apakah Anda yakin ingin mereset semua pengaturan ke default? Semua konfigurasi yang ada akan hilang."}
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.modalCancelButton}
                onClick={() => setShowModal(false)}
                disabled={isProcessing}
              >
                Batal
              </button>
              <button
                className={
                  modalType === "save"
                    ? styles.modalConfirmButton
                    : styles.modalResetButton
                }
                onClick={handleConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className={styles.loadingSpinner}></div>
                ) : (
                  <>
                    {modalType === "save" ? (
                      <>
                        <Save size={16} />
                        Simpan Sekarang
                      </>
                    ) : (
                      <>
                        <RotateCcw size={16} />
                        Reset Sekarang
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
