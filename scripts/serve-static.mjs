#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const args = new Map(
  process.argv.slice(2).flatMap((arg, index, all) => {
    if (!arg.startsWith("--")) return [];
    const key = arg.slice(2);
    const next = all[index + 1];
    return [[key, next && !next.startsWith("--") ? next : "true"]];
  }),
);

const root = path.resolve(args.get("root") ?? "dist");
const host = args.get("host") ?? process.env.HOST ?? "0.0.0.0";
const port = Number(args.get("port") ?? process.env.PORT ?? 4173);
const base = (args.get("base") ?? process.env.BASE_PATH ?? "/study_site/").replace(/\/?$/, "/");

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".ico", "image/x-icon"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".ttf", "font/ttf"],
]);

if (!fs.existsSync(path.join(root, "index.html"))) {
  console.error(`dist/index.html을 찾을 수 없습니다. 먼저 npm run build를 실행하세요: ${root}`);
  process.exit(1);
}

const sendFile = (response, filePath) => {
  const extension = path.extname(filePath);
  const contentType = mimeTypes.get(extension) ?? "application/octet-stream";
  fs.createReadStream(filePath)
    .on("error", () => {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("File read error");
    })
    .once("open", () => {
      response.writeHead(200, {
        "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
        "Content-Type": contentType,
      });
    })
    .pipe(response);
};

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`).pathname);

  if (pathname === "/" && base !== "/") {
    response.writeHead(302, { Location: base });
    response.end();
    return;
  }

  const relativeUrl = base === "/" ? pathname : pathname.startsWith(base) ? pathname.slice(base.length - 1) : pathname;
  const normalized = path.normalize(relativeUrl).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = path.join(root, normalized === "/" ? "index.html" : normalized);
  const filePath = fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()
    ? requestedPath
    : path.join(root, "index.html");

  sendFile(response, filePath);
});

server.listen(port, host, () => {
  const addresses = Object.values(os.networkInterfaces())
    .flat()
    .filter((item) => item && item.family === "IPv4" && !item.internal)
    .map((item) => `http://${item.address}:${port}${base}`);

  console.log(`Physical AI Study Site serving ${root}`);
  console.log(`Local: http://localhost:${port}${base}`);
  for (const address of addresses) console.log(`LAN:   ${address}`);
});
