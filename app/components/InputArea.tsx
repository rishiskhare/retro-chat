"use client";

import { useState, useCallback, useRef } from "react";
import { useTheme } from "@/app/context/ThemeContext";

interface InputAreaProps {
  onSend: (text: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled: boolean;
  rateLimited: boolean;
}

export function InputArea({ onSend, onTyping, onStopTyping, disabled, rateLimited }: InputAreaProps) {
  const { theme } = useTheme();
  const [text, setText] = useState("");
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping = useRef(false);

  const handleTyping = useCallback(() => {
    if (!isTyping.current) {
      isTyping.current = true;
      onTyping();
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      isTyping.current = false;
      onStopTyping();
    }, 2000);
  }, [onTyping, onStopTyping]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    isTyping.current = false;
    onStopTyping();
  }, [text, disabled, onSend, onStopTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (theme === "modern") {
    return (
      <div className="modern-input-area">
        <textarea
          className="modern-input"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "Chat ended" : "Message"}
          maxLength={500}
          autoComplete="off"
          autoCorrect="on"
          rows={1}
        />
        <button
          className="modern-send-btn"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          aria-label="Send"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ display: "block" }}>
            <circle cx="14" cy="14" r="14" fill={disabled || !text.trim() ? "#C7C7CC" : "#007AFF"} />
            <path d="M14 20V10M14 10L9.5 14.5M14 10L18.5 14.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {rateLimited && (
          <span className="rate-limit-warning" style={{ alignSelf: "center", flexShrink: 0 }}>
            Slow down!
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "4px", padding: "4px", flexShrink: 0 }}>
      <textarea
        className="chat-input"
        style={{ flex: 1, height: "44px", minWidth: 0 }}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          handleTyping();
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? "Chat ended" : "Type a message..."}
        maxLength={500}
        autoComplete="off"
        autoCorrect="on"
      />
      <button
        className="button"
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        style={{
          alignSelf: "stretch",
          padding: "0 20px",
          minHeight: "44px",
          flexShrink: 0,
          fontSize: "14px",
        }}
      >
        Send
      </button>
      {rateLimited && (
        <span
          className="rate-limit-warning"
          style={{ alignSelf: "center", flexShrink: 0 }}
        >
          Slow down!
        </span>
      )}
    </div>
  );
}
