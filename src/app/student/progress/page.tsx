"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar, TopHeader } from "@/components/layout";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import styles from "./progress.module.css";
import { BookOpen, CheckCircle, Clock, GraduationCap } from "lucide-react";

export default function ProgressPage() {
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Daily");

  // Fetch real data from Convex with calculated progress
  const enrollmentsWithCourse = useQuery(
    api.enrollments.getEnrollmentsWithCourseByUser,
    user?._id ? { userId: user._id } : "skip",
  );
  const allCourses = useQuery(api.courses.getAllCourses);
  const allLessons = useQuery(api.lessons.getAllLessons);
  
  // Get all lesson progress with timestamps
  const allLessonProgress = useQuery(
    api.lessonProgress.getAllLessonProgressByUser,
    user?._id ? { userId: user._id } : "skip",
  );

  // Extract enrollments from the response (progress is already calculated)
  const enrollments = enrollmentsWithCourse || [];

  // Calculate statistics from real data
  // Count courses with 100% progress as completed
  const completedEnrollments =
    enrollments?.filter((e) => (e.progress || 0) >= 100) || [];
  const activeEnrollments =
    enrollments?.filter(
      (e) => (e.progress || 0) < 100 && (e.progress || 0) > 0,
    ) || [];
  const notStartedEnrollments =
    enrollments?.filter((e) => (e.progress || 0) === 0) || [];

  // Calculate total learning hours based on completed lessons across all courses
  const totalCompletedLessons =
    enrollments?.reduce((total, enrollment) => {
      const courseLessons =
        allLessons?.filter((l) => l.courseId === enrollment.courseId) || [];
      const completed = Math.round(
        ((enrollment.progress || 0) * courseLessons.length) / 100,
      );
      return total + completed;
    }, 0) || 0;

  // Calculate total hours: assume 30 minutes (0.5 hour) per lesson on average
  // If there are completed lessons, ensure minimum of 1 hour
  const calculatedHours = totalCompletedLessons * 0.5;
  const totalHours = totalCompletedLessons > 0 
    ? Math.max(1, Math.round(calculatedHours))
    : 0;

  const stats = [
    {
      label: "Kursus Selesai",
      value: completedEnrollments.length.toString(),
      icon: CheckCircle,
      colorClass: styles.greenIcon,
    },
    {
      label: "Sedang Dipelajari",
      value: activeEnrollments.length.toString(),
      icon: BookOpen,
      colorClass: styles.blueIcon,
    },
    {
      label: "Total Jam Belajar",
      value: totalHours.toString(),
      icon: Clock,
      colorClass: styles.orangeIcon,
    },
  ];

  // Calculate activity data based on completed lessons and activeTab (Daily/Weekly/Monthly)
  const activityData = React.useMemo(() => {
    if (!allLessonProgress || allLessonProgress.length === 0) {
      // Return empty data if no progress
      const emptyLabels = activeTab === "Daily" 
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : activeTab === "Weekly"
        ? ["Week 1", "Week 2", "Week 3", "Week 4"]
        : ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      return emptyLabels.map(label => ({ label, value: 0 }));
    }

    const now = new Date();
    const hoursPerLesson = 0.5; // 30 minutes per lesson

    if (activeTab === "Daily") {
      // Daily: Last 7 days (Sun to Sat)
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dailyHours: Record<number, number> = {}; // day of week -> hours
      
      allLessonProgress.forEach((progress) => {
        if (progress.completedAt) {
          const completedDate = new Date(progress.completedAt);
          const dayOfWeek = completedDate.getDay(); // 0 = Sunday, 6 = Saturday
          dailyHours[dayOfWeek] = (dailyHours[dayOfWeek] || 0) + hoursPerLesson;
        }
      });

      // Return data for each day of the week
      return dayNames.map((day, index) => ({
        label: day,
        value: Math.round(dailyHours[index] || 0),
      }));

    } else if (activeTab === "Weekly") {
      // Weekly: Last 4 weeks
      const weeklyHours: Record<number, number> = {}; // week number -> hours
      
      allLessonProgress.forEach((progress) => {
        if (progress.completedAt) {
          const completedDate = new Date(progress.completedAt);
          const diffTime = now.getTime() - completedDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const weekNumber = Math.floor(diffDays / 7);
          
          if (weekNumber < 4) {
            weeklyHours[weekNumber] = (weeklyHours[weekNumber] || 0) + hoursPerLesson;
          }
        }
      });

      return ["Week 1", "Week 2", "Week 3", "Week 4"].map((week, index) => ({
        label: week,
        value: Math.round(weeklyHours[index] || 0),
      }));

    } else {
      // Monthly: Last 6 months
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyHours: Record<number, number> = {}; // month index -> hours
      
      allLessonProgress.forEach((progress) => {
        if (progress.completedAt) {
          const completedDate = new Date(progress.completedAt);
          const monthIndex = completedDate.getMonth(); // 0-11
          monthlyHours[monthIndex] = (monthlyHours[monthIndex] || 0) + hoursPerLesson;
        }
      });

      // Get last 6 months
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (now.getMonth() - i + 12) % 12;
        last6Months.push({
          label: monthNames[monthIndex],
          value: Math.round(monthlyHours[monthIndex] || 0),
        });
      }

      return last6Months;
    }
  }, [allLessonProgress, activeTab]);

  const topicData = React.useMemo(() => {
    // Group courses by category and calculate progress
    const categoryProgress: Record<string, number> = {};
    const categoryCount: Record<string, number> = {};

    enrollments?.forEach((enrollment) => {
      // Use embedded course data from enrollment or fallback to allCourses
      const course = enrollment.course || allCourses?.find((c) => c._id === enrollment.courseId);
      if (course) {
        const category = course.category || "Other";
        categoryProgress[category] =
          (categoryProgress[category] || 0) + (enrollment.progress || 0);
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });

    // Calculate average progress per category
    return Object.entries(categoryProgress)
      .map(([label, totalProgress]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1).replace("-", " "),
        value: Math.round(totalProgress / (categoryCount[label] || 1)),
      }))
      .slice(0, 4); // Take top 4 categories
  }, [enrollments, allCourses]);

  // Get courses with progress (enrollments already have course data and calculated progress)
  const progressCourses =
    enrollments
      ?.filter((e) => e.status === "active" || e.status === "completed")
      .map((enrollment) => {
        // Use embedded course data from enrollment
        const course = enrollment.course || allCourses?.find((c) => c._id === enrollment.courseId);
        if (!course) return null;

        // Count total lessons for this course
        const courseLessons =
          allLessons?.filter((l) => l.courseId === course._id) || [];
        const totalLessons = courseLessons.length;

        // Calculate completed lessons based on calculated progress percentage
        const completedLessons = Math.round(
          ((enrollment.progress || 0) * totalLessons) / 100,
        );

        return {
          id: course._id,
          title: course.title,
          image: course.thumbnail || "/placeholder-course.png",
          progress: enrollment.progress || 0, // This is now auto-calculated from lessonProgress
          totalLessons: totalLessons,
          completedLessons: completedLessons,
        };
      })
      .filter(Boolean) || [];

  // Charts Dimensions Logic
  const chart1Ref = React.useRef<HTMLDivElement>(null);
  const chart2Ref = React.useRef<HTMLDivElement>(null);
  const [width1, setWidth1] = useState(0);
  const [width2, setWidth2] = useState(0);

  React.useEffect(() => {
    const handleResize = () => {
      if (chart1Ref.current) setWidth1(chart1Ref.current.clientWidth);
      if (chart2Ref.current) setWidth2(chart2Ref.current.clientWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const height = 250;
  const padding = 40;

  // --- Chart 1 Calculations (Line Area) ---
  const maxValue1 = Math.max(...activityData.map((d) => d.value), 1) || 3;
  const effectiveWidth1 = width1 || 600;
  const xStep1 = (effectiveWidth1 - padding * 2) / (activityData.length - 1);

  const points1 = activityData.map((d, i) => {
    const x = padding + i * xStep1;
    const y = height - padding - (d.value / maxValue1) * (height - padding * 2);
    return { x, y, value: d.value, label: d.label };
  });

  const pathData1 = points1.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = a[i - 1];
    // Control points
    const controlX1 = prev.x + (point.x - prev.x) / 2;
    const controlY1 = prev.y;
    const controlX2 = point.x - (point.x - prev.x) / 2;
    const controlY2 = point.y;
    return `${acc} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${point.x},${point.y}`;
  }, "");

  const areaPath1 = `${pathData1} L ${effectiveWidth1 - padding},${height} L ${padding},${height} Z`;

  // --- Chart 2 Calculations (Bar) ---
  const maxValue2 = 100;
  const effectiveWidth2 = width2 || 400;
  const barWidth = 32;
  // Distribute bars evenly
  // Available width for bars = effectiveWidth2 - padding * 2
  // Space between bars
  const xStep2 = (effectiveWidth2 - padding * 2) / topicData.length;

  const bars2 = topicData.map((d, i) => {
    const x = padding + i * xStep2 + (xStep2 - barWidth) / 2; // Center in slot
    const barHeight = (d.value / maxValue2) * (height - padding * 2);
    const y = height - padding - barHeight;
    return {
      x,
      y,
      width: barWidth,
      height: barHeight,
      value: d.value,
      label: d.label,
    };
  });

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.main}>
        <TopHeader
          title="Progress Belajar"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>Statistik Pembelajaran</h1>
            <p className={styles.subtitle}>
              Pantau pencapaian dan lanjutkan pembelajaranmu.
            </p>
          </div>

          {/* Charts Grid */}
          <div className={styles.chartsGrid}>
            {/* CHART 1: Activity */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div className={styles.chartTitleGroup}>
                  <h3>Aktivitas Belajar</h3>
                  <p>Durasi belajar harian (jam)</p>
                </div>
                <div className={styles.chartTabs}>
                  {["Daily", "Weekly", "Monthly"].map((tab) => (
                    <button
                      key={tab}
                      className={`${styles.chartTab} ${activeTab === tab ? styles.active : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.chartArea} ref={chart1Ref}>
                <svg
                  className={styles.chartSvg}
                  viewBox={`0 0 ${effectiveWidth1} ${height}`}
                >
                  <defs>
                    <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--primary)"
                        stopOpacity="0.2"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--primary)"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines Chart 1 */}
                  {Array.from({ length: 5 }, (_, i) => {
                    const val = Math.round((maxValue1 / 4) * i);
                    const y =
                      height -
                      padding -
                      (val / maxValue1) * (height - padding * 2);
                    return (
                      <g key={`grid-${i}`}>
                        <line
                          x1={padding}
                          y1={y}
                          x2={effectiveWidth1 - padding}
                          y2={y}
                          className={styles.gridLine}
                        />
                        <text
                          x={padding - 10}
                          y={y + 4}
                          className={`${styles.axisText} ${styles.axisTextY}`}
                        >
                          {val}h
                        </text>
                      </g>
                    );
                  })}

                  <path
                    d={areaPath1}
                    className={styles.chartPath}
                    style={{ stroke: "none", fill: "url(#gradient1)" }}
                  />
                  <path
                    d={pathData1}
                    className={styles.chartPath}
                    style={{ fill: "none" }}
                  />

                  {points1.map((point, i) => (
                    <g key={i}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        className={styles.chartDot}
                      />
                      <text
                        x={point.x}
                        y={height - 10}
                        className={styles.axisText}
                      >
                        {point.label}
                      </text>
                      <text
                        x={point.x}
                        y={point.y - 15}
                        className={styles.axisText}
                        style={{ opacity: 0.8 }}
                      >
                        {point.value}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* CHART 2: Topics Focus */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div className={styles.chartTitleGroup}>
                  <h3>Fokus Topik</h3>
                  <p>Distribusi penguasaan materi (%)</p>
                </div>
              </div>

              <div className={styles.chartArea} ref={chart2Ref}>
                <svg
                  className={styles.chartSvg}
                  viewBox={`0 0 ${effectiveWidth2} ${height}`}
                >
                  {/* Grid Lines Chart 2 */}
                  {[0, 25, 50, 75, 100].map((val) => {
                    const y =
                      height -
                      padding -
                      (val / maxValue2) * (height - padding * 2);
                    return (
                      <g key={val}>
                        <line
                          x1={padding}
                          y1={y}
                          x2={effectiveWidth2 - padding}
                          y2={y}
                          className={styles.gridLine}
                          style={{ strokeDasharray: 2 }}
                        />
                      </g>
                    );
                  })}

                  {/* Bars */}
                  {bars2.map((bar, i) => (
                    <g key={i}>
                      <rect
                        x={bar.x}
                        y={bar.y}
                        width={bar.width}
                        height={bar.height}
                        fill="var(--primary)"
                        rx={4}
                        opacity={0.8}
                      />
                      <text
                        x={bar.x + bar.width / 2}
                        y={height - 10}
                        className={styles.axisText}
                      >
                        {bar.label}
                      </text>
                      <text
                        x={bar.x + bar.width / 2}
                        y={bar.y - 8}
                        className={styles.axisText}
                        style={{ fontWeight: "bold" }}
                      >
                        {bar.value}%
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            {stats.map((stat, idx) => (
              <div key={idx} className={styles.statCard}>
                <div className={`${styles.statIconWrapper} ${stat.colorClass}`}>
                  <stat.icon size={24} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

          <h2 className={styles.sectionTitle}>Melanjutkan Belajar</h2>
          <div className={styles.courseList}>
            {progressCourses.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "4rem 2rem",
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--background-secondary)",
                  borderRadius: "1rem",
                }}
              >
                <GraduationCap
                  size={64}
                  style={{ margin: "0 auto 1.5rem", opacity: 0.3 }}
                />
                <h3
                  style={{
                    marginBottom: "0.5rem",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                  }}
                >
                  Belum ada kursus aktif
                </h3>
                <p style={{ fontSize: "0.95rem", marginBottom: "2rem" }}>
                  Mulai perjalanan belajar Anda dengan mendaftar kursus
                </p>
                <Link
                  href="/student/explore"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "var(--primary)",
                    color: "white",
                    borderRadius: "0.5rem",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                  }}
                >
                  <BookOpen size={18} />
                  Jelajahi Kursus
                </Link>
              </div>
            ) : (
              progressCourses.map((course: any) => (
                <div key={course.id} className={styles.courseCard}>
                  <img
                    src={course.image}
                    alt={course.title}
                    className={styles.courseImage}
                  />

                  <div className={styles.courseInfo}>
                    <Link
                      href={`/student/learn/${course.id}`}
                      className={styles.courseTitle}
                    >
                      {course.title}
                    </Link>

                    <div className={styles.progressBarWrapper}>
                      <div
                        className={styles.progressBarFill}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <div className={styles.progressText}>
                      <span>{course.progress}% Selesai</span>
                      <span>Progress: {course.progress}%</span>
                    </div>
                  </div>

                  <Link
                    href={`/student/learn/${course.id}`}
                    className={styles.continueBtn}
                  >
                    Lanjut Belajar
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
