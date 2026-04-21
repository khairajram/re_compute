import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, required = true): string {
  const value = process.env[key];

  if (!value && required) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }

  return value as string;
}

export const config = {
  NODE_ENV: getEnv("NODE_ENV", false) || "Development",

  FRONTEND_URL: getEnv("FRONTEND_URL", false) || "http://localhost:3000",

  PORT: Number(getEnv("PORT", false)) || 3000,

  // DATABASE_URL: getEnv("DATABASE_URL"),

  JWT: {
    SECRET: getEnv("JWT_SECRET"),
    EXPIRES_IN: getEnv("JWT_EXPIRES_IN", false) || "7d",
  },

  LOG_LEVEL: getEnv("LOG_LEVEL", false) || "info",


  GOOGLE_CLIENT_ID : getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET : getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_REDIRECT_URI :getEnv("GOOGLE_REDIRECT_URI")
};