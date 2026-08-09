const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
export const BASE_URL = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const rawWsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080";
export const WEBSOCKET_URL = rawWsUrl.endsWith("/") ? rawWsUrl.slice(0, -1) : rawWsUrl;

