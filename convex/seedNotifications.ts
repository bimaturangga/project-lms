import { mutation } from "./_generated/server";

export const seedNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    // Sample notifications untuk testing
    const sampleNotifications = [
      {
        title: "User Baru Terdaftar",
        message:
          "Seorang user baru dengan nama John Doe telah berhasil mendaftar ke platform.",
        type: "user" as const,
        icon: "User",
        color: "#10b981",
        isRead: false,
        createdAt: Date.now() - 1000 * 60 * 5, // 5 minutes ago
      },
      {
        title: "Perubahan Sistem",
        message:
          "Konfigurasi tema sistem telah diubah dari biru ke hijau oleh administrator.",
        type: "system" as const,
        icon: "Settings",
        color: "#3b82f6",
        isRead: false,
        createdAt: Date.now() - 1000 * 60 * 15, // 15 minutes ago
      },
      {
        title: "Kursus Baru Ditambahkan",
        message:
          "Kursus 'React.js Fundamentals' telah berhasil ditambahkan ke platform.",
        type: "course" as const,
        icon: "BookOpen",
        color: "#f59e0b",
        isRead: true,
        createdAt: Date.now() - 1000 * 60 * 30, // 30 minutes ago
      },
      {
        title: "Pembayaran Berhasil",
        message:
          "Pembayaran sebesar Rp 299,000 untuk kursus React.js telah berhasil diproses.",
        type: "payment" as const,
        icon: "CreditCard",
        color: "#8b5cf6",
        isRead: false,
        createdAt: Date.now() - 1000 * 60 * 45, // 45 minutes ago
      },
      {
        title: "Sertifikat Diterbitkan",
        message:
          "Sertifikat untuk kursus JavaScript Basics telah berhasil diterbitkan untuk Jane Smith.",
        type: "certificate" as const,
        icon: "Award",
        color: "#f97316",
        isRead: false,
        createdAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
      },
      {
        title: "Pendaftaran Kursus",
        message:
          "5 user baru telah mendaftar untuk kursus Python Programming dalam 24 jam terakhir.",
        type: "enrollment" as const,
        icon: "Users",
        color: "#06b6d4",
        isRead: true,
        createdAt: Date.now() - 1000 * 60 * 90, // 1.5 hours ago
      },
    ];

    // Insert sample notifications
    for (const notification of sampleNotifications) {
      await ctx.db.insert("notifications", notification);
    }

    return {
      message: `${sampleNotifications.length} sample notifications created!`,
    };
  },
});
