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
  | { type: "matched" }
  | { type: "message"; text: string; ts: number }
  | { type: "stranger-typing" }
  | { type: "stranger-stop-typing" }
  | { type: "stranger-disconnected" }
  | { type: "error"; code: string; message: string }
  | { type: "rate-limited"; retryAfter: number }
  | { type: "pong" };

export function sendMessage(ws: WebSocket, msg: ServerMessage): void {
  try {
    ws.send(JSON.stringify(msg));
  } catch {
    // Socket may be closed
  }
}

export function parseClientMessage(data: string): ClientMessage | null {
  try {
    const msg = JSON.parse(data);
    if (typeof msg !== "object" || msg === null || typeof msg.type !== "string") {
      return null;
    }
    return msg as ClientMessage;
  } catch {
    return null;
  }
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
