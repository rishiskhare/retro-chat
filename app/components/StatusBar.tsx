"use client";

import { useState, useEffect, useCallback } from "react";
import type { ChatState } from "@/app/hooks/useChat";
import type { ConnectionState } from "@/app/lib/ws";
import { useTheme } from "@/app/context/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";

interface StatusBarProps {
  chatState: ChatState;
  connectionState: ConnectionState;
  strangerTyping: boolean;
  onNewChat: () => void;
  onDisconnect: () => void;
}

export function StatusBar({
  chatState,
  connectionState,
  strangerTyping,
  onNewChat,
  onDisconnect,
}: StatusBarProps) {
  const { theme } = useTheme();
  const [confirming, setConfirming] = useState(false);

  // Reset confirmation state when chat state changes
  useEffect(() => {
    setConfirming(false);
  }, [chatState]);

  const handleStop = useCallback(() => {
    if (confirming) {
      setConfirming(false);
      onNewChat();
    } else {
      setConfirming(true);
    }
  }, [confirming, onNewChat]);

  // Esc keyboard shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (chatState === "stranger-left") {
          onNewChat();
        } else if (chatState === "chatting") {
          handleStop();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [chatState, handleStop, onNewChat]);

  let statusText = "";

  if (connectionState === "connecting" || connectionState === "reconnecting") {
    statusText = "Connecting...";
  } else if (chatState === "chatting") {
    statusText = strangerTyping ? "Stranger is typing..." : "Connected";
  } else if (chatState === "stranger-left") {
    statusText = "Stranger disconnected";
  } else if (chatState === "waiting") {
    statusText = "Searching...";
  } else {
    statusText = "Ready";
  }

  if (theme === "modern") {
    return (
      <div className="modern-status-bar">
        <div className="modern-status-left">
          <span
            className="modern-status-dot"
            style={{
              background:
                connectionState === "connected"
                  ? "#34C759"
                  : connectionState === "connecting" || connectionState === "reconnecting"
                  ? "#FF9500"
                  : "#FF3B30",
            }}
          />
          <span className="modern-status-text">{statusText}</span>
        </div>
        <div className="modern-status-right">
          {chatState === "chatting" && (
            <button className="modern-btn-secondary" onClick={handleStop}>
              {confirming ? "Really?" : "Stop (esc)"}
            </button>
          )}
          {chatState === "stranger-left" && (
            <button className="modern-btn-primary modern-btn-sm" onClick={onNewChat}>
              New Chat (esc)
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="status-bar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 10px",
        borderTop: "1px solid #808080",
        background: "#ece9d8",
        gap: "8px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
        <span
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            flexShrink: 0,
            background:
              connectionState === "connected"
                ? "#00aa00"
                : connectionState === "connecting" || connectionState === "reconnecting"
                ? "#ffaa00"
                : "#cc0000",
            display: "inline-block",
          }}
        />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {statusText}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {chatState === "chatting" && (
          <button
            className="button"
            onClick={handleStop}
            style={{ fontSize: "15px", padding: "6px 14px", minHeight: "36px", flexShrink: 0 }}
          >
            {confirming ? "Really?" : "Stop (esc)"}
          </button>
        )}
        {chatState === "stranger-left" && (
          <button
            className="button"
            onClick={onNewChat}
            style={{ fontSize: "15px", padding: "6px 14px", minHeight: "36px", flexShrink: 0 }}
          >
            New Chat (esc)
          </button>
        )}
        <ThemeToggle />
      </div>
    </div>
  );
}
