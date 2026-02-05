"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Sidebar, TopHeader } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import styles from "./users.module.css";
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  X,
  Shield,
  GraduationCap,
  BookOpen,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";

export default function UsersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "student",
    password: "",
  });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Convex queries and mutations
  const users = useQuery(api.users.getAllUsers);
  const createUser = useMutation(api.users.createUser);
  const updateUser = useMutation(api.users.updateUser);
  const updateUserPassword = useMutation(api.users.updateUserPassword);
  const deleteUser = useMutation(api.users.deleteUser);

  // Filter users based on search query
  const filteredUsers =
    users?.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <span className={`${styles.badge} ${styles.admin}`}>
            <Shield size={12} />
            Admin
          </span>
        );
      case "instructor":
        return (
          <span className={`${styles.badge} ${styles.instructor}`}>
            <BookOpen size={12} />
            Instruktur
          </span>
        );
      case "student":
        return (
          <span className={`${styles.badge} ${styles.student}`}>
            <GraduationCap size={12} />
            Siswa
          </span>
        );
      default:
        return null;
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role as "student" | "admin",
      });

      // Reset form and close modal
      setNewUser({
        name: "",
        email: "",
        role: "student",
        password: "",
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Gagal membuat user. Pastikan email belum terdaftar.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      try {
        await deleteUser({ userId: userId as any });
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Gagal menghapus user.");
      }
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser({ ...user });
    setShowChangePassword(false);
    setNewPassword("");
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await updateUser({
        userId: editingUser._id,
        name: editingUser.name,
        phone: editingUser.phone,
        address: editingUser.address,
        bio: editingUser.bio,
      });

      // Update password if requested
      if (showChangePassword && newPassword.trim()) {
        if (newPassword.length < 6) {
          alert("Password minimal 6 karakter.");
          return;
        }
        await updateUserPassword({
          userId: editingUser._id,
          newPassword: newPassword,
        });
      }

      setIsEditModalOpen(false);
      setEditingUser(null);
      setShowChangePassword(false);
      setNewPassword("");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Gagal mengupdate user.");
    }
  };

  // Loading state
  if (users === undefined) {
    return (
      <div className={styles.layout}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className={styles.main}>
          <TopHeader
            title="Manajemen User"
            onMenuClick={() => setIsSidebarOpen(true)}
          />
          <div className={styles.content}>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              Loading...
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.main}>
        <TopHeader
          title="Kelola Pengguna"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <h1>Daftar Pengguna</h1>
              <p className={styles.subtitle}>
                Kelola siswa, instruktur, dan admin platform.
              </p>
            </div>
            <button
              className={styles.addButton}
              onClick={() => setIsModalOpen(true)}
            >
              <UserPlus size={20} />
              <span>Tambah Pengguna</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{users?.length || 0}</div>
              <div className={styles.statLabel}>Total Pengguna</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>
                {users?.filter((u) => u.role === "student").length || 0}
              </div>
              <div className={styles.statLabel}>Siswa</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>
                {users?.filter((u) => u.role === "admin").length || 0}
              </div>
              <div className={styles.statLabel}>Admin</div>
            </div>
          </div>

          {/* Users Table */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                Semua Pengguna ({filteredUsers.length})
              </h3>
              <div className={styles.searchWrapper}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Cari pengguna..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Pengguna</th>
                    <th className={styles.th}>Role</th>
                    <th className={styles.th}>Bergabung</th>
                    <th className={styles.th}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className={styles.tr}>
                      <td className={styles.td}>
                        <div className={styles.userCell}>
                          <img
                            src={
                              user.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
                            }
                            alt={user.name}
                            className={styles.avatar}
                          />
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>{user.name}</span>
                            <span className={styles.userEmail}>
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={styles.td}>{getRoleBadge(user.role)}</td>
                      <td className={styles.td}>
                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            title="Edit"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            title="Hapus"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className={styles.td}
                        style={{ textAlign: "center", padding: "40px" }}
                      >
                        Tidak ada pengguna ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Edit User Modal */}
        {isEditModalOpen && editingUser && (
          <div
            className={styles.modalOverlay}
            onClick={() => setIsEditModalOpen(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Edit Pengguna</h2>
                <button
                  className={styles.closeBtn}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateUser}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nama Lengkap</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Masukkan nama lengkap"
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="Masukkan email"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Role</label>
                  <select
                    className={styles.select}
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value })
                    }
                  >
                    <option value="student">Siswa</option>
                    <option value="instructor">Instruktur</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Password Change Section */}
                <div className={styles.passwordSection}>
                  <div className={styles.passwordToggle}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={showChangePassword}
                        onChange={(e) =>
                          setShowChangePassword(e.target.checked)
                        }
                        className={styles.checkbox}
                      />
                      <Key size={16} />
                      Ubah Password
                    </label>
                  </div>

                  {showChangePassword && (
                    <div className={styles.passwordInput}>
                      <label className={styles.label}>Password Baru</label>
                      <div className={styles.passwordWrapper}>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className={styles.input}
                          placeholder="Masukkan password baru"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          minLength={6}
                        />
                        <button
                          type="button"
                          className={styles.eyeBtn}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                      <small className={styles.hint}>Minimal 6 karakter</small>
                    </div>
                  )}
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/*     </div>
                    </div>
                </div>

                {/* Add User Modal */}
        {isModalOpen && (
          <div
            className={styles.modalOverlay}
            onClick={() => setIsModalOpen(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Tambah Pengguna Baru</h2>
                <button
                  className={styles.closeBtn}
                  onClick={() => setIsModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddUser}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nama Lengkap</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Masukkan nama lengkap"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="Masukkan email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Password</label>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="Masukkan password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Role</label>
                  <select
                    className={styles.select}
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                  >
                    <option value="student">Siswa</option>
                    <option value="instructor">Instruktur</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setIsModalOpen(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Tambah Pengguna
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
