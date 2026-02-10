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
    statusText = strangerTyping ? "Stranger is typing..." : "Connected to stranger";
  } else if (chatState === "stranger-left") {
    statusText = "Stranger has disconnected";
  } else if (chatState === "waiting") {
    statusText = "Looking for someone to chat with...";
  } else {
    statusText = "Ready";
  }

  return (
    <div className="status-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", borderTop: "1px solid #808080", background: "#ece9d8" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background:
              connectionState === "connected"
                ? "#00aa00"
                : connectionState === "connecting" || connectionState === "reconnecting"
                ? "#ffaa00"
                : "#cc0000",
            display: "inline-block",
          }}
        />
        <span>{statusText}</span>
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        {(chatState === "chatting" || chatState === "stranger-left") && (
          <>
            <button className="button" onClick={onNewChat} style={{ fontSize: "11px", padding: "2px 8px" }}>
              New Chat
            </button>
            <button className="button" onClick={onDisconnect} style={{ fontSize: "11px", padding: "2px 8px" }}>
              Disconnect
            </button>
          </>
        )}
      </div>
    </div>
  );
}
