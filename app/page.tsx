"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/ThemeContext";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export default function Home() {
  const { theme } = useTheme();
  const router = useRouter();

  const handleStart = useCallback(() => {
    router.push("/chat");
  }, [router]);

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

            <button className="modern-btn-primary" onClick={handleStart}>
              Start Chatting
            </button>

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
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
            <button aria-label="Close" />
          </div>
        </div>
        <div className="window-body" style={{ padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>💬</div>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#7B0099", margin: "0 0 8px 0" }}>
            LuckyChat
          </h1>
          <p style={{ fontSize: "14px", color: "#333", margin: "0 0 4px 0" }}>
            Talk to random strangers!
          </p>
          <p style={{ fontSize: "12px", color: "#666", margin: "0 0 24px 0" }}>
            Inspired by Yahoo! Messenger &amp; AOL Instant Messenger
          </p>

          <div style={{ border: "1px solid #808080", padding: "16px", marginBottom: "20px", background: "#ffffcc" }}>
            <p style={{ fontSize: "12px", margin: 0, lineHeight: 1.6 }}>
              You will be randomly paired with a stranger for a 1-on-1 chat.
              <br />
              Be respectful. You can skip to a new stranger at any time.
            </p>
          </div>

          <button
            className="button"
            onClick={handleStart}
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

          <div style={{ marginTop: "20px", fontSize: "11px", color: "#999" }}>
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
