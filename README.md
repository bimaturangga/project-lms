# 🎓 Edu Learn - Learning Management System

Platform pembelajaran online modern dengan fitur lengkap untuk mengelola kursus, siswa, dan sertifikat secara digital.

## ✨ Fitur Utama

### 👨‍🎓 Student Features

- **Dashboard Interaktif** - Overview progress belajar dan kursus aktif
- **Katalog Kursus** - Jelajahi kursus dengan filter kategori dan pencarian
- **Video Learning** - Tonton video pembelajaran dengan progress tracking
- **Quiz & Assessment** - Uji pemahaman dengan quiz interaktif
- **Progress Tracking** - Monitor kemajuan belajar per lesson dan course
- **Sertifikat Digital** - Auto-generate sertifikat PDF saat course selesai
- **Share Certificate** - Bagikan sertifikat ke LinkedIn, Twitter, atau copy link
- **Payment System** - Pembayaran course dengan upload bukti transfer
- **Review & Rating** - Beri rating dan review untuk course yang sudah diselesaikan
- **Shopping Cart** - Keranjang belanja untuk multiple course purchase
- **Notifikasi Real-time** - Update langsung untuk course, payment, dan notifikasi penting

### 👨‍💼 Admin Features

- **Dashboard Analytics** - Statistik lengkap dengan data real-time
- **User Management** - Kelola student dan admin
- **Course Management** - CRUD courses dengan upload thumbnail
- **Lesson Management** - Kelola lesson per course dengan video upload
- **Payment Verification** - Verifikasi pembayaran student
- **Enrollment Management** - Monitor progress student
- **Reports** - Laporan lengkap dengan filter date range
- **Settings** - Kustomisasi theme color dan upload logo

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.6 (App Router + Turbopack)
- **Language**: TypeScript
- **Backend**: Convex (Real-time database & serverless functions)
- **State Management**: Zustand
- **Styling**: CSS Modules
- **PDF Generation**: jsPDF v2.5.2
- **Image Processing**: Sharp (SVG to PNG conversion)
- **Icons**: Lucide React
- **Authentication**: Custom with Convex

## 📋 Prerequisites

Sebelum memulai, pastikan sudah install:

- **Node.js** 18.x atau lebih baru
- **npm** atau **yarn**
- **Git**
- **Convex Account** (gratis di [convex.dev](https://convex.dev))

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/project-lms.git
cd project-lms
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Convex

```bash
# Install Convex CLI globally (jika belum)
npm install -g convex

# Login ke Convex
npx convex login

# Setup project Convex
npx convex dev
```

Ikuti instruksi di terminal untuk membuat project baru atau connect ke existing project.

### 4. Environment Variables

Buat file `.env.local` di root project:

```env
# Convex
CONVEX_DEPLOYMENT=your-deployment-url
NEXT_PUBLIC_CONVEX_URL=your-convex-url

# Optional: Upload configuration
MAX_FILE_SIZE=10485760
```

**PENTING**: File `.env.local` tidak akan di-commit ke GitHub (sudah ada di `.gitignore`).

### 5. Seed Database (Optional)

Untuk mengisi data dummy:

1. Login sebagai admin (buat akun pertama akan otomatis jadi admin)
2. Buka `/admin/seed`
3. Klik tombol seed untuk generate data dummy

## 🏃‍♂️ Running the Project

### Development Mode

**Terminal 1** - Convex Backend:

```bash
npx convex dev
```

**Terminal 2** - Next.js Development Server:

```bash
npm run dev
```

Buka browser ke [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
project-lms/
├── convex/                  # Convex backend functions
│   ├── schema.ts           # Database schema
│   ├── users.ts            # User operations
│   ├── courses.ts          # Course operations
│   ├── lessons.ts          # Lesson operations
│   ├── enrollments.ts      # Enrollment tracking
│   ├── certificates.ts     # Certificate generation
│   └── ...
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/        # Auth pages (login, register)
│   │   ├── admin/         # Admin dashboard & management
│   │   ├── student/       # Student interface
│   │   └── api/           # API routes
│   ├── components/         # Reusable components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # UI components
│   ├── lib/               # Utilities & helpers
│   ├── stores/            # Zustand state management
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
│   ├── uploads/           # User uploads (gitignored)
│   └── logo.svg           # Default logo
└── package.json
```

## 👤 Default Accounts

Setelah seed, gunakan akun berikut:

**Admin:**

- Email: `admin@edulearn.com`
- Password: `admin123`

**Student:**

- Email: `bima@example.com`
- Password: `password123`

## 🎨 Features Detail

### Sertifikat Digital

- **Auto-generation**: Sertifikat otomatis dibuat saat course 100% selesai
- **PDF Format**: Download sertifikat dalam format PDF berkualitas tinggi
- **Custom Logo**: Upload logo di admin settings (support SVG, PNG, JPEG)
- **Theme Colors**: Kustomisasi warna theme dari admin settings
- **Share**: Bagikan ke social media atau copy certificate link

### Payment System

- **Upload Proof**: Student upload bukti transfer
- **Verification**: Admin verifikasi payment
- **Auto Enrollment**: Setelah verified, otomatis enrolled ke course

### Progress Tracking

- **Lesson Progress**: Track completion per lesson
- **Course Progress**: Hitung % progress otomatis
- **Auto Certificate**: Generate sertifikat saat 100%

## 🔧 Troubleshooting

### Port 3000 sudah digunakan

```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Convex tidak connect

```bash
npx convex dev --once
npx convex dev
```

### Build error dengan jsPDF

Pastikan menggunakan versi `2.5.2`:

```bash
npm uninstall jspdf
npm install jspdf@2.5.2 --save
```

Lihat [TROUBLESHOOTING_CERTIFICATE.md](./TROUBLESHOOTING_CERTIFICATE.md) untuk detail lebih lanjut.

## 📝 Documentation

- [Certificate Integration Guide](./CONVEX_INTEGRATION.md)
- [Upload Feature](./UPLOAD_FEATURE.md)
- [Edit Course Feature](./EDIT_COURSE_FEATURE.md)
- [Troubleshooting](./TROUBLESHOOTING_CERTIFICATE.md)

## 🤝 Contributing

1. Fork repository
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Convex](https://convex.dev/) - Real-time backend
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [Lucide Icons](https://lucide.dev/) - Beautiful icons
- [Sharp](https://sharp.pixelplumbing.com/) - Image processing

## 📧 Contact

Untuk pertanyaan atau support, silakan buka issue di GitHub repository.

---

**Made with ❤️ using Next.js and Convex**
