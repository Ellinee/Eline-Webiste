import { motion } from "framer-motion";
import { mockups, releaseUrl, steps } from "./home-content";
import { fadeUp } from "./home-motion";
import { PhoneMockup } from "./PhoneMockup";

export function PreviewProcess() {
  return (
    <>
      <section id="preview" className="p-3 py-20 sm:p-4 sm:py-20">
        <div className="relative overflow-hidden rounded-[2.75rem] border border-white/80 bg-[radial-gradient(circle_at_12%_18%,rgba(255,212,194,0.86),transparent_24rem),radial-gradient(circle_at_86%_12%,rgba(168,216,194,0.42),transparent_28rem),radial-gradient(circle_at_74%_92%,rgba(217,85,69,0.16),transparent_26rem),linear-gradient(135deg,#FFFDFC_0%,#F6F1EC_48%,#FFE7E2_100%)] p-5 text-eline-text shadow-[0_34px_110px_rgba(23,32,42,0.14)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-28 -top-28 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(217,85,69,0.25),rgba(255,212,194,0.2)_45%,transparent_70%)]" />
          <div className="pointer-events-none absolute -bottom-28 left-[18%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(168,216,194,0.34),transparent_68%)]" />
          <div className="relative z-10 grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.6 }} variants={fadeUp}>
              <p className="mb-4 text-[13px] font-black uppercase tracking-[0.16em] text-eline-coral">Mobile preview</p>
              <h2 className="text-[clamp(2.5rem,5.5vw,5.7rem)] font-black leading-[0.9] tracking-[-0.085em] text-eline-text">Mockups that feel like a real product story.</h2>
              <p className="mt-6 max-w-lg text-[16px] font-semibold leading-8 text-eline-muted">
                Screenshots are arranged as a contained editorial showcase with gradient depth, soft surfaces, and motion-ready cards.
              </p>
              <a className="mt-8 inline-flex min-h-14 items-center justify-center rounded-full bg-eline-text px-6 text-[15px] font-black text-white transition hover:-translate-y-1 hover:bg-eline-coral" href={releaseUrl} target="_blank" rel="noreferrer">View GitHub release</a>
            </motion.div>

            <div className="relative min-h-[690px] overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_50%_30%,rgba(217,85,69,0.16),transparent_23rem),radial-gradient(circle_at_80%_20%,rgba(168,216,194,0.22),transparent_20rem),rgba(255,255,255,0.38)] p-4">
              <div className="absolute inset-x-0 top-1/2 h-px bg-eline-line/70" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-eline-line/70" />
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
            <motion.div className="flex w-max" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, ease: "linear", repeat: Infinity }}>
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
            <p className="mb-4 text-[13px] font-black uppercase tracking-[0.16em] text-eline-coral">How it works</p>
            <h2 className="text-[clamp(2.5rem,5vw,5.3rem)] font-black leading-[0.9] tracking-[-0.085em] text-eline-text">Pair DoraBot once, then monitor calmly.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map(([number, title, text], index) => (
              <motion.article key={title} className="relative overflow-hidden rounded-[2rem] border border-eline-line bg-white p-7 shadow-[0_20px_70px_rgba(23,32,42,0.08)]" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.55, delay: index * 0.08 }} variants={fadeUp}>
                <span className="text-[5rem] font-black leading-none tracking-[-0.12em] text-eline-soft">{number}</span>
                <h3 className="mt-8 text-[2rem] font-black leading-none tracking-[-0.07em] text-eline-text">{title}</h3>
                <p className="mt-4 text-[15px] font-semibold leading-7 text-eline-muted">{text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
