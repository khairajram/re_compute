import { exec } from "child_process";


export function runCommand(cmd: string, cwd?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
      } else {
        resolve(stdout);
      }
    });
  });
}