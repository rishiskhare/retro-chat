"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type Theme = "retro" | "modern";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "retro",
  setTheme: () => {},
});

const STORAGE_KEY = "retro-chat-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("retro");
  const [mounted, setMounted] = useState(false);

  // Read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "modern" || stored === "retro") {
      setThemeState(stored);
    }
    setMounted(true);
  }, []);

  // Sync data-theme attribute on <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  }, []);

  // Prevent flash of wrong theme by hiding content until mounted
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
