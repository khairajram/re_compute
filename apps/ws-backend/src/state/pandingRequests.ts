import { WebSocket } from "ws";
export const pendingStatusChecks = new Map<string, WebSocket>();