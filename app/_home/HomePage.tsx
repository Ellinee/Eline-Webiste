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
      gsap.from("[data-layer-card]", { x: 16, y: 18, duration: 0.65, ease: "power3.out" });
      gsap.utils.toArray<HTMLElement>("[data-reveal]", pageRef.current).forEach((section) => {
        gsap.from(section, { y: 32, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: section, start: "top 92%", once: true } });
      });
    }, pageRef);
    media.add("(min-width: 960px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: 0.8 } })
        .fromTo("[data-hero-glow]", { scale: 0.92 }, { scale: 1, y: -8 }, 0)
        .to("[data-hero-phone]", { y: -32, rotate: -2, rotateY: 5 }, 0)
        .to("[data-layer-float]", { y: -56, rotate: -3 }, 0);
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
