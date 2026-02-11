"use client";

import { useEffect, useCallback } from "react";
import { useChat } from "@/app/hooks/useChat";
import { useTheme } from "@/app/context/ThemeContext";
import { MessageArea } from "./MessageArea";
import { InputArea } from "./InputArea";
import { StatusBar } from "./StatusBar";
import { WaitingScreen } from "./WaitingScreen";
import { ThemeToggle } from "./ThemeToggle";

export function ChatWindow() {
  const { theme } = useTheme();
  const {
    chatState,
    messages,
    strangerTyping,
    rateLimited,
    waitingPosition,
    connectionState,
    joinQueue,
    sendMessage,
    sendTyping,
    sendStopTyping,
    newChat,
    disconnectChat,
    checkPendingRoom,
  } = useChat();

  // Start by joining queue automatically
  useEffect(() => {
    joinQueue();
  }, [joinQueue]);

  // Poll for pending room connection (when matched by matchmaker)
  useEffect(() => {
    if (chatState === "waiting") {
      const interval = setInterval(() => {
        checkPendingRoom();
      }, 200);
      return () => clearInterval(interval);
    }
  }, [chatState, checkPendingRoom]);

  const handleDisconnect = useCallback(() => {
    disconnectChat();
    window.location.href = "/";
  }, [disconnectChat]);

  if (theme === "modern") {
    return (
      <div className="modern-chat-container">
        <div className="modern-header">
          <span className="modern-header-title">LuckyChat</span>
          <ThemeToggle />
        </div>
        <div className="modern-chat-body">
          {chatState === "waiting" ? (
            <WaitingScreen position={waitingPosition} onCancel={handleDisconnect} />
          ) : (
            <>
              <MessageArea messages={messages} strangerTyping={strangerTyping} />
              <InputArea
                onSend={sendMessage}
                onTyping={sendTyping}
                onStopTyping={sendStopTyping}
                disabled={chatState !== "chatting"}
                rateLimited={rateLimited}
              />
            </>
          )}
        </div>
        <StatusBar
          chatState={chatState}
          connectionState={connectionState}
          strangerTyping={strangerTyping}
          onNewChat={newChat}
          onDisconnect={handleDisconnect}
        />
      </div>
    );
  }

  return (
    <div
      className="window"
      style={{
        width: "100%",
        maxWidth: "600px",
        height: "min(500px, 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="title-bar">
        <div className="title-bar-text">LuckyChat - Instant Message</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" />
          <button aria-label="Maximize" />
          <button aria-label="Close" onClick={handleDisconnect} />
        </div>
      </div>
      <div
        className="window-body"
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          margin: 0,
          padding: "4px",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {chatState === "waiting" ? (
          <WaitingScreen position={waitingPosition} onCancel={handleDisconnect} />
        ) : (
          <>
            <MessageArea messages={messages} strangerTyping={strangerTyping} />
            <InputArea
              onSend={sendMessage}
              onTyping={sendTyping}
              onStopTyping={sendStopTyping}
              disabled={chatState !== "chatting"}
              rateLimited={rateLimited}
            />
          </>
        )}
      </div>
      <StatusBar
        chatState={chatState}
        connectionState={connectionState}
        strangerTyping={strangerTyping}
        onNewChat={newChat}
        onDisconnect={handleDisconnect}
      />
    </div>
  );
}
