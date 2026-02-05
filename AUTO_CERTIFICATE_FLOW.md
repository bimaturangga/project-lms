# Auto-Generate Certificate on Course Completion

## 🎓 Overview

Certificate akan otomatis digenerate saat student menyelesaikan semua lessons dalam kursus. Flow ini terintegrasi penuh dengan lesson progress tracking.

## 🔄 Complete Flow

### 1. Student Menonton Video Lesson

```
Student play video → Video ended → markLessonCompleted()
```

### 2. Mark Lesson Completed (Auto)

File: `convex/lessonProgress.ts`

```typescript
markLessonCompleted({
  userId,
  lessonId,
  enrollmentId,
  watchTime,
});
```

**Process:**

- ✅ Save lesson progress ke database
- ✅ Auto-calculate enrollment progress
- ✅ Check apakah semua lessons sudah complete
- ✅ **Auto-generate certificate** jika 100% complete
- ✅ Send notification ke student

### 3. Auto-Generate Certificate

Saat semua lessons complete:

```typescript
// Auto-triggered di helper function
updateEnrollmentProgressAndCheckCompletion()
  → Check total lessons vs completed lessons
  → If 100%:
    - Update enrollment status = "completed"
    - Generate unique certificate number
    - Insert certificate ke database
    - Send push notification
```

### 4. Show Completion Modal

File: `src/app/student/learn/[courseId]/page.tsx`

```typescript
// Auto-detect completion
useEffect(() => {
  if (lessonProgressData?.isAllCompleted) {
    setShowCompletionModal(true);
  }
}, [lessonProgressData?.isAllCompleted]);
```

**Modal Actions:**

- Student memberikan rating (1-5 stars)
- Student menulis review (min 10 karakter)
- Click "Klaim Sertifikat" → Redirect ke `/student/certificates`

### 5. Download Certificate

File: `src/app/student/certificates/page.tsx`

Student dapat:

- ✅ View semua certificates
- ✅ Download PDF certificate (via API route)
- ✅ Share certificate

## 📊 Database Updates

### Lesson Progress

```typescript
{
  userId: Id<"users">,
  lessonId: Id<"lessons">,
  enrollmentId: Id<"enrollments">,
  completed: true,
  completedAt: timestamp,
  watchTime: number
}
```

### Enrollment Progress

```typescript
{
  progress: 100,        // Auto-calculated
  status: "completed",  // Auto-updated
  completedAt: timestamp
}
```

### Certificate Record

```typescript
{
  userId: Id<"users">,
  courseId: Id<"courses">,
  enrollmentId: Id<"enrollments">,
  certificateNumber: "CERT-1738828800000-abc123",
  issuedAt: timestamp,
  pdfUrl: ""  // Generated on-demand via API
}
```

### Notification

```typescript
{
  userId: Id<"users">,
  type: "certificate",
  title: "🎓 Sertifikat Tersedia!",
  message: "Selamat! Anda telah menyelesaikan kursus...",
  isRead: false,
  link: "/student/certificates",
  createdAt: timestamp
}
```

## 🎯 Key Features

### ✅ Automatic Certificate Generation

- No manual action needed
- Generated instantly saat course 100% complete
- Certificate number format: `CERT-{timestamp}-{userId}`

### ✅ Duplicate Prevention

- Check existing certificate sebelum generate
- Return existing certificate ID jika sudah ada

### ✅ Progress Tracking

- Real-time update enrollment progress
- Auto-calculate based on completed lessons
- Accurate percentage calculation

### ✅ User Notifications

- Push notification saat certificate ready
- Link langsung ke certificates page

### ✅ Review Collection

- Mandatory review sebelum claim certificate
- Rating 1-5 stars
- Written review min 10 characters

## 🔧 Technical Implementation

### Helper Function

```typescript
// convex/lessonProgress.ts
async function updateEnrollmentProgressAndCheckCompletion(ctx, enrollmentId) {
  // 1. Get enrollment
  const enrollment = await ctx.db.get(enrollmentId);

  // 2. Calculate progress
  const totalLessons = await ctx.db.query("lessons")...
  const completedLessons = await ctx.db.query("lessonProgress")...
  const progress = (completed / total) * 100;

  // 3. Auto-complete if 100%
  if (progress >= 100 && status !== "completed") {
    // Update enrollment
    await ctx.db.patch(enrollmentId, {
      status: "completed",
      completedAt: Date.now()
    });

    // Generate certificate
    await ctx.db.insert("certificates", {
      certificateNumber: `CERT-${Date.now()}-${userId.slice(-6)}`,
      ...
    });

    // Send notification
    await ctx.db.insert("notifications", {...});
  }
}
```

### Frontend Detection

```typescript
// Auto-show modal when completed
useEffect(() => {
  if (lessonProgressData?.isAllCompleted && !showCompletionModal) {
    setTimeout(() => setShowCompletionModal(true), 1000);
  }
}, [lessonProgressData?.isAllCompleted]);
```

## 📝 User Journey

1. **Student mengikuti kursus**
   - Enroll di course
   - Mulai menonton lessons

2. **Progress tracking**
   - Setiap lesson selesai → progress update
   - Progress bar real-time update
   - Enrollment status tracked

3. **Complete last lesson**
   - Video ended
   - `markLessonCompleted()` called
   - Progress → 100%
   - **Certificate auto-generated** 🎓
   - Notification sent 📬

4. **Completion modal muncul**
   - Congratulations message
   - Rating form
   - Review textarea
   - "Klaim Sertifikat" button

5. **Submit review**
   - Review saved to database
   - Redirect to certificates page
   - Certificate ready to download

6. **Download certificate**
   - Click "Unduh PDF"
   - API generates PDF on-demand
   - Professional certificate with:
     - Student name
     - Course name
     - Completion date
     - Certificate ID
     - Signature

## 🚀 Testing Flow

### Test Auto-Generation:

1. Login sebagai student
2. Enroll di course dengan lessons
3. Complete semua lessons satu per satu
4. Saat complete last lesson:
   - ✅ Modal completion muncul
   - ✅ Certificate ada di database
   - ✅ Notification diterima
5. Submit review
6. Redirect ke certificates page
7. Download PDF certificate

### Verify in Database:

```typescript
// Check certificates table
certificates.find({ userId: "xxx" });

// Check notifications
notifications.find({
  userId: "xxx",
  type: "certificate",
});

// Check enrollment
enrollments.find({
  userId: "xxx",
  status: "completed",
});
```

## 🎨 UI Components

### Completion Modal

- **Title**: "Selamat! 🎉"
- **Subtitle**: Course name
- **Note**: "✨ Sertifikat Anda sudah tersedia!"
- **Rating**: 5-star rating component
- **Review**: Textarea (min 10 chars)
- **Actions**:
  - "Klaim Sertifikat" (primary)
  - "Nanti saja" (secondary)

### Certificates Page

- Grid view of all certificates
- Each card shows:
  - Course title
  - Instructor name
  - Completion date
  - Certificate ID
  - Download button
  - Share button

## 🔐 Security & Validation

- ✅ Check user authentication
- ✅ Verify enrollment exists
- ✅ Validate 100% completion
- ✅ Prevent duplicate certificates
- ✅ Validate review length
- ✅ Server-side PDF generation

## 📈 Future Enhancements

- [ ] Email certificate automatically
- [ ] Social media sharing integration
- [ ] Public certificate verification page
- [ ] QR code on certificate
- [ ] Batch download multiple certificates
- [ ] Custom certificate templates per course
- [ ] Certificate expiry/renewal
- [ ] LinkedIn integration
