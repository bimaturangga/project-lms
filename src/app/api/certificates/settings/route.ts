import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

export const dynamic = "force-dynamic";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    // Fetch settings from Convex
    const settings = await convex.query(api.settings.getAllSettings);

    // Extract theme color and logo URL
    const themeColorSetting = Array.isArray(settings)
      ? settings.find((s: any) => s.key === "themeColor")
      : undefined;
    const logoUrlSetting = Array.isArray(settings)
      ? settings.find((s: any) => s.key === "logoUrl")
      : undefined;

    let logoBase64 = undefined;

    // If logo URL exists, fetch and convert to base64
    if (logoUrlSetting?.value) {
      try {
        const logoPath = logoUrlSetting.value;
        if (logoPath.startsWith("/uploads/")) {
          // Read from public directory
          const fs = require("fs");
          const path = require("path");
          const sharp = require("sharp");
          const publicDir = path.join(process.cwd(), "public");
          const fullLogoPath = path.join(publicDir, logoPath);

          if (fs.existsSync(fullLogoPath)) {
            const logoBuffer = fs.readFileSync(fullLogoPath);
            const ext = path.extname(fullLogoPath).toLowerCase();

            // If SVG, convert to PNG
            if (ext === ".svg") {
              console.log("[Settings API] Converting uploaded SVG to PNG...");
              const pngBuffer = await sharp(logoBuffer)
                .resize(600, 300, {
                  fit: "contain",
                  background: { r: 255, g: 255, b: 255, alpha: 0 },
                })
                .png()
                .toBuffer();
              logoBase64 = `data:image/png;base64,${pngBuffer.toString("base64")}`;
            } else {
              // PNG or JPEG - use as is
              const mimeType =
                ext === ".png"
                  ? "image/png"
                  : ext === ".jpg" || ext === ".jpeg"
                    ? "image/jpeg"
                    : "image/png";
              logoBase64 = `data:${mimeType};base64,${logoBuffer.toString("base64")}`;
            }
          }
        } else if (logoPath.startsWith("data:")) {
          // Already base64 - check if SVG
          if (logoPath.startsWith("data:image/svg")) {
            console.log("[Settings API] Converting base64 SVG to PNG...");
            const sharp = require("sharp");
            const base64Data = logoPath.split(",")[1];
            const svgBuffer = Buffer.from(base64Data, "base64");
            const pngBuffer = await sharp(svgBuffer)
              .resize(600, 300, {
                fit: "contain",
                background: { r: 255, g: 255, b: 255, alpha: 0 },
              })
              .png()
              .toBuffer();
            logoBase64 = `data:image/png;base64,${pngBuffer.toString("base64")}`;
          } else {
            // Already PNG/JPEG base64
            logoBase64 = logoPath;
          }
        }
      } catch (logoError) {
        console.error("Error loading logo:", logoError);
      }
    }

    // If no logo found, use default logo.svg and convert to PNG
    if (!logoBase64) {
      try {
        const fs = require("fs");
        const path = require("path");
        const sharp = require("sharp");
        const publicDir = path.join(process.cwd(), "public");
        const defaultLogoPath = path.join(publicDir, "logo.svg");

        if (fs.existsSync(defaultLogoPath)) {
          console.log("[Settings API] Converting logo.svg to PNG...");

          // Read SVG file
          const svgBuffer = fs.readFileSync(defaultLogoPath);

          // Convert SVG to PNG using sharp with white background
          const pngBuffer = await sharp(svgBuffer)
            .resize(600, 300, {
              fit: "contain",
              background: { r: 255, g: 255, b: 255, alpha: 0 },
            })
            .png()
            .toBuffer();

          logoBase64 = `data:image/png;base64,${pngBuffer.toString("base64")}`;
          console.log("[Settings API] Logo converted to PNG successfully");
        }
      } catch (defaultLogoError) {
        console.error("Error converting default logo:", defaultLogoError);
      }
    }

    return NextResponse.json({
      themeColor: themeColorSetting?.value || "#2563eb",
      logoUrl: logoBase64,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      {
        themeColor: "#2563eb",
        logoUrl: undefined,
      },
      { status: 200 }, // Return defaults even on error
    );
  }
}
