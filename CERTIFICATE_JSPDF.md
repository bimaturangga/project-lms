# Certificate Generation - Turbopack Compatible Solution

## 🚀 Solution Overview

Menggunakan **jsPDF** - library yang fully compatible dengan Turbopack/Next.js 16.

## 📦 Packages Installed

- `jsPDF` - Generate PDF dari JavaScript/TypeScript

## ✅ Keunggulan jsPDF

- ✅ **Turbopack Compatible** - No webpack issues
- ✅ **Lightweight** - Lebih ringan dari React PDF
- ✅ **No Canvas Dependencies** - Tidak butuh native dependencies
- ✅ **Server-side Ready** - Works di Next.js API routes
- ✅ **Simple API** - Easy to customize

## 📁 File Structure

```
src/
├── lib/
│   └── certificateGenerator.ts       # jsPDF generator function
└── app/
    └── api/
        └── certificates/
            └── generate/
                └── route.ts           # API endpoint (GET & POST)
```

## 🎨 Certificate Design

Design professional dengan:

- **Double Border** - Blue border dengan inner border
- **Watermark** - "CERTIFIED" background
- **Student Name** - Prominent dengan underline
- **Course Info** - Course name, completion date, duration, cert ID
- **Signature** - Instructor name dengan signature line
- **Colors** - Professional blue color scheme

## 🔧 How to Use

### Testing (Manual):

```
1. Buka: http://localhost:3000/test-certificate
2. Isi form
3. Click "Generate & Download PDF"
```

### Production (Auto):

Certificate auto-generated saat student complete course, lalu download via:

```
GET /api/certificates/generate?certificateId={id}&userId={userId}
```

## 🎯 Customization

Edit [`certificateGenerator.ts`](../../../src/lib/certificateGenerator.ts):

```typescript
// Change colors
const primaryBlue = "#2563eb"; // Main border color
const darkBlue = "#1e40af"; // Title color

// Change text
doc.text("YOUR CUSTOM TEXT", x, y, { align: "center" });

// Change fonts
doc.setFont("helvetica", "bold"); // Options: helvetica, times, courier

// Change size
doc.setFontSize(24);
```

## 🔄 Migration dari React PDF

**Before:**

```typescript
import CertificateTemplate from "@/components/certificates/CertificateTemplate";
```

**After:**

```typescript
import { generateCertificatePDF } from "@/lib/certificateGenerator";
```

**Before:**

```typescript
const pdfDoc = CertificateTemplate({ ...props });
const blob = await pdf(pdfDoc).toBlob();
```

**After:**

```typescript
const pdf = generateCertificatePDF({ ...props });
const buffer = Buffer.from(pdf.output("arraybuffer"));
```

## 📝 API Reference

### `generateCertificatePDF(data: CertificateData): jsPDF`

**Parameters:**

```typescript
interface CertificateData {
  studentName: string; // Nama student
  courseName: string; // Nama kursus
  completionDate: string; // Tanggal selesai (formatted)
  certificateNumber: string; // Certificate ID
  instructorName?: string; // Nama instructor (default: "Learning Management System")
  duration?: string; // Durasi kursus (default: "N/A")
}
```

**Returns:** jsPDF object

**Example:**

```typescript
const pdf = generateCertificatePDF({
  studentName: "John Doe",
  courseName: "Full Stack Development",
  completionDate: "6 Februari 2026",
  certificateNumber: "CERT-123456",
  instructorName: "Jane Smith",
  duration: "40 jam",
});

// Download di browser
pdf.save("certificate.pdf");

// Get buffer untuk API response
const buffer = Buffer.from(pdf.output("arraybuffer"));
```

## 🐛 Troubleshooting

**Error: "Cannot find module 'jspdf'"**

```bash
npm install jspdf
```

**PDF tidak tergenerate:**

- Check console untuk error messages
- Pastikan semua required fields ada
- Verify API route accessible

**Text terpotong / overflow:**

- Adjust font size di `certificateGenerator.ts`
- Modify yPos positions untuk spacing
- Check text width dengan `doc.getTextWidth(text)`

## 🎨 Advanced Customization

### Add Logo/Image

```typescript
// Di certificateGenerator.ts, tambahkan:
const imgData = "data:image/png;base64,...";
doc.addImage(imgData, "PNG", x, y, width, height);
```

### Custom Fonts

```typescript
// Register custom font
doc.addFont("path/to/font.ttf", "CustomFont", "normal");
doc.setFont("CustomFont");
```

### Add QR Code (untuk verification)

```bash
npm install qrcode
```

```typescript
import QRCode from "qrcode";

const qrUrl = `https://yourdomain.com/verify/${certificateNumber}`;
const qrDataUrl = await QRCode.toDataURL(qrUrl);
doc.addImage(qrDataUrl, "PNG", x, y, 30, 30);
```

## 📊 Performance

- **Generation Time**: ~100-300ms
- **File Size**: ~15-25KB
- **Memory Usage**: Minimal (no heavy dependencies)
- **Turbopack**: ✅ Fully supported

## 🔗 Resources

- [jsPDF Documentation](https://artskydj.github.io/jsPDF/docs/jsPDF.html)
- [jsPDF Examples](https://github.com/parallax/jsPDF#examples)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
