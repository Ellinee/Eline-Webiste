import { ArrowLeft, GooglePlayLogo } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PhoneMockup } from "../_home/PhoneMockup";
import { getSiteConfig } from "../site-config.mjs";

export const metadata: Metadata = {
  title: "Eline for Android",
  description: "Explore Eline for Android and check Google Play availability.",
  alternates: { canonical: "/download" },
  openGraph: { type: "website", siteName: "Eline", title: "Eline for Android", url: "/download", description: "Home, a little closer. Explore the Eline Android app.", images: ["/eline-icon.png"] },
  twitter: { card: "summary", title: "Eline for Android", description: "Home, a little closer. Explore the Eline Android app.", images: ["/eline-icon.png"] },
};

export default function DownloadPage() {
  const { playStoreUrl } = getSiteConfig();
  const badge = <><GooglePlayLogo size={32} weight="fill" aria-hidden="true" /><span className="text-left"><span className="block text-[10px] uppercase leading-3 tracking-[.08em]">Get it on</span><span className="block text-xl font-extrabold leading-6">Google Play</span></span></>;
  const badgeClass = "inline-flex min-h-[60px] items-center justify-center gap-3 rounded-xl bg-eline-deep px-5 py-3 text-white transition-colors enabled:hover:bg-[#17665E] disabled:cursor-not-allowed";

  return (
    <main id="main-content" tabIndex={-1} className="relative isolate h-screen overflow-y-auto bg-white supports-[height:100dvh]:h-dvh" data-lenis-prevent>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_16%,black_82%,transparent)]">
        <div data-download-photo className="absolute -inset-[6%] opacity-60 md:opacity-80"><Image src="/eline-highlands.webp" alt="" fill priority sizes="100vw" className="object-cover object-[70%_center]" /></div>
        <div data-download-mist className="absolute inset-x-0 bottom-[-8%] top-[45%] bg-white/60 [mask-image:linear-gradient(to_bottom,transparent,black_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/90 via-40% to-white/0 md:bg-gradient-to-r md:via-white/95 md:via-45% md:to-white/10" />
      </div>
      <Link href="/" aria-label="Back to Eline home" className="absolute left-5 top-5 z-20 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-eline-deep transition-colors hover:bg-eline-mint md:left-9 xl:left-[max(56px,calc((100%-1256px)/2))]"><ArrowLeft size={18} aria-hidden="true" />Back</Link>
      <div className="relative mx-auto grid min-h-full w-[calc(100%-40px)] max-w-[1256px] content-center items-center gap-9 pb-10 pt-24 md:w-[calc(100%-72px)] md:grid-cols-2 md:gap-10 xl:w-[calc(100%-112px)] xl:gap-20">
        <div className="relative z-10 text-center md:text-left">
          <p data-download-enter className="text-[11px] font-extrabold uppercase tracking-[.13em] text-[#28756C]">Eline for Android</p>
          <h1 data-download-enter className="my-4 text-[clamp(42px,8vw,80px)] font-extrabold leading-[1.06] tracking-[-.055em] md:mb-[25px] md:mt-5">Home, a little<br /><span className="text-[#287E74]">closer.</span></h1>
          <p data-download-enter className="mx-auto max-w-[440px] text-[15px] leading-[1.75] text-eline-muted md:mx-0 md:text-lg">Your home’s safety status, connected devices, and family updates. All in your pocket.</p>
          <div data-download-enter className="mt-6 md:mt-8">{playStoreUrl ? <a className={`${badgeClass} hover:bg-[#17665E]`} href={playStoreUrl} aria-label="Get Eline on Google Play">{badge}</a> : <button type="button" disabled className={badgeClass} aria-label="Get Eline on Google Play — download link not yet provided" title="Download link not yet provided">{badge}</button>}</div>
        </div>
        <figure className="relative grid min-w-0 place-items-center py-5 [perspective:1200px]">
          <div data-download-phone><div className="rotate-[3deg] md:rotate-[5deg]"><PhoneMockup screen="home" className="[--phone-scale:.43] md:[--phone-scale:.62] xl:[--phone-scale:.72] [@media(min-width:768px)_and_(max-height:820px)]:[--phone-scale:.54]" /></div></div>
        </figure>
      </div>
    </main>
  );
}
