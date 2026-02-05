"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Sidebar, TopHeader } from "@/components/layout";

export default function TestAdmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const users = useQuery(api.users.getAllUsers);
  const courses = useQuery(api.courses.getAllCourses);
  const enrollments = useQuery(api.enrollments.getAllEnrollments);
  const payments = useQuery(api.payments.getAllPayments);

  console.log("Test Admin Data:", { users, courses, enrollments, payments });

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--muted)",
      }}
    >
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "var(--background)",
        }}
      >
        <TopHeader
          title="Test Admin"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div style={{ flex: 1, padding: "2rem" }}>
          <h1>Admin Dashboard Test</h1>

          <div style={{ marginBottom: "2rem" }}>
            <h2>Data Status:</h2>
            <ul>
              <li>
                Users:{" "}
                {users === undefined
                  ? "Loading..."
                  : users === null
                    ? "Error"
                    : `${users.length} loaded`}
              </li>
              <li>
                Courses:{" "}
                {courses === undefined
                  ? "Loading..."
                  : courses === null
                    ? "Error"
                    : `${courses.length} loaded`}
              </li>
              <li>
                Enrollments:{" "}
                {enrollments === undefined
                  ? "Loading..."
                  : enrollments === null
                    ? "Error"
                    : `${enrollments.length} loaded`}
              </li>
              <li>
                Payments:{" "}
                {payments === undefined
                  ? "Loading..."
                  : payments === null
                    ? "Error"
                    : `${payments.length} loaded`}
              </li>
            </ul>
          </div>

          {users && users.length > 0 && (
            <div>
              <h2>Sample Users:</h2>
              {users.slice(0, 3).map((user) => (
                <div
                  key={user._id}
                  style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    margin: "4px 0",
                  }}
                >
                  {user.name} ({user.email}) - {user.role}
                </div>
              ))}
            </div>
          )}

          {courses && courses.length > 0 && (
            <div>
              <h2>Sample Courses:</h2>
              {courses.slice(0, 3).map((course) => (
                <div
                  key={course._id}
                  style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    margin: "4px 0",
                  }}
                >
                  {course.title} - {course.category}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
