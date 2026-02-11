import { DurableObject } from "cloudflare:workers";
import { sendMessage, parseClientMessage } from "./protocol";
import { TokenBucket } from "./ratelimit";

const MAX_MESSAGE_LENGTH = 500;
const MAX_VIOLATIONS = 3;

interface SocketState {
  messageLimiter: TokenBucket;
  typingLimiter: TokenBucket;
  violations: number;
  isTyping: boolean;
}

interface Env {
  MATCHMAKER: DurableObjectNamespace;
}

export class ChatRoom extends DurableObject<Env> {
  private socketStates: Map<WebSocket, SocketState> = new Map();
  private notifiedSockets = new Set<WebSocket>();

  async fetch(request: Request): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server);
    this.socketStates.set(server, {
      messageLimiter: new TokenBucket(5, 1), // 5 burst, 1/s sustained
      typingLimiter: new TokenBucket(1, 1),  // 1 per second
      violations: 0,
      isTyping: false,
    });

    // If both users are connected, notify that they're matched
    const sockets = this.ctx.getWebSockets();
    if (sockets.length === 2) {
      for (const ws of sockets) {
        sendMessage(ws, { type: "matched" });
      }
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, data: string | ArrayBuffer): Promise<void> {
    if (typeof data !== "string") return;

    const msg = parseClientMessage(data);
    if (!msg) {
      sendMessage(ws, { type: "error", code: "INVALID_MESSAGE", message: "Invalid message format" });
      return;
    }

    const state = this.socketStates.get(ws);
    if (!state) return;

    const partner = this.getPartner(ws);

    switch (msg.type) {
      case "message": {
        if (!partner) {
          sendMessage(ws, { type: "error", code: "NO_PARTNER", message: "No one is connected" });
          return;
        }

        const text = (msg.text || "").trim();
        if (!text) {
          sendMessage(ws, { type: "error", code: "EMPTY_MESSAGE", message: "Message cannot be empty" });
          return;
        }

        if (text.length > MAX_MESSAGE_LENGTH) {
          sendMessage(ws, { type: "error", code: "MESSAGE_TOO_LONG", message: `Max ${MAX_MESSAGE_LENGTH} characters` });
          return;
        }

        if (!state.messageLimiter.consume()) {
          state.violations++;
          sendMessage(ws, { type: "rate-limited", retryAfter: 1 });
          if (state.violations >= MAX_VIOLATIONS) {
            sendMessage(ws, { type: "error", code: "KICKED", message: "Too many violations" });
            ws.close(1008, "Policy violation");
            this.notifyPartnerDisconnected(ws);
          }
          return;
        }

        // Implicitly clear typing state when a message is sent
        if (state.isTyping) {
          state.isTyping = false;
          sendMessage(partner, { type: "stranger-stop-typing" });
        }
        sendMessage(partner, { type: "message", text, ts: Date.now() });
        break;
      }

      case "typing": {
        if (partner && !state.isTyping) {
          // Only forward the first typing event; throttle subsequent ones
          if (state.typingLimiter.consume()) {
            state.isTyping = true;
            sendMessage(partner, { type: "stranger-typing" });
          }
        }
        break;
      }

      case "stop-typing": {
        if (partner && state.isTyping) {
          state.isTyping = false;
          sendMessage(partner, { type: "stranger-stop-typing" });
        }
        break;
      }

      case "ping": {
        sendMessage(ws, { type: "pong" });
        break;
      }

      case "disconnect-chat":
      case "new-chat": {
        this.notifyPartnerDisconnected(ws);
        this.notifyMatchmakerDisconnect(ws);
        ws.close(1000, msg.type === "new-chat" ? "new-chat" : "user-disconnect");
        this.socketStates.delete(ws);
        break;
      }
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    this.notifyPartnerDisconnected(ws);
    this.notifyMatchmakerDisconnect(ws);
    this.socketStates.delete(ws);
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    this.notifyPartnerDisconnected(ws);
    this.notifyMatchmakerDisconnect(ws);
    this.socketStates.delete(ws);
  }

  private getPartner(ws: WebSocket): WebSocket | null {
    const sockets = this.ctx.getWebSockets();
    for (const s of sockets) {
      if (s !== ws) return s;
    }
    return null;
  }

  private notifyMatchmakerDisconnect(ws: WebSocket): void {
    if (this.notifiedSockets.has(ws)) return;
    this.notifiedSockets.add(ws);
    const id = this.env.MATCHMAKER.idFromName("global-matchmaker");
    const matchmaker = this.env.MATCHMAKER.get(id);
    matchmaker.fetch("http://do/room-disconnect", { method: "POST" }).catch(() => {});
  }

  private notifyPartnerDisconnected(ws: WebSocket): void {
    const partner = this.getPartner(ws);
    if (partner) {
      sendMessage(partner, { type: "stranger-disconnected" });
    }
  }
}
