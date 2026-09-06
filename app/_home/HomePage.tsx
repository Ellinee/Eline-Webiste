"use client";

import gsap from "gsap";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { DownloadFooter } from "./DownloadFooter";
import { Features } from "./Features";
import { Hero } from "./Hero";
import { PreviewProcess } from "./PreviewProcess";

export default function HomePage() {
  const pageRef = useRef<HTMLElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, -88]);
  const heroRotate = useTransform(scrollYProgress, [0, 0.4], [0, -4]);
  const glowScale = useTransform(scrollYProgress, [0, 0.7], [1, 1.32]);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        ".gsap-pulse",
        { scale: 0.94, opacity: 0.42 },
        { scale: 1.12, opacity: 0.72, duration: 2.7, ease: "sine.inOut", yoyo: true, repeat: -1 },
      );
      gsap.fromTo(".gsap-orbit", { rotate: 0 }, { rotate: 360, duration: 36, ease: "none", repeat: -1 });

      if (marqueeRef.current) {
        gsap.to(marqueeRef.current, { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
      }
    }, pageRef);

    return () => context.revert();
  }, []);

  return (
    <main ref={pageRef} className="overflow-x-hidden bg-[#FDF8F5] text-eline-text">
      <motion.div className="fixed left-0 top-0 z-[90] h-1 w-full origin-left bg-gradient-to-r from-eline-coral via-[#FFD4C2] to-eline-mint" style={{ scaleX: progress }} />
      <Hero glowScale={glowScale} heroRotate={heroRotate} heroY={heroY} marqueeRef={marqueeRef} />
      <Features />
      <PreviewProcess />
      <DownloadFooter />
    </main>
  );
}
