// Export all types
export * from './user';
export * from './course';
export * from './quiz';
export * from './payment';

// Common types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: Pagination;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface SelectOption {
    value: string;
    label: string;
}

// Certificate type
export interface Certificate {
    id: string;
    userId: string;
    courseId: string;
    courseName: string;
    userName: string;
    issueDate: string;
    certificateUrl: string;
    certificateNumber: string;
}

// Notification type
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    link?: string;
    createdAt: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'course' | 'payment';
