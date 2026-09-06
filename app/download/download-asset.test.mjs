import assert from "node:assert/strict";
import test from "node:test";
import { selectApkDownloadUrl } from "./download-asset.mjs";

const fallbackUrl = "https://example.com/fallback.apk";

test("selects the first valid APK asset and falls back when none is available", () => {
  assert.equal(
    selectApkDownloadUrl(
      [
        { name: "release-notes.txt", browser_download_url: "https://example.com/notes" },
        { name: "eline.APK", browser_download_url: "https://example.com/eline.apk" },
      ],
      fallbackUrl,
    ),
    "https://example.com/eline.apk",
  );
  assert.equal(
    selectApkDownloadUrl(
      [
        { name: "broken.apk" },
        { name: "empty.apk", browser_download_url: "  " },
        { name: "working.apk", browser_download_url: "https://example.com/working.apk" },
      ],
      fallbackUrl,
    ),
    "https://example.com/working.apk",
  );
  assert.equal(selectApkDownloadUrl([], fallbackUrl), fallbackUrl);
  assert.equal(selectApkDownloadUrl(undefined, fallbackUrl), fallbackUrl);
});
