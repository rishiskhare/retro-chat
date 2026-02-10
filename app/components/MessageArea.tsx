"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/app/hooks/useChat";
import { MessageBubble } from "./MessageBubble";

interface MessageAreaProps {
  messages: ChatMessage[];
  strangerTyping: boolean;
}

export function MessageArea({ messages, strangerTyping }: MessageAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, strangerTyping]);

  return (
    <div className="message-area" style={{ flex: 1, padding: "4px 0" }}>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {strangerTyping && (
        <div style={{ padding: "2px 8px", color: "#808080" }}>
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
