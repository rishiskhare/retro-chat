"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/app/hooks/useChat";
import { useTheme } from "@/app/context/ThemeContext";
import { MessageBubble } from "./MessageBubble";

interface MessageAreaProps {
  messages: ChatMessage[];
  strangerTyping: boolean;
}

export function MessageArea({ messages, strangerTyping }: MessageAreaProps) {
  const { theme } = useTheme();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, strangerTyping]);

  if (theme === "modern") {
    return (
      <div className="modern-message-area">
        {messages.map((msg, i) => {
          const next = messages[i + 1];
          const isLastInGroup = !next || next.sender !== msg.sender;
          return (
            <MessageBubble key={msg.id} message={msg} isLastInGroup={isLastInGroup} />
          );
        })}
        {strangerTyping && (
          <div className="modern-bubble-row modern-bubble-left">
            <div className="modern-bubble modern-bubble-received modern-typing-bubble">
              <span className="modern-typing-dot" />
              <span className="modern-typing-dot" />
              <span className="modern-typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    );
  }

  return (
    <div className="message-area" style={{ flex: 1, padding: "4px 0" }}>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {strangerTyping && (
        <div style={{ padding: "2px 8px", color: "#808080", fontSize: "16px" }}>
          <span className="sender-stranger">Stranger</span>{" "}
          <span>is typing</span>
          <span className="typing-dot">.</span>
          <span className="typing-dot">.</span>
          <span className="typing-dot">.</span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
