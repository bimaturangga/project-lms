"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Check, Loader2 } from "lucide-react";
import styles from "./FileUpload.module.css";

interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  placeholder?: string;
  description?: string;
  className?: string;
  currentFile?: string;
}

export default function FileUpload({
  onUpload,
  accept = ".jpg,.jpeg,.png,.pdf",
  maxSize = 2,
  placeholder = "Klik atau drop file di sini",
  description,
  className,
  currentFile,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setUploadSuccess(false);

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File terlalu besar. Maksimal ${maxSize}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = accept.split(",").map((type) => type.trim());
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const isValidType =
      allowedTypes.includes(fileExtension) || allowedTypes.includes(file.type);

    if (!isValidType) {
      setError(`Tipe file tidak didukung. Hanya: ${accept}`);
      return;
    }

    setIsUploading(true);

    try {
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
      setUploadSuccess(true);
      onUpload(data.url);

      // Reset success state after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setError("Gagal mengupload file. Coba lagi.");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setUploadSuccess(false);
    setError(null);
    onUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStatusIcon = () => {
    if (isUploading)
      return <Loader2 size={32} className={styles.loadingIcon} />;
    if (uploadSuccess || currentFile)
      return <Check size={32} className={styles.successIcon} />;
    return <Upload size={32} className={styles.uploadIcon} />;
  };

  const getStatusText = () => {
    if (isUploading) return "Mengupload...";
    if (uploadSuccess) return "Upload berhasil!";
    if (currentFile) return "File sudah diupload";
    return placeholder;
  };

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div
        className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ""} ${
          error ? styles.error : ""
        } ${uploadSuccess || currentFile ? styles.success : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {getStatusIcon()}

        <div className={styles.textContent}>
          <p className={styles.mainText}>{getStatusText()}</p>
          {description && <p className={styles.description}>{description}</p>}
        </div>

        {(uploadSuccess || currentFile) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeFile();
            }}
            className={styles.removeButton}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className={styles.hiddenInput}
      />
    </div>
  );
}
