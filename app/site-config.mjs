export const androidPackage = "id.pik.eline.app";

export function getSiteConfig(env = process.env) {
  let playStoreUrl = "";
  const candidate = env.ELINE_PLAY_STORE_URL?.trim();

  if (candidate) {
    try {
      const url = new URL(candidate);
      if (
        url.protocol === "https:" &&
        url.hostname === "play.google.com" &&
        !url.port && !url.username && !url.password &&
        url.pathname === "/store/apps/details" &&
        url.searchParams.get("id") === androidPackage
      ) {
        playStoreUrl = url.href;
      }
    } catch {
      playStoreUrl = "";
    }
  }

  const email = env.ELINE_SUPPORT_EMAIL?.trim() || "eline01092026@gmail.com";
  const supportEmail = email.length <= 254 && /^[a-zA-Z0-9.!#$%&'*+/=_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/.test(email)
    ? email
    : "";

  return { playStoreUrl, supportEmail };
}
