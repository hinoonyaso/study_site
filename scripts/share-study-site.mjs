#!/usr/bin/env node
import { spawn } from "node:child_process";
import os from "node:os";
import process from "node:process";

const port = Number(process.env.PORT ?? 4173);
const base = (process.env.BASE_PATH ?? "/study_site/").replace(/\/?$/, "/");
const localUrl = `http://localhost:${port}${base}`;
const lanUrls = Object.values(os.networkInterfaces())
  .flat()
  .filter((item) => item && item.family === "IPv4" && !item.internal)
  .map((item) => `http://${item.address}:${port}${base}`);

console.log("Local URL");
console.log(`  ${localUrl}`);
console.log("Same Wi-Fi / LAN URLs");
for (const lanUrl of lanUrls) console.log(`  ${lanUrl}`);

const shouldTunnel = process.argv.includes("--tunnel");
if (!shouldTunnel) {
  console.log("");
  console.log("외부 인터넷에서 접속하려면:");
  console.log("  1) GitHub Pages: https://hinoonyaso.github.io/study_site/");
  console.log("  2) 임시 터널: cloudflared 설치 후 npm run share:study -- --tunnel");
  process.exit(0);
}

const tunnel = spawn("cloudflared", ["tunnel", "--url", `http://localhost:${port}`], {
  stdio: "inherit",
});

tunnel.on("error", () => {
  console.error("cloudflared를 찾을 수 없습니다. 설치 후 다시 실행하세요.");
  console.error("Ubuntu 예: wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && sudo dpkg -i cloudflared-linux-amd64.deb");
  process.exit(1);
});
