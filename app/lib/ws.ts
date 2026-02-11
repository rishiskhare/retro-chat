import { type ClientMessage, type ServerMessage, parseServerMessage } from "./protocol";

export type ConnectionState = "connecting" | "connected" | "disconnected" | "reconnecting";

export type MessageHandler = (msg: ServerMessage) => void;
export type StateChangeHandler = (state: ConnectionState) => void;

const HEARTBEAT_INTERVAL = 10_000; // 10s – stay under Cloudflare DO ~15s hibernation timeout
const MAX_BACKOFF = 30_000; // 30s cap
const INITIAL_BACKOFF = 1_000; // 1s
const PONG_TIMEOUT = 3_000; // 3s to receive pong after visibility-triggered ping

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pongTimer: ReturnType<typeof setTimeout> | null = null;
  private backoff = INITIAL_BACKOFF;
  private onMessage: MessageHandler;
  private onStateChange: StateChangeHandler;
  private onConnect: (() => void) | null;
  private state: ConnectionState = "disconnected";
  private intentionalClose = false;
  private autoReconnect: boolean;
  private awaitingPong = false;
  private visibilityHandler: (() => void) | null = null;

  constructor(
    url: string,
    onMessage: MessageHandler,
    onStateChange: StateChangeHandler,
    autoReconnect = true,
    onConnect: (() => void) | null = null
  ) {
    this.url = url;
    this.onMessage = onMessage;
    this.onStateChange = onStateChange;
    this.autoReconnect = autoReconnect;
    this.onConnect = onConnect;
  }

  connect(): void {
    this.intentionalClose = false;
    this.cleanup();

    this.setState("connecting");

    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.setState("disconnected");
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.setState("connected");
      this.backoff = INITIAL_BACKOFF;
      this.startHeartbeat();
      this.onConnect?.();
    };

    this.ws.onmessage = (event) => {
      if (typeof event.data !== "string") return;
      const msg = parseServerMessage(event.data);
      if (!msg) return;

      // Clear liveness check on pong
      if (msg.type === "pong") {
        this.awaitingPong = false;
        if (this.pongTimer) {
          clearTimeout(this.pongTimer);
          this.pongTimer = null;
        }
      }

      this.onMessage(msg);
    };

    this.ws.onclose = (event) => {
      this.stopHeartbeat();
      this.setState("disconnected");

      if (!this.intentionalClose && this.autoReconnect) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror
    };
  }

  send(msg: ClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.cleanup();
    this.setState("disconnected");
  }

  changeUrl(newUrl: string): void {
    this.url = newUrl;
    this.intentionalClose = true;
    this.cleanup();
    this.intentionalClose = false;
    this.connect();
  }

  getState(): ConnectionState {
    return this.state;
  }

  private setState(state: ConnectionState): void {
    if (this.state !== state) {
      this.state = state;
      this.onStateChange(state);
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: "ping" });
    }, HEARTBEAT_INTERVAL);
    this.startVisibilityCheck();
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.stopVisibilityCheck();
  }

  /** When the tab becomes visible again, verify the connection is still alive. */
  private startVisibilityCheck(): void {
    this.stopVisibilityCheck();
    this.visibilityHandler = () => {
      if (document.visibilityState !== "visible") return;
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

      // Send a ping and require a pong within the deadline
      this.awaitingPong = true;
      this.send({ type: "ping" });
      this.pongTimer = setTimeout(() => {
        if (!this.awaitingPong) return;
        // No pong received — connection is stale, force close
        this.pongTimer = null;
        if (this.ws) {
          this.ws.close(4000, "pong-timeout");
        }
      }, PONG_TIMEOUT);

      // Restart the heartbeat interval since timers may have drifted
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
      }
      this.heartbeatTimer = setInterval(() => {
        this.send({ type: "ping" });
      }, HEARTBEAT_INTERVAL);
    };
    document.addEventListener("visibilitychange", this.visibilityHandler);
  }

  private stopVisibilityCheck(): void {
    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
    this.awaitingPong = false;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.setState("reconnecting");

    const jitter = Math.random() * 500;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.backoff + jitter);

    this.backoff = Math.min(this.backoff * 2, MAX_BACKOFF);
  }

  private cleanup(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }
  }
}
