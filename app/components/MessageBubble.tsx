"use client";

import type { ChatMessage } from "@/app/hooks/useChat";
import { useTheme } from "@/app/context/ThemeContext";

interface MessageBubbleProps {
  message: ChatMessage;
  isLastInGroup?: boolean;
}

export function MessageBubble({ message, isLastInGroup = true }: MessageBubbleProps) {
  const { theme } = useTheme();

  if (message.sender === "system") {
    return <div className="system-message">{message.text}</div>;
  }

  if (theme === "modern") {
    const isYou = message.sender === "you";
    const tailClass = isLastInGroup ? "" : " modern-bubble-no-tail";
    return (
      <div className={`modern-bubble-row ${isYou ? "modern-bubble-right" : "modern-bubble-left"}`}>
        <div className={`modern-bubble ${isYou ? "modern-bubble-sent" : "modern-bubble-received"}${tailClass}`}>
          {message.text}
        </div>
      </div>
    );
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
