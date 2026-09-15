import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
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
  return (
    <main id="main-content" tabIndex={-1} className="relative h-screen overflow-y-auto bg-white supports-[height:100dvh]:h-dvh" data-lenis-prevent>
      <Link href="/" aria-label="Back to Eline home" className="absolute left-5 top-5 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-eline-deep transition-colors hover:bg-eline-mint md:left-9 xl:left-[max(56px,calc((100%-1256px)/2))]"><ArrowLeft size={18} aria-hidden="true" />Back</Link>
      <div className="mx-auto grid min-h-full w-[calc(100%-40px)] max-w-[1256px] content-center items-center gap-7 pb-8 pt-24 md:w-[calc(100%-72px)] md:grid-cols-2 md:gap-10 md:pb-10 xl:w-[calc(100%-112px)] xl:gap-20">
        <div className="text-center md:text-left">
          <p className="text-[11px] font-extrabold uppercase tracking-[.13em] text-[#28756C]">Eline for Android</p>
          <h1 className="my-4 text-[clamp(42px,8vw,80px)] font-extrabold leading-[1.06] tracking-[-.055em] md:mb-[25px] md:mt-5">Home, a little<br /><span className="text-[#287E74]">closer.</span></h1>
          <p className="mx-auto max-w-[440px] text-[15px] leading-[1.75] text-eline-muted md:mx-0 md:text-lg">Your home’s safety status, connected devices, and family updates. All in your pocket.</p>
          <div className="mt-5 md:mt-[30px]">{playStoreUrl ? <a className="inline-flex min-h-[54px] items-center justify-center gap-[22px] rounded-full bg-eline-deep px-[25px] py-4 text-sm font-extrabold text-white transition-colors hover:bg-[#17665E]" href={playStoreUrl}>Get it on Google Play <ArrowRight size={20} aria-hidden="true" /></a> : <span className="inline-flex items-center rounded-full border border-[#B2D9CF] px-4 py-2.5 text-[13px] font-extrabold text-eline-deep">Coming to Google Play</span>}</div>
        </div>
        <figure className="relative isolate flex min-w-0 flex-col items-center justify-center gap-4 md:gap-6">
          <div data-gradient-orb aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_closest-side,#74D3CEB3_0%,#74D3CE80_55%,#D1F4F2B3_78%,#D1F4F200_100%)]" />
          <PhoneMockup screen="home" className="[--phone-scale:.43] md:[--phone-scale:.62] xl:[--phone-scale:.72] [@media(min-width:768px)_and_(max-height:820px)]:[--phone-scale:.54]" />
          <figcaption className="text-center text-[9px] text-eline-muted md:text-[10px]">App preview · example home and device data</figcaption>
        </figure>
      </div>
    </main>
  );
}
