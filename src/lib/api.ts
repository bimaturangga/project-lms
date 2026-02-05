import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage (client-side only)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - clear token and redirect to login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// Helper functions for common API operations
export const apiGet = async <T>(url: string, params?: object): Promise<T> => {
    const response = await api.get<T>(url, { params });
    return response.data;
};

export const apiPost = async <T>(url: string, data?: object): Promise<T> => {
    const response = await api.post<T>(url, data);
    return response.data;
};

export const apiPut = async <T>(url: string, data?: object): Promise<T> => {
    const response = await api.put<T>(url, data);
    return response.data;
};

export const apiDelete = async <T>(url: string): Promise<T> => {
    const response = await api.delete<T>(url);
    return response.data;
};

// Upload file helper
export const apiUpload = async <T>(url: string, formData: FormData): Promise<T> => {
    const response = await api.post<T>(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
