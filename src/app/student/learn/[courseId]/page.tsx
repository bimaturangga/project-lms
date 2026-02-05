"use client";

import React, { useState, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { TopHeader } from "@/components/layout";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useAuthStore } from "@/stores/authStore";
import styles from "../learn.module.css";
import CourseCompletionModal from "../CourseCompletionModal";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  PanelRightClose,
  PanelRightOpen,
  Check,
  Award,
} from "lucide-react";

// Types
interface LessonType {
  _id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number;
  order: number;
  content?: string;
  completed?: boolean;
  type?: "video" | "quiz" | "reading";
}

export default function LearnPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { user } = useAuthStore();
  const router = useRouter();
  const { courseId } = use(params);

  // Fetch course data and lessons
  const courseData = useQuery(api.courses.getCourseById, {
    courseId: courseId as Id<"courses">,
  });

  const lessonsData = useQuery(api.lessons.getLessonsByCourse, {
    courseId: courseId as Id<"courses">,
  });

  // Get lesson progress
  const lessonProgressData = useQuery(
    api.lessonProgress.getCompletedLessonsForCourse,
    user && courseId
      ? { userId: user._id as Id<"users">, courseId: courseId as Id<"courses"> }
      : "skip",
  );

  // Debug: log lessons data
  console.log("=== LEARN PAGE DEBUG ===");
  console.log("Course ID from URL:", courseId);
  console.log("Course ID type:", typeof courseId);
  console.log("Course Data:", courseData);
  console.log("Lessons Data:", lessonsData);
  console.log("Lessons is undefined?", lessonsData === undefined);
  console.log("Lessons is array?", Array.isArray(lessonsData));
  console.log("Lessons length:", lessonsData?.length);
  console.log("========================");

  // Get user enrollment for progress tracking
  const enrollmentData = useQuery(
    api.enrollments.getEnrollmentsWithCourseByUser,
    user ? { userId: user._id as Id<"users"> } : "skip",
  );

  const currentEnrollment = enrollmentData?.find(
    (e: any) => e.courseId === courseId,
  );

  // Get user's existing review for this course
  const existingReview = useQuery(
    api.reviews.getUserReviewForCourse,
    user && courseId
      ? {
          userId: user._id as Id<"users">,
          courseId: courseId as Id<"courses">,
        }
      : "skip",
  );

  // Mutations
  const markCompleted = useMutation(api.lessonProgress.markLessonCompleted);
  const generateCertificate = useMutation(api.certificates.generateCertificate);
  const createReview = useMutation(api.reviews.createReview);

  // Component state
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Set first lesson as current if not set
  React.useEffect(() => {
    if (lessonsData && lessonsData.length > 0 && !currentLessonId) {
      setCurrentLessonId(lessonsData[0]._id);
    }
  }, [lessonsData, currentLessonId]);

  // Auto-show completion modal when all lessons completed
  React.useEffect(() => {
    if (
      lessonProgressData?.isAllCompleted &&
      currentEnrollment &&
      !showCompletionModal
    ) {
      // Delay modal untuk smooth transition
      const timer = setTimeout(() => {
        setShowCompletionModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    lessonProgressData?.isAllCompleted,
    currentEnrollment,
    showCompletionModal,
  ]);

  // Loading states
  if (!courseData || lessonsData === undefined) {
    return (
      <div className={styles.layout}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Memuat kursus...</p>
        </div>
      </div>
    );
  }

  // No lessons state (data loaded but empty)
  if (lessonsData.length === 0) {
    return (
      <div className={styles.layout}>
        <TopHeader
          title={courseData.title}
          showBackButton={true}
          onMenuClick={() => {}}
        />
        <div className={styles.content}>
          <div className={styles.emptyState}>
            <BookOpen size={64} strokeWidth={1.5} />
            <h2>Belum Ada Materi</h2>
            <p>
              Kursus ini belum memiliki materi pembelajaran. Silakan cek kembali
              nanti.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Helper functions
  const currentLesson = lessonsData.find((l) => l._id === currentLessonId);
  const currentLessonIndex = lessonsData.findIndex(
    (l) => l._id === currentLessonId,
  );

  console.log("Current Lesson:", currentLesson);
  console.log("Video URL:", currentLesson?.videoUrl);
  console.log("Lesson Progress:", lessonProgressData);

  const getTotalLessons = () => lessonsData.length;
  const getCompletedLessons = () => lessonProgressData?.completedLessons || 0;

  const isLessonCompleted = (lessonId: string) => {
    return (
      lessonProgressData?.completedLessonIds?.includes(lessonId as any) || false
    );
  };

  const isAllLessonsCompleted = lessonProgressData?.isAllCompleted || false;
  const isLastLesson = currentLessonIndex === lessonsData.length - 1;

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonId(lessonsData[currentLessonIndex - 1]._id);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < lessonsData.length - 1) {
      setCurrentLessonId(lessonsData[currentLessonIndex + 1]._id);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0
      ? `${hours}:${mins.toString().padStart(2, "0")}:00`
      : `${mins}:00`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper to convert YouTube URL to embed URL
  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;

    // Check if it's a YouTube URL
    const youtubeRegex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/;
    const match = url.match(youtubeRegex);

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }

    // If not YouTube, assume it's a direct video URL
    return url;
  };

  const isYouTubeVideo = (url: string) => {
    if (!url) return false;
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  // Handle video metadata loaded
  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setDuration(video.duration);
  };

  // Handle video ended - mark as completed
  const handleVideoEnded = async () => {
    console.log("=== MARKING LESSON AS COMPLETED ===");
    console.log("User:", user);
    console.log("Current Lesson:", currentLesson);
    console.log("Enrollment:", currentEnrollment);

    if (user && currentLesson && currentEnrollment) {
      try {
        // Mark lesson as completed
        console.log("Calling markCompleted mutation...");
        await markCompleted({
          userId: user._id as Id<"users">,
          lessonId: currentLesson._id as Id<"lessons">,
          enrollmentId: currentEnrollment._id as Id<"enrollments">,
          watchTime: duration,
        });
        console.log("✅ Lesson marked as completed!");

        // Auto-play next lesson after 2 seconds
        setTimeout(() => {
          if (currentLessonIndex < lessonsData.length - 1) {
            console.log("Moving to next lesson...");
            setCurrentLessonId(lessonsData[currentLessonIndex + 1]._id);
          } else {
            console.log("This is the last lesson!");
          }
        }, 2000);
      } catch (error) {
        console.error("❌ Failed to mark lesson as completed:", error);
      }
    } else {
      console.log("Missing required data:", {
        hasUser: !!user,
        hasLesson: !!currentLesson,
        hasEnrollment: !!currentEnrollment,
      });
    }
  };

  // Handle complete course - shows completion modal
  const handleCompleteCourse = () => {
    console.log("=== COMPLETING COURSE ===");
    console.log("User:", user);
    console.log("Enrollment:", currentEnrollment);
    console.log("Is All Completed:", isAllLessonsCompleted);
    console.log("Course ID:", courseId);

    if (!user) {
      alert("User tidak ditemukan. Silakan login kembali.");
      return;
    }

    if (!currentEnrollment) {
      alert("Enrollment tidak ditemukan. Anda belum terdaftar di kursus ini.");
      return;
    }

    if (!isAllLessonsCompleted) {
      alert("Selesaikan semua lesson terlebih dahulu!");
      return;
    }

    // Open completion modal
    setShowCompletionModal(true);
  };

  // Handle submit review and view certificate
  const handleSubmitReviewAndClaim = async (rating: number, review: string) => {
    if (!user || !currentEnrollment) {
      throw new Error("User atau enrollment tidak ditemukan");
    }

    try {
      // Create review first
      console.log("Creating review...");
      await createReview({
        userId: user._id as Id<"users">,
        courseId: courseId as Id<"courses">,
        enrollmentId: currentEnrollment._id as Id<"enrollments">,
        rating,
        review,
      });
      console.log("✅ Review created!");

      // Certificate should already be auto-generated when course completed
      // But double-check and generate if not exists
      console.log("Ensuring certificate exists...");
      await generateCertificate({
        userId: user._id as Id<"users">,
        courseId: courseId as Id<"courses">,
        enrollmentId: currentEnrollment._id as Id<"enrollments">,
      });
      console.log("✅ Certificate ready!");

      // Close modal and redirect to certificates page
      setShowCompletionModal(false);
      router.push("/student/certificates");
    } catch (error: any) {
      console.error("❌ Failed:", error);
      throw error;
    }
  };

  return (
    <div className={styles.layout}>
      <TopHeader
        title={courseData.title}
        showBackButton={true}
        onMenuClick={() => {}}
      />

      <div className={styles.content}>
        {/* Main Video/Content Area */}
        <div
          className={`${styles.mainContent} ${!isCurriculumOpen ? styles.fullWidth : ""}`}
        >
          {/* Video Player */}
          <div className={styles.videoContainer}>
            {currentLesson?.videoUrl ? (
              isYouTubeVideo(currentLesson.videoUrl) ? (
                <iframe
                  className={styles.videoPlayer}
                  src={getVideoEmbedUrl(currentLesson.videoUrl) || ""}
                  title={currentLesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  className={styles.videoPlayer}
                  src={currentLesson.videoUrl}
                  controls
                  onLoadedMetadata={handleVideoLoad}
                  onEnded={handleVideoEnded}
                />
              )
            ) : (
              <div className={styles.videoPlaceholder}>
                <Play size={64} />
                <p>Video belum tersedia</p>
              </div>
            )}
          </div>

          {/* Mark Complete Button */}
          {currentLesson && !isLessonCompleted(currentLesson._id) && (
            <button
              className={styles.markCompleteBtn}
              onClick={handleVideoEnded}
            >
              <Check size={20} />
              Tandai Selesai
            </button>
          )}

          {/* Lesson Info */}
          <div className={styles.lessonInfo}>
            <div className={styles.lessonHeader}>
              <h1 className={styles.lessonTitle}>
                {currentLesson?.title || "Pilih lesson untuk mulai belajar"}
              </h1>
              <div className={styles.lessonMeta}>
                <span className={styles.metaItem}>
                  <Clock size={16} />
                  {duration > 0
                    ? formatTime(duration)
                    : currentLesson
                      ? formatDuration(currentLesson.duration)
                      : "0:00"}
                </span>
              </div>
            </div>

            {/* Lesson Content */}
            {currentLesson?.content && (
              <div className={styles.lessonContent}>
                <h3>Materi Pembelajaran</h3>
                <div
                  dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                />
              </div>
            )}

            {/* Navigation */}
            <div className={styles.lessonNavigation}>
              <button
                className={styles.navBtn}
                onClick={handlePrevLesson}
                disabled={currentLessonIndex === 0}
              >
                <ChevronLeft size={20} />
                Lesson Sebelumnya
              </button>

              {isLastLesson && isAllLessonsCompleted ? (
                <button
                  className={`${styles.navBtn} ${styles.completeBtn}`}
                  onClick={handleCompleteCourse}
                >
                  <Award size={20} />
                  Selesaikan Kursus
                </button>
              ) : (
                <button
                  className={styles.navBtn}
                  onClick={handleNextLesson}
                  disabled={currentLessonIndex === lessonsData.length - 1}
                >
                  Lesson Selanjutnya
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Curriculum Sidebar */}
        {isCurriculumOpen && (
          <div className={styles.curriculum}>
            <div className={styles.curriculumHeader}>
              <div className={styles.curriculumTitle}>
                <BookOpen size={20} />
                <span>Kurikulum Kursus</span>
              </div>
              <button
                className={styles.toggleBtn}
                onClick={() => setIsCurriculumOpen(false)}
              >
                <PanelRightClose size={20} />
              </button>
            </div>

            <div className={styles.progressSummary}>
              <div className={styles.progressText}>
                {getCompletedLessons()}/{getTotalLessons()} selesai
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${getTotalLessons() > 0 ? (getCompletedLessons() / getTotalLessons()) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className={styles.lessonsList}>
              {lessonsData.map((lesson, index) => {
                const completed = isLessonCompleted(lesson._id);
                return (
                  <div
                    key={lesson._id}
                    className={`${styles.lessonItem} ${
                      lesson._id === currentLessonId ? styles.active : ""
                    } ${completed ? styles.completed : ""}`}
                    onClick={() => setCurrentLessonId(lesson._id)}
                  >
                    <div className={styles.lessonIcon}>
                      {completed ? <Check size={20} /> : <Play size={20} />}
                    </div>

                    <div className={styles.lessonDetails}>
                      <h4 className={styles.lessonItemTitle}>{lesson.title}</h4>
                      <span className={styles.lessonDuration}>
                        {formatDuration(lesson.duration)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Collapsed Curriculum Sidebar */}
        {!isCurriculumOpen && (
          <div className={styles.curriculumCollapsed}>
            <button
              className={styles.toggleBtnCollapsed}
              onClick={() => setIsCurriculumOpen(true)}
              title="Tampilkan Kurikulum"
            >
              <PanelRightOpen size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Course Completion Modal */}
      <CourseCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onSubmit={handleSubmitReviewAndClaim}
        courseName={courseData?.title || "Kursus"}
        existingReview={
          existingReview
            ? {
                rating: existingReview.rating,
                review: existingReview.review,
              }
            : null
        }
      />
    </div>
  );
}
