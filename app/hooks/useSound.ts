"use client";

import { useCallback, useRef } from "react";

type SoundName = "door-open" | "door-close" | "message";

const SOUND_PATHS: Record<SoundName, string> = {
  "door-open": "/sounds/door-open.mp3",
  "door-close": "/sounds/door-close.mp3",
  message: "/sounds/message.mp3",
};

export function useSound() {
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  const play = useCallback((name: SoundName) => {
    try {
      let audio = audioCache.current.get(name);
      if (!audio) {
        audio = new Audio(SOUND_PATHS[name]);
        audio.volume = 0.5;
        audioCache.current.set(name, audio);
      }
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Autoplay may be blocked
      });
    } catch {
      // Audio not supported
    }
  }, []);

  return { play };
}
