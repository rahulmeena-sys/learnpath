import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, "..", "artifacts", "learn-app");

const env = {
  ...process.env,
  NODE_ENV: "development",
  PORT: "22464",
  BASE_PATH: "/",
  API_PROXY_TARGET: "http://localhost:8080",
};

const vite = path.join(appDir, "node_modules", "vite", "bin", "vite.js");
const child = spawn(
  process.execPath,
  [vite, "--config", "vite.config.ts", "--host", "0.0.0.0"],
  { cwd: appDir, env, stdio: "inherit" },
);
child.on("exit", (code) => process.exit(code ?? 0));
