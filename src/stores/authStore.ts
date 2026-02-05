"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Id } from "../../convex/_generated/dataModel";

export interface User {
  _id: Id<"users">;
  name: string;
  email: string;
  role: "student" | "admin";
  avatar?: string;
  phone?: string;
  address?: string;
  bio?: string;
  notificationPreferences?: {
    courseUpdates: boolean;
    newLessons: boolean;
    promotions: boolean;
  };
  createdAt: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      clearError: () => set({ error: null }),

      logout: () => {
        set({ user: null, error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),
    },
  ),
);
