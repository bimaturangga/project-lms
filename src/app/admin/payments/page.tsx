"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Sidebar, TopHeader } from "@/components/layout";
import styles from "./payments.module.css";
import * as XLSX from "xlsx";
import {
  ChevronDown,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  CreditCard,
  X,
  Eye,
  Calendar,
  User,
  BookOpen,
  Receipt,
  ExternalLink,
  Check,
} from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

// Types - keep for local display transformation
interface PaymentDisplay {
  _id: Id<"payments">;
  id: string;
  invoiceNumber?: string;
  userId: Id<"users">;
  courseId: Id<"courses">;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  course: string;
  amount: string;
  status: string;
  date: string;
  paymentMethod: string;
  proofImage: string;
  bankName?: string;
  accountNumber?: string;
}

export default function PaymentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<PaymentDisplay | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [selectedQuickFilter, setSelectedQuickFilter] =
    useState("Last 30 Days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [displayDateRange, setDisplayDateRange] = useState("Last 30 Days");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Convex queries and mutations
  const paymentsData = useQuery(api.payments.getAllPayments) || [];
  const usersData = useQuery(api.users.getAllUsers) || [];
  const coursesData = useQuery(api.courses.getAllCourses) || [];
  const verifyPaymentMutation = useMutation(api.payments.verifyPayment);
  const rejectPaymentMutation = useMutation(api.payments.rejectPayment);

  // Transform payments data for display
  const transformedPayments: PaymentDisplay[] = paymentsData.map((payment) => {
    const user = usersData.find((u) => u._id === payment.userId);
    const course = coursesData.find((c) => c._id === payment.courseId);

    return {
      _id: payment._id,
      id: payment.invoiceNumber || payment._id.slice(-8).toUpperCase(),
      invoiceNumber: payment.invoiceNumber,
      userId: payment.userId,
      courseId: payment.courseId,
      user: {
        name: user?.name || "Unknown User",
        email: user?.email || "",
        avatar: user?.avatar || "",
      },
      course: course?.title || "Unknown Course",
      amount: `Rp ${payment.amount.toLocaleString("id-ID")}`,
      status: payment.status,
      date: new Date(payment.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      paymentMethod: payment.paymentMethod,
      proofImage: payment.proofUrl || "",
    };
  });

  // Calculate stats from real data - filtered by date range
  const getDateFilteredPayments = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let startDateFilter = new Date();
    startDateFilter.setDate(today.getDate() - 30);
    startDateFilter.setHours(0, 0, 0, 0);
    let endDateFilter = today;

    if (dateRange.start && dateRange.end) {
      startDateFilter = new Date(dateRange.start);
      startDateFilter.setHours(0, 0, 0, 0);
      endDateFilter = new Date(dateRange.end);
      endDateFilter.setHours(23, 59, 59, 999);
    }

    return paymentsData.filter((payment) => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate >= startDateFilter && paymentDate <= endDateFilter;
    });
  };

  const dateFilteredPayments = getDateFilteredPayments();

  const totalRevenue = dateFilteredPayments
    .filter((p) => p.status === "verified")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = dateFilteredPayments.filter(
    (p) => p.status === "pending",
  ).length;
  const rejectedCount = dateFilteredPayments.filter(
    (p) => p.status === "rejected",
  ).length;
  const totalTransactionsCount = dateFilteredPayments.length;

  const dynamicPaymentStats = [
    {
      label: "Total Pendapatan",
      value: `Rp ${totalRevenue.toLocaleString("id-ID")}`,
      icon: <DollarSign size={24} />,
      color: "green",
    },
    {
      label: "Pending Verifikasi",
      value: pendingCount.toString(),
      icon: <Clock size={24} />,
      color: "yellow",
    },
    {
      label: "Ditolak",
      value: rejectedCount.toString(),
      icon: <XCircle size={24} />,
      color: "red",
    },
    {
      label: "Total Transaksi",
      value: totalTransactionsCount.toString(),
      icon: <CreditCard size={24} />,
      color: "blue",
    },
  ];

  // Filter payments by status and date range
  const dateFilteredTransformedPayments = transformedPayments.filter((payment) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let startDateFilter = new Date();
    startDateFilter.setDate(today.getDate() - 30);
    startDateFilter.setHours(0, 0, 0, 0);
    let endDateFilter = today;

    if (dateRange.start && dateRange.end) {
      startDateFilter = new Date(dateRange.start);
      startDateFilter.setHours(0, 0, 0, 0);
      endDateFilter = new Date(dateRange.end);
      endDateFilter.setHours(23, 59, 59, 999);
    }

    // Parse the payment date from transformed format back to Date
    const originalPayment = paymentsData.find((p) => p._id === payment._id);
    if (!originalPayment) return false;

    const paymentDate = new Date(originalPayment.createdAt);
    return paymentDate >= startDateFilter && paymentDate <= endDateFilter;
  });

  const filteredPayments =
    activeTab === "all"
      ? dateFilteredTransformedPayments
      : dateFilteredTransformedPayments.filter((p) => p.status === activeTab);

  // Handle verify payment
  const handleVerifyPayment = async (payment: PaymentDisplay) => {
    try {
      // Verify the payment (this will automatically create enrollment)
      await verifyPaymentMutation({
        paymentId: payment._id,
      });

      setSuccessMessage(
        "Pembayaran berhasil diverifikasi! Student sudah terdaftar di kursus.",
      );
      setShowSuccessModal(true);
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert("Gagal memverifikasi pembayaran");
    }
  };

  // Handle reject payment
  const handleRejectPayment = async (payment: PaymentDisplay) => {
    try {
      await rejectPaymentMutation({
        paymentId: payment._id,
      });

      setSuccessMessage("Pembayaran ditolak.");
      setShowSuccessModal(true);
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error("Error rejecting payment:", error);
      alert("Gagal menolak pembayaran");
    }
  };

  const quickFilterOptions = [
    "Last 7 Days",
    "Last 30 Days",
    "This Month",
    "Last Quarter",
  ];

  const handleQuickFilterSelect = (filter: string) => {
    setSelectedQuickFilter(filter);
    setStartDate("");
    setEndDate("");
  };

  const handleApplyRange = () => {
    if (startDate && endDate) {
      setDisplayDateRange(`${startDate} - ${endDate}`);
      setDateRange({ start: startDate, end: endDate });
    } else {
      setDisplayDateRange(selectedQuickFilter);
      // Calculate date range based on quick filter
      const today = new Date();
      let start = new Date();
      let end = today;

      switch (selectedQuickFilter) {
        case "Last 7 Days":
          start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "Last 30 Days":
          start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "This Month":
          start = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case "Last Quarter":
          start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
          break;
      }

      setDateRange({
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      });
    }
    setIsDateRangeOpen(false);
  };

  const handleCancelDateRange = () => {
    setIsDateRangeOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className={`${styles.badge} ${styles.verified}`}>
            <CheckCircle2 size={12} />
            Terverifikasi
          </span>
        );
      case "pending":
        return (
          <span className={`${styles.badge} ${styles.pending}`}>
            <Clock size={12} />
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className={`${styles.badge} ${styles.rejected}`}>
            <XCircle size={12} />
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  const openDetailModal = (payment: PaymentDisplay) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPayment(null);
  };

  // Export to Excel function
  const handleExportExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary Stats
    const summaryData = [
      ["Laporan Pembayaran - " + displayDateRange],
      [""],
      ["Ringkasan Statistik"],
      ["Metrik", "Nilai"],
      ["Total Pendapatan", `Rp ${totalRevenue.toLocaleString("id-ID")}`],
      ["Pending Verifikasi", pendingCount.toString()],
      ["Ditolak", rejectedCount.toString()],
      ["Total Transaksi", totalTransactionsCount.toString()],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

    // Sheet 2: Transaction Details
    const transactionData = [
      ["Detail Transaksi"],
      [""],
      [
        "No",
        "Invoice",
        "Nama Siswa",
        "Email",
        "Kursus",
        "Jumlah",
        "Status",
        "Metode Pembayaran",
        "Bank",
        "No. Rekening",
        "Tanggal",
      ],
      ...filteredPayments.map((payment, index) => [
        index + 1,
        payment.invoiceNumber || payment.id,
        payment.user.name,
        payment.user.email,
        payment.course,
        payment.amount,
        payment.status === "verified"
          ? "Terverifikasi"
          : payment.status === "pending"
            ? "Pending"
            : "Ditolak",
        payment.paymentMethod,
        payment.bankName || "-",
        payment.accountNumber || "-",
        payment.date,
      ]),
    ];
    const wsTransactions = XLSX.utils.aoa_to_sheet(transactionData);
    XLSX.utils.book_append_sheet(wb, wsTransactions, "Detail Transaksi");

    // Generate filename with date
    const today = new Date().toISOString().split("T")[0];
    const filename = `Laporan_Pembayaran_${today}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.main}>
        <TopHeader
          title="Kelola Pembayaran"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>
          {/* Header Section */}
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <h1>Verifikasi Pembayaran</h1>
              <p className={styles.subtitle}>
                Kelola dan verifikasi pembayaran dari siswa.
              </p>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.filterButton}
                onClick={() => setIsDateRangeOpen(true)}
              >
                <Calendar size={16} />
                <span>{displayDateRange}</span>
                <ChevronDown size={16} />
              </button>
              <button className={styles.exportButton} onClick={handleExportExcel}>
                <Download size={20} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            {dynamicPaymentStats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={`${styles.statIcon} ${styles[stat.color]}`}>
                    {stat.icon}
                  </div>
                </div>
                <span className={styles.statLabel}>{stat.label}</span>
                <p className={styles.statValue}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Payments Table */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Daftar Transaksi</h3>
              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${activeTab === "all" ? styles.active : ""}`}
                  onClick={() => setActiveTab("all")}
                >
                  Semua
                </button>
                <button
                  className={`${styles.tab} ${activeTab === "pending" ? styles.active : ""}`}
                  onClick={() => setActiveTab("pending")}
                >
                  Pending
                </button>
                <button
                  className={`${styles.tab} ${activeTab === "verified" ? styles.active : ""}`}
                  onClick={() => setActiveTab("verified")}
                >
                  Verified
                </button>
                <button
                  className={`${styles.tab} ${activeTab === "rejected" ? styles.active : ""}`}
                  onClick={() => setActiveTab("rejected")}
                >
                  Rejected
                </button>
              </div>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>ID Transaksi</th>
                    <th className={styles.th}>Siswa</th>
                    <th className={styles.th}>Kursus</th>
                    <th className={styles.th}>Jumlah</th>
                    <th className={styles.th}>Tanggal</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className={styles.tr}>
                      <td className={styles.td}>
                        <span className={styles.transactionId}>
                          {payment.id}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.userCell}>
                          <img
                            src={payment.user.avatar}
                            alt={payment.user.name}
                            className={styles.avatar}
                          />
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>
                              {payment.user.name}
                            </span>
                            <span className={styles.userEmail}>
                              {payment.user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={styles.td}>{payment.course}</td>
                      <td className={styles.td}>
                        <span className={styles.amount}>{payment.amount}</span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.date}>{payment.date}</span>
                      </td>
                      <td className={styles.td}>
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionBtn} ${styles.reviewBtn}`}
                            onClick={() => openDetailModal(payment)}
                          >
                            <Eye size={14} />
                            Lihat Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className={styles.td}
                        style={{ textAlign: "center", padding: "40px" }}
                      >
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        {isDetailModalOpen && selectedPayment && (
          <div className={styles.modalOverlay} onClick={closeDetailModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Detail Pembayaran</h2>
                <button className={styles.closeBtn} onClick={closeDetailModal}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                {/* Transaction Info */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Receipt size={16} />
                    ID Transaksi
                  </label>
                  <div className={styles.infoText}>{selectedPayment.id}</div>
                </div>

                {selectedPayment.invoiceNumber && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <Receipt size={16} />
                      No. Invoice
                    </label>
                    <div className={styles.infoText}>
                      {selectedPayment.invoiceNumber}
                    </div>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <User size={16} />
                    Siswa
                  </label>
                  <div className={styles.infoUserCell}>
                    <img
                      src={selectedPayment.user.avatar}
                      alt={selectedPayment.user.name}
                      className={styles.infoAvatar}
                    />
                    <div>
                      <div className={styles.infoText}>
                        {selectedPayment.user.name}
                      </div>
                      <div className={styles.infoSubtext}>
                        {selectedPayment.user.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <BookOpen size={16} />
                    Kursus
                  </label>
                  <div className={styles.infoText}>
                    {selectedPayment.course}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <DollarSign size={16} />
                    Jumlah
                  </label>
                  <div
                    className={`${styles.infoText} ${styles.amountHighlight}`}
                  >
                    {selectedPayment.amount}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Calendar size={16} />
                    Tanggal
                  </label>
                  <div className={styles.infoText}>{selectedPayment.date}</div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <CreditCard size={16} />
                    Metode Pembayaran
                  </label>
                  <div className={styles.infoText}>
                    {selectedPayment.paymentMethod}
                    {selectedPayment.bankName &&
                      ` - ${selectedPayment.bankName}`}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Status</label>
                  <div>{getStatusBadge(selectedPayment.status)}</div>
                </div>

                {/* Payment Proof */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Bukti Pembayaran</label>
                  <div className={styles.proofImageWrapper}>
                    <img
                      src={selectedPayment.proofImage}
                      alt="Bukti Pembayaran"
                      className={styles.proofImage}
                    />
                    <a
                      href={selectedPayment.proofImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.viewFullBtn}
                    >
                      <ExternalLink size={16} />
                      Lihat Ukuran Penuh
                    </a>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className={styles.modalFooter}>
                {selectedPayment.status === "pending" ? (
                  <>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => handleRejectPayment(selectedPayment)}
                    >
                      <XCircle size={18} />
                      Tolak
                    </button>
                    <button
                      className={styles.submitBtn}
                      onClick={() => handleVerifyPayment(selectedPayment)}
                    >
                      <CheckCircle2 size={18} />
                      Verifikasi
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={styles.cancelBtn}
                      onClick={closeDetailModal}
                    >
                      Tutup
                    </button>
                    {selectedPayment.invoiceNumber && (
                      <button
                        className={styles.submitBtn}
                        onClick={() => {
                          alert(
                            `Downloading invoice ${selectedPayment.invoiceNumber}`,
                          );
                        }}
                      >
                        <Download size={18} />
                        Unduh Invoice
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Date Range Modal */}
        {isDateRangeOpen && (
          <div className={styles.modalOverlay} onClick={handleCancelDateRange}>
            <div
              className={styles.dateRangeModal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.dateRangeHeader}>
                <h2 className={styles.dateRangeTitle}>Select Date Range</h2>
                <button
                  className={styles.closeBtn}
                  onClick={handleCancelDateRange}
                >
                  <X size={20} />
                </button>
              </div>

              <div className={styles.quickFilters}>
                {quickFilterOptions.map((option) => (
                  <button
                    key={option}
                    className={`${styles.quickFilterBtn} ${selectedQuickFilter === option ? styles.activeQuickFilter : ""}`}
                    onClick={() => handleQuickFilterSelect(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className={styles.dateInputsRow}>
                <div className={styles.dateInputGroup}>
                  <label className={styles.dateLabel}>Start Date</label>
                  <div className={styles.dateInputWrapper}>
                    <Calendar size={16} className={styles.dateIcon} />
                    <input
                      type="date"
                      className={styles.dateInput}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                </div>
                <div className={styles.dateInputGroup}>
                  <label className={styles.dateLabel}>End Date</label>
                  <div className={styles.dateInputWrapper}>
                    <Calendar size={16} className={styles.dateIcon} />
                    <input
                      type="date"
                      className={styles.dateInput}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.dateRangeFooter}>
                <button
                  className={styles.cancelBtn}
                  onClick={handleCancelDateRange}
                >
                  Cancel
                </button>
                <button className={styles.submitBtn} onClick={handleApplyRange}>
                  Apply Range
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div
            className={styles.successModalOverlay}
            onClick={() => setShowSuccessModal(false)}
          >
            <div
              className={styles.successModalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.successModalIconWrapper}>
                <Check size={32} />
              </div>
              <h3 className={styles.successModalTitle}>Berhasil!</h3>
              <p className={styles.successModalText}>{successMessage}</p>
              <button
                className={styles.successModalBtn}
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
