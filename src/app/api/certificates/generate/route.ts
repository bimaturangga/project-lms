import { NextRequest, NextResponse } from "next/server";
import { generateCertificatePDF } from "@/lib/certificateGenerator";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

// Configure runtime
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  console.log("=".repeat(80));
  console.log("[Certificate API] ========== NEW REQUEST ==========");
  console.log(
    "[Certificate API] GET request received at",
    new Date().toISOString(),
  );
  console.log("=".repeat(80));

  // Verify Convex connection
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.error("[Certificate API] CONVEX_URL not configured");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const certificateId = searchParams.get("certificateId");
    const userId = searchParams.get("userId");

    console.log("[Certificate API] Request params:", { certificateId, userId });

    if (!certificateId) {
      console.error("[Certificate API] Missing certificate ID");
      return NextResponse.json(
        { error: "Certificate ID is required" },
        { status: 400 },
      );
    }

    if (!userId) {
      console.error("[Certificate API] Missing user ID");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Fetch admin settings from Convex (theme color and logo)
    let settings = null;
    let themeColor = "#2563eb";
    let logoBase64 = undefined;

    try {
      settings = await convex.query(api.settings.getAllSettings);
      themeColor = settings?.themeColor || "#2563eb";
      const logoUrl = settings?.logoUrl || "";

      // Fetch and convert logo to base64 if it exists
      if (logoUrl) {
        try {
          const logoPath = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${logoUrl}`;
          const logoResponse = await fetch(logoPath);
          if (logoResponse.ok) {
            const logoBuffer = await logoResponse.arrayBuffer();
            const base64 = Buffer.from(logoBuffer).toString("base64");
            const ext = logoUrl.toLowerCase().endsWith(".png") ? "png" : "jpeg";
            logoBase64 = `data:image/${ext};base64,${base64}`;
          }
        } catch (logoError) {
          console.error("Error fetching logo:", logoError);
          // Continue without logo
        }
      }
    } catch (settingsError) {
      console.error("Error fetching settings:", settingsError);
      // Continue with defaults
    }

    // Fetch certificate data dari Convex
    console.log("[Certificate API] Fetching certificates from Convex...");
    let certificates;
    try {
      certificates = await convex.query(
        api.certificates.getCertificatesWithCourseByUser,
        {
          userId: userId as Id<"users">,
        },
      );
      console.log(
        "[Certificate API] Found certificates:",
        certificates?.length,
      );

      if (!certificates || certificates.length === 0) {
        console.error(
          "[Certificate API] No certificates found for user:",
          userId,
        );
        return NextResponse.json(
          { error: "No certificates found for this user" },
          { status: 404 },
        );
      }

      // Log certificate IDs for debugging
      console.log(
        "[Certificate API] Certificate IDs:",
        certificates.map((c) => c._id),
      );
    } catch (convexError) {
      console.error(
        "[Certificate API] Error fetching from Convex:",
        convexError,
      );
      return NextResponse.json(
        {
          error: "Failed to fetch certificate data",
          details:
            convexError instanceof Error
              ? convexError.message
              : "Unknown error",
        },
        { status: 500 },
      );
    }

    const certificate = certificates.find((cert) => cert._id === certificateId);

    if (!certificate) {
      console.error("[Certificate API] Certificate not found:", certificateId);
      console.error(
        "[Certificate API] Available IDs:",
        certificates.map((c) => c._id),
      );
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 },
      );
    }

    console.log(
      "[Certificate API] Found certificate:",
      certificate.certificateNumber,
    );
    console.log(
      "[Certificate API] Certificate has course:",
      !!certificate.course,
    );
    console.log("[Certificate API] Course title:", certificate.course?.title);

    // Fetch user data
    console.log("[Certificate API] Fetching user data...");
    const user = await convex.query(api.users.getUserById, {
      userId: certificate.userId,
    });

    if (!user || !certificate.course) {
      console.error("[Certificate API] User or course not found:", {
        user: !!user,
        course: !!certificate.course,
      });
      return NextResponse.json(
        { error: "User or course not found" },
        { status: 404 },
      );
    }

    console.log("[Certificate API] User found:", user.name);

    // Format completion date
    const completionDate = new Date(certificate.issuedAt).toLocaleDateString(
      "id-ID",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

    // Generate PDF using jsPDF
    console.log("[Certificate API] Generating PDF...");
    let pdf;
    try {
      pdf = generateCertificatePDF({
        studentName: user.name,
        courseName: certificate.course.title,
        completionDate: completionDate,
        certificateNumber: certificate.certificateNumber,
        instructorName: certificate.course.instructor,
        duration: certificate.course.duration,
        themeColor: themeColor,
        logoUrl: logoBase64,
      });
      console.log("[Certificate API] PDF generated successfully");

      // Validate PDF object
      if (!pdf || typeof pdf.output !== "function") {
        throw new Error("Invalid PDF object returned from generator");
      }

      console.log("[Certificate API] PDF object is valid");
    } catch (pdfError) {
      console.error("[Certificate API] Error generating PDF:", pdfError);
      return NextResponse.json(
        {
          error: "Failed to generate PDF",
          details:
            pdfError instanceof Error ? pdfError.message : "Unknown error",
          stack: pdfError instanceof Error ? pdfError.stack : undefined,
        },
        { status: 500 },
      );
    }

    // Convert to buffer
    let pdfBuffer: Buffer;
    try {
      console.log("[Certificate API] Converting PDF to buffer...");

      // Get PDF as arraybuffer (Node.js compatible)
      let arrayBuffer;
      try {
        arrayBuffer = pdf.output("arraybuffer");
        console.log(
          "[Certificate API] ArrayBuffer created, size:",
          arrayBuffer.byteLength,
        );
      } catch (outputError) {
        console.error(
          "[Certificate API] Error calling pdf.output():",
          outputError,
        );
        throw new Error(
          `PDF output failed: ${outputError instanceof Error ? outputError.message : "Unknown"}`,
        );
      }

      if (!arrayBuffer) {
        console.error("[Certificate API] ArrayBuffer is null or undefined");
        throw new Error("PDF output returned null/undefined");
      }

      if (arrayBuffer.byteLength === 0) {
        console.error("[Certificate API] PDF generation produced empty buffer");
        throw new Error(
          "PDF generation produced empty buffer - check PDF generator",
        );
      }

      pdfBuffer = Buffer.from(arrayBuffer);

      console.log("[Certificate API] PDF buffer size:", pdfBuffer.length);

      if (pdfBuffer.length === 0) {
        throw new Error("PDF buffer is empty after conversion");
      }
    } catch (bufferError) {
      console.error(
        "[Certificate API] Error converting PDF to buffer:",
        bufferError,
      );
      return NextResponse.json(
        {
          error: "Failed to convert PDF to buffer",
          details:
            bufferError instanceof Error
              ? bufferError.message
              : "Unknown error",
          suggestion: "Check server logs for PDF generation errors",
        },
        { status: 500 },
      );
    }

    // Return PDF as response
    // Convert Buffer to Uint8Array for Next.js compatibility
    console.log("[Certificate API] Converting buffer to Uint8Array...");
    let uint8Array;
    try {
      uint8Array = new Uint8Array(pdfBuffer);
      console.log(
        "[Certificate API] Uint8Array created, length:",
        uint8Array.length,
      );

      if (uint8Array.length === 0) {
        throw new Error("Uint8Array conversion resulted in empty array");
      }
    } catch (conversionError) {
      console.error(
        "[Certificate API] Error converting to Uint8Array:",
        conversionError,
      );
      return NextResponse.json(
        { error: "Failed to prepare PDF for transmission" },
        { status: 500 },
      );
    }

    console.log("[Certificate API] Creating NextResponse...");
    const response = new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": uint8Array.length.toString(),
        "Content-Disposition": `attachment; filename=\"certificate-${certificate.certificateNumber}.pdf\"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    console.log(
      "[Certificate API] Response headers:",
      Object.fromEntries(response.headers.entries()),
    );
    console.log("[Certificate API] ✓ Returning PDF response successfully");
    console.log("=".repeat(80));
    return response;
  } catch (error) {
    console.error("Error generating certificate (GET):", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("Error details:", { errorMessage, errorStack });
    return NextResponse.json(
      {
        error: "Failed to generate certificate",
        details: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentName,
      courseName,
      certificateNumber,
      instructorName,
      duration,
    } = body;

    if (!studentName || !courseName || !certificateNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Fetch admin settings from Convex (theme color and logo)
    let settings = null;
    let themeColor = "#2563eb";
    let logoBase64 = undefined;

    try {
      settings = await convex.query(api.settings.getAllSettings);
      themeColor = settings?.themeColor || "#2563eb";
      const logoUrl = settings?.logoUrl || "";

      // Fetch and convert logo to base64 if it exists
      if (logoUrl) {
        try {
          const logoPath = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${logoUrl}`;
          const logoResponse = await fetch(logoPath);
          if (logoResponse.ok) {
            const logoBuffer = await logoResponse.arrayBuffer();
            const base64 = Buffer.from(logoBuffer).toString("base64");
            const ext = logoUrl.toLowerCase().endsWith(".png") ? "png" : "jpeg";
            logoBase64 = `data:image/${ext};base64,${base64}`;
          }
        } catch (logoError) {
          console.error("Error fetching logo:", logoError);
          // Continue without logo
        }
      }
    } catch (settingsError) {
      console.error("Error fetching settings:", settingsError);
      // Continue with defaults
    }

    // Format completion date (using current date)
    const completionDate = new Date().toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Generate PDF using jsPDF
    const pdf = generateCertificatePDF({
      studentName,
      courseName,
      completionDate,
      certificateNumber,
      instructorName: instructorName || "Learning Management System",
      duration: duration || "N/A",
      themeColor: themeColor,
      logoUrl: logoBase64,
    });

    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    // Return PDF as response
    // Convert Buffer to Uint8Array for Next.js compatibility
    const uint8Array = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length.toString(),
        "Content-Disposition": `attachment; filename="certificate-${certificateNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating certificate (POST):", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("Error details:", { errorMessage, errorStack });
    return NextResponse.json(
      {
        error: "Failed to generate certificate",
        details: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 },
    );
  }
}
