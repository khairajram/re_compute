import fs from "fs";
import path from "path";

export function createJobDir(sessionId: string) {
  const dir = path.join("./jobs", String(sessionId));

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return dir;
}