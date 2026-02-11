"use client";

import { useCallback, useRef } from "react";
import { useTheme, type Theme } from "@/app/context/ThemeContext";

type SoundName = "door-open" | "door-close" | "message" | "send";

const RETRO_PATHS: Record<SoundName, string> = {
  "door-open": "/sounds/door-open.mp3",
  "door-close": "/sounds/door-close.mp3",
  message: "/sounds/message.mp3",
  send: "/sounds/message.mp3",
};

const MODERN_PATHS: Record<SoundName, string> = {
  "door-open": "/sounds/modern-receive.mp3",
  "door-close": "/sounds/door-close.mp3",
  message: "/sounds/modern-receive.mp3",
  send: "/sounds/modern-send.mp3",
};

export function useSound() {
  const { theme } = useTheme();
  const themeRef = useRef<Theme>(theme);
  themeRef.current = theme;
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  const play = useCallback((name: SoundName) => {
    try {
      const currentTheme = themeRef.current;
      const paths = currentTheme === "modern" ? MODERN_PATHS : RETRO_PATHS;
      const path = paths[name];
      const key = `${currentTheme}-${name}`;
      let audio = audioCache.current.get(key);
      if (!audio) {
        audio = new Audio(path);
        audio.volume = 0.5;
        audioCache.current.set(key, audio);
      }
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {}
  }, []);

  return { play };
}
