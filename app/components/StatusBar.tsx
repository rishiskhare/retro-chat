"use client";

import type { ChatState } from "@/app/hooks/useChat";
import type { ConnectionState } from "@/app/lib/ws";

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

  return (
    <div
      className="status-bar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 8px",
        borderTop: "1px solid #808080",
        background: "#ece9d8",
        gap: "8px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
        <span
          style={{
            width: "8px",
            height: "8px",
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
      {(chatState === "chatting" || chatState === "stranger-left") && (
        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
          <button
            className="button"
            onClick={onNewChat}
            style={{ fontSize: "11px", padding: "4px 10px", minHeight: "28px" }}
          >
            New Chat
          </button>
          <button
            className="button"
            onClick={onDisconnect}
            style={{ fontSize: "11px", padding: "4px 10px", minHeight: "28px" }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
