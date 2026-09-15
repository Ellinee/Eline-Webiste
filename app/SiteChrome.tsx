"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { MotionConfig } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDownload = pathname === "/download";

  useEffect(() => {
    if (isDownload) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
      const lenis = new Lenis({ autoRaf: false, anchors: true, duration: 1.05, syncTouch: false });
      const tick = (time: number) => lenis.raf(time * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      return () => {
        gsap.ticker.remove(tick);
        lenis.off("scroll", ScrollTrigger.update);
        lenis.destroy();
        gsap.ticker.lagSmoothing(500, 33);
      };
    });
    return () => media.revert();
  }, [pathname, isDownload]);

  if (isDownload) return <MotionConfig reducedMotion="user">{children}</MotionConfig>;

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.25 }}>
      <a className="fixed left-3 top-3 z-50 -translate-y-[160%] rounded-lg bg-eline-deep p-4 text-white focus:translate-y-0" href="#main-content" data-lenis-prevent>Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-eline-text/[.07] bg-eline-base/95">
        <div className="mx-auto flex min-h-[84px] w-[calc(100%-40px)] max-w-[1256px] flex-wrap items-center justify-between gap-3 py-3 md:w-[calc(100%-72px)] md:flex-nowrap md:gap-6 md:py-0 xl:w-[calc(100%-112px)]">
          <Link href="/" aria-label="Eline home" className="inline-flex items-center gap-[7px] text-[32px] font-extrabold leading-none tracking-[-.075em] text-eline-deep">
            <Image src="/eline-mark.png" width={35} height={39} alt="" priority className="h-[39px] w-[35px] object-contain" />
            <span>eline<span className="text-[#CCAD00]">.</span></span>
          </Link>
          <nav aria-label="Main navigation" className="order-3 flex basis-full justify-center gap-7 border-t border-eline-line pt-1 text-[13px] font-semibold [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:underline-offset-4 hover:[&_a]:underline md:order-none md:basis-auto md:gap-8 md:border-0 md:pt-0 lg:ml-12"><Link href="/#features">The app</Link><Link href="/#devices">Our devices</Link><Link href="/#how-it-works">How it works</Link></nav>
          <Link href="/download" className="inline-flex min-h-11 items-center justify-center gap-6 rounded-full bg-eline-deep px-[21px] py-3 text-[13px] font-extrabold text-white transition-colors hover:bg-[#17665E]">Get Eline <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </header>
      {children}
      <footer className="mx-auto w-[calc(100%-40px)] max-w-[1256px] pb-[25px] pt-10 md:w-[calc(100%-72px)] xl:w-[calc(100%-112px)]">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center md:gap-6">
          <Link href="/" className="inline-flex items-center gap-[7px] text-[32px] font-extrabold leading-none tracking-[-.075em] text-eline-deep" aria-label="Eline home"><Image src="/eline-mark.png" width={35} height={39} alt="" className="h-[39px] w-[35px] object-contain" /><span>eline<span className="text-[#CCAD00]">.</span></span></Link>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs font-semibold [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:gap-1.5 [&_a]:underline-offset-4 hover:[&_a]:underline" aria-label="Footer navigation"><Link href="/privacy">Privacy Policy</Link><Link href="/account-deletion">Delete account</Link></nav>
        </div>
        <div className="mt-[25px] flex flex-col justify-between gap-2.5 border-t border-eline-line pt-[22px] text-[10px] leading-[1.7] text-eline-muted md:flex-row md:gap-5 md:text-[11px]"><span>© {new Date().getFullYear()} Eline</span><p className="max-w-[520px]">Eline supports family care. It is not an emergency service or a medical device.</p></div>
      </footer>
    </MotionConfig>
  );
}
