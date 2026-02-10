"use client";

import { useCallback } from "react";

export default function Home() {
  const handleStart = useCallback(() => {
    window.location.href = "/chat";
  }, []);

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
          <div className="title-bar-text">Welcome to RetroChat</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
            <button aria-label="Close" />
          </div>
        </div>
        <div className="window-body" style={{ padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>💬</div>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#7B0099", margin: "0 0 8px 0" }}>
            RetroChat
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
        </div>
      </div>
    </div>
  );
}
