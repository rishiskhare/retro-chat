"use client";

import { useState, useCallback, useRef } from "react";
import { useWebSocket } from "./useWebSocket";
import { useSound } from "./useSound";
import type { ServerMessage } from "@/app/lib/protocol";

export type ChatState = "idle" | "waiting" | "chatting" | "stranger-left";

export interface ChatMessage {
  id: string;
  sender: "you" | "stranger" | "system";
  text: string;
  ts: number;
}

export function useChat() {
  const [chatState, setChatState] = useState<ChatState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [strangerTyping, setStrangerTyping] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [waitingPosition, setWaitingPosition] = useState(0);
  const rateLimitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingSafetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgIdCounter = useRef(0);
  const pendingRoomId = useRef<string | null>(null);
  const { play } = useSound();

  const nextId = () => `msg-${++msgIdCounter.current}`;

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleServerMessage = useCallback(
    (msg: ServerMessage) => {
      switch (msg.type) {
        case "waiting":
          setWaitingPosition(msg.position);
          setChatState("waiting");
          break;

        case "matched": {
          // Store room ID for the WebSocket hook to use
          const roomId = (msg as ServerMessage & { roomId?: string }).roomId;
          if (roomId) {
            pendingRoomId.current = roomId;
          }
          // Don't set chatting yet — wait until room connection is established
          break;
        }

        case "message":
          addMessage({
            id: nextId(),
            sender: "stranger",
            text: msg.text,
            ts: msg.ts,
          });
          play("message");
          setStrangerTyping(false);
          if (typingSafetyTimer.current) {
            clearTimeout(typingSafetyTimer.current);
            typingSafetyTimer.current = null;
          }
          break;

        case "stranger-typing":
          setStrangerTyping(true);
          // Safety timeout: auto-clear after 5s in case stop-typing is lost
          if (typingSafetyTimer.current) clearTimeout(typingSafetyTimer.current);
          typingSafetyTimer.current = setTimeout(() => {
            setStrangerTyping(false);
          }, 5000);
          break;

        case "stranger-stop-typing":
          setStrangerTyping(false);
          if (typingSafetyTimer.current) {
            clearTimeout(typingSafetyTimer.current);
            typingSafetyTimer.current = null;
          }
          break;

        case "stranger-disconnected":
          setChatState("stranger-left");
          setStrangerTyping(false);
          addMessage({
            id: nextId(),
            sender: "system",
            text: "Stranger has disconnected.",
            ts: Date.now(),
          });
          play("door-close");
          break;

        case "rate-limited":
          setRateLimited(true);
          if (rateLimitTimer.current) clearTimeout(rateLimitTimer.current);
          rateLimitTimer.current = setTimeout(() => {
            setRateLimited(false);
          }, msg.retryAfter * 1000);
          break;

        case "error":
          if (msg.code === "KICKED") {
            setChatState("idle");
            addMessage({
              id: nextId(),
              sender: "system",
              text: "You have been disconnected for too many violations.",
              ts: Date.now(),
            });
          }
          break;

        case "pong":
          // Heartbeat response, no action needed
          break;
      }
    },
    [addMessage, play]
  );

  const {
    connectionState,
    connectToMatchmaker,
    connectToRoom,
    send,
    disconnect,
  } = useWebSocket(handleServerMessage);

  const joinQueue = useCallback(() => {
    setMessages([]);
    setStrangerTyping(false);
    setRateLimited(false);
    setChatState("waiting");
    pendingRoomId.current = null;

    // Connect to matchmaker, send join-queue once connected
    connectToMatchmaker(() => {
      send({ type: "join-queue" });
    });
  }, [connectToMatchmaker, send]);

  // When matched, connect to room
  const connectToRoomAndChat = useCallback(() => {
    const roomId = pendingRoomId.current;
    if (!roomId) return;
    pendingRoomId.current = null;

    connectToRoom(roomId);
    setChatState("chatting");
    setMessages([]);
    addMessage({
      id: nextId(),
      sender: "system",
      text: "You are now chatting with a random stranger. Say hi!",
      ts: Date.now(),
    });
    play("door-open");
  }, [connectToRoom, addMessage, play]);

  // Check for pending room connection
  const checkPendingRoom = useCallback(() => {
    if (pendingRoomId.current) {
      connectToRoomAndChat();
    }
  }, [connectToRoomAndChat]);

  const sendMessage = useCallback(
    (text: string) => {
      if (chatState !== "chatting" || !text.trim()) return;

      send({ type: "message", text: text.trim() });
      addMessage({
        id: nextId(),
        sender: "you",
        text: text.trim(),
        ts: Date.now(),
      });
    },
    [chatState, send, addMessage]
  );

  const sendTyping = useCallback(() => {
    if (chatState === "chatting") {
      send({ type: "typing" });
    }
  }, [chatState, send]);

  const sendStopTyping = useCallback(() => {
    if (chatState === "chatting") {
      send({ type: "stop-typing" });
    }
  }, [chatState, send]);

  const newChat = useCallback(() => {
    send({ type: "new-chat" });
    disconnect();
    joinQueue();
  }, [send, disconnect, joinQueue]);

  const disconnectChat = useCallback(() => {
    send({ type: "disconnect-chat" });
    disconnect();
    setChatState("idle");
    setMessages([]);
    setStrangerTyping(false);
  }, [send, disconnect]);

  return {
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
  };
}
