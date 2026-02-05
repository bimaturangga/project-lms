// Course types
export interface Course {
    id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    thumbnail: string;
    price: number;
    discountPrice?: number;
    instructor: Instructor;
    category: Category;
    level: CourseLevel;
    duration: number; // in minutes
    totalLessons: number;
    totalStudents: number;
    rating: number;
    totalReviews: number;
    status: CourseStatus;
    modules: Module[];
    createdAt: string;
    updatedAt: string;
}

export interface Instructor {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    totalCourses: number;
    totalStudents: number;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
}

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';

// Module & Lesson types
export interface Module {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

export interface Lesson {
    id: string;
    title: string;
    type: LessonType;
    duration: number; // in minutes
    order: number;
    content?: string;
    videoUrl?: string;
    attachments?: Attachment[];
}

export type LessonType = 'video' | 'text' | 'quiz' | 'assignment';

export interface Attachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
}

// Enrollment types
export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    status: EnrollmentStatus;
    progress: number; // percentage 0-100
    completedLessons: string[];
    startedAt: string;
    completedAt?: string;
}

export type EnrollmentStatus = 'active' | 'completed' | 'expired';

// Progress tracking
export interface CourseProgress {
    courseId: string;
    userId: string;
    progress: number;
    currentLessonId: string;
    completedLessons: string[];
    lastAccessedAt: string;
}

// Review types
export interface Review {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    courseId: string;
    rating: number;
    comment: string;
    createdAt: string;
}
