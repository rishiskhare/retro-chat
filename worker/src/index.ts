export { Matchmaker } from "./matchmaker";
export { ChatRoom } from "./chatroom";

interface Env {
  MATCHMAKER: DurableObjectNamespace;
  CHATROOM: DurableObjectNamespace;
  ALLOWED_ORIGIN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Origin validation
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = env.ALLOWED_ORIGIN.split(",").map((o) => o.trim());
    const matchedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(matchedOrigin),
      });
    }

    if (origin && !allowedOrigins.includes(origin)) {
      return new Response("Forbidden origin", { status: 403 });
    }

    // WebSocket routes
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    // Route: /ws — connect to matchmaker
    if (url.pathname === "/ws") {
      const matchmakerId = env.MATCHMAKER.idFromName("global-matchmaker");
      const matchmaker = env.MATCHMAKER.get(matchmakerId);
      return matchmaker.fetch(request);
    }

    // Route: /ws/room/:roomId — connect to a specific chat room
    const roomMatch = url.pathname.match(/^\/ws\/room\/(.+)$/);
    if (roomMatch) {
      const roomIdStr = roomMatch[1];
      try {
        const roomId = env.CHATROOM.idFromString(roomIdStr);
        const room = env.CHATROOM.get(roomId);
        return room.fetch(request);
      } catch {
        return new Response("Invalid room ID", { status: 400 });
      }
    }

    return new Response("Not found", { status: 404 });
  },
};

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Upgrade, Connection",
  };
}
