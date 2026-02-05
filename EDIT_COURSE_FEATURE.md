# Edit Course Feature

## Overview

Admin sekarang dapat mengedit dan mengupdate kursus yang sudah dibuat melalui halaman manajemen kursus.

## Fitur yang Ditambahkan

### 1. Tombol Edit di Daftar Kursus

- Tambahan tombol Edit (ikon pensil) di setiap baris kursus
- Link menuju halaman edit course: `/admin/courses/[courseId]/edit`

### 2. Halaman Edit Course

- Path: `src/app/admin/courses/[courseId]/edit/page.tsx`
- Form yang sudah terisi dengan data kursus existing
- Semua field dapat diedit:
  - Judul kursus
  - Deskripsi
  - Kategori
  - Level (Pemula/Menengah/Lanjutan)
  - Harga
  - Status (Draft/Published/Archived)
  - Thumbnail (upload baru atau keep existing)
  - Template sertifikat (upload baru atau keep existing)

### 3. Status Management

- Admin dapat mengubah status kursus langsung dari form edit
- Status options: Draft, Published, Archived
- Penjelasan status untuk membantu admin

### 4. Course Information Display

- Header menampilkan nama kursus dan status saat ini
- Info tambahan: jumlah siswa terdaftar
- Visual status badge (hijau: Published, kuning: Draft, abu: Archived)

## Cara Penggunaan

### Untuk Admin:

1. Go to Admin Dashboard → Kelola Kursus
2. Click tombol Edit (ikon pensil) pada kursus yang ingin diedit
3. Update field yang diinginkan
4. Klik "Simpan Perubahan"
5. Konfirmasi sukses dan redirect ke daftar kursus

### Technical Details:

- Menggunakan dynamic route `[courseId]`
- Form pre-populated dengan data dari database
- File upload terintegrasi untuk thumbnail dan sertifikat
- Real-time validation dan error handling
- Loading state saat menyimpan perubahan

## Files Modified/Created

### Modified:

- ✅ `src/app/admin/courses/page.tsx` - Added Edit button
- ✅ `src/app/admin/courses/new/newCourse.module.css` - Added loading styles

### Created:

- ✅ `src/app/admin/courses/[courseId]/edit/page.tsx` - Edit course page

## Features Included:

- ✅ Dynamic route handling dengan courseId
- ✅ Pre-populated form dengan data existing
- ✅ File upload untuk thumbnail dan certificate template
- ✅ Status management (Draft/Published/Archived)
- ✅ Course info display di header
- ✅ Loading states dan error handling
- ✅ Success modal dengan redirect
- ✅ Form validation
- ✅ Responsive design

Admin sekarang memiliki kontrol penuh untuk mengedit dan mengupdate semua aspek kursus yang sudah dibuat!
