"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Sidebar, TopHeader } from "@/components/layout";
import { FileUpload } from "@/components/ui";
import styles from "../../new/newCourse.module.css";
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Video,
  FileText,
  Save,
  Loader2,
  HelpCircle,
  Link as LinkIcon,
  X,
  Check,
} from "lucide-react";
import { Id } from "../../../../../../convex/_generated/dataModel";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Lesson {
  id: string;
  title: string;
  type: "video" | "text" | "quiz";
  videoUrl?: string;
  videoType?: "upload" | "link";
  thumbnail?: string;
  description?: string;
  quizQuestions?: QuizQuestion[];
  _id?: Id<"lessons">;
  isNew?: boolean;
  isDeleted?: boolean;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

export default function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const router = useRouter();
  const { courseId: courseIdParam } = use(params);
  const courseId = courseIdParam as Id<"courses">;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "curriculum">("info");
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [selectedVideoType, setSelectedVideoType] = useState<
    "upload" | "link" | null
  >(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    { id: "1", question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch course data and lessons
  const courseData = useQuery(api.courses.getCourseById, { courseId });
  const lessonsData =
    useQuery(api.lessons.getLessonsByCourse, { courseId }) || [];

  // Mutations
  const updateCourse = useMutation(api.courses.updateCourse);
  const createLessonMutation = useMutation(api.lessons.createLesson);
  const updateLessonMutation = useMutation(api.lessons.updateLesson);
  const deleteLessonMutation = useMutation(api.lessons.deleteLesson);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    price: "",
    level: "beginner",
    category: "bahasa-china",
    thumbnail: "",
    certificateTemplate: "",
    previewVideo: "",
  });

  // Category management
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [availableCategories, setAvailableCategories] = useState([
    "bahasa-china",
    "programming",
    "design",
    "business",
    "marketing",
  ]);

  const [sections, setSections] = useState<Section[]>([
    { id: "1", title: "Pengenalan", lessons: [] },
  ]);

  // Load custom categories from localStorage on component mount
  useEffect(() => {
    const savedCategories = localStorage.getItem("customCategories");
    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories);
        if (Array.isArray(parsed)) {
          setAvailableCategories((prev) => {
            const combined = [...prev, ...parsed];
            return Array.from(new Set(combined));
          });
        }
      } catch (error) {
        console.error("Error loading custom categories:", error);
      }
    }
  }, []);

  // Load course data when available
  useEffect(() => {
    if (courseData) {
      const levelMap: Record<string, string> = {
        Pemula: "beginner",
        Menengah: "intermediate",
        Lanjutan: "advanced",
      };

      if (
        courseData.category &&
        !availableCategories.includes(courseData.category)
      ) {
        setAvailableCategories((prev) => [...prev, courseData.category!]);
      }

      setFormData({
        title: courseData.title || "",
        subtitle: "",
        description: courseData.description || "",
        price: courseData.price?.toString() || "",
        level: levelMap[courseData.level] || "beginner",
        category: courseData.category || "bahasa-china",
        thumbnail: courseData.thumbnail || "",
        certificateTemplate: courseData.certificateTemplate || "",
        previewVideo: courseData.previewVideo || "",
      });
    }
  }, [courseData, availableCategories]);

  // Load lessons data and organize into sections
  useEffect(() => {
    if (lessonsData && lessonsData.length > 0) {
      const loadedLessons: Lesson[] = lessonsData.map((lesson: any) => ({
        id: lesson._id,
        _id: lesson._id,
        title: lesson.title,
        type: lesson.videoUrl ? "video" : "text",
        videoUrl: lesson.videoUrl || "",
        description: lesson.description || "",
        isNew: false,
        isDeleted: false,
      }));

      // Put all lessons in a single section for now
      if (loadedLessons.length > 0) {
        setSections([
          {
            id: "loaded-section",
            title: "Materi Kursus",
            lessons: loadedLessons,
          },
        ]);
      }
    }
  }, [lessonsData]);

  const handleInfoChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "category" && value === "custom") {
      setShowCustomCategory(true);
    } else if (name === "category" && value !== "custom") {
      setShowCustomCategory(false);
      setCustomCategory("");
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleAddCustomCategory = () => {
    if (
      customCategory.trim() &&
      !availableCategories.includes(
        customCategory.toLowerCase().replace(/\s+/g, "-"),
      )
    ) {
      const newCategoryValue = customCategory
        .toLowerCase()
        .replace(/\s+/g, "-");
      const updatedCategories = [...availableCategories, newCategoryValue];

      setAvailableCategories(updatedCategories);
      setFormData({ ...formData, category: newCategoryValue });
      setCustomCategory("");
      setShowCustomCategory(false);

      const defaultCategories = [
        "bahasa-china",
        "programming",
        "design",
        "business",
        "marketing",
      ];
      const customOnlyCategories = updatedCategories.filter(
        (cat) => !defaultCategories.includes(cat),
      );
      localStorage.setItem(
        "customCategories",
        JSON.stringify(customOnlyCategories),
      );
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      "bahasa-china": "Bahasa China",
      programming: "Programming",
      design: "Design",
      business: "Business",
      marketing: "Marketing",
    };
    return (
      categoryMap[category] ||
      category
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  const addSection = () => {
    setSections([
      ...sections,
      { id: Date.now().toString(), title: "Bagian Baru", lessons: [] },
    ]);
  };

  const updateSectionTitle = (id: string, title: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, title } : s)));
  };

  const addLesson = (sectionId: string, type: "video" | "text" | "quiz") => {
    const defaultTitle =
      type === "video"
        ? "Video Baru"
        : type === "quiz"
          ? "Kuis Baru"
          : "Materi Baru";
    setSections(
      sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            lessons: [
              ...s.lessons,
              {
                id: Date.now().toString(),
                title: defaultTitle,
                type,
                isNew: true,
              },
            ],
          };
        }
        return s;
      }),
    );
  };

  const openVideoModal = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setVideoModalOpen(true);
  };

  const handleVideoOption = (option: "upload" | "link") => {
    setSelectedVideoType(option);
    setVideoModalOpen(false);
    setThumbnailModalOpen(true);
  };

  const handleThumbnailSubmit = () => {
    if (currentSectionId && selectedVideoType) {
      setSections(
        sections.map((s) => {
          if (s.id === currentSectionId) {
            return {
              ...s,
              lessons: [
                ...s.lessons,
                {
                  id: Date.now().toString(),
                  title: "Video Baru",
                  type: "video",
                  videoType: selectedVideoType,
                  videoUrl: videoUrl,
                  description: videoDescription,
                  thumbnail: "https://via.placeholder.com/160x90",
                  isNew: true,
                },
              ],
            };
          }
          return s;
        }),
      );
    }
    setThumbnailModalOpen(false);
    setCurrentSectionId(null);
    setSelectedVideoType(null);
    setVideoUrl("");
    setVideoDescription("");
  };

  const openQuizModal = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setQuizModalOpen(true);
  };

  const addQuizQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        id: Date.now().toString(),
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  const updateQuizQuestion = (id: string, field: string, value: any) => {
    setQuizQuestions(
      quizQuestions.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  const updateQuizOption = (
    questionId: string,
    optionIndex: number,
    value: string,
  ) => {
    setQuizQuestions(
      quizQuestions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      }),
    );
  };

  const deleteQuizQuestion = (id: string) => {
    setQuizQuestions(quizQuestions.filter((q) => q.id !== id));
  };

  const handleQuizSubmit = () => {
    if (currentSectionId && quizTitle && quizQuestions.length > 0) {
      setSections(
        sections.map((s) => {
          if (s.id === currentSectionId) {
            return {
              ...s,
              lessons: [
                ...s.lessons,
                {
                  id: Date.now().toString(),
                  title: quizTitle,
                  type: "quiz",
                  quizQuestions: quizQuestions,
                  isNew: true,
                },
              ],
            };
          }
          return s;
        }),
      );
    }
    setQuizModalOpen(false);
    setCurrentSectionId(null);
    setQuizTitle("");
    setQuizQuestions([
      { id: "1", question: "", options: ["", "", "", ""], correctAnswer: 0 },
    ]);
  };

  const deleteLesson = (sectionId: string, lessonId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            lessons: s.lessons.map((l) =>
              l.id === lessonId ? { ...l, isDeleted: true } : l,
            ),
          };
        }
        return s;
      }),
    );
  };

  const updateLessonTitle = (
    sectionId: string,
    lessonId: string,
    title: string,
  ) => {
    setSections(
      sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            lessons: s.lessons.map((l) =>
              l.id === lessonId ? { ...l, title } : l,
            ),
          };
        }
        return s;
      }),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Calculate duration from sections and lessons
      let totalLessons = 0;
      sections.forEach((section) => {
        totalLessons += section.lessons.filter((l) => !l.isDeleted).length;
      });
      const estimatedDuration = `${Math.max(1, Math.ceil(totalLessons * 15))} menit`;

      // Map level to database value
      const levelMap: Record<string, "Pemula" | "Menengah" | "Lanjutan"> = {
        beginner: "Pemula",
        intermediate: "Menengah",
        advanced: "Lanjutan",
      };

      // Update course info
      await updateCourse({
        courseId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: levelMap[formData.level] || "Pemula",
        price: parseInt(formData.price) || 0,
        thumbnail: formData.thumbnail || "/placeholder-course.jpg",
        certificateTemplate: formData.certificateTemplate || undefined,
        previewVideo: formData.previewVideo || undefined,
      });

      // Handle lessons - delete, update, and create
      let lessonOrder = 0;
      console.log("Sections to save:", sections);
      for (const section of sections) {
        console.log(
          "Processing section:",
          section.title,
          "with lessons:",
          section.lessons,
        );
        for (const lesson of section.lessons) {
          console.log(
            "Processing lesson:",
            lesson.title,
            "isNew:",
            lesson.isNew,
            "isDeleted:",
            lesson.isDeleted,
          );
          if (lesson.isDeleted && lesson._id) {
            // Delete existing lesson
            console.log("Deleting lesson:", lesson._id);
            await deleteLessonMutation({ lessonId: lesson._id });
          } else if (lesson.isNew && !lesson.isDeleted) {
            // Create new lesson
            console.log("Creating new lesson:", lesson.title);
            const newLessonId = await createLessonMutation({
              courseId,
              title: lesson.title,
              description: lesson.description || "",
              videoUrl: lesson.videoUrl || undefined,
              duration: 10,
              order: lessonOrder++,
              content: lesson.description || "",
            });
            console.log("Created lesson with ID:", newLessonId);
          } else if (!lesson.isNew && !lesson.isDeleted && lesson._id) {
            // Update existing lesson
            await updateLessonMutation({
              lessonId: lesson._id,
              title: lesson.title,
              description: lesson.description || "",
              videoUrl: lesson.videoUrl || undefined,
              duration: 10,
              order: lessonOrder++,
            });
          }
        }
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Gagal mengupdate kursus");
    } finally {
      setIsLoading(false);
    }
  };

  if (!courseData) {
    return (
      <div className={styles.layout}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className={styles.main}>
          <TopHeader
            title="Edit Kursus"
            onMenuClick={() => setIsSidebarOpen(true)}
          />
          <div className={styles.content}>
            <div className={styles.loading}>
              <Loader2 size={24} className="animate-spin" />
              <span>Memuat data kursus...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.main}>
        <TopHeader
          title="Edit Kursus"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>
          <div className={styles.header}>
            <Link href="/admin/courses" className={styles.backButton}>
              <ArrowLeft size={20} />
            </Link>
            <div className={styles.title}>
              <h1>Edit Kursus</h1>
              <p>Perbarui kurikulum dan materi pembelajaran.</p>
            </div>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "info" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("info")}
            >
              Informasi Dasar
            </button>
            <button
              className={`${styles.tab} ${activeTab === "curriculum" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("curriculum")}
            >
              Kurikulum
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {activeTab === "info" && (
              <div className={styles.formCard}>
                <div className={styles.formGrid}>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Judul Kursus</label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleInfoChange}
                      className={styles.input}
                      placeholder="Contoh: Master Web Development 2024"
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Deskripsi Singkat</label>
                    <input
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInfoChange}
                      className={styles.input}
                      placeholder="Ringkasan singkat tentang kursus ini"
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Deskripsi Lengkap</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInfoChange}
                      className={styles.textarea}
                      placeholder="Jelaskan apa yang akan dipelajari siswa..."
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Kategori</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInfoChange}
                      className={styles.select}
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {getCategoryDisplayName(cat)}
                        </option>
                      ))}
                      <option value="custom">+ Tambah Kategori Baru</option>
                    </select>

                    {showCustomCategory && (
                      <div
                        style={{
                          marginTop: "12px",
                          display: "flex",
                          gap: "8px",
                          alignItems: "end",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className={styles.input}
                            placeholder="Masukkan nama kategori baru..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCustomCategory}
                          className={styles.addCategoryBtn}
                          disabled={!customCategory.trim()}
                        >
                          Tambah
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomCategory(false);
                            setCustomCategory("");
                            setFormData({
                              ...formData,
                              category: "bahasa-china",
                            });
                          }}
                          className={styles.cancelCategoryBtn}
                        >
                          Batal
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Level</label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInfoChange}
                      className={styles.select}
                    >
                      <option value="beginner">Pemula (Beginner)</option>
                      <option value="intermediate">
                        Menengah (Intermediate)
                      </option>
                      <option value="advanced">Mahir (Advanced)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Harga (IDR)</label>
                    <input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInfoChange}
                      className={styles.input}
                      placeholder="Contoh: 150000"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Thumbnail Kursus</label>
                    <FileUpload
                      onUpload={(url) =>
                        setFormData((prev) => ({ ...prev, thumbnail: url }))
                      }
                      accept=".jpg,.jpeg,.png"
                      maxSize={2}
                      placeholder="Klik atau drop gambar di sini"
                      description="JPG, PNG max 2MB"
                      currentFile={formData.thumbnail}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Video Preview Kursus</label>
                    <FileUpload
                      onUpload={(url) =>
                        setFormData((prev) => ({ ...prev, previewVideo: url }))
                      }
                      accept=".mp4,.webm,.mov"
                      maxSize={100}
                      placeholder="Upload video preview"
                      description="MP4, WebM, MOV max 100MB"
                      currentFile={formData.previewVideo}
                    />
                    <input
                      name="previewVideo"
                      value={formData.previewVideo}
                      onChange={handleInfoChange}
                      className={styles.input}
                      placeholder="Atau paste link YouTube/video URL"
                      style={{ marginTop: "12px" }}
                    />
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        marginTop: "8px",
                      }}
                    >
                      🎬 Video ini akan ditampilkan sebagai preview di halaman detail kursus
                    </p>
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>
                      Template Sertifikat (Opsional)
                    </label>
                    <FileUpload
                      onUpload={(url) =>
                        setFormData((prev) => ({
                          ...prev,
                          certificateTemplate: url,
                        }))
                      }
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSize={5}
                      placeholder="Upload template sertifikat"
                      description="PDF, JPG, PNG - Akan diberikan saat kursus selesai"
                      currentFile={formData.certificateTemplate}
                    />
                    <input
                      name="certificateTemplate"
                      value={formData.certificateTemplate}
                      onChange={handleInfoChange}
                      className={styles.input}
                      placeholder="Atau masukkan URL template sertifikat"
                      style={{ marginTop: "12px" }}
                    />
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        marginTop: "8px",
                      }}
                    >
                      💡 Tip: Template sertifikat akan otomatis diberikan kepada
                      student yang menyelesaikan kursus ini
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "curriculum" && (
              <div className={styles.formCard}>
                <div className={styles.sectionList}>
                  {sections.map((section) => (
                    <div key={section.id} className={styles.sectionItem}>
                      <div className={styles.sectionHeader}>
                        <input
                          value={section.title}
                          onChange={(e) =>
                            updateSectionTitle(section.id, e.target.value)
                          }
                          className={styles.sectionTitleInput}
                          placeholder="Judul Bagian"
                        />
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() =>
                            setSections(
                              sections.filter((s) => s.id !== section.id),
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className={styles.lessonList}>
                        {section.lessons
                          .filter((l) => !l.isDeleted)
                          .map((lesson) => (
                            <div key={lesson.id} className={styles.lessonItem}>
                              <div className={styles.lessonIcon}>
                                {lesson.type === "video" ? (
                                  <Video size={16} />
                                ) : lesson.type === "quiz" ? (
                                  <HelpCircle size={16} />
                                ) : (
                                  <FileText size={16} />
                                )}
                              </div>
                              <input
                                value={lesson.title}
                                onChange={(e) =>
                                  updateLessonTitle(
                                    section.id,
                                    lesson.id,
                                    e.target.value,
                                  )
                                }
                                className={styles.lessonInput}
                                placeholder="Judul Materi"
                              />
                              <button
                                type="button"
                                className={styles.deleteLessonBtn}
                                onClick={() =>
                                  deleteLesson(section.id, lesson.id)
                                }
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        <div className={styles.addLessonButtons}>
                          <button
                            type="button"
                            className={styles.addLessonBtn}
                            onClick={() => openVideoModal(section.id)}
                          >
                            <Video size={16} /> Tambah Video
                          </button>
                          <button
                            type="button"
                            className={styles.addLessonBtn}
                            onClick={() => openQuizModal(section.id)}
                          >
                            <HelpCircle size={16} /> Tambah Kuis
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className={styles.addSectionBtn}
                  onClick={addSection}
                >
                  <Plus size={20} /> Tambah Bagian Baru
                </button>
              </div>
            )}

            <div className={styles.footer}>
              <Link href="/admin/courses" className={styles.cancelBtn}>
                Batal
              </Link>
              <button
                type="submit"
                className={styles.headerButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Video Modal */}
        {videoModalOpen && (
          <div
            className={styles.modalOverlay}
            onClick={() => setVideoModalOpen(false)}
          >
            <div
              className={styles.videoModal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Tambah Video</h3>
                <button
                  className={styles.closeBtn}
                  onClick={() => setVideoModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <p className={styles.modalSubtitle}>
                Pilih cara menambahkan video ke materi kursus
              </p>
              <div className={styles.videoOptions}>
                <button
                  type="button"
                  className={styles.videoOptionBtn}
                  onClick={() => handleVideoOption("upload")}
                >
                  <Upload size={24} />
                  <span className={styles.optionTitle}>Upload Video</span>
                  <span className={styles.optionDesc}>
                    Upload file video dari komputer Anda
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.videoOptionBtn}
                  onClick={() => handleVideoOption("link")}
                >
                  <LinkIcon size={24} />
                  <span className={styles.optionTitle}>Paste Link Video</span>
                  <span className={styles.optionDesc}>
                    Tambahkan link dari YouTube atau Vimeo
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Thumbnail Modal */}
        {thumbnailModalOpen && (
          <div
            className={styles.modalOverlay}
            onClick={() => setThumbnailModalOpen(false)}
          >
            <div
              className={styles.videoModal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Tambahkan Detail Video</h3>
                <button
                  className={styles.closeBtn}
                  onClick={() => setThumbnailModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <p className={styles.modalSubtitle}>
                {selectedVideoType === "link"
                  ? "Masukkan link video dan upload thumbnail"
                  : "Upload video dan thumbnail"}
              </p>

              <div className={styles.formGroup}>
                {selectedVideoType === "link" && (
                  <>
                    <label className={styles.label}>Link Video</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="https://youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </>
                )}

                {selectedVideoType === "upload" && (
                  <>
                    <label className={styles.label}>Upload Video</label>
                    <div className={styles.uploadArea}>
                      <Upload size={32} className={styles.uploadIcon} />
                      <p style={{ fontSize: "14px", fontWeight: 500 }}>
                        Klik atau drop video di sini
                      </p>
                      <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                        MP4, MOV max 500MB
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.formGroup} style={{ marginTop: "20px" }}>
                <label className={styles.label}>Deskripsi Video</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Jelaskan isi video ini..."
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup} style={{ marginTop: "20px" }}>
                <label className={styles.label}>Thumbnail Video</label>
                <div className={styles.uploadArea}>
                  <Upload size={32} className={styles.uploadIcon} />
                  <p style={{ fontSize: "14px", fontWeight: 500 }}>
                    Klik atau drop thumbnail di sini
                  </p>
                  <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                    JPG, PNG (1280x720 recommended)
                  </p>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setThumbnailModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className={styles.headerButton}
                  onClick={handleThumbnailSubmit}
                >
                  Tambah Video
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Modal */}
        {quizModalOpen && (
          <div
            className={styles.modalOverlay}
            onClick={() => setQuizModalOpen(false)}
          >
            <div
              className={styles.quizModal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Buat Kuis</h3>
                <button
                  className={styles.closeBtn}
                  onClick={() => setQuizModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Judul Kuis</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Contoh: Kuis Pengenalan JavaScript"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                />
              </div>

              <div className={styles.quizQuestionsWrapper}>
                <div className={styles.quizHeader}>
                  <span className={styles.quizLabel}>
                    Soal ({quizQuestions.length})
                  </span>
                  <button
                    type="button"
                    className={styles.addQuestionBtn}
                    onClick={addQuizQuestion}
                  >
                    <Plus size={16} /> Tambah Soal
                  </button>
                </div>

                <div className={styles.questionsList}>
                  {quizQuestions.map((question, qIndex) => (
                    <div key={question.id} className={styles.questionCard}>
                      <div className={styles.questionHeader}>
                        <span className={styles.questionNumber}>
                          Soal {qIndex + 1}
                        </span>
                        {quizQuestions.length > 1 && (
                          <button
                            type="button"
                            className={styles.deleteQuestionBtn}
                            onClick={() => deleteQuizQuestion(question.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Pertanyaan</label>
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="Tulis pertanyaan di sini..."
                          value={question.question}
                          onChange={(e) =>
                            updateQuizQuestion(
                              question.id,
                              "question",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <div className={styles.optionsWrapper}>
                        <label className={styles.label}>Pilihan Jawaban</label>
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className={styles.optionRow}>
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correctAnswer === optIndex}
                              onChange={() =>
                                updateQuizQuestion(
                                  question.id,
                                  "correctAnswer",
                                  optIndex,
                                )
                              }
                              className={styles.radio}
                            />
                            <input
                              type="text"
                              className={styles.optionInput}
                              placeholder={`Pilihan ${String.fromCharCode(65 + optIndex)}`}
                              value={option}
                              onChange={(e) =>
                                updateQuizOption(
                                  question.id,
                                  optIndex,
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        ))}
                        <p className={styles.correctHint}>
                          * Pilih radio button untuk menandai jawaban yang benar
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setQuizModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className={styles.headerButton}
                  onClick={handleQuizSubmit}
                >
                  Simpan Kuis
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => {
              setShowSuccessModal(false);
              router.push("/admin/courses");
            }}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalIconWrapper}>
                <Check size={32} />
              </div>
              <h3 className={styles.modalTitle}>Berhasil!</h3>
              <p className={styles.modalText}>
                Kursus berhasil diperbarui. Perubahan akan langsung diterapkan.
              </p>
              <button
                className={styles.modalBtn}
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/admin/courses");
                }}
              >
                Oke, Mengerti
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
