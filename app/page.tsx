"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/ThemeContext";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { useOnlineCount } from "@/app/hooks/useOnlineCount";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8787";
const API_BASE_URL = WS_BASE_URL.replace(/^ws/, "http");
const CHALLENGE_URL = `${API_BASE_URL}/api/altcha-challenge`;

export default function Home() {
  const { theme } = useTheme();
  const router = useRouter();
  const onlineCount = useOnlineCount();
  const altchaImported = useRef(false);

  useEffect(() => {
    if (altchaImported.current) return;
    altchaImported.current = true;
    import("altcha").catch(() => {});
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      router.push("/chat");
    },
    [router]
  );

  if (theme === "modern") {
    return (
      <div className="modern-welcome-page">
        <div className="modern-welcome-card">
          <div className="modern-welcome-header">
            <ThemeToggle />
          </div>
          <div className="modern-welcome-body">
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>💬</div>
            <h1 className="modern-welcome-title">LuckyChat</h1>
            <p className="modern-welcome-subtitle">Talk to random strangers!</p>
            <p className="modern-welcome-desc">Anonymous. Instant. Fun.</p>

            <div className="modern-welcome-notice">
              <p>
                You will be randomly paired with a stranger for a 1-on-1 chat.
                <br />
                Be respectful. You can skip to a new stranger at any time.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <altcha-widget
                challengeurl={CHALLENGE_URL}
                floating="bottom"
                auto="onsubmit"
                hidefooter
                floatinganchor=".modern-start-btn"
              />
              <button className="modern-btn-primary modern-start-btn" type="submit">
                Start Chatting
              </button>
              <p className="verification-hint">
                <span style={{ fontSize: "12px" }}>🔒</span> Quick verification required to start
              </p>
            </form>

            {onlineCount !== null && (
              <div style={{ marginTop: "12px", fontSize: "14px", color: "#636366", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
                {onlineCount} {onlineCount === 1 ? "user" : "users"} online
              </div>
            )}

            <div className="modern-welcome-footer">
              No registration required &bull; Free &bull; Anonymous
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        padding: "16px",
      }}
    >
      <div className="window" style={{ width: "100%", maxWidth: "420px" }}>
        <div className="title-bar">
          <div className="title-bar-text">Welcome to LuckyChat</div>
        </div>
        <div className="window-body" style={{ padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>💬</div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#7B0099", margin: "0 0 8px 0" }}>
            LuckyChat
          </h1>
          <p style={{ fontSize: "16px", color: "#333", margin: "0 0 24px 0" }}>
            Talk to random strangers!
          </p>
          <div style={{ border: "1px solid #808080", padding: "16px", marginBottom: "20px", background: "#ffffcc" }}>
            <p style={{ fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
              You will be randomly paired with a stranger for a 1-on-1 chat.
              <br />
              Be respectful. You can skip to a new stranger at any time.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <altcha-widget
              challengeurl={CHALLENGE_URL}
              floating="bottom"
              auto="onsubmit"
              hidefooter
              floatinganchor=".retro-start-btn"
            />
            <button
              className="button retro-start-btn"
              type="submit"
              style={{
                fontSize: "16px",
                padding: "12px 40px",
                fontWeight: "bold",
                cursor: "pointer",
                minHeight: "44px",
              }}
            >
              Start Chatting
            </button>
            <p className="verification-hint">
              <span style={{ fontSize: "12px" }}>🔒</span> Quick verification required to start
            </p>
          </form>

          {onlineCount !== null && (
            <div style={{ marginTop: "12px", fontSize: "14px", color: "#666", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
              {onlineCount} {onlineCount === 1 ? "user" : "users"} online
            </div>
          )}

          <div style={{ marginTop: "20px", fontSize: "13px", color: "#666" }}>
            No registration required &bull; Free &bull; Anonymous
          </div>
          <div style={{ marginTop: "16px" }}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
