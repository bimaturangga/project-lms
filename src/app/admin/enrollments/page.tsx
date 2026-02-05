"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar, TopHeader } from "@/components/layout";
import styles from "./enrollments.module.css";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Download,
  UserPlus,
} from "lucide-react";

const enrollmentsData: any[] = [];
const enrollmentsDataOld = [
  {
    id: "TRX-001",
    user: {
      name: "Siti Nurhaliza",
      email: "siti@example.com",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    course: "UI/UX Design Masterclass",
    amount: "Rp 249.000",
    date: "02 Feb 2026, 10:30",
    status: "pending",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "TRX-002",
    user: {
      name: "Budi Santoso",
      email: "budi@example.com",
      avatar:
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop",
    },
    course: "Python Data Science",
    amount: "Rp 299.000",
    date: "01 Feb 2026, 15:45",
    status: "verified",
    paymentMethod: "Credit Card",
  },
  {
    id: "TRX-003",
    user: {
      name: "Ahmad Rizky",
      email: "ahmad@example.com",
      avatar:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
    },
    course: "Web Development Bootcamp",
    amount: "Rp 199.000",
    date: "01 Feb 2026, 09:20",
    status: "verified",
    paymentMethod: "E-Wallet",
  },
  {
    id: "TRX-004",
    user: {
      name: "Dewi Lestari",
      email: "dewi@example.com",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
    },
    course: "React Native Guide",
    amount: "Rp 219.000",
    date: "31 Jan 2026, 20:15",
    status: "rejected",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "TRX-005",
    user: {
      name: "Eko Kurniawan",
      email: "eko@example.com",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    },
    course: "Digital Marketing",
    amount: "Rp 149.000",
    date: "31 Jan 2026, 14:00",
    status: "pending",
    paymentMethod: "Bank Transfer",
  },
];

export default function EnrollmentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const filteredData = enrollmentsData.filter((item) => {
    if (activeTab === "all") return true;
    return item.status === activeTab;
  });

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.main}>
        <TopHeader
          title="Verifikasi Pendaftaran"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <h1>Pendaftaran & Transaksi</h1>
              <p className={styles.subtitle}>
                Verifikasi pembayaran dan pendaftaran siswa.
              </p>
            </div>
            <Link href="/admin/users/new" className={styles.headerButton}>
              <UserPlus size={20} />
              <span>Tambah User</span>
            </Link>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <div className={styles.tabs}>
                {["all", "pending", "verified", "rejected"].map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.tab} ${activeTab === tab ? styles.active : ""}`}
                    onClick={() => setActiveTab(tab)}
                    style={{ textTransform: "capitalize" }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button
                className={styles.actionBtn}
                style={{
                  background: "white",
                  border: "1px solid var(--border)",
                  display: "flex",
                  gap: "8px",
                  color: "var(--foreground)",
                }}
              >
                <Download size={16} />
                Export CSV
              </button>
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
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id} className={styles.tr}>
                      <td
                        className={styles.td}
                        style={{
                          fontFamily: "monospace",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {item.id}
                      </td>
                      <td className={styles.td}>
                        <div className={styles.userCell}>
                          <img
                            src={item.user.avatar}
                            alt={item.user.name}
                            className={styles.avatar}
                          />
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>
                              {item.user.name}
                            </span>
                            <span className={styles.userEmail}>
                              {item.user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.courseName}>{item.course}</span>
                      </td>
                      <td className={styles.td} style={{ fontWeight: 600 }}>
                        {item.amount}
                      </td>
                      <td
                        className={styles.td}
                        style={{
                          fontSize: "13px",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {item.date}
                      </td>
                      <td className={styles.td}>
                        <span
                          className={`${styles.badge} ${styles[item.status]}`}
                        >
                          {item.status === "verified" && (
                            <CheckCircle2 size={12} />
                          )}
                          {item.status === "pending" && <Clock size={12} />}
                          {item.status === "rejected" && <XCircle size={12} />}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className={styles.td}
                        style={{ textAlign: "center", padding: "40px" }}
                      >
                        Tidak ada data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
