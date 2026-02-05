"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui";
import { Database, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import styles from "./seed.module.css";

export default function SeedDatabasePage() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const seedDatabase = useMutation(api.seed.seedDatabase);
  const clearDatabase = useMutation(api.seed.clearDatabase);
  const recalculateProgress = useMutation(
    api.enrollments.recalculateEnrollmentProgress,
  );

  const handleSeed = async () => {
    setStatus("loading");
    setMessage("Sedang mengisi database...");

    try {
      const result = await seedDatabase();
      setStatus("success");
      setMessage(
        `Database berhasil diisi! Admin: admin@edulearn.com, data kursus dan sample telah dibuat.`,
      );
    } catch (error: any) {
      setStatus("error");
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleClear = async () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus SEMUA data? Ini tidak bisa dibatalkan!",
      )
    ) {
      return;
    }

    setStatus("loading");
    setMessage("Sedang menghapus semua data...");

    try {
      await clearDatabase();
      setStatus("success");
      setMessage("Database berhasil dikosongkan!");
    } catch (error: any) {
      setStatus("error");
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleRecalculate = async () => {
    setStatus("loading");
    setMessage("Sedang menghitung ulang progress enrollments...");

    try {
      const result = await recalculateProgress({});
      setStatus("success");
      setMessage(result.message || "Progress berhasil dihitung ulang!");
    } catch (error: any) {
      setStatus("error");
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Database size={32} />
          <h1>Database Management</h1>
          <p>Kelola data database untuk development</p>
        </div>

        <div className={styles.content}>
          {status !== "idle" && (
            <div className={`${styles.alert} ${styles[status]}`}>
              {status === "loading" && <div className={styles.spinner} />}
              {status === "success" && <CheckCircle size={20} />}
              {status === "error" && <AlertCircle size={20} />}
              <span>{message}</span>
            </div>
          )}

          <div className={styles.section}>
            <h2>Seed Database</h2>
            <p>Isi database dengan data sample untuk development:</p>
            <ul>
              <li>1 Admin user (admin@edulearn.com / admin123)</li>
              <li>4 Sample courses</li>
            </ul>
            <Button
              onClick={handleSeed}
              disabled={status === "loading"}
              variant="primary"
            >
              <Database size={18} />
              Seed Database
            </Button>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <h2>Recalculate Enrollment Progress</h2>
            <p>
              Hitung ulang progress semua enrollments berdasarkan lesson yang
              sudah diselesaikan
            </p>
            <Button
              onClick={handleRecalculate}
              disabled={status === "loading"}
              variant="primary"
            >
              <CheckCircle size={18} />
              Recalculate Progress
            </Button>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <h2>Clear Database</h2>
            <p className={styles.danger}>
              ⚠️ Menghapus SEMUA data dari database!
            </p>
            <Button
              onClick={handleClear}
              disabled={status === "loading"}
              variant="outline"
            >
              <Trash2 size={18} />
              Clear Database
            </Button>
          </div>

          <div className={styles.info}>
            <h3>Login Credentials After Seeding:</h3>
            <div className={styles.credentials}>
              <div>
                <strong>Admin:</strong>
                <p>Email: admin@edulearn.com</p>
                <p>Password: admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
