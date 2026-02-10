"use client";

import type { ChatMessage } from "@/app/hooks/useChat";

export function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.sender === "system") {
    return <div className="system-message">{message.text}</div>;
  }

  const senderClass = message.sender === "you" ? "sender-you" : "sender-stranger";
  const label = message.sender === "you" ? "You" : "Stranger";

  return (
    <div style={{ padding: "2px 8px", wordBreak: "break-word" }}>
      <span className={senderClass}>{label}:</span>{" "}
      <span>{message.text}</span>
    </div>
  );
}
