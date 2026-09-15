import { ArrowDown, ArrowRight } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { PhoneMockup } from "./PhoneMockup";

export function Hero({ playStoreUrl }: { playStoreUrl: string }) {
  return (
    <section data-hero className="bg-white">
      <div className="mx-auto grid w-[calc(100%-40px)] max-w-[1256px] items-center gap-10 py-12 md:min-h-[calc(100svh-84px)] md:w-[calc(100%-72px)] md:grid-cols-[1.12fr_.88fr] md:gap-6 xl:w-[calc(100%-112px)] xl:gap-8">
        <div className="relative z-10 text-center md:pb-4 md:text-left">
          <h1 className="text-[clamp(51px,12.5vw,78px)] font-extrabold leading-[1.025] tracking-[-.065em] md:text-[clamp(52px,6.6vw,96px)]" data-hero-reveal>Feel closer to<br />those who<br /><span className="text-[#278477]">matter most.</span></h1>
          <p className="mx-auto mt-7 max-w-[455px] text-base leading-[1.75] text-eline-muted md:mx-0 md:text-[17px]" data-hero-reveal>Check in on home. Know what needs attention.<br className="hidden lg:block" /> Care together, even when you’re apart.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 md:justify-start md:gap-7" data-hero-reveal>
            <Link href={playStoreUrl || "/download"} className="inline-flex min-h-[54px] items-center justify-center gap-[22px] rounded-full bg-eline-deep px-[25px] py-4 text-sm font-extrabold text-white transition-colors hover:bg-[#17665E]">{playStoreUrl ? "Get it on Google Play" : "Get Eline"}<ArrowRight size={20} aria-hidden="true" /></Link>
            <a href="#features" className="inline-flex min-h-11 items-center gap-2.5 text-[13px] font-extrabold underline-offset-4 hover:underline md:text-sm">Explore the app <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
          <p className="mt-4 text-[11px] text-eline-muted" data-hero-reveal>{playStoreUrl ? "Available for Android." : "Coming to Google Play for Android."}</p>
        </div>
        <figure className="flex min-w-0 flex-col items-center justify-center gap-6 pt-3">
          <div data-hero-layers className="relative isolate grid w-full place-items-center py-5 [perspective:1200px]">
            <div data-gradient-orb data-hero-glow aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_closest-side,#74D3CEB3_0%,#74D3CE80_55%,#D1F4F2B3_78%,#D1F4F200_100%)]" />
            <div data-hero-phone className="relative z-0 -rotate-[4deg] md:-rotate-[6deg]"><PhoneMockup screen="home" className="[--phone-scale:.64] md:[--phone-scale:.63] lg:[--phone-scale:.69] xl:[--phone-scale:.77]" /></div>
            <div data-layer-float className="pointer-events-none absolute right-0 top-[56%] z-20 md:top-[52%]" aria-hidden="true">
              <div data-layer-card className="w-[172px] rotate-[4deg] rounded-[18px] border border-white/20 bg-eline-deep p-4 text-white shadow-[0_18px_35px_-12px_rgba(0,75,72,0.4)] lg:w-[210px] lg:p-5">
                <div className="flex items-center justify-between gap-3"><Image src="/radar.webp" alt="" width={76} height={46} className="h-[42px] w-[70px] object-contain" /><span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-eline-mint"><span className="h-1.5 w-1.5 rounded-full bg-eline-accent" />Online</span></div>
                <strong className="mt-3 block text-sm font-extrabold lg:text-base">Eline Radar</strong>
                <span className="mt-1 block text-[11px] text-eline-mint">Living room</span>
              </div>
            </div>
          </div>
          <figcaption className="text-center text-[10px] text-eline-muted">Home dashboard · example data</figcaption>
        </figure>
      </div>
    </section>
  );
}
