"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { features } from "./home-content";
import { PhoneMockup, type PreviewScreen } from "./PhoneMockup";

const motionPreference = "(prefers-reduced-motion: reduce)";

function subscribeMotionPreference(onChange: () => void) {
  const query = window.matchMedia(motionPreference);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function PreviewLayer({ screen, reducedMotion }: { screen: PreviewScreen; reducedMotion: boolean }) {
  const present = useIsPresent();

  return (
    <motion.div className={`col-start-1 row-start-1 ${present ? "z-10" : "pointer-events-none z-0"}`} aria-hidden={!present} initial={{ opacity: 0, x: reducedMotion ? 0 : 18, y: reducedMotion ? 0 : 10, rotate: reducedMotion ? 0 : 2, scale: reducedMotion ? 1 : 0.96 }} animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }} exit={{ opacity: 0, x: reducedMotion ? 0 : -18, y: reducedMotion ? 0 : -8, rotate: reducedMotion ? 0 : -2, scale: reducedMotion ? 1 : 0.98 }} transition={{ duration: reducedMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}>
      <PhoneMockup screen={screen} className="[--phone-scale:.64] md:[--phone-scale:.66] lg:[--phone-scale:.72]" />
    </motion.div>
  );
}

export function Features() {
  const [active, setActive] = useState(0);
  const reducedMotion = useSyncExternalStore(subscribeMotionPreference, () => window.matchMedia(motionPreference).matches, () => true);
  const feature = features[active];

  return (
    <section id="features" className="bg-white py-16 md:py-20 xl:py-28">
      <div className="mx-auto w-[calc(100%-40px)] max-w-[1256px] md:w-[calc(100%-72px)] xl:w-[calc(100%-112px)]">
        <div className="mb-8 flex flex-col gap-5 md:mb-[52px] md:flex-row md:items-end md:justify-between md:gap-8" data-reveal>
          <div><p className="text-[11px] font-extrabold uppercase tracking-[.13em] text-[#28756C]">One app. A closer connection.</p><h2 className="mt-4 text-[clamp(38px,4.5vw,62px)] font-extrabold leading-[1.1] tracking-[-.05em]">Less wondering.<br /><span className="text-[#287E74]">More knowing.</span></h2></div>
          <p className="max-w-[410px] text-[15px] leading-[1.75] text-eline-muted md:max-w-[270px] md:pb-1 lg:max-w-[410px] lg:text-base">Home status, safety alerts, and connected devices.<br className="hidden lg:block" /> Everything in its right place.</p>
        </div>
        <div data-reveal>
          <div className="grid grid-cols-3 border-y border-eline-line" role="group" aria-label="Choose an app preview">
            {features.map((item, index) => <button key={item.id} type="button" className={`relative flex min-h-[55px] items-center justify-center gap-2 px-2 py-3.5 text-[13px] transition-colors hover:bg-eline-base [&+button]:border-l [&+button]:border-eline-line md:min-h-[70px] md:justify-start md:gap-3.5 md:px-5 md:py-5 md:text-[15px] xl:px-7 ${active === index ? "font-extrabold text-eline-deep after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:bg-eline-teal" : "font-semibold text-eline-muted"}`} aria-pressed={active === index} aria-controls="feature-preview" onClick={() => setActive(index)}><span className="text-[9px] opacity-80 md:text-[11px]" aria-hidden="true">{item.number}</span>{item.tab}<ArrowRight className="ml-auto hidden md:block" size={16} aria-hidden="true" /></button>)}
          </div>
          <div className="grid items-center gap-8 pt-7 md:grid-cols-2 md:gap-6 md:pt-[42px] lg:gap-11 xl:gap-[70px]" id="feature-preview">
            <div className="min-h-[226px] md:min-h-0 md:max-w-[410px]" aria-live="polite" aria-atomic="true">
              <p className="mb-[25px] hidden text-xs tracking-[.1em] text-[#477971] md:block">{feature.number} / 03</p>
              <h3 className="max-w-[340px] text-[31px] font-extrabold leading-[1.18] tracking-[-.045em] [text-wrap:balance] md:max-w-none md:text-[34px] lg:text-[37px] xl:text-[46px]">{feature.title}</h3>
              <p className="mt-3.5 text-sm leading-[1.85] text-eline-muted md:mt-[22px] md:text-[15px] lg:text-base">{feature.text}</p>
              <Link href="/privacy" className="mt-3 inline-flex min-h-11 items-center gap-2.5 text-[13px] font-extrabold underline-offset-4 hover:underline md:mt-[25px] md:text-sm">Your data, explained <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
            <figure className="relative isolate flex min-w-0 flex-col items-center gap-[18px] border-0 bg-transparent p-0 shadow-none md:gap-[22px]">
              <div data-gradient-orb aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_closest-side,#74D3CEB3_0%,#74D3CE80_55%,#D1F4F2B3_78%,#D1F4F200_100%)]" />
              <p className="text-[11px] font-semibold text-eline-muted md:text-xs">{feature.label}</p>
              <div className="grid [perspective:1200px]"><AnimatePresence key={String(reducedMotion)} initial={false} mode="sync"><PreviewLayer key={feature.id} screen={feature.id} reducedMotion={reducedMotion} /></AnimatePresence></div>
              <figcaption className="text-center text-[9px] text-eline-muted md:text-[10px]">Recreated from the Eline app · example data</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
