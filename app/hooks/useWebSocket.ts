"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { WebSocketManager, type ConnectionState } from "@/app/lib/ws";
import type { ClientMessage, ServerMessage } from "@/app/lib/protocol";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8787";

export function useWebSocket(onMessage: (msg: ServerMessage) => void) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const managerRef = useRef<WebSocketManager | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connectToMatchmaker = useCallback((onConnect?: () => void) => {
    const url = `${WS_BASE_URL}/ws`;
    if (managerRef.current) {
      managerRef.current.disconnect();
    }
    const manager = new WebSocketManager(
      url,
      (msg) => onMessageRef.current(msg),
      setConnectionState,
      false,
      onConnect || null
    );
    managerRef.current = manager;
    manager.connect();
  }, []);

  const connectToRoom = useCallback((roomId: string) => {
    const url = `${WS_BASE_URL}/ws/room/${roomId}`;
    if (managerRef.current) {
      managerRef.current.disconnect();
    }
    const manager = new WebSocketManager(
      url,
      (msg) => onMessageRef.current(msg),
      setConnectionState,
      false
    );
    managerRef.current = manager;
    manager.connect();
  }, []);

  const send = useCallback((msg: ClientMessage) => {
    managerRef.current?.send(msg);
  }, []);

  const disconnect = useCallback(() => {
    managerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      managerRef.current?.disconnect();
    };
  }, []);

  return {
    connectionState,
    connectToMatchmaker,
    connectToRoom,
    send,
    disconnect,
  };
}
