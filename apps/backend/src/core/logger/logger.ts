import pino from "pino";
import { config } from "../config/config.js";

export const logger = pino({
  level: config.LOG_LEVEL,
  transport:
    config.NODE_ENV === "Development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
});