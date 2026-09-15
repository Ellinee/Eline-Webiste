"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Features } from "./Features";
import { Hero } from "./Hero";
import { PreviewProcess } from "./PreviewProcess";

export default function HomePage({ playStoreUrl }: { playStoreUrl: string }) {
  const pageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from("[data-hero-reveal]", { y: 22, duration: 0.5, stagger: 0.045, ease: "power3.out" });
      gsap.utils.toArray<HTMLElement>("[data-reveal]", pageRef.current).forEach((section) => {
        gsap.from(section, { y: 32, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: section, start: "top 92%", once: true } });
      });
    }, pageRef);
    media.add({ desktop: "(min-width: 960px)", mobile: "(max-width: 959px)", motion: "(prefers-reduced-motion: no-preference)" }, (context) => {
      if (!context.conditions?.motion) return;
      const distance = context.conditions.desktop ? 1 : 0.4;
      gsap.timeline({ defaults: { ease: "none", duration: 1 }, scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: 0.7 } })
        .to("[data-landscape-distance]", { y: -16 * distance }, 0)
        .to("[data-landscape-foreground]", { y: -34 * distance }, 0)
        .to("[data-hero-phone]", { y: -24 * distance, rotate: -2 }, 0);
    }, pageRef);
    return () => media.revert();
  }, []);

  return (
    <main id="main-content" tabIndex={-1} ref={pageRef}>
      <Hero playStoreUrl={playStoreUrl} />
      <Features />
      <PreviewProcess />
    </main>
  );
}
