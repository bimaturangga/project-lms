"use client";

import React, { useState } from "react";
import styles from "./dateModal.module.css";
import { X, Calendar } from "lucide-react";

interface DateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (range: { start: string; end: string; label: string }) => void;
  currentLabel: string;
}

export default function DateRangeModal({
  isOpen,
  onClose,
  onApply,
  currentLabel,
}: DateRangeModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activePreset, setActivePreset] = useState(
    currentLabel || "Last 30 Days",
  );

  if (!isOpen) return null;

  const handlePresetClick = (preset: string) => {
    setActivePreset(preset);
    const today = new Date();
    let start = new Date();

    switch (preset) {
      case "Last 7 Days":
        start.setDate(today.getDate() - 7);
        break;
      case "Last 30 Days":
        start.setDate(today.getDate() - 30);
        break;
      case "This Month":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "Last Quarter":
        start.setMonth(today.getMonth() - 3);
        break;
      default:
        break;
    }

    // Format YYYY-MM-DD
    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    setStartDate(formatDate(start));
    setEndDate(formatDate(today));
  };

  const handleApply = () => {
    onApply({ start: startDate, end: endDate, label: activePreset });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Select Date Range</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.presets}>
          {["Last 7 Days", "Last 30 Days", "This Month", "Last Quarter"].map(
            (preset) => (
              <button
                key={preset}
                className={`${styles.presetBtn} ${activePreset === preset ? styles.active : ""}`}
                onClick={() => handlePresetClick(preset)}
              >
                {preset}
              </button>
            ),
          )}
        </div>

        <div className={styles.inputsRow}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Start Date</label>
            <div className={styles.inputWrapper}>
              <Calendar size={16} className={styles.calendarIcon} />
              <input
                type="date"
                className={styles.input}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setActivePreset("Custom");
                }}
              />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>End Date</label>
            <div className={styles.inputWrapper}>
              <Calendar size={16} className={styles.calendarIcon} />
              <input
                type="date"
                className={styles.input}
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setActivePreset("Custom");
                }}
              />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.applyBtn} onClick={handleApply}>
            Apply Range
          </button>
        </div>
      </div>
    </div>
  );
}
