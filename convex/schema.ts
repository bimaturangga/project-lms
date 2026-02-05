import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("student"), v.literal("admin")),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    bio: v.optional(v.string()),
    notificationPreferences: v.optional(
      v.object({
        courseUpdates: v.boolean(),
        newLessons: v.boolean(),
        promotions: v.boolean(),
      }),
    ),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  courses: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    level: v.union(
      v.literal("Pemula"),
      v.literal("Menengah"),
      v.literal("Lanjutan"),
    ),
    price: v.number(),
    thumbnail: v.string(),
    instructor: v.string(),
    duration: v.string(),
    totalStudents: v.number(),
    rating: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived"),
    ),
    certificateTemplate: v.optional(v.string()), // URL atau template ID untuk sertifikat
    previewVideo: v.optional(v.string()), // URL video preview/intro kursus
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_level", ["level"]),

  lessons: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    videoUrl: v.optional(v.string()),
    duration: v.number(), // in minutes
    order: v.number(),
    content: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_course", ["courseId"]),

  lessonProgress: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    enrollmentId: v.id("enrollments"),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    watchTime: v.optional(v.number()), // in seconds
  })
    .index("by_user", ["userId"])
    .index("by_lesson", ["lessonId"])
    .index("by_enrollment", ["enrollmentId"])
    .index("by_user_and_lesson", ["userId", "lessonId"]),

  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("pending"),
    ),
    progress: v.number(), // 0-100
    enrolledAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_user_and_course", ["userId", "courseId"]),

  payments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    enrollmentId: v.optional(v.id("enrollments")),
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("rejected"),
    ),
    paymentMethod: v.string(),
    invoiceNumber: v.string(),
    proofUrl: v.optional(v.string()),
    createdAt: v.number(),
    verifiedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_invoice", ["invoiceNumber"]),

  certificates: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    enrollmentId: v.id("enrollments"),
    certificateNumber: v.string(),
    issuedAt: v.number(),
    pdfUrl: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_certificate_number", ["certificateNumber"]),

  quizzes: defineTable({
    courseId: v.id("courses"),
    lessonId: v.optional(v.id("lessons")),
    title: v.string(),
    description: v.optional(v.string()),
    passingScore: v.number(),
    timeLimit: v.optional(v.number()), // in minutes
    createdAt: v.number(),
  }).index("by_course", ["courseId"]),

  quizQuestions: defineTable({
    quizId: v.id("quizzes"),
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.number(), // index of correct option
    order: v.number(),
  }).index("by_quiz", ["quizId"]),

  quizAttempts: defineTable({
    userId: v.id("users"),
    quizId: v.id("quizzes"),
    score: v.number(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    passed: v.boolean(),
    answers: v.array(
      v.object({
        questionId: v.id("quizQuestions"),
        selectedAnswer: v.number(),
        isCorrect: v.boolean(),
      }),
    ),
    startedAt: v.number(),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_quiz", ["quizId"]),

  cart: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    addedAt: v.number(),
  }).index("by_user", ["userId"]),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  notifications: defineTable({
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("system"), // Perubahan sistem/konfigurasi
      v.literal("user"), // Aktivitas user (registrasi, update profil)
      v.literal("course"), // Aktivitas kursus
      v.literal("payment"), // Transaksi pembayaran
      v.literal("certificate"), // Sertifikat
      v.literal("enrollment"), // Pendaftaran kursus
    ),
    icon: v.string(), // Icon name untuk UI
    color: v.string(), // Warna notifikasi
    userId: v.optional(v.id("users")), // User terkait (optional)
    relatedId: v.optional(v.string()), // ID entitas terkait
    metadata: v.optional(
      v.object({
        action: v.string(), // create, update, delete, complete, etc.
        entity: v.string(), // user, course, payment, etc.
        oldValue: v.optional(v.string()),
        newValue: v.optional(v.string()),
      }),
    ),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_created_at", ["createdAt"])
    .index("by_user", ["userId"])
    .index("by_is_read", ["isRead"]),

  reviews: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    enrollmentId: v.id("enrollments"),
    rating: v.number(), // 1-5 stars
    review: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()), // Track when review is updated
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_user_and_course", ["userId", "courseId"]),
});
