"use client";

import { ChatWindow } from "@/app/components/ChatWindow";

export default function ChatPage() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "16px" }}>
      <ChatWindow />
    </div>
  );
}
