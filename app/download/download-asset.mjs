/**
 * @typedef {{ name?: string, browser_download_url?: string }} ReleaseAsset
 */

/**
 * @param {ReleaseAsset[] | undefined} assets
 * @param {string} fallbackUrl
 */
export function selectApkDownloadUrl(assets, fallbackUrl) {
  return assets?.find(
    (asset) => asset.name?.toLowerCase().endsWith(".apk") && asset.browser_download_url?.trim(),
  )?.browser_download_url ?? fallbackUrl;
}
