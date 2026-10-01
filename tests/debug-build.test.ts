import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import test from "node:test";
import { debugAsset, debugShell, safeAssetName } from "../debug/assets.ts";

const root = process.cwd();
test("root installation includes locked nested build tools", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  const lock = JSON.parse(await readFile(path.join(root, "package-lock.json"), "utf8"));
  const nested = JSON.parse(await readFile(path.join(root, "debug-app/package.json"), "utf8"));
  const nestedLock = JSON.parse(await readFile(path.join(root, "debug-app/package-lock.json"), "utf8"));
  assert.equal(manifest.scripts.postinstall, "npm ci --prefix debug-app --include=dev");
  assert.equal(manifest.scripts.build, "npm --prefix debug-app run build && next build");
  assert.deepEqual(manifest.engines, nested.engines);
  assert.equal(lock.packages[""].hasInstallScript, true);
  for (const [pkg, pkgLock] of [[manifest, lock], [nested, nestedLock]]) {
    for (const field of ["dependencies", "devDependencies", "engines"]) assert.deepEqual(pkgLock.packages[""][field], pkg[field]);
  }
});
test("built shell, lazy assets and production traces remain isolated", async (context) => {
  const files = await readdir(path.join(root, ".debug-dist/assets"));
  const html = await debugShell();
  assert.equal(html.status, 200);
  const markup = await html.text();
  assert.match(markup, /\/debug\/assets\/index-[\w-]+\.js/);
  assert.ok(!markup.includes("_next"));
  assert.ok(!markup.includes("SiteChrome"));
  assert.equal(html.headers.get("cache-control"), "no-store");
  assert.match(html.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  let total = Buffer.byteLength(markup);
  let compressed = gzipSync(markup).byteLength;
  const built = [path.join(root, ".debug-dist/index.html")];
  for (const name of files) {
    assert.ok(safeAssetName(name), name);
    const response = await debugAsset(name);
    assert.equal(response.status, 200);
    const content = await response.text();
    assert.ok(!content.includes("DEBUG_API_URL"));
    assert.ok(!content.includes("DEBUG_PASSWORD_HASH"));
    total += Buffer.byteLength(content);
    compressed += gzipSync(content).byteLength;
    built.push(path.join(root, ".debug-dist/assets", name));
  }
  for (const route of ["debug", "debug/assets/[file]"]) {
    const tracePath = path.join(root, ".next/server/app", route, "route.js.nft.json");
    const trace = JSON.parse(await readFile(tracePath, "utf8")) as { files: string[] };
    const traced = new Set(trace.files.map((file) => path.resolve(path.dirname(tracePath), file)));
    for (const file of built) assert.ok(traced.has(file), `Not traced: ${file}`);
  }
  const forbidden = /(?:DEBUG_[A-Z_]+|NEXT_PUBLIC_DEBUG|VITE_DEBUG|eline_debug_session|build-only\.invalid|build-browser\.invalid|backend\.test|diagnostics\.test|Bearer not-public|12345678-1234-4234-8234-123456789abc|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:postgres(?:ql)?|mongodb(?:\+srv)?|redis):\/\/)/;
  for (const directory of [".debug-dist", ".next/static", "public"]) {
    const base = path.join(root, directory);
    const entries = await readdir(base, { recursive: true, withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const filename = path.join(entry.parentPath, entry.name);
      assert.ok(!entry.name.startsWith(".env"), `Environment file in public assets: ${filename}`);
      if (!/\.(?:js|css|html|json|txt|svg|map)$/i.test(entry.name)) continue;
      const content = await readFile(filename, "utf8");
      assert.doesNotMatch(content, forbidden, `Private configuration or fixture data in public assets: ${filename}`);
    }
  }
  for (const font of ["nunito-regular.ttf", "nunito-semibold.ttf"]) assert.ok((await stat(path.join(root, "public", font))).size > 0);
  assert.equal((await debugAsset("../index.html")).status, 404);
  context.diagnostic(`Debug artifact: ${total} bytes; ${compressed} bytes gzip (sum of files; existing public fonts excluded).`);
});
