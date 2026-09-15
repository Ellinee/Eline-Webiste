import { Check, House, Plus } from "@phosphor-icons/react";
import Image from "next/image";
import { steps } from "./home-content";

export function PreviewProcess() {
  return (
    <>
      <section id="devices" tabIndex={-1} className="bg-white py-16 md:py-20 xl:py-28">
        <div className="mx-auto w-[calc(100%-40px)] max-w-[1256px] md:w-[calc(100%-72px)] xl:w-[calc(100%-112px)]">
          <div className="mb-9 flex flex-col gap-5 md:mb-[52px] md:flex-row md:items-end md:justify-between md:gap-8" data-reveal>
            <div><p className="text-[11px] font-extrabold uppercase tracking-[.13em] text-[#28756C]">Meet the devices</p><h2 className="mt-4 text-[clamp(38px,4.5vw,62px)] font-extrabold leading-[1.1] tracking-[-.05em]">Care for the room.<br /><span className="text-[#287E74]">Care for the person.</span></h2></div>
            <p className="max-w-[330px] text-[15px] leading-[1.75] text-eline-muted lg:text-base">Two ways to support everyday care.<br />One place to stay connected.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            <article className="border-t border-eline-line pt-7" data-reveal><div className="relative isolate flex h-[210px] items-center justify-center"><div data-gradient-orb aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_closest-side,#74D3CE80_0%,#D1F4F2B3_60%,#D1F4F200_100%)]" /><Image src="/radar.webp" width={240} height={145} alt="Eline Radar contactless room-monitoring device" className="h-[125px] w-[210px] object-contain" /></div><p className="mt-3 text-[11px] font-extrabold uppercase tracking-[.12em] text-[#28756C]">Room monitoring</p><h3 className="mt-3 text-[32px] font-extrabold tracking-[-.04em]">Eline Radar</h3><p className="mt-3 max-w-[440px] text-[15px] leading-[1.85] text-eline-muted">Contactless monitoring with mmWave radar. Connect Radar to your home Wi-Fi, assign it to a room, and follow its status and safety alerts in Eline.</p></article>
            <article className="border-t border-eline-line pt-7" data-reveal><div className="relative isolate flex h-[210px] items-center justify-center"><div data-gradient-orb aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_closest-side,#74D3CE80_0%,#D1F4F2B3_60%,#D1F4F200_100%)]" /><Image src="/vest.webp" width={145} height={185} alt="Eline Vest wearable device" className="h-[170px] w-[135px] object-contain" /></div><p className="mt-3 text-[11px] font-extrabold uppercase tracking-[.12em] text-[#28756C]">Wearable care</p><h3 className="mt-3 text-[32px] font-extrabold tracking-[-.04em]">Eline Vest</h3><p className="mt-3 max-w-[440px] text-[15px] leading-[1.85] text-eline-muted">The wearable in the Eline family, designed to be worn by the person you care for. Explore the Vest setup guide from Add Device in the app.</p><p className="mt-4 max-w-[440px] text-xs leading-7 text-eline-muted"><strong className="font-extrabold text-eline-text">Setup guide available.</strong> Vest scanning and pairing are still in development.</p></article>
          </div>
        </div>
      </section>
      <section id="how-it-works" tabIndex={-1} className="border-y border-eline-line bg-white py-16 md:py-20 xl:py-28">
        <div className="mx-auto w-[calc(100%-40px)] max-w-[1256px] md:w-[calc(100%-72px)] xl:w-[calc(100%-112px)]">
          <div className="mb-8 flex flex-col gap-5 md:mb-[52px] md:flex-row md:items-end md:justify-between md:gap-8" data-reveal><div><p className="text-[11px] font-extrabold uppercase tracking-[.13em] text-[#28756C]">Getting started</p><h2 className="mt-4 text-[clamp(38px,4.5vw,62px)] font-extrabold leading-[1.1] tracking-[-.05em]">Make yourself<br /><span className="text-[#287E74]">at home.</span></h2></div><p className="text-[15px] leading-[1.75] text-eline-muted lg:text-base">Connect your home.<br />Then bring your family along.</p></div>
          <div className="grid gap-8 md:gap-5 lg:grid-cols-3 xl:gap-[26px]">
            {steps.map((step, index) => <article key={step.number} className="md:grid md:grid-cols-[.9fr_1.1fr] md:items-center md:gap-[30px] lg:block" data-reveal>
              <div className={`flex h-[190px] items-center justify-center rounded-[18px] px-4 py-[22px] md:h-[180px] lg:h-[198px] xl:px-[22px] ${index === 0 ? "bg-[#E5F3EE]" : index === 1 ? "bg-[#DAEEE9]" : "bg-[#ECF4ED]"}`} aria-hidden="true">
                {index === 0 ? <div className="flex w-full max-w-[285px] items-center gap-3 rounded-[14px] border border-[#D4E5DD] bg-white px-[15px] py-[18px] shadow-[0_5px_12px_rgb(0_75_72_/_3%)]"><House size={27} className="shrink-0 text-eline-teal" /><div className="flex-1"><strong className="text-[13px] font-extrabold">Family Home</strong><small className="mt-1 block text-[9px] text-eline-muted">Living room · Bedroom</small></div><Check size={18} weight="bold" className="shrink-0 text-[#287E74]" /></div> : index === 1 ? <div className="flex flex-col items-center gap-3"><div className="flex h-[86px] items-center gap-5"><Image src="/radar.webp" width={138} height={76} alt="" className="h-[66px] w-[108px] object-contain" /><Image src="/vest.webp" width={62} height={76} alt="" className="h-[76px] w-[62px] object-contain" /></div><span className="flex items-center gap-[7px] text-[11px] font-semibold">Radar & Vest</span></div> : <div className="flex w-full max-w-[260px] items-center justify-center [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-[9px] [&_small]:whitespace-nowrap [&_small]:text-[8px]"><div><span className="grid h-11 w-11 place-items-center rounded-full bg-eline-text text-[15px] font-extrabold text-white">A</span><small>Home Owner</small></div><i className="mx-1 -mt-[22px] h-px min-w-[6px] max-w-[26px] flex-1 bg-[#B3D2C6]" /><div><span className="grid h-11 w-11 place-items-center rounded-full bg-eline-text text-[15px] font-extrabold text-white">J</span><small>Administrator</small></div><i className="mx-1 -mt-[22px] h-px min-w-[6px] max-w-[26px] flex-1 bg-[#B3D2C6]" /><div><span className="grid h-11 w-11 place-items-center rounded-full border border-dashed border-eline-teal text-eline-teal"><Plus size={23} /></span><small>Invite</small></div></div>}
              </div>
              <div className="flex items-start gap-3.5 pt-5 md:pt-0 lg:pt-6"><span className="pt-1.5 text-[11px] font-extrabold text-[#357D71]">{step.number}</span><div><h3 className="mb-3 text-[22px] font-extrabold leading-[1.3] tracking-[-.03em] lg:text-[21px]">{step.title}</h3><p className="text-sm leading-[1.8] text-eline-muted">{step.text}</p></div></div>
            </article>)}
          </div>
        </div>
      </section>
    </>
  );
}
