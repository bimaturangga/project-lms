"use client";

import React, { useState, useMemo } from "react";
import { Sidebar, TopHeader } from "@/components/layout";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import styles from "./reports.module.css";
import DateRangeModal from "./DateRangeModal";
import * as XLSX from "xlsx";
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  DollarSign,
  Award,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronDown,
  Download,
} from "lucide-react";

export default function ReportsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Last 30 Days");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [revenueTab, setRevenueTab] = useState("Bulanan");

  // Chart ref and dimensions
  const revenueChartRef = React.useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  React.useEffect(() => {
    const handleResize = () => {
      if (revenueChartRef.current)
        setChartWidth(revenueChartRef.current.clientWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch real data from Convex
  const allPayments = useQuery(api.payments.getAllPayments);
  const allUsers = useQuery(api.users.getAllUsers);
  const allEnrollments = useQuery(api.enrollments.getAllEnrollments);
  const allCourses = useQuery(api.courses.getAllCourses);
  const allLessonProgress = useQuery(
    api.lessonProgress.getAllLessonProgressByUser,
    {},
  );

  // Calculate revenue data per month
  const allRevenueData = useMemo(() => {
    if (!allPayments) return [];

    const months = [
      { month: "Jan", date: "2026-01" },
      { month: "Feb", date: "2026-02" },
      { month: "Mar", date: "2026-03" },
      { month: "Apr", date: "2026-04" },
      { month: "Mei", date: "2026-05" },
      { month: "Jun", date: "2026-06" },
      { month: "Jul", date: "2026-07" },
      { month: "Agu", date: "2026-08" },
      { month: "Sep", date: "2026-09" },
      { month: "Okt", date: "2026-10" },
      { month: "Nov", date: "2026-11" },
      { month: "Des", date: "2026-12" },
    ];

    return months.map(({ month, date }) => {
      const monthIndex = parseInt(date.split("-")[1]) - 1;
      const monthlyPayments = allPayments.filter((payment) => {
        if (payment.status !== "verified") return false;
        const paymentDate = new Date(payment.createdAt);
        return paymentDate.getMonth() === monthIndex;
      });

      const amount = monthlyPayments.reduce(
        (sum, p) => sum + (p.amount || 0),
        0,
      );
      const courses = monthlyPayments.length;

      return { month, amount, courses, date };
    });
  }, [allPayments]);

  // Calculate top courses - filtered by date range
  const allTopCourses = useMemo(() => {
    if (!allEnrollments || !allCourses) return [];

    // Apply date filter - default to last 30 days
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let startDate = new Date();
    startDate.setDate(today.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
    let endDate = today;

    if (dateRange.start && dateRange.end) {
      startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
    }

    const filteredEnrollments = allEnrollments.filter((enrollment) => {
      const enrollDate = new Date(enrollment.enrolledAt);
      return enrollDate >= startDate && enrollDate <= endDate;
    });

    const courseEnrollmentCount: Record<string, number> = {};

    filteredEnrollments.forEach((enrollment) => {
      const courseId = enrollment.courseId;
      courseEnrollmentCount[courseId] =
        (courseEnrollmentCount[courseId] || 0) + 1;
    });

    const topCourses = Object.entries(courseEnrollmentCount)
      .map(([courseId, count]) => {
        const course = allCourses.find((c) => c._id === courseId);
        return {
          courseId,
          title: course?.title || "Unknown Course",
          enrollments: count,
        };
      })
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    return topCourses;
  }, [allEnrollments, allCourses, dateRange]);

  // Calculate enrollment trends per category - filtered by date range
  const allEnrollmentTrends = useMemo(() => {
    if (!allEnrollments || !allCourses) return [];

    // Apply date filter - default to last 30 days
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let startDate = new Date();
    startDate.setDate(today.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
    let endDate = today;

    if (dateRange.start && dateRange.end) {
      startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
    }

    const filteredEnrollments = allEnrollments.filter((enrollment) => {
      const enrollDate = new Date(enrollment.enrolledAt);
      return enrollDate >= startDate && enrollDate <= endDate;
    });

    const categoryCount: Record<string, number> = {};

    filteredEnrollments.forEach((enrollment) => {
      const course = allCourses.find((c) => c._id === enrollment.courseId);
      if (course && course.category) {
        categoryCount[course.category] =
          (categoryCount[course.category] || 0) + 1;
      }
    });

    const totalEnrollments = filteredEnrollments.length || 1;

    const trends = Object.entries(categoryCount).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
      percentage: Math.round((count / totalEnrollments) * 100),
    }));

    return trends;
  }, [allEnrollments, allCourses, dateRange]);

  // Filter data based on date range
  const getFilteredData = () => {
    // Default to last 30 days if no range selected
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    let startDate = new Date();
    startDate.setDate(today.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
    let endDate = today;

    if (dateRange.start && dateRange.end) {
      startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
    }

    // Filter payments by date
    const filteredPayments = allPayments?.filter((payment) => {
      if (payment.status !== "verified") return false;
      const paymentDate = new Date(payment.createdAt);
      return paymentDate >= startDate && paymentDate <= endDate;
    }) || [];

    // Calculate total revenue from filtered payments
    const totalRevenue = filteredPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );
    const totalCoursesSold = filteredPayments.length;

    // Filter enrollments by date
    const filteredEnrollments = allEnrollments?.filter((enrollment) => {
      const enrollDate = new Date(enrollment.enrolledAt);
      return enrollDate >= startDate && enrollDate <= endDate;
    }) || [];

    // Count active students enrolled in date range
    const uniqueStudentIds = new Set(
      filteredEnrollments.map((e) => e.userId)
    );
    const activeStudents = uniqueStudentIds.size;

    // Calculate completion rate from filtered enrollments
    const completedEnrollments = filteredEnrollments.filter(
      (e) => e.status === "completed" || (e.progress || 0) >= 100
    ).length;
    const totalEnrollmentsCount = filteredEnrollments.length || 1;
    const completionRate =
      filteredEnrollments.length > 0
        ? Math.round((completedEnrollments / totalEnrollmentsCount) * 100)
        : 0;

    // Generate revenue data by month for selected range
    const revenueByMonth: Record<string, { amount: number; courses: number }> = {};

    filteredPayments.forEach((payment) => {
      const paymentDate = new Date(payment.createdAt);
      const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;

      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = { amount: 0, courses: 0 };
      }
      revenueByMonth[monthKey].amount += payment.amount || 0;
      revenueByMonth[monthKey].courses += 1;
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    const revenueData = Object.entries(revenueByMonth)
      .map(([date, data]) => {
        const [year, month] = date.split('-');
        return {
          month: monthNames[parseInt(month) - 1],
          amount: data.amount,
          courses: data.courses,
          date,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      revenue: revenueData,
      stats: {
        totalRevenue:
          totalRevenue > 0
            ? `Rp ${(totalRevenue / 1000000).toFixed(1)} M`
            : "Rp 0",
        totalStudents: activeStudents.toString(),
        coursesSold: totalCoursesSold.toString(),
        completion: `${completionRate}%`,
      },
      startDate,
      endDate,
    };
  };

  const filteredData = getFilteredData();
  const maxRevenue = Math.max(...filteredData.revenue.map((d) => d.amount), 1);

  // Revenue chart data based on selected tab (Harian/Mingguan/Bulanan)
  const revenueChartData = useMemo(() => {
    if (!allPayments) {
      const emptyLabels =
        revenueTab === "Harian"
          ? ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
          : revenueTab === "Mingguan"
            ? ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"]
            : ["Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

      return emptyLabels.map((label) => ({ label, value: 0 }));
    }

    // Apply date range filter to payments - default to last 30 days
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let startDate = new Date();
    startDate.setDate(today.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
    let endDate = today;

    if (dateRange.start && dateRange.end) {
      startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
    }

    const verifiedPayments = allPayments.filter((p) => {
      if (p.status !== "verified") return false;
      const paymentDate = new Date(p.createdAt);
      return paymentDate >= startDate && paymentDate <= endDate;
    });

    if (revenueTab === "Harian") {
      // Daily: Show last 7 days within selected range
      const dailyRevenue: Record<string, number> = {};

      // Create labels for last 7 days
      const dayLabels: string[] = [];
      const dayKeys: string[] = [];
      const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(endDate.getDate() - i);
        const dayName = dayNames[date.getDay()];
        const dateKey = date.toISOString().split('T')[0];
        dayLabels.push(dayName);
        dayKeys.push(dateKey);
        dailyRevenue[dateKey] = 0;
      }

      verifiedPayments.forEach((payment) => {
        const paymentDate = new Date(payment.createdAt);
        const dateKey = paymentDate.toISOString().split('T')[0];
        if (dailyRevenue[dateKey] !== undefined) {
          dailyRevenue[dateKey] += payment.amount || 0;
        }
      });

      return dayLabels.map((label, i) => ({
        label,
        value: Math.round(((dailyRevenue[dayKeys[i]] || 0) / 1000000) * 10) / 10,
      }));
    } else if (revenueTab === "Mingguan") {
      // Weekly: Show last 4 weeks within range
      const weeklyRevenue: number[] = [0, 0, 0, 0];

      verifiedPayments.forEach((payment) => {
        const paymentDate = new Date(payment.createdAt);
        const diffTime = endDate.getTime() - paymentDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weekNumber = Math.min(Math.floor(diffDays / 7), 3);

        if (weekNumber < 4) {
          weeklyRevenue[3 - weekNumber] += payment.amount || 0;
        }
      });

      return ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"].map(
        (week, index) => ({
          label: week,
          value: Math.round(((weeklyRevenue[index] || 0) / 1000000) * 10) / 10,
        }),
      );
    } else {
      // Monthly: Show months in selected range
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];
      const monthlyRevenue: Record<string, number> = {};

      verifiedPayments.forEach((payment) => {
        const paymentDate = new Date(payment.createdAt);
        const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (payment.amount || 0);
      });

      // Generate months between start and end date
      const months: { label: string; key: string }[] = [];
      const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

      while (current <= end) {
        const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        months.push({
          label: monthNames[current.getMonth()],
          key,
        });
        current.setMonth(current.getMonth() + 1);
      }

      return months.map(({ label, key }) => ({
        label,
        value: Math.round(((monthlyRevenue[key] || 0) / 1000000) * 10) / 10,
      }));
    }
  }, [allPayments, revenueTab, dateRange]);

  // Chart calculations
  const chartHeight = 250;
  const chartPadding = 40;
  const effectiveChartWidth = chartWidth || 600;
  const maxChartValue = Math.max(...revenueChartData.map((d) => d.value), 1);
  const xStep =
    (effectiveChartWidth - chartPadding * 2) /
    Math.max(revenueChartData.length - 1, 1);

  const chartPoints = revenueChartData.map((d, i) => {
    const x = chartPadding + i * xStep;
    const y =
      chartHeight -
      chartPadding -
      (d.value / maxChartValue) * (chartHeight - chartPadding * 2);
    return { x, y, value: d.value, label: d.label };
  });

  const chartPathData = chartPoints.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = a[i - 1];
    const controlX1 = prev.x + (point.x - prev.x) / 2;
    const controlY1 = prev.y;
    const controlX2 = point.x - (point.x - prev.x) / 2;
    const controlY2 = point.y;
    return `${acc} C ${controlX1},${controlY1} ${controlX2},${controlY2} ${point.x},${point.y}`;
  }, "");

  const chartAreaPath = `${chartPathData} L ${effectiveChartWidth - chartPadding},${chartHeight} L ${chartPadding},${chartHeight} Z`;

  // Dynamic topic focus based on enrollments per category - show actual categories
  const getDynamicTopicFocus = () => {
    if (!allEnrollments || !allCourses || allEnrollments.length === 0) {
      return [];
    }

    // Apply date filter - default to last 30 days
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let startDate = new Date();
    startDate.setDate(today.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
    let endDate = today;

    if (dateRange.start && dateRange.end) {
      startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
    }

    const filteredEnrollments = allEnrollments.filter((enrollment) => {
      const enrollDate = new Date(enrollment.enrolledAt);
      return enrollDate >= startDate && enrollDate <= endDate;
    });

    if (filteredEnrollments.length === 0) {
      return [];
    }

    const categoryCompletionCount: Record<
      string,
      { completed: number; total: number }
    > = {};

    filteredEnrollments.forEach((enrollment) => {
      const course = allCourses.find((c) => c._id === enrollment.courseId);
      if (course && course.category) {
        const category = course.category;
        if (!categoryCompletionCount[category]) {
          categoryCompletionCount[category] = { completed: 0, total: 0 };
        }
        categoryCompletionCount[category].total++;
        if (
          enrollment.status === "completed" ||
          (enrollment.progress || 0) >= 100
        ) {
          categoryCompletionCount[category].completed++;
        }
      }
    });

    // Create topic focus data from actual categories
    const topicData = Object.entries(categoryCompletionCount)
      .map(([category, data]) => ({
        topic:
          category.charAt(0).toUpperCase() +
          category.slice(1).replace(/-/g, " "),
        percentage:
          data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 4); // Take top 4 categories

    return topicData;
  };

  const dynamicTopicFocus = getDynamicTopicFocus();

  const handleApplyRange = (range: {
    start: string;
    end: string;
    label: string;
  }) => {
    // Show date range in button like payments page
    if (range.start && range.end) {
      setSelectedPeriod(`${range.start} - ${range.end}`);
    } else {
      setSelectedPeriod(range.label);
    }
    setDateRange({ start: range.start, end: range.end });
  };

  // Export to Excel function
  const handleExportExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary Stats
    const summaryData = [
      ["Laporan Analytics - " + selectedPeriod],
      [""],
      ["Ringkasan Statistik"],
      ["Metrik", "Nilai"],
      ["Total Pendapatan", filteredData.stats.totalRevenue],
      ["Total Siswa Aktif", filteredData.stats.totalStudents],
      ["Kursus Terjual", filteredData.stats.coursesSold],
      ["Tingkat Penyelesaian", filteredData.stats.completion],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

    // Sheet 2: Revenue by Month
    const revenueData = [
      ["Pendapatan per Periode"],
      [""],
      ["Periode", "Pendapatan (Juta Rp)"],
      ...revenueChartData.map((item) => [item.label, item.value]),
    ];
    const wsRevenue = XLSX.utils.aoa_to_sheet(revenueData);
    XLSX.utils.book_append_sheet(wb, wsRevenue, "Pendapatan");

    // Sheet 3: Top Courses
    const topCoursesData = [
      ["Kursus Terpopuler"],
      [""],
      ["No", "Judul Kursus", "Jumlah Pendaftaran"],
      ...allTopCourses.map((course, index) => [
        index + 1,
        course.title,
        course.enrollments,
      ]),
    ];
    const wsCourses = XLSX.utils.aoa_to_sheet(topCoursesData);
    XLSX.utils.book_append_sheet(wb, wsCourses, "Kursus Terpopuler");

    // Sheet 4: Enrollment Trends
    const enrollmentData = [
      ["Pendaftaran per Kategori"],
      [""],
      ["Kategori", "Jumlah", "Persentase (%)"],
      ...allEnrollmentTrends.map((trend) => [
        trend.category,
        trend.count,
        trend.percentage,
      ]),
    ];
    const wsEnrollment = XLSX.utils.aoa_to_sheet(enrollmentData);
    XLSX.utils.book_append_sheet(wb, wsEnrollment, "Per Kategori");

    // Sheet 5: Topic Focus
    const topicData = [
      ["Fokus Topik - Tingkat Penguasaan"],
      [""],
      ["Topik", "Persentase Penyelesaian (%)"],
      ...dynamicTopicFocus.map((topic) => [topic.topic, topic.percentage]),
    ];
    const wsTopic = XLSX.utils.aoa_to_sheet(topicData);
    XLSX.utils.book_append_sheet(wb, wsTopic, "Fokus Topik");

    // Generate filename with date
    const today = new Date().toISOString().split("T")[0];
    const filename = `Laporan_Analytics_${today}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className={styles.main}>
        <TopHeader
          title="Laporan & Statistik"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <h1>Analytics</h1>
              <p className={styles.subtitle}>
                Monitor performa platform secara menyeluruh
              </p>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.filterButton}
                onClick={() => setIsDateModalOpen(true)}
              >
                <Calendar size={16} />
                <span>{selectedPeriod}</span>
                <ChevronDown size={16} />
              </button>
              <button className={styles.exportButton} onClick={handleExportExcel}>
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={`${styles.statIcon} ${styles.green}`}>
                  <DollarSign size={24} />
                </div>
              </div>
              <p className={styles.statLabel}>Total Pendapatan</p>
              <h2 className={styles.statValue}>
                {filteredData.stats.totalRevenue}
              </h2>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={`${styles.statIcon} ${styles.blue}`}>
                  <Users size={24} />
                </div>
              </div>
              <p className={styles.statLabel}>Total Siswa Aktif</p>
              <h2 className={styles.statValue}>
                {filteredData.stats.totalStudents}
              </h2>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={`${styles.statIcon} ${styles.yellow}`}>
                  <BookOpen size={24} />
                </div>
              </div>
              <p className={styles.statLabel}>Kursus Terjual</p>
              <h2 className={styles.statValue}>
                {filteredData.stats.coursesSold}
              </h2>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={`${styles.statIcon} ${styles.red}`}>
                  <Award size={24} />
                </div>
              </div>
              <p className={styles.statLabel}>Tingkat Penyelesaian</p>
              <h2 className={styles.statValue}>
                {filteredData.stats.completion}
              </h2>
            </div>
          </div>

          {/* Activity & Topic Stats */}
          <div className={styles.twoColumn}>
            {/* Revenue Chart */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>
                    Pendapatan Penjualan Kursus
                  </h3>
                  <p className={styles.cardSubtitle}>
                    Tren pendapatan (Juta Rupiah)
                  </p>
                </div>
                <div className={styles.chartTabs}>
                  {["Harian", "Mingguan", "Bulanan"].map((tab) => (
                    <button
                      key={tab}
                      className={`${styles.chartTab} ${revenueTab === tab ? styles.active : ""}`}
                      onClick={() => setRevenueTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.revenueChartArea} ref={revenueChartRef}>
                <svg
                  className={styles.revenueChartSvg}
                  viewBox={`0 0 ${effectiveChartWidth} ${chartHeight}`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {Array.from({ length: 5 }, (_, i) => {
                    const val = Math.round((maxChartValue / 4) * i * 10) / 10;
                    const y =
                      chartHeight -
                      chartPadding -
                      (val / maxChartValue) * (chartHeight - chartPadding * 2);
                    return (
                      <g key={`grid-${i}`}>
                        <line
                          x1={chartPadding}
                          y1={y}
                          x2={effectiveChartWidth - chartPadding}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeDasharray="4"
                        />
                        <text
                          x={chartPadding - 10}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="11"
                          fill="#94a3b8"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area Fill */}
                  <path d={chartAreaPath} fill="url(#revenueGradient)" />

                  {/* Line */}
                  <path
                    d={chartPathData}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Points and Labels */}
                  {chartPoints.map((point, i) => (
                    <g key={i}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="5"
                        fill="#3b82f6"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={point.x}
                        y={point.y - 12}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#64748b"
                        fontWeight="600"
                      >
                        {point.value}
                      </text>
                      <text
                        x={point.x}
                        y={chartHeight - 10}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#64748b"
                      >
                        {point.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Topic Focus */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>Fokus Topik</h3>
                  <p className={styles.cardSubtitle}>
                    Distribusi penguasaan materi (%)
                  </p>
                </div>
              </div>
              <div className={styles.topicChartContainer}>
                {dynamicTopicFocus.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>Belum ada data kategori</p>
                  </div>
                ) : (
                  dynamicTopicFocus.map((topic, index) => {
                    const maxPercentage =
                      Math.max(...dynamicTopicFocus.map((t) => t.percentage)) ||
                      1; // Prevent division by zero
                    const height = (topic.percentage / maxPercentage) * 100;

                    return (
                      <div key={index} className={styles.topicBarWrapper}>
                        <div className={styles.topicBarValue}>
                          {topic.percentage}%
                        </div>
                        <div className={styles.topicBarContainer}>
                          <div
                            className={styles.topicBar}
                            style={{ height: `${Math.max(height, 5)}%` }}
                          />
                        </div>
                        <div className={styles.topicBarLabel}>
                          {topic.topic}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className={styles.twoColumn}>
            {/* Top Performing Courses */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>Kursus Terpopuler</h3>
                  <p className={styles.cardSubtitle}>
                    Berdasarkan jumlah pendaftaran
                  </p>
                </div>
              </div>
              <div className={styles.courseList}>
                {allTopCourses.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>Belum ada data kursus</p>
                  </div>
                ) : (
                  allTopCourses.map((course, index) => (
                    <div key={index} className={styles.courseItem}>
                      <div className={styles.courseRank}>#{index + 1}</div>
                      <div className={styles.courseInfo}>
                        <h4 className={styles.courseTitle}>{course.title}</h4>
                        <div className={styles.courseStats}>
                          <span className={styles.courseStat}>
                            <Users size={12} />
                            {course.enrollments} siswa
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Enrollment by Category */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>Pendaftaran per Kategori</h3>
                  <p className={styles.cardSubtitle}>
                    Distribusi siswa berdasarkan kategori
                  </p>
                </div>
              </div>
              <div className={styles.categoryList}>
                {allEnrollmentTrends.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>Belum ada data pendaftaran</p>
                  </div>
                ) : (
                  allEnrollmentTrends.map((trend, index) => (
                    <div key={index} className={styles.categoryItem}>
                      <div className={styles.categoryHeader}>
                        <span className={styles.categoryName}>
                          {trend.category}
                        </span>
                        <span className={styles.categoryCount}>
                          {trend.count} siswa
                        </span>
                      </div>
                      <div className={styles.categoryBar}>
                        <div
                          className={styles.categoryFill}
                          style={{ width: `${trend.percentage}%` }}
                        />
                      </div>
                      <span className={styles.categoryPercent}>
                        {trend.percentage}%
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Summary Stats */}
              <div className={styles.categorySummary}>
                <div className={styles.summaryItem}>
                  <Clock size={16} />
                  <div>
                    <p className={styles.summaryLabel}>
                      Rata-rata Waktu Belajar
                    </p>
                    <p className={styles.summaryValue}>
                      {allLessonProgress
                        ? Math.round(
                          (allLessonProgress.length * 0.5) /
                          Math.max(
                            allUsers?.filter((u) => u.role === "student")
                              .length || 1,
                            1,
                          ),
                        )
                        : 0}{" "}
                      jam/minggu
                    </p>
                  </div>
                </div>
                <div className={styles.summaryItem}>
                  <CheckCircle2 size={16} />
                  <div>
                    <p className={styles.summaryLabel}>Tingkat Kelulusan</p>
                    <p className={styles.summaryValue}>
                      {filteredData.stats.completion}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Modal */}
        <DateRangeModal
          isOpen={isDateModalOpen}
          onClose={() => setIsDateModalOpen(false)}
          onApply={handleApplyRange}
          currentLabel={selectedPeriod}
        />
      </main>
    </div>
  );
}
