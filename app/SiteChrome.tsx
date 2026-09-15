"use client";

import { ArrowRight, List, X } from "@phosphor-icons/react";
import { MotionConfig } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

function MobileNavigation() {
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) menuRef.current.open = false;
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuRef.current?.open) {
        menuRef.current.open = false;
        menuRef.current.querySelector("summary")?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches && menuRef.current) {
        const hadFocus = menuRef.current.contains(document.activeElement);
        menuRef.current.open = false;
        if (hadFocus) document.querySelector<HTMLAnchorElement>('[data-desktop-navigation] a')?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, []);

  return (
    <details ref={menuRef} className="group shrink-0 md:hidden" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false;
    }}>
      <summary aria-label="Navigation menu" className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-xl text-eline-deep transition-colors hover:bg-eline-mint/60 group-open:bg-eline-mint/60 [&::-webkit-details-marker]:hidden">
        <List size={26} aria-hidden="true" className="group-open:hidden" />
        <X size={24} aria-hidden="true" className="hidden group-open:block" />
      </summary>
      <nav aria-label="Mobile navigation" className="absolute inset-x-0 top-full max-h-[calc(100dvh-73px)] overflow-y-auto rounded-b-[24px] border-b border-eline-line bg-eline-base px-5 pb-4 pt-1 shadow-[0_20px_24px_-24px_rgba(0,75,72,0.3)]" onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = (event.target as Element).closest<HTMLAnchorElement>("a");
        if (!link || !menuRef.current) return;
        menuRef.current.open = false;
        const target = link.pathname === window.location.pathname ? document.querySelector<HTMLElement>(link.hash) : null;
        if (target) {
          target.focus({ preventScroll: true });
          if (link.href === window.location.href) target.scrollIntoView({ behavior: "instant", block: "start" });
        } else menuRef.current.querySelector("summary")?.focus();
      }}>
        {[["The app", "/#features"], ["Our devices", "/#devices"], ["How it works", "/#how-it-works"]].map(([label, href]) => <Link key={href} href={href} className="flex min-h-14 items-center border-t border-eline-line py-3 text-lg font-semibold leading-6 tracking-[-.01em] text-eline-deep transition-colors hover:text-eline-teal">{label}</Link>)}
      </nav>
    </details>
  );
}

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDownload = pathname === "/download";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    if (isDownload) {
      const main = document.getElementById("main-content");
      if (!main) return;
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const photo = main.querySelector("[data-download-photo]");
        const mist = main.querySelector("[data-download-mist]");
        const phone = main.querySelector("[data-download-phone]");
        gsap.from(main.querySelectorAll("[data-download-enter]"), { y: 16, duration: 0.5, stagger: 0.04, ease: "power3.out" });
        const photoX = gsap.quickTo(photo, "x", { duration: 0.9, ease: "power2.out" });
        const phoneX = gsap.quickTo(phone, "x", { duration: 0.6, ease: "power2.out" });
        const phoneTilt = gsap.quickTo(phone, "rotationY", { duration: 0.6, ease: "power2.out" });
        const move = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          const x = (event.clientX / main.clientWidth - 0.5) * 2;
          photoX(x * -10);
          phoneX(x * 6);
          phoneTilt(x * 2);
        };
        const reset = () => { photoX(0); phoneX(0); phoneTilt(0); };
        const scroll = () => {
          const range = main.scrollHeight - main.clientHeight;
          const progress = range > 0 ? Math.min(1, Math.max(0, main.scrollTop / range)) : 0;
          gsap.set(photo, { y: -12 * progress });
          gsap.set(mist, { y: -24 * progress });
          gsap.set(phone, { y: -18 * progress });
        };
        scroll();
        main.addEventListener("pointermove", move, { passive: true });
        main.addEventListener("pointerleave", reset);
        main.addEventListener("scroll", scroll, { passive: true });
        window.addEventListener("resize", scroll);
        return () => {
          main.removeEventListener("pointermove", move);
          main.removeEventListener("pointerleave", reset);
          main.removeEventListener("scroll", scroll);
          window.removeEventListener("resize", scroll);
          gsap.set([photo, mist, phone], { clearProps: "transform" });
        };
      }, main);
      return () => media.revert();
    }
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
        <div className="mx-auto flex min-h-[72px] w-[calc(100%-40px)] max-w-[1256px] items-center justify-between gap-3 py-3 md:min-h-[84px] md:w-[calc(100%-72px)] md:gap-6 md:py-0 xl:w-[calc(100%-112px)]">
          <Link href="/" aria-label="Eline home" className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-[28px] font-extrabold leading-none tracking-[-.075em] text-eline-deep md:gap-[7px] md:text-[32px]">
            <Image src="/eline-mark.png" width={35} height={39} alt="" priority className="h-[34px] w-[30px] object-contain md:h-[39px] md:w-[35px]" />
            <span>eline<span className="text-[#CCAD00]">.</span></span>
          </Link>
          <nav data-desktop-navigation aria-label="Main navigation" className="hidden justify-center gap-8 text-[13px] font-semibold [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:underline-offset-4 hover:[&_a]:underline md:flex lg:ml-12"><Link href="/#features">The app</Link><Link href="/#devices">Our devices</Link><Link href="/#how-it-works">How it works</Link></nav>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/download" className="hidden min-h-11 items-center justify-center gap-2.5 rounded-full bg-eline-deep px-4 py-3 text-xs font-extrabold text-white transition-colors hover:bg-[#17665E] md:inline-flex md:gap-6 md:px-[21px] md:text-[13px]">Get Eline <ArrowRight size={16} aria-hidden="true" className="md:h-[17px] md:w-[17px]" /></Link>
            <MobileNavigation key={pathname} />
          </div>
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
