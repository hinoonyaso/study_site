import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pyodideDir = path.join(root, "node_modules", "pyodide");
const publicDir = path.join(root, "public", "pyodide");
const tmpDir = path.join(root, "public", ".pyodide-tmp");

const runtimeFiles = [
  "pyodide.js",
  "pyodide.asm.js",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
];

const rootPackages = ["numpy", "scipy", "matplotlib"];

const exists = (file) => {
  try {
    fs.accessSync(file);
    return true;
  } catch {
    return false;
  }
};

if (!exists(pyodideDir)) {
  console.warn("[vendor-pyodide] node_modules/pyodide not found; skipping local Pyodide vendor step.");
  process.exit(0);
}

const pyodidePackage = JSON.parse(fs.readFileSync(path.join(pyodideDir, "package.json"), "utf8"));
const lock = JSON.parse(fs.readFileSync(path.join(pyodideDir, "pyodide-lock.json"), "utf8"));
const cdnBase = `https://cdn.jsdelivr.net/pyodide/v${pyodidePackage.version}/full/`;

const normalizeDependency = (name) => name.replace(/[<>=!~].*$/, "").trim();

const collectPackages = (names, seen = new Set()) => {
  for (const rawName of names) {
    const name = normalizeDependency(rawName);
    if (!name || seen.has(name)) continue;
    const item = lock.packages[name];
    if (!item) {
      console.warn(`[vendor-pyodide] package '${name}' not found in pyodide-lock.json; skipping.`);
      continue;
    }
    seen.add(name);
    collectPackages(item.depends ?? [], seen);
  }
  return [...seen];
};

const sha256 = async (file) => {
  const hash = crypto.createHash("sha256");
  const stream = fs.createReadStream(file);
  for await (const chunk of stream) hash.update(chunk);
  return hash.digest("hex");
};

const download = async (url, dest, expectedSha256) => {
  if (exists(dest) && (!expectedSha256 || (await sha256(dest)) === expectedSha256)) return;

  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`download failed ${response.status} ${response.statusText}: ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (expectedSha256) {
    const digest = crypto.createHash("sha256").update(buffer).digest("hex");
    if (digest !== expectedSha256) {
      throw new Error(`sha256 mismatch for ${url}: expected ${expectedSha256}, got ${digest}`);
    }
  }
  fs.writeFileSync(dest, buffer);
};

const run = async () => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  for (const file of runtimeFiles) {
    fs.copyFileSync(path.join(pyodideDir, file), path.join(tmpDir, file));
  }

  const packageNames = collectPackages(rootPackages);
  for (const name of packageNames) {
    const item = lock.packages[name];
    const fileName = item.file_name;
    if (!fileName) continue;
    await download(`${cdnBase}${fileName}`, path.join(tmpDir, fileName), item.sha256);
  }

  fs.writeFileSync(
    path.join(tmpDir, "codex-vendor-manifest.json"),
    JSON.stringify(
      {
        version: pyodidePackage.version,
        packages: packageNames,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(path.join(tmpDir, ".gitignore"), "*\n!.gitignore\n");

  fs.rmSync(publicDir, { recursive: true, force: true });
  fs.renameSync(tmpDir, publicDir);
  console.log(`[vendor-pyodide] vendored Pyodide ${pyodidePackage.version} with ${packageNames.length} packages to public/pyodide`);
};

run().catch((err) => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.warn(`[vendor-pyodide] ${String(err)}`);
  console.warn("[vendor-pyodide] Local Pyodide assets were not refreshed; runtime will fall back to the CDN when needed.");
});
