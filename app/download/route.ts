import { NextResponse } from "next/server";
import { selectApkDownloadUrl } from "./download-asset.mjs";

interface ReleaseAsset {
  name?: string;
  browser_download_url?: string;
}

const releasesUrl = "https://github.com/Ellinee/Eline-Mobile/releases/latest";

export const dynamic = "force-dynamic";

export async function GET() {
  let targetUrl = releasesUrl;

  try {
    const response = await fetch("https://api.github.com/repos/Ellinee/Eline-Mobile/releases/latest", {
      headers: {
        Accept: "application/vnd.github+json",
      },
      next: { revalidate: 300 },
    });

    if (response.ok) {
      const release = await response.json() as { assets?: ReleaseAsset[] };
      targetUrl = selectApkDownloadUrl(release.assets, releasesUrl);

      if (targetUrl === releasesUrl) {
        console.warn("Eline APK download: latest GitHub release has no downloadable APK; using fallback.");
      }
    } else {
      console.warn(`Eline APK download: GitHub Releases API returned ${response.status}; using fallback.`);
    }
  } catch (error) {
    console.warn("Eline APK download: GitHub Releases API request failed; using fallback.", error instanceof Error ? error.message : "Unknown error");
  }

  return NextResponse.redirect(targetUrl, 302);
}
