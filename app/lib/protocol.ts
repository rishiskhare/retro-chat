// Client → Server messages
export type ClientMessage =
  | { type: "join-queue" }
  | { type: "message"; text: string }
  | { type: "typing" }
  | { type: "stop-typing" }
  | { type: "new-chat" }
  | { type: "disconnect-chat" }
  | { type: "ping" };

// Server → Client messages
export type ServerMessage =
  | { type: "waiting"; position: number }
  | { type: "matched"; roomId?: string }
  | { type: "message"; text: string; ts: number }
  | { type: "stranger-typing" }
  | { type: "stranger-stop-typing" }
  | { type: "stranger-disconnected" }
  | { type: "error"; code: string; message: string }
  | { type: "rate-limited"; retryAfter: number }
  | { type: "pong" };

export function parseServerMessage(data: string): ServerMessage | null {
  try {
    const msg = JSON.parse(data);
    if (typeof msg !== "object" || msg === null || typeof msg.type !== "string") {
      return null;
    }
    return msg as ServerMessage;
  } catch {
    return null;
  }
}
