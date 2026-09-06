import type { MotionValue } from "framer-motion";
import { motion } from "framer-motion";
import Image from "next/image";
import type { RefObject } from "react";
import { downloadUrl, marqueeItems, mockups } from "./home-content";
import { fadeUp } from "./home-motion";
import { PhoneMockup } from "./PhoneMockup";

interface HeroProps {
  glowScale: MotionValue<number>;
  heroRotate: MotionValue<number>;
  heroY: MotionValue<number>;
  marqueeRef: RefObject<HTMLDivElement | null>;
}

export function Hero({ glowScale, heroRotate, heroY, marqueeRef }: HeroProps) {
  return (
    <>
      <section id="home" className="relative h-screen min-h-[760px] overflow-hidden bg-[#FDF8F5] p-3 sm:p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,212,194,0.82),transparent_24rem),radial-gradient(circle_at_92%_10%,rgba(168,216,194,0.42),transparent_28rem),radial-gradient(circle_at_70%_92%,rgba(217,85,69,0.16),transparent_26rem)]" />
        <div className="absolute inset-0 opacity-[0.1] [background-image:linear-gradient(#D95545_1px,transparent_1px),linear-gradient(90deg,#D95545_1px,transparent_1px)] [background-size:54px_54px]" />

        <div className="relative h-full overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,#FFFDFC_0%,#F6F1EC_48%,#FFE7E2_100%)] shadow-[0_34px_110px_rgba(23,32,42,0.16)] sm:rounded-[2.75rem]">
          <motion.div className="pointer-events-none absolute -right-28 -top-28 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(217,85,69,0.28),rgba(255,212,194,0.22)_45%,transparent_70%)]" style={{ scale: glowScale }} />
          <div className="pointer-events-none absolute -bottom-32 left-[22%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(168,216,194,0.35),transparent_68%)] blur-sm" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.7),transparent_30%,rgba(217,85,69,0.08)_62%,rgba(168,216,194,0.12))]" />
          <div className="pointer-events-none absolute inset-x-8 top-[46%] h-px bg-eline-line/70" />
          <div className="pointer-events-none absolute bottom-8 top-8 hidden w-px bg-eline-line/70 lg:left-[48%] lg:block" />

          <nav className="absolute inset-x-0 top-0 z-40 flex items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
            <a className="inline-flex items-center gap-3" href="#home" aria-label="Eline home">
              <Image src="/brand/eline_logo_nobg.png" alt="Eline logo" width={44} height={44} />
              <span className="hidden gap-0.5 sm:grid">
                <strong className="text-[18px] leading-none tracking-[-0.04em] text-eline-text">Eline</strong>
                <small className="text-[11px] font-bold text-eline-muted">Elderly care, made calmer</small>
              </span>
            </a>
            <div className="hidden items-center gap-1 rounded-full border border-white/70 bg-white/55 p-1 backdrop-blur-xl md:flex">
              {[
                ["Features", "#features"],
                ["Preview", "#preview"],
                ["Flow", "#how"],
              ].map(([label, href]) => (
                <a key={label} className="rounded-full px-4 py-2 text-[13px] font-extrabold text-eline-muted transition hover:bg-white hover:text-eline-coral" href={href}>
                  {label}
                </a>
              ))}
            </div>
            <a className="rounded-full bg-eline-text px-5 py-3 text-[13px] font-black text-white shadow-[0_18px_42px_rgba(23,32,42,0.2)] transition hover:-translate-y-0.5 hover:bg-eline-coral" href={downloadUrl}>
              Download APK
            </a>
          </nav>

          <div className="grid h-full grid-rows-[1fr_auto] px-5 pb-5 pt-24 sm:px-8 lg:px-10 lg:pt-28">
            <div className="grid min-h-0 items-center gap-6 lg:grid-cols-[0.92fr_1.08fr]">
              <motion.div className="relative z-20 max-w-[760px]" initial="hidden" animate="visible" transition={{ staggerChildren: 0.1 }}>
                <motion.h1 className="max-w-[720px] text-[clamp(3.4rem,9vw,8.4rem)] font-black leading-[0.82] tracking-[-0.105em] text-eline-text" variants={fadeUp}>
                  Care that feels less heavy.
                </motion.h1>
                <motion.p className="mt-9 max-w-[610px] text-[clamp(1rem,1.55vw,1.18rem)] font-semibold leading-[1.8] text-eline-muted" variants={fadeUp}>
                  Eline turns safety alerts, DoraBot status, wellness summaries, and family follow-ups into a focused mobile command center for everyday caregiving.
                </motion.p>
                <motion.div className="mt-7 flex flex-wrap gap-3" variants={fadeUp}>
                  <a className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-eline-coral px-7 text-[15px] font-black text-white shadow-[0_22px_50px_rgba(217,85,69,0.28)] transition hover:-translate-y-1" href={downloadUrl}>
                    Download latest APK
                  </a>
                  <a className="inline-flex min-h-14 items-center justify-center rounded-full border border-eline-line bg-white/55 px-7 text-[15px] font-black text-eline-text backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white" href="#preview">
                    View the experience
                  </a>
                </motion.div>
              </motion.div>

              <motion.div className="relative z-10 hidden h-full min-h-[540px] lg:block" style={{ y: heroY, rotate: heroRotate }} aria-label="Eline app previews">
                <div className="gsap-pulse absolute left-1/2 top-1/2 h-[530px] w-[530px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-eline-coral/10 bg-white/25" />
                <div className="gsap-orbit absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-eline-coral/18">
                  <span className="absolute -top-2 left-1/2 h-4 w-4 rounded-full bg-eline-mint shadow-[0_0_28px_rgba(168,216,194,0.9)]" />
                </div>

                <div className="absolute left-[3%] top-[41%] z-10 rotate-[-17deg] opacity-80 blur-[0.1px]">
                  <PhoneMockup src={mockups[3].src} alt={mockups[3].alt} className="!w-[230px] border-[7px]" />
                </div>
                <div className="absolute right-[6%] top-[21%] z-20 rotate-[14deg] opacity-95">
                  <PhoneMockup src={mockups[1].src} alt={mockups[1].alt} className="!w-[255px] border-[7px]" />
                </div>
                <div className="absolute left-1/2 top-[7%] z-30 -translate-x-1/2 rotate-[-2deg]">
                  <PhoneMockup src={mockups[0].src} alt={mockups[0].alt} className="!w-[330px]" />
                </div>
              </motion.div>

              <motion.div className="relative z-10 mx-auto block w-full max-w-[310px] lg:hidden" initial={{ opacity: 0, y: 34, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: -2 }} transition={{ duration: 0.72, delay: 0.25 }}>
                <PhoneMockup src={mockups[0].src} alt={mockups[0].alt} className="!w-full" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden py-8">
        <div className="overflow-hidden border-y border-eline-line bg-white/70">
          <div className="flex w-max" ref={marqueeRef}>
            {marqueeItems.map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex min-h-[78px] items-center whitespace-nowrap px-8 text-[clamp(1.2rem,2.2vw,2rem)] font-black tracking-[-0.055em] text-eline-text/72">
                <span className="mr-8 inline-block h-3 w-3 rounded-full bg-eline-coral" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
