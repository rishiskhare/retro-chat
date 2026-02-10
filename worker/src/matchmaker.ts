import { DurableObject } from "cloudflare:workers";
import { sendMessage, parseClientMessage } from "./protocol";
import { TokenBucket } from "./ratelimit";

interface Env {
  CHATROOM: DurableObjectNamespace;
}

interface QueueEntry {
  ws: WebSocket;
  joinLimiter: TokenBucket;
  skipLimiter: TokenBucket;
}

export class Matchmaker extends DurableObject<Env> {
  private queue: QueueEntry[] = [];

  async fetch(request: Request): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, data: string | ArrayBuffer): Promise<void> {
    if (typeof data !== "string") return;

    const msg = parseClientMessage(data);
    if (!msg) {
      sendMessage(ws, { type: "error", code: "INVALID_MESSAGE", message: "Invalid message format" });
      return;
    }

    switch (msg.type) {
      case "join-queue": {
        if (this.queue.some((e) => e.ws === ws)) {
          sendMessage(ws, { type: "error", code: "ALREADY_QUEUED", message: "Already in queue" });
          return;
        }

        const entry: QueueEntry = {
          ws,
          joinLimiter: new TokenBucket(1, 1 / 3),
          skipLimiter: new TokenBucket(1, 1 / 2),
        };
        entry.joinLimiter.consume();

        this.queue.push(entry);
        sendMessage(ws, { type: "waiting", position: this.queue.length });
        this.tryMatch();
        break;
      }

      case "new-chat": {
        const idx = this.queue.findIndex((e) => e.ws === ws);
        if (idx !== -1) {
          const entry = this.queue[idx];
          if (!entry.skipLimiter.consume()) {
            sendMessage(ws, { type: "rate-limited", retryAfter: 2 });
            return;
          }
          return;
        }

        const newEntry: QueueEntry = {
          ws,
          joinLimiter: new TokenBucket(1, 1 / 3),
          skipLimiter: new TokenBucket(1, 1 / 2),
        };
        newEntry.joinLimiter.consume();

        this.queue.push(newEntry);
        sendMessage(ws, { type: "waiting", position: this.queue.length });
        this.tryMatch();
        break;
      }

      case "disconnect-chat": {
        this.removeFromQueue(ws);
        break;
      }

      case "ping": {
        sendMessage(ws, { type: "pong" });
        break;
      }
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    this.removeFromQueue(ws);
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    this.removeFromQueue(ws);
  }

  private removeFromQueue(ws: WebSocket): void {
    this.queue = this.queue.filter((e) => e.ws !== ws);
  }

  private tryMatch(): void {
    while (this.queue.length >= 2) {
      const user1 = this.queue.shift()!;
      const user2 = this.queue.shift()!;

      const roomId = this.env.CHATROOM.newUniqueId();
      const roomIdStr = roomId.toString();

      // Notify both clients with the room they should connect to
      try {
        user1.ws.send(JSON.stringify({ type: "matched", roomId: roomIdStr }));
      } catch {
        // user1 failed — re-queue user2
        this.queue.unshift(user2);
        continue;
      }

      try {
        user2.ws.send(JSON.stringify({ type: "matched", roomId: roomIdStr }));
      } catch {
        // user2 failed — re-queue user1
        this.queue.unshift(user1);
        continue;
      }

      // Close matchmaker connections — clients reconnect to ChatRoom
      try { user1.ws.close(1000, "matched"); } catch {}
      try { user2.ws.close(1000, "matched"); } catch {}
    }

    // Update positions for remaining users
    this.queue.forEach((entry, i) => {
      sendMessage(entry.ws, { type: "waiting", position: i + 1 });
    });
  }
}
