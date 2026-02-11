"use client";

import { useTheme } from "@/app/context/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle">
      <button
        className={`theme-toggle-option ${theme === "retro" ? "active" : ""}`}
        onClick={() => setTheme("retro")}
      >
        Retro
      </button>
      <button
        className={`theme-toggle-option ${theme === "modern" ? "active" : ""}`}
        onClick={() => setTheme("modern")}
      >
        Modern
      </button>
    </div>
  );
}
