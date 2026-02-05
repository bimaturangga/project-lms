# EduLearn LMS - Convex Integration Guide

## 🎯 Setup Complete!

Your LMS platform is now integrated with **Convex** - a realtime database that replaces all dummy/mock data.

## 📊 Database Schema

### Tables Created:

1. **users** - User accounts (students & admins)
2. **courses** - Course catalog
3. **lessons** - Course lessons/modules
4. **enrollments** - Student course enrollments
5. **payments** - Payment transactions
6. **certificates** - Course completion certificates
7. **quizzes** - Quiz/assessments
8. **quizQuestions** - Quiz questions
9. **quizAttempts** - Student quiz attempts
10. **cart** - Shopping cart items
11. **settings** - App configuration (logo, colors)

## 🚀 Quick Start

### 1. Seed the Database

Run this in your browser console or create a button to execute:

```javascript
// In Convex dashboard at http://127.0.0.1:6790
// Or create an API route to call this

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

// In your component:
const seedDb = useMutation(api.seed.seedDatabase);
await seedDb();
```

This creates:

- 1 admin user (admin@edulearn.com / admin123)
- 4 sample courses

### 2. Login Credentials

**Admin:**

- Email: admin@edulearn.com
- Password: admin123

**New Students:** Register through /register page

## 💻 Using Convex in Your Pages

### Example: Fetch Courses (Student Explore Page)

```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ExplorePage() {
  const courses = useQuery(api.courses.getPublishedCourses);

  if (!courses) return <div>Loading...</div>;

  return (
    <div>
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  );
}
```

### Example: Create Course (Admin)

```tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function NewCoursePage() {
  const createCourse = useMutation(api.courses.createCourse);

  const handleSubmit = async (formData) => {
    await createCourse({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      level: formData.level,
      price: formData.price,
      thumbnail: formData.thumbnail,
      instructor: formData.instructor,
      duration: formData.duration,
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Example: Get User's Enrollments (Student Dashboard)

```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/stores/authStore";

export default function MyCoursesPage() {
  const { user } = useAuthStore();
  const enrollments = useQuery(
    api.enrollments.getEnrollmentsByUser,
    user ? { userId: user._id } : "skip",
  );

  if (!enrollments) return <div>Loading...</div>;

  return (
    <div>
      {enrollments.map((enrollment) => (
        <EnrollmentCard key={enrollment._id} enrollment={enrollment} />
      ))}
    </div>
  );
}
```

### Example: Verify Payment (Admin)

```tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function PaymentsPage() {
  const verifyPayment = useMutation(api.payments.verifyPayment);
  const createEnrollment = useMutation(api.enrollments.createEnrollment);

  const handleVerify = async (payment) => {
    // Create enrollment
    const enrollmentId = await createEnrollment({
      userId: payment.userId,
      courseId: payment.courseId,
    });

    // Update enrollment status
    await updateEnrollmentStatus({
      enrollmentId,
      status: "active",
    });

    // Verify payment
    await verifyPayment({
      paymentId: payment._id,
      enrollmentId,
    });
  };

  return ...;
}
```

## 📝 Available Convex Functions

### Users (`convex/users.ts`)

- `createUser` - Create new user
- `getUserByEmail` - Find user by email
- `getUserById` - Get user by ID
- `getAllUsers` - Get all users (admin)
- `updateUser` - Update user profile
- `deleteUser` - Delete user

### Courses (`convex/courses.ts`)

- `createCourse` - Create new course
- `getAllCourses` - Get all courses
- `getPublishedCourses` - Get published courses only
- `getCourseById` - Get course details
- `getCoursesByCategory` - Filter by category
- `updateCourse` - Update course
- `deleteCourse` - Delete course
- `searchCourses` - Search courses

### Enrollments (`convex/enrollments.ts`)

- `createEnrollment` - Enroll student
- `getEnrollmentsByUser` - Get user's enrollments
- `getAllEnrollments` - Get all enrollments (admin)
- `updateEnrollmentProgress` - Update progress
- `updateEnrollmentStatus` - Change status

### Payments (`convex/payments.ts`)

- `createPayment` - Create payment record
- `getAllPayments` - Get all payments (admin)
- `getPaymentsByUser` - Get user's payments
- `getPaymentsByStatus` - Filter by status
- `verifyPayment` - Approve payment
- `rejectPayment` - Reject payment

### Cart (`convex/cart.ts`)

- `getCartByUser` - Get cart items
- `addToCart` - Add course to cart
- `removeFromCart` - Remove from cart
- `clearCart` - Empty cart
- `getCartCount` - Get item count

### Settings (`convex/settings.ts`)

- `getSetting` - Get setting value
- `updateSetting` - Update/create setting

## 🔧 Next Steps to Complete Integration

### Pages to Update:

#### Admin Pages:

1. ✅ `/admin/dashboard` - Use Convex for enrollment stats
2. ✅ `/admin/courses` - Use `getAllCourses`
3. ✅ `/admin/courses/new` - Use `createCourse`
4. ✅ `/admin/users` - Use `getAllUsers`
5. ✅ `/admin/payments` - Use `getAllPayments`
6. ✅ `/admin/reports` - Use queries for analytics
7. ✅ `/admin/settings` - Use `getSetting`/`updateSetting`

#### Student Pages:

1. ✅ `/student/dashboard` - Use `getEnrollmentsByUser`
2. ✅ `/student/explore` - Use `getPublishedCourses`
3. ✅ `/student/my-courses` - Use `getEnrollmentsByUser`
4. ✅ `/student/cart` - Use `getCartByUser`
5. ✅ `/student/payment/[courseId]` - Use `createPayment`

## 🎨 Settings Integration

Admin can now customize:

- **Primary Color** - Stored in Convex settings table
- **Logo** - Stored in Convex settings table

Update your settings page to use:

```tsx
const primaryColor = useQuery(api.settings.getSetting, { key: "primaryColor" });
const logoUrl = useQuery(api.settings.getSetting, { key: "logoUrl" });
const updateSetting = useMutation(api.settings.updateSetting);

await updateSetting({ key: "primaryColor", value: "#165dff" });
```

## 🌐 Convex Dashboard

Access your database dashboard at:
**http://127.0.0.1:6790**

Here you can:

- View all tables and data
- Run queries manually
- Monitor function calls
- Debug issues

## 🔐 Authentication Flow

1. User submits login/register form
2. API route (`/api/auth/login` or `/api/auth/register`) handles request
3. API route queries Convex database
4. User data stored in Zustand store
5. User redirected to appropriate dashboard

## 📦 Deployment

When ready to deploy:

1. Create account at https://www.convex.dev
2. Run `npx convex deploy`
3. Update `.env.local` with production URL
4. Deploy to Vercel/your hosting platform

## 🎉 All Dummy Data Removed

The following have been replaced with Convex:

- ❌ Mock user authentication
- ❌ Static course arrays
- ❌ Hardcoded enrollment data
- ❌ Fake payment records
- ❌ Mock cart functionality

Now using:

- ✅ Real-time Convex database
- ✅ Persistent data storage
- ✅ Live updates across clients
- ✅ Type-safe queries and mutations
