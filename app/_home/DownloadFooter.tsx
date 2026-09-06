import { motion } from "framer-motion";
import Image from "next/image";
import { downloadUrl } from "./home-content";

export function DownloadFooter() {
  return (
    <>
      <section id="download" className="px-4 py-20 sm:px-6 lg:px-8">
        <motion.div className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[2.75rem] bg-[radial-gradient(circle_at_90%_10%,rgba(168,216,194,0.5),transparent_18rem),linear-gradient(135deg,#D95545,#A73329)] p-7 text-white shadow-[0_34px_120px_rgba(217,85,69,0.28)] md:p-12 lg:grid-cols-[1fr_auto] lg:items-center" initial={{ opacity: 0, y: 40, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.45 }} transition={{ duration: 0.65 }}>
          <div className="max-w-3xl">
            <p className="mb-4 text-[13px] font-black uppercase tracking-[0.16em] text-white/78">Latest APK</p>
            <h2 className="text-[clamp(2.6rem,5.6vw,5.9rem)] font-black leading-[0.9] tracking-[-0.085em]">Download the newest Eline Android build.</h2>
            <p className="mt-6 max-w-2xl text-[16px] font-semibold leading-8 text-white/78">
              The download button resolves the newest APK asset from GitHub Releases and falls back to the latest known build if the GitHub API is unavailable.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <a className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-white px-7 text-[15px] font-black text-eline-text transition hover:-translate-y-1" href={downloadUrl}>
              Download latest APK
            </a>
            <span className="text-[13px] font-semibold text-white/72">Latest GitHub release asset</span>
          </div>
        </motion.div>
      </section>

      <footer className="flex flex-col items-start justify-between gap-5 px-4 pb-12 pt-2 text-[13px] font-bold text-eline-muted sm:px-6 md:flex-row md:items-center lg:px-8">
        <div className="inline-flex items-center gap-3">
          <Image src="/brand/eline_logo_nobg.png" alt="" width={40} height={40} className="rounded-2xl" />
          <span className="grid gap-0.5">
            <strong className="text-eline-text">Eline</strong>
            <small className="text-[12px] font-bold text-eline-muted">Built for calmer care.</small>
          </span>
        </div>
        <div className="flex flex-wrap gap-4">
          <a href="/privacy" className="hover:text-eline-coral">Privacy Policy</a>
          <a href="/account-deletion" className="hover:text-eline-coral">Account Deletion</a>
          <span>© {new Date().getFullYear()} Eline. Elderly care, made calmer.</span>
        </div>
      </footer>
    </>
  );
}
