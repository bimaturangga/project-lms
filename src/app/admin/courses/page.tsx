"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Sidebar, TopHeader } from "@/components/layout";
import styles from "./courses.module.css";
import CourseFilterModal from "./CourseFilterModal";
import {
  Plus,
  Search,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Archive,
  Check,
  PlayCircle,
} from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

export default function AdminCoursesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterLabel, setFilterLabel] = useState("Semua Status");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Convex queries and mutations
  const coursesData = useQuery(api.courses.getAllCourses) || [];
  const updateCourse = useMutation(api.courses.updateCourse);
  const deleteCourse = useMutation(api.courses.deleteCourse);

  // Map status for filtering
  const statusMap: Record<string, string> = {
    published: "active",
    draft: "draft",
    archived: "archived",
  };

  const filteredCourses = coursesData.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const mappedStatus = statusMap[course.status] || course.status;
    const matchesStatus =
      statusFilter === "all" || mappedStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleFilterApply = (status: string, label: string) => {
    setStatusFilter(status);
    setFilterLabel(label);
  };

  const handlePublishCourse = async (courseId: Id<"courses">) => {
    try {
      await updateCourse({
        courseId,
        status: "published",
      });
      setSuccessMessage(
        "Kursus berhasil dipublish! Sekarang kursus akan muncul di dashboard student.",
      );
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error publishing course:", error);
      alert("Gagal mempublish kursus");
    }
  };

  const handleArchiveCourse = async (courseId: Id<"courses">) => {
    try {
      await updateCourse({
        courseId,
        status: "archived",
      });
      setSuccessMessage("Kursus berhasil diarsipkan.");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error archiving course:", error);
      alert("Gagal mengarsipkan kursus");
    }
  };

  const handleDeleteCourse = async (courseId: Id<"courses">) => {
    if (confirm("Apakah Anda yakin ingin menghapus kursus ini?")) {
      try {
        await deleteCourse({ courseId });
        setSuccessMessage("Kursus berhasil dihapus.");
        setShowSuccessModal(true);
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("Gagal menghapus kursus");
      }
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
          title="Kelola Kursus"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <h1>Daftar Kursus</h1>
              <p className={styles.subtitle}>
                Kelola semua materi pembelajaran di platform Anda.
              </p>
            </div>
            <Link href="/admin/courses/new" className={styles.addButton}>
              <Plus size={20} />
              <span>Tambah Kursus</span>
            </Link>
          </div>

          {/* Table Card */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <div className={styles.searchWrapper}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Cari kursus atau instruktur..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button
                className={styles.filterButton}
                onClick={() => setIsFilterModalOpen(true)}
              >
                <span>{filterLabel}</span>
                <ChevronDown size={16} />
              </button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Info Kursus</th>
                    <th className={styles.th}>Harga</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Siswa</th>
                    <th className={styles.th}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => {
                    const displayStatus =
                      statusMap[course.status] || course.status;
                    return (
                      <tr key={course._id} className={styles.tr}>
                        <td className={styles.td}>
                          <div className={styles.courseCell}>
                            <img
                              src={
                                course.thumbnail || "/placeholder-course.jpg"
                              }
                              alt={course.title}
                              className={styles.courseThumbnail}
                            />
                            <div className={styles.courseInfo}>
                              <span className={styles.courseTitle}>
                                {course.title}
                              </span>
                              <span className={styles.courseInstructor}>
                                {course.instructor}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.price}>
                            {formatPrice(course.price)}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span
                            className={`${styles.badge} ${styles[displayStatus]}`}
                          >
                            {displayStatus === "active" && (
                              <CheckCircle2 size={12} />
                            )}
                            {displayStatus === "draft" && <Clock size={12} />}
                            {displayStatus === "archived" && (
                              <Archive size={12} />
                            )}
                            {displayStatus === "active" && "Aktif"}
                            {displayStatus === "draft" && "Draft"}
                            {displayStatus === "archived" && "Diarsipkan"}
                          </span>
                        </td>
                        <td className={styles.td}>
                          {course.totalStudents.toLocaleString()}
                        </td>
                        <td className={styles.td}>
                          <div className={styles.actions}>
                            {course.status === "draft" && (
                              <button
                                className={`${styles.actionBtn} ${styles.publishBtn}`}
                                title="Publish"
                                onClick={() => handlePublishCourse(course._id)}
                              >
                                <PlayCircle size={18} />
                              </button>
                            )}
                            {course.status === "published" && (
                              <button
                                className={`${styles.actionBtn} ${styles.archiveBtn}`}
                                title="Archive"
                                onClick={() => handleArchiveCourse(course._id)}
                              >
                                <Archive size={18} />
                              </button>
                            )}
                            <Link
                              href={`/student/explore/${course._id}`}
                              className={`${styles.actionBtn}`}
                              title="View"
                            >
                              <Eye size={18} />
                            </Link>
                            <Link
                              href={`/admin/courses/${course._id}/edit`}
                              className={`${styles.actionBtn} ${styles.editBtn}`}
                              title="Edit"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              title="Delete"
                              onClick={() => handleDeleteCourse(course._id)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCourses.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
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

        <CourseFilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={handleFilterApply}
          currentFilter={statusFilter}
        />

        {/* Success Modal */}
        {showSuccessModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowSuccessModal(false)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalIconWrapper}>
                <Check size={32} />
              </div>
              <h3 className={styles.modalTitle}>Berhasil!</h3>
              <p className={styles.modalText}>{successMessage}</p>
              <button
                className={styles.modalBtn}
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
