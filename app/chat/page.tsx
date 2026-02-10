"use client";

import { ChatWindow } from "@/app/components/ChatWindow";

export default function ChatPage() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100dvh",
        padding: "0",
      }}
      className="chat-page-container"
    >
      <ChatWindow />
    </div>
  );
}
