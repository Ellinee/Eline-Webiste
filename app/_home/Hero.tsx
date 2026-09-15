import { ArrowDown, GooglePlayLogo } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { PhoneMockup } from "./PhoneMockup";

export function Hero({ playStoreUrl }: { playStoreUrl: string }) {
  return (
    <section data-hero className="relative isolate bg-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 top-[38%] -z-10 overflow-hidden opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_72%,transparent)] md:top-0 md:opacity-75">
        <div data-landscape-distance className="absolute inset-x-0 -bottom-[10%] -top-[6%]">
          <Image src="/eline-highlands.webp" alt="" fill priority sizes="100vw" className="object-cover object-[65%_center]" />
        </div>
        <div data-landscape-foreground className="absolute inset-x-0 -bottom-[10%] -top-[6%] bg-white/40 [mask-image:linear-gradient(to_bottom,transparent_58%,black_82%)]" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-white via-white/95 via-40% to-white/10 md:block" />
      </div>
      <div className="relative mx-auto grid w-[calc(100%-40px)] max-w-[1256px] items-center gap-10 py-12 md:min-h-[calc(100svh-84px)] md:w-[calc(100%-72px)] md:grid-cols-[1.12fr_.88fr] md:gap-6 xl:w-[calc(100%-112px)] xl:gap-8">
        <div className="relative z-10 text-center md:pb-4 md:text-left">
          <h1 className="text-[clamp(51px,12.5vw,78px)] font-extrabold leading-[1.025] tracking-[-.065em] md:text-[clamp(52px,6.6vw,96px)]" data-hero-reveal>Feel closer to<br />those who<br /><span className="text-[#278477]">matter most.</span></h1>
          <p className="mx-auto mt-7 max-w-[455px] text-base leading-[1.75] text-eline-muted md:mx-0 md:text-[17px]" data-hero-reveal>Check in on home. Know what needs attention.<br className="hidden lg:block" /> Care together, even when you’re apart.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 md:justify-start md:gap-7" data-hero-reveal>
            <Link href={playStoreUrl || "/download"} className="inline-flex min-h-[58px] items-center justify-center gap-3 rounded-xl bg-eline-deep px-5 py-3 text-white transition-colors hover:bg-[#17665E]" aria-label="Get Eline on Google Play"><GooglePlayLogo size={30} weight="fill" aria-hidden="true" /><span className="text-left"><span className="block text-[10px] uppercase leading-3 tracking-[.08em]">Get it on</span><span className="block text-xl font-extrabold leading-6">Google Play</span></span></Link>
            <a href="#features" className="inline-flex min-h-11 items-center gap-2.5 text-[13px] font-extrabold underline-offset-4 hover:underline md:text-sm">Explore the app <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
        </div>
        <figure className="flex min-w-0 flex-col items-center justify-center gap-6 pt-3">
          <div className="relative grid w-full place-items-center py-5 [perspective:1200px]">
            <div data-hero-phone className="relative -rotate-[4deg] md:-rotate-[6deg]"><PhoneMockup screen="home" className="[--phone-scale:.64] md:[--phone-scale:.63] lg:[--phone-scale:.69] xl:[--phone-scale:.77]" /></div>
          </div>
        </figure>
      </div>
    </section>
  );
}
