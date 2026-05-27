import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

export function loadFirstEnv(paths: string[]) {
  for (const path of paths) {
    if (existsSync(path)) {
      loadEnvFile(path);
      return path;
    }
  }

  return null;
}
