// Certificate generator using jsPDF (Turbopack compatible)
import { jsPDF } from "jspdf";

interface CertificateData {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateNumber: string;
  instructorName?: string;
  duration?: string;
  themeColor?: string;
  logoUrl?: string;
}

export function generateCertificatePDF(data: CertificateData): jsPDF {
  try {
    console.log("[PDF Generator] Starting PDF generation...");
    console.log(
      "[PDF Generator] Input data:",
      JSON.stringify({
        studentName: data.studentName,
        courseName: data.courseName,
        certificateNumber: data.certificateNumber,
        hasLogo: !!data.logoUrl,
        themeColor: data.themeColor,
      }),
    );

    const {
      studentName,
      courseName,
      completionDate,
      certificateNumber,
      instructorName = "Learning Management System",
      duration = "N/A",
      themeColor = "#2563eb",
      logoUrl,
    } = data;

    // Create PDF in landscape A4
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const centerX = pageWidth / 2;

    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 37, g: 99, b: 235 }; // Default blue
    };

    // Helper function to darken/lighten color
    const adjustColor = (hex: string, amount: number): string => {
      const rgb = hexToRgb(hex);
      return `rgb(${Math.max(0, Math.min(255, rgb.r + amount))}, ${Math.max(0, Math.min(255, rgb.g + amount))}, ${Math.max(0, Math.min(255, rgb.b + amount))})`;
    };

    // Colors - use theme color or default
    const primaryBlue = themeColor;
    const darkBlue = adjustColor(themeColor, -20); // Darker shade
    const lightGray = "#64748b";
    const darkGray = "#0f172a";

    // Pre-calculate theme color RGB for reuse
    const themeColorRgb = hexToRgb(themeColor);
    const headerColor = hexToRgb(lightGray);
    const nameColor = hexToRgb(darkGray);
    const lineColor = hexToRgb("#94a3b8");

    // Logo handling
    let logoAdded = false;

    // Add logo - will always have logo from API (either admin uploaded or default)
    if (logoUrl) {
      try {
        // Logo position (top-left)
        const logoX = 20;
        const logoY = 20;
        const logoWidth = 40;
        const logoHeight = 20;

        // Detect image format from data URL
        let format = "PNG";

        if (
          logoUrl.startsWith("data:image/jpeg") ||
          logoUrl.startsWith("data:image/jpg")
        ) {
          format = "JPEG";
        } else if (logoUrl.startsWith("data:image/png")) {
          format = "PNG";
        }

        doc.addImage(logoUrl, format, logoX, logoY, logoWidth, logoHeight);
        logoAdded = true;
        console.log("[PDF Generator] Logo image added successfully");
      } catch (error) {
        console.error("[PDF Generator] Error adding logo image:", error);
        console.error(
          "[PDF Generator] Logo URL length:",
          logoUrl?.substring(0, 50),
        );
      }
    }

    // If logo failed to add, log warning (should not happen with proper API)
    if (!logoAdded) {
      console.warn(
        "[PDF Generator] No logo added - check API settings endpoint",
      );
    }

    // Outer border (blue)
    const borderColor = hexToRgb(primaryBlue);
    doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Inner border (light blue)
    const innerBorderColor = hexToRgb("#3b82f6");
    doc.setDrawColor(
      innerBorderColor.r,
      innerBorderColor.g,
      innerBorderColor.b,
    );
    doc.setLineWidth(0.5);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Watermark "CERTIFIED"
    doc.setFontSize(100);
    doc.setTextColor(241, 245, 249);
    doc.setFont("helvetica", "bold");
    const watermarkText = "CERTIFIED";
    const watermarkWidth = doc.getTextWidth(watermarkText);
    doc.text(watermarkText, centerX - watermarkWidth / 2, pageHeight / 2 + 20, {
      baseline: "middle",
    });

    // Header
    let yPos = 40;

    // "CERTIFICATE" text
    doc.setFontSize(14);
    doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
    doc.setFont("helvetica", "normal");
    doc.text("CERTIFICATE", centerX, yPos, { align: "center" });

    yPos += 12;

    // "OF COMPLETION"
    doc.setFontSize(36);
    doc.setTextColor(themeColorRgb.r, themeColorRgb.g, themeColorRgb.b);
    doc.setFont("helvetica", "bold");
    doc.text("OF COMPLETION", centerX, yPos, { align: "center" });

    yPos += 10;

    // Subtitle
    doc.setFontSize(11);
    doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
    doc.setFont("helvetica", "normal");
    doc.text(
      "This certificate is awarded to recognize excellent achievement",
      centerX,
      yPos,
      { align: "center" },
    );

    yPos += 20;

    // Body
    // "This is to certify that"
    doc.setFontSize(10);
    doc.text("This is to certify that", centerX, yPos, { align: "center" });

    yPos += 10;

    // Student Name
    doc.setFontSize(24);
    doc.setTextColor(nameColor.r, nameColor.g, nameColor.b);
    doc.setFont("helvetica", "bold");
    doc.text(studentName, centerX, yPos, { align: "center" });

    yPos += 2;

    // Line under name
    const nameLineWidth = 120;
    doc.setDrawColor(lineColor.r, lineColor.g, lineColor.b);
    doc.setLineWidth(0.5);
    doc.line(
      centerX - nameLineWidth / 2,
      yPos,
      centerX + nameLineWidth / 2,
      yPos,
    );

    yPos += 10;

    // "has successfully completed"
    doc.setFontSize(10);
    doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
    doc.setFont("helvetica", "normal");
    doc.text("has successfully completed the online course", centerX, yPos, {
      align: "center",
    });

    yPos += 8;

    // Course Name
    doc.setFontSize(16);
    doc.setTextColor(themeColorRgb.r, themeColorRgb.g, themeColorRgb.b);
    doc.setFont("helvetica", "bold");
    doc.text(courseName, centerX, yPos, { align: "center" });

    yPos += 8;

    // Description
    doc.setFontSize(10);
    doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
    doc.setFont("helvetica", "normal");
    doc.text(
      "demonstrating dedication, commitment, and mastery of the course material",
      centerX,
      yPos,
      { align: "center" },
    );

    yPos += 20;

    // Details Row (Date, Duration, Cert ID)
    const detailY = yPos;
    const col1X = pageWidth / 4;
    const col2X = pageWidth / 2;
    const col3X = (pageWidth * 3) / 4;

    doc.setFontSize(8);
    doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);

    // Date of Completion
    doc.text("Date of Completion", col1X, detailY, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(nameColor.r, nameColor.g, nameColor.b);
    doc.setFont("helvetica", "bold");
    doc.text(completionDate, col1X, detailY + 5, { align: "center" });

    // Course Duration
    doc.setFontSize(8);
    doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
    doc.setFont("helvetica", "normal");
    doc.text("Course Duration", col2X, detailY, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(nameColor.r, nameColor.g, nameColor.b);
    doc.setFont("helvetica", "bold");
    doc.text(duration, col2X, detailY + 5, { align: "center" });

    // Certification ID
    doc.setFontSize(8);
    doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
    doc.setFont("helvetica", "normal");
    doc.text("Certification ID", col3X, detailY, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(nameColor.r, nameColor.g, nameColor.b);
    doc.setFont("helvetica", "bold");
    doc.text(certificateNumber, col3X, detailY + 5, { align: "center" });

    yPos += 20;

    // Signature
    const sigLineWidth = 60;
    doc.setDrawColor(nameColor.r, nameColor.g, nameColor.b);
    doc.setLineWidth(0.5);
    doc.line(
      centerX - sigLineWidth / 2,
      yPos,
      centerX + sigLineWidth / 2,
      yPos,
    );

    yPos += 5;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(instructorName, centerX, yPos, { align: "center" });

    yPos += 5;

    doc.setFontSize(9);
    doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
    doc.setFont("helvetica", "normal");
    doc.text("Platform Administrator", centerX, yPos, { align: "center" });

    // Certificate Number (bottom right)
    doc.setFontSize(7);
    doc.setTextColor(lineColor.r, lineColor.g, lineColor.b);
    doc.text(certificateNumber, pageWidth - 20, pageHeight - 15, {
      align: "right",
    });

    console.log("[PDF Generator] PDF generation completed successfully");
    return doc;
  } catch (error) {
    console.error("[PDF Generator] ERROR during PDF generation:", error);
    console.error(
      "[PDF Generator] Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );

    // Return a minimal fallback PDF instead of throwing
    console.log("[PDF Generator] Creating fallback PDF...");
    const fallbackDoc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    fallbackDoc.setFontSize(20);
    fallbackDoc.text("Certificate Generation Error", 148, 100, {
      align: "center",
    });
    fallbackDoc.setFontSize(12);
    fallbackDoc.text(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      148,
      110,
      { align: "center" },
    );
    fallbackDoc.text(`Certificate: ${data.certificateNumber}`, 148, 120, {
      align: "center",
    });

    return fallbackDoc;
  }
}
