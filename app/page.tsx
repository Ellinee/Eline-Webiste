"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import { MiniIcon, PhoneMockup } from "@/components/common";
import {
  downloadUrl,
  fadeUp,
  features,
  heroChecks,
  heroStats,
  marqueeItems,
  mockups,
  pillars,
  releaseUrl,
  steps,
  structuredData,
} from "@/constants/data";

export default function Home() {
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
        ".gsap-float",
        { y: -10, rotate: -1 },
        { y: 14, rotate: 1.2, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.16 },
      );

      gsap.fromTo(
        ".gsap-pulse",
        { scale: 0.94, opacity: 0.42 },
        { scale: 1.12, opacity: 0.72, duration: 2.7, ease: "sine.inOut", yoyo: true, repeat: -1 },
      );

      gsap.fromTo(
        ".gsap-orbit",
        { rotate: 0 },
        { rotate: 360, duration: 36, ease: "none", repeat: -1 },
      );

      if (marqueeRef.current) {
        gsap.to(marqueeRef.current, {
          xPercent: -50,
          duration: 30,
          ease: "none",
          repeat: -1,
        });
      }
    }, pageRef);

    return () => context.revert();
  }, []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main ref={pageRef} className="overflow-x-hidden bg-[#FDF8F5] text-eldora-text">
        <motion.div className="fixed left-0 top-0 z-[90] h-1 w-full origin-left bg-gradient-to-r from-eldora-coral via-[#FFD4C2] to-eldora-mint" style={{ scaleX: progress }} />

        <section id="home" className="relative h-screen min-h-[760px] overflow-hidden bg-[#FDF8F5] p-3 sm:p-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,212,194,0.82),transparent_24rem),radial-gradient(circle_at_92%_10%,rgba(168,216,194,0.42),transparent_28rem),radial-gradient(circle_at_70%_92%,rgba(217,85,69,0.16),transparent_26rem)]" />
          <div className="absolute inset-0 opacity-[0.1] [background-image:linear-gradient(#D95545_1px,transparent_1px),linear-gradient(90deg,#D95545_1px,transparent_1px)] [background-size:54px_54px]" />

          <div className="relative h-full overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,#FFFDFC_0%,#F6F1EC_48%,#FFE7E2_100%)] shadow-[0_34px_110px_rgba(23,32,42,0.16)] sm:rounded-[2.75rem]">
            <motion.div className="pointer-events-none absolute -right-28 -top-28 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(217,85,69,0.28),rgba(255,212,194,0.22)_45%,transparent_70%)]" style={{ scale: glowScale }} />
            <div className="pointer-events-none absolute -bottom-32 left-[22%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(168,216,194,0.35),transparent_68%)] blur-sm" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.7),transparent_30%,rgba(217,85,69,0.08)_62%,rgba(168,216,194,0.12))]" />
            <div className="pointer-events-none absolute inset-x-8 top-[46%] h-px bg-eldora-line/70" />
            <div className="pointer-events-none absolute bottom-8 top-8 hidden w-px bg-eldora-line/70 lg:left-[48%] lg:block" />

            <nav className="absolute inset-x-0 top-0 z-40 flex items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
              <a className="inline-flex items-center gap-3" href="#home" aria-label="Eldora home">
                <Image src="/brand/eldora_logo_nobg.png" alt="Eldora logo" width={44} height={44} />
                <span className="hidden gap-0.5 sm:grid">
                  <strong className="text-[18px] leading-none tracking-[-0.04em] text-eldora-text">Eldora</strong>
                  <small className="text-[11px] font-bold text-eldora-muted">Elderly care, made calmer</small>
                </span>
              </a>
              <div className="hidden items-center gap-1 rounded-full border border-white/70 bg-white/55 p-1 backdrop-blur-xl md:flex">
                {[
                  ["Features", "#features"],
                  ["Preview", "#preview"],
                  ["Flow", "#how"],
                ].map(([label, href]) => (
                  <a key={label} className="rounded-full px-4 py-2 text-[13px] font-extrabold text-eldora-muted transition hover:bg-white hover:text-eldora-coral" href={href}>
                    {label}
                  </a>
                ))}
              </div>
              <a className="rounded-full bg-eldora-text px-5 py-3 text-[13px] font-black text-white shadow-[0_18px_42px_rgba(23,32,42,0.2)] transition hover:-translate-y-0.5 hover:bg-eldora-coral" href={downloadUrl}>
                Download APK
              </a>
            </nav>

            <div className="grid h-full grid-rows-[1fr_auto] px-5 pb-5 pt-24 sm:px-8 lg:px-10 lg:pt-28">
              <div className="grid min-h-0 items-center gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                <motion.div className="relative z-20 max-w-[760px]" initial="hidden" animate="visible" transition={{ staggerChildren: 0.1 }}>
                  <motion.h1 className="max-w-[720px] text-[clamp(3.4rem,9vw,8.4rem)] font-black leading-[0.82] tracking-[-0.105em] text-eldora-text" variants={fadeUp}>
                    Care that feels less heavy.
                  </motion.h1>
                  <motion.p className="mt-9 max-w-[610px] text-[clamp(1rem,1.55vw,1.18rem)] font-semibold leading-[1.8] text-eldora-muted" variants={fadeUp}>
                    Eldora turns safety alerts, DoraBot status, wellness summaries, and family follow-ups into a focused mobile command center for everyday caregiving.
                  </motion.p>
                  <motion.div className="mt-7 flex flex-wrap gap-3" variants={fadeUp}>
                    <a className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-eldora-coral px-7 text-[15px] font-black text-white shadow-[0_22px_50px_rgba(217,85,69,0.28)] transition hover:-translate-y-1" href={downloadUrl}>
                      Download latest APK
                    </a>
                    <a className="inline-flex min-h-14 items-center justify-center rounded-full border border-eldora-line bg-white/55 px-7 text-[15px] font-black text-eldora-text backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white" href="#preview">
                      View the experience
                    </a>
                  </motion.div>
                </motion.div>

                <motion.div className="relative z-10 hidden h-full min-h-[540px] lg:block" style={{ y: heroY, rotate: heroRotate }} aria-label="Eldora app previews">
                  <div className="gsap-pulse absolute left-1/2 top-1/2 h-[530px] w-[530px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-eldora-coral/10 bg-white/25" />
                  <div className="gsap-orbit absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-eldora-coral/18">
                    <span className="absolute -top-2 left-1/2 h-4 w-4 rounded-full bg-eldora-mint shadow-[0_0_28px_rgba(168,216,194,0.9)]" />
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
          <div className="overflow-hidden border-y border-eldora-line bg-white/70">
            <div className="flex w-max" ref={marqueeRef}>
              {marqueeItems.map((item, index) => (
                <span key={`${item}-${index}`} className="inline-flex min-h-[78px] items-center whitespace-nowrap px-8 text-[clamp(1.2rem,2.2vw,2rem)] font-black tracking-[-0.055em] text-eldora-text/72">
                  <span className="mr-8 inline-block h-3 w-3 rounded-full bg-eldora-coral" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.6 }} variants={fadeUp}>
              <p className="text-[13px] font-black uppercase tracking-[0.18em] text-eldora-coral">Core operating system</p>
              <h2 className="max-w-4xl text-[clamp(2.5rem,6vw,5.8rem)] font-black leading-[0.9] tracking-[-0.085em] text-eldora-text">
                DoraBot and DoraShield keep the home calm.
              </h2>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
              {pillars.map((pillar, index) => (
                <motion.article key={pillar.title} className="relative min-h-[390px] overflow-hidden rounded-[2rem] border border-eldora-line bg-white p-7 shadow-[0_20px_70px_rgba(23,32,42,0.08)] transition hover:-translate-y-1" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.55, delay: index * 0.08 }} variants={fadeUp}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-eldora-soft text-eldora-coral shadow-inner">
                      <MiniIcon type={(["shield", "device", "care"] as const)[index]} />
                    </span>
                    <span className="rounded-full bg-eldora-soft px-4 py-2 text-[12px] font-black uppercase tracking-[0.16em] text-eldora-coral">{pillar.eyebrow}</span>
                  </div>
                  <h3 className="mt-8 text-[2rem] font-black leading-none tracking-[-0.07em] text-eldora-text">{pillar.title}</h3>
                  <p className="mt-4 text-[15px] font-semibold leading-7 text-eldora-muted">{pillar.text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <motion.article className="relative overflow-hidden p-7 md:p-10" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.62 }} variants={fadeUp}>
              <div className="relative z-10 max-w-3xl">
                <p className="mb-4 text-[13px] font-black uppercase tracking-[0.16em] text-eldora-coral">Family-grade clarity</p>
                <h2 className="max-w-2xl text-[clamp(2.2rem,5vw,5rem)] font-black leading-[0.92] tracking-[-0.08em] text-eldora-text">A dashboard that feels calm even when the moment is urgent.</h2>
                <p className="mt-5 max-w-xl text-[16px] font-semibold leading-8 text-eldora-muted">
                  Coral highlights DoraShield urgency, warm surfaces reduce anxiety, and every DoraBot or DoraShield status stays easy to understand.
                </p>
              </div>
            </motion.article>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {[
                ["shield", "DoraShield priority", "Fall and safety moments are treated as first-class signals, not buried notifications."],
                ["scene", "DoraBot follow-ups", "Build check-ins, voice prompts, and family follow-ups around DoraBot routines."],
              ].map(([icon, title, text], index) => (
                <motion.article key={title} className={`${index === 0 ? "bg-eldora-soft text-eldora-text" : "bg-white text-eldora-text"} rounded-[2rem] border border-eldora-line p-7 shadow-[0_22px_70px_rgba(23,32,42,0.08)]`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.55, delay: index * 0.08 }} variants={fadeUp}>
                  <h3 className="text-[2rem] font-black leading-none tracking-[-0.07em]">{title}</h3>
                  <p className={`mt-4 text-[15px] font-semibold leading-7 ${index === 0 ? "text-eldora-muted" : "text-eldora-muted"}`}>{text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article key={feature.title} className="group overflow-hidden rounded-[2rem] border border-eldora-line bg-white p-4 shadow-[0_20px_70px_rgba(23,32,42,0.08)]" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.55, delay: index * 0.08 }} variants={fadeUp}>
                <div className="grid min-h-[260px] place-items-center rounded-[1.5rem] bg-gradient-to-br from-eldora-warm to-eldora-soft transition group-hover:scale-[0.98]">
                  <Image src={feature.image} alt="" width={270} height={230} className="max-w-full transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="text-[1.85rem] font-black leading-[0.98] tracking-[-0.07em] text-eldora-text">{feature.title}</h3>
                  <p className="mt-4 text-[15px] font-semibold leading-7 text-eldora-muted">{feature.text}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="preview" className="p-3 py-20 sm:p-4 sm:py-20">
          <div className="relative overflow-hidden rounded-[2.75rem] border border-white/80 bg-[radial-gradient(circle_at_12%_18%,rgba(255,212,194,0.86),transparent_24rem),radial-gradient(circle_at_86%_12%,rgba(168,216,194,0.42),transparent_28rem),radial-gradient(circle_at_74%_92%,rgba(217,85,69,0.16),transparent_26rem),linear-gradient(135deg,#FFFDFC_0%,#F6F1EC_48%,#FFE7E2_100%)] p-5 text-eldora-text shadow-[0_34px_110px_rgba(23,32,42,0.14)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-28 -top-28 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(217,85,69,0.25),rgba(255,212,194,0.2)_45%,transparent_70%)]" />
            <div className="pointer-events-none absolute -bottom-28 left-[18%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(168,216,194,0.34),transparent_68%)]" />
            <div className="relative z-10 grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.6 }} variants={fadeUp}>
                <p className="mb-4 text-[13px] font-black uppercase tracking-[0.16em] text-eldora-coral">Mobile preview</p>
                <h2 className="text-[clamp(2.5rem,5.5vw,5.7rem)] font-black leading-[0.9] tracking-[-0.085em] text-eldora-text">Mockups that feel like a real product story.</h2>
                <p className="mt-6 max-w-lg text-[16px] font-semibold leading-8 text-eldora-muted">
                  Screenshots are arranged as a contained editorial showcase with gradient depth, soft surfaces, and motion-ready cards.
                </p>
                <a className="mt-8 inline-flex min-h-14 items-center justify-center rounded-full bg-eldora-text px-6 text-[15px] font-black text-white transition hover:-translate-y-1 hover:bg-eldora-coral" href={releaseUrl} target="_blank" rel="noreferrer">View GitHub release</a>
              </motion.div>

              <div className="relative min-h-[690px] overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_50%_30%,rgba(217,85,69,0.16),transparent_23rem),radial-gradient(circle_at_80%_20%,rgba(168,216,194,0.22),transparent_20rem),rgba(255,255,255,0.38)] p-4">
                <div className="absolute inset-x-0 top-1/2 h-px bg-eldora-line/70" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-eldora-line/70" />
                <div className="absolute left-[10%] top-[12%] rotate-[-12deg]">
                  <PhoneMockup src={mockups[4].src} alt={mockups[4].alt} className="!w-[min(220px,38vw)] border-[7px] opacity-80" />
                </div>
                <div className="absolute right-[9%] top-[15%] rotate-[11deg]">
                  <PhoneMockup src={mockups[5].src} alt={mockups[5].alt} className="!w-[min(220px,38vw)] border-[7px] opacity-80" />
                </div>
                <div className="absolute left-1/2 top-[6%] z-20 -translate-x-1/2">
                  <PhoneMockup src={mockups[2].src} alt={mockups[2].alt} className="!w-[min(310px,62vw)]" />
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-5 overflow-hidden pb-2">
              <motion.div
                className="flex w-max"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 30, ease: "linear", repeat: Infinity }}
              >
                {[0, 1].map((group) => (
                  <div key={group} className="flex shrink-0 gap-4 pr-4">
                    {[...mockups, ...mockups].map((mockup, itemIndex) => (
                      <article key={`${mockup.src}-${group}-${itemIndex}`} className="w-[190px] shrink-0">
                        <PhoneMockup src={mockup.src} alt={mockup.alt} className="!w-full rounded-[1.7rem] border-[5px] !shadow-none" />
                      </article>
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section id="how" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-4 text-[13px] font-black uppercase tracking-[0.16em] text-eldora-coral">How it works</p>
              <h2 className="text-[clamp(2.5rem,5vw,5.3rem)] font-black leading-[0.9] tracking-[-0.085em] text-eldora-text">Pair DoraBot once, then monitor calmly.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map(([number, title, text], index) => (
                <motion.article key={title} className="relative overflow-hidden rounded-[2rem] border border-eldora-line bg-white p-7 shadow-[0_20px_70px_rgba(23,32,42,0.08)]" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.55, delay: index * 0.08 }} variants={fadeUp}>
                  <span className="text-[5rem] font-black leading-none tracking-[-0.12em] text-eldora-soft">{number}</span>
                  <h3 className="mt-8 text-[2rem] font-black leading-none tracking-[-0.07em] text-eldora-text">{title}</h3>
                  <p className="mt-4 text-[15px] font-semibold leading-7 text-eldora-muted">{text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="download" className="px-4 py-20 sm:px-6 lg:px-8">
          <motion.div className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[2.75rem] bg-[radial-gradient(circle_at_90%_10%,rgba(168,216,194,0.5),transparent_18rem),linear-gradient(135deg,#D95545,#A73329)] p-7 text-white shadow-[0_34px_120px_rgba(217,85,69,0.28)] md:p-12 lg:grid-cols-[1fr_auto] lg:items-center" initial={{ opacity: 0, y: 40, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.45 }} transition={{ duration: 0.65 }}>
            <div className="max-w-3xl">
              <p className="mb-4 text-[13px] font-black uppercase tracking-[0.16em] text-white/78">Latest APK</p>
              <h2 className="text-[clamp(2.6rem,5.6vw,5.9rem)] font-black leading-[0.9] tracking-[-0.085em]">Download the newest Eldora Android build.</h2>
              <p className="mt-6 max-w-2xl text-[16px] font-semibold leading-8 text-white/78">
                The download button resolves the newest APK asset from GitHub Releases and falls back to the latest known build if the GitHub API is unavailable.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <a className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-white px-7 text-[15px] font-black text-eldora-text transition hover:-translate-y-1" href={downloadUrl}>
                Download latest APK
              </a>
              <span className="text-[13px] font-semibold text-white/72">Latest GitHub release asset</span>
            </div>
          </motion.div>
        </section>

        <footer className="flex flex-col items-start justify-between gap-5 px-4 pb-12 pt-2 text-[13px] font-bold text-eldora-muted sm:px-6 md:flex-row md:items-center lg:px-8">
          <div className="inline-flex items-center gap-3">
            <Image src="/brand/eldora_logo_nobg.png" alt="" width={40} height={40} className="rounded-2xl" />
            <span className="grid gap-0.5">
              <strong className="text-eldora-text">Eldora</strong>
              <small className="text-[12px] font-bold text-eldora-muted">Built for calmer care.</small>
            </span>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="/privacy" className="hover:text-eldora-coral">Privacy Policy</a>
            <a href="/account-deletion" className="hover:text-eldora-coral">Account Deletion</a>
            <span>© {new Date().getFullYear()} Eldora. Elderly care, made calmer.</span>
          </div>
        </footer>
      </main>
    </>
  );
}
