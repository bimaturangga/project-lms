"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", theme);

    // Also add to body for compatibility
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [theme]);

  return <>{children}</>;
}
