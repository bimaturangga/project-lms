// Helper functions untuk certificate features

/**
 * Generate unique certificate number
 * Format: CERT-{timestamp}-{userId}
 */
export function generateCertificateNumber(userId: string): string {
  const timestamp = Date.now();
  const userIdSuffix = userId.slice(-6);
  return `CERT-${timestamp}-${userIdSuffix}`;
}

/**
 * Format date for certificate display (Indonesian locale)
 */
export function formatCertificateDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Validate certificate number format
 */
export function isValidCertificateNumber(certNumber: string): boolean {
  const pattern = /^CERT-\d+-[a-zA-Z0-9]{6}$/;
  return pattern.test(certNumber);
}

/**
 * Extract timestamp from certificate number
 */
export function extractTimestampFromCertNumber(
  certNumber: string,
): number | null {
  const parts = certNumber.split("-");
  if (parts.length === 3 && !isNaN(Number(parts[1]))) {
    return Number(parts[1]);
  }
  return null;
}

/**
 * Download file from blob
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Share certificate (Web Share API)
 */
export async function shareCertificate(
  certificateNumber: string,
  courseName: string,
): Promise<boolean> {
  if (!navigator.share) {
    console.warn("Web Share API not supported");
    return false;
  }

  try {
    await navigator.share({
      title: "Sertifikat Kursus",
      text: `Saya telah menyelesaikan kursus "${courseName}"! 🎓\nCertificate ID: ${certificateNumber}`,
      url: window.location.href,
    });
    return true;
  } catch (error) {
    console.error("Error sharing:", error);
    return false;
  }
}

/**
 * Copy certificate link to clipboard
 */
export async function copyCertificateLink(
  certificateId: string,
): Promise<boolean> {
  const link = `${window.location.origin}/certificates/verify/${certificateId}`;

  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch (error) {
    console.error("Error copying to clipboard:", error);
    return false;
  }
}

/**
 * Generate certificate file name
 */
export function generateCertificateFileName(
  certificateNumber: string,
  courseName?: string,
): string {
  const sanitizedCourseName = courseName
    ? courseName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()
    : "course";
  return `certificate-${sanitizedCourseName}-${certificateNumber}.pdf`;
}
