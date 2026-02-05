# Fitur Generate Sertifikat dengan React PDF

## 📋 Overview

Fitur ini memungkinkan student untuk menggenerate dan mengunduh sertifikat dalam format PDF setelah menyelesaikan kursus.

## 🛠️ Teknologi

- **@react-pdf/renderer** - Library untuk membuat PDF dengan React components
- **Next.js API Routes** - Server-side PDF generation
- **Convex** - Database untuk menyimpan data sertifikat

## 📁 File Structure

```
src/
├── components/
│   └── certificates/
│       └── CertificateTemplate.tsx      # Template sertifikat PDF
├── app/
│   ├── api/
│   │   └── certificates/
│   │       └── generate/
│   │           └── route.ts             # API endpoint untuk generate PDF
│   └── student/
│       └── certificates/
│           └── page.tsx                 # Halaman sertifikat student

convex/
└── certificates.ts                      # Convex queries & mutations
```

## 🎨 Certificate Template Features

Template sertifikat mencakup:

- **Border & Design**: Double border dengan warna biru profesional
- **Watermark**: "CERTIFIED" sebagai background
- **Student Info**: Nama student dan nama kursus
- **Details**: Tanggal selesai, durasi kursus, certificate ID
- **Signature**: Nama instructor/admin
- **Certificate Number**: ID unik untuk verifikasi

## 🔧 Cara Kerja

### 1. Generate Certificate

Sertifikat otomatis dibuat saat student menyelesaikan course:

```typescript
// convex/certificates.ts
generateCertificate({
  userId: "user_id",
  courseId: "course_id",
  enrollmentId: "enrollment_id",
});
```

### 2. Download PDF

Student dapat download sertifikat melalui UI:

```typescript
// Memanggil API route
GET /api/certificates/generate?certificateId={id}&userId={userId}
```

API route akan:

1. Fetch data certificate dari Convex
2. Fetch user dan course data
3. Generate PDF menggunakan React PDF
4. Return PDF sebagai downloadable file

### 3. Customization

#### Mengubah Template Design

Edit file [`CertificateTemplate.tsx`](src/components/certificates/CertificateTemplate.tsx):

```typescript
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
  },
  // ... customize styles
});
```

#### Menambah Custom Fonts

```typescript
import { Font } from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf",
});
```

## 🚀 Usage

### Untuk Student:

1. Selesaikan semua lesson dalam course
2. Buka halaman "Sertifikat" di dashboard
3. Klik tombol "Unduh PDF" pada sertifikat yang tersedia
4. PDF otomatis terdownload

### Untuk Admin:

Data sertifikat tersimpan di Convex database dengan structure:

```typescript
{
  userId: Id<"users">,
  courseId: Id<"courses">,
  enrollmentId: Id<"enrollments">,
  certificateNumber: string,  // Format: CERT-{timestamp}-{userId}
  issuedAt: number,
  pdfUrl: string              // Optional: untuk custom template
}
```

## 🔐 Security Notes

- PDF generation dilakukan di server-side untuk keamanan
- Certificate ID validated sebelum generate
- User authentication required untuk download

## 📝 Next Steps

Possible enhancements:

- [ ] Email sertifikat otomatis setelah course selesai
- [ ] Share certificate ke social media
- [ ] Certificate verification page (public)
- [ ] Batch download multiple certificates
- [ ] Custom certificate templates per course
- [ ] Digital signature dengan QR code

## 🐛 Troubleshooting

**PDF tidak tergenerate:**

- Pastikan Convex connection aktif
- Check console untuk error messages
- Verify certificate data ada di database

**Styling tidak muncul:**

- React PDF menggunakan subset CSS properties
- Gunakan flexbox untuk layout
- Tidak support CSS Grid

**Font tidak muncul:**

- Register font dengan `Font.register()`
- Pastikan font URL accessible
- Gunakan web-safe fonts sebagai fallback

## 📚 Resources

- [React PDF Documentation](https://react-pdf.org/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Convex Documentation](https://docs.convex.dev/)
