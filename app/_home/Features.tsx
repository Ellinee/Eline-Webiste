import { motion } from "framer-motion";
import Image from "next/image";
import { features, pillars } from "./home-content";
import { fadeUp } from "./home-motion";
import { MiniIcon } from "./MiniIcon";

export function Features() {
  return (
    <>
      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.6 }} variants={fadeUp}>
            <p className="text-[13px] font-black uppercase tracking-[0.18em] text-eline-coral">Core operating system</p>
            <h2 className="max-w-4xl text-[clamp(2.5rem,6vw,5.8rem)] font-black leading-[0.9] tracking-[-0.085em] text-eline-text">
              DoraBot and DoraShield keep the home calm.
            </h2>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map((pillar, index) => (
              <motion.article key={pillar.title} className="relative min-h-[390px] overflow-hidden rounded-[2rem] border border-eline-line bg-white p-7 shadow-[0_20px_70px_rgba(23,32,42,0.08)] transition hover:-translate-y-1" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.55, delay: index * 0.08 }} variants={fadeUp}>
                <div className="flex items-center justify-between gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-eline-soft text-eline-coral shadow-inner">
                    <MiniIcon type={(["shield", "device", "care"] as const)[index]} />
                  </span>
                  <span className="rounded-full bg-eline-soft px-4 py-2 text-[12px] font-black uppercase tracking-[0.16em] text-eline-coral">{pillar.eyebrow}</span>
                </div>
                <h3 className="mt-8 text-[2rem] font-black leading-none tracking-[-0.07em] text-eline-text">{pillar.title}</h3>
                <p className="mt-4 text-[15px] font-semibold leading-7 text-eline-muted">{pillar.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.article className="relative overflow-hidden p-7 md:p-10" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.62 }} variants={fadeUp}>
            <div className="relative z-10 max-w-3xl">
              <p className="mb-4 text-[13px] font-black uppercase tracking-[0.16em] text-eline-coral">Family-grade clarity</p>
              <h2 className="max-w-2xl text-[clamp(2.2rem,5vw,5rem)] font-black leading-[0.92] tracking-[-0.08em] text-eline-text">A dashboard that feels calm even when the moment is urgent.</h2>
              <p className="mt-5 max-w-xl text-[16px] font-semibold leading-8 text-eline-muted">
                Coral highlights DoraShield urgency, warm surfaces reduce anxiety, and every DoraBot or DoraShield status stays easy to understand.
              </p>
            </div>
          </motion.article>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[
              ["DoraShield priority", "Fall and safety moments are treated as first-class signals, not buried notifications."],
              ["DoraBot follow-ups", "Build check-ins, voice prompts, and family follow-ups around DoraBot routines."],
            ].map(([title, text], index) => (
              <motion.article key={title} className={`${index === 0 ? "bg-eline-soft text-eline-text" : "bg-white text-eline-text"} rounded-[2rem] border border-eline-line p-7 shadow-[0_22px_70px_rgba(23,32,42,0.08)]`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.55, delay: index * 0.08 }} variants={fadeUp}>
                <h3 className="text-[2rem] font-black leading-none tracking-[-0.07em]">{title}</h3>
                <p className="mt-4 text-[15px] font-semibold leading-7 text-eline-muted">{text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.article key={feature.title} className="group overflow-hidden rounded-[2rem] border border-eline-line bg-white p-4 shadow-[0_20px_70px_rgba(23,32,42,0.08)]" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.55, delay: index * 0.08 }} variants={fadeUp}>
              <div className="grid min-h-[260px] place-items-center rounded-[1.5rem] bg-gradient-to-br from-eline-warm to-eline-soft transition group-hover:scale-[0.98]">
                <Image src={feature.image} alt="" width={270} height={230} className="max-w-full transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-4">
                <h3 className="text-[1.85rem] font-black leading-[0.98] tracking-[-0.07em] text-eline-text">{feature.title}</h3>
                <p className="mt-4 text-[15px] font-semibold leading-7 text-eline-muted">{feature.text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </>
  );
}
