"use client";

import { useState, useEffect } from "react";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8787";
const API_BASE_URL = WS_BASE_URL.replace(/^ws/, "http");

export function useOnlineCount() {
  const [onlineCount, setOnlineCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/stats`);
        if (res.ok) {
          const data = await res.json();
          setOnlineCount(data.online);
        }
      } catch {
        // silently ignore fetch errors
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 10_000);
    return () => clearInterval(interval);
  }, []);

  return onlineCount;
}
