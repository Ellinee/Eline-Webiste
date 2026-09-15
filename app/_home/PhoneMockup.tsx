"use client";

import { CaretDown, House, Plus, WifiHigh } from "@phosphor-icons/react";
import Image from "next/image";
import { MobileIcon } from "./MobileIcon";

export type PreviewScreen = "home" | "alerts" | "devices";

export function PhoneMockup({ screen = "home", className = "[--phone-scale:.75]" }: { screen?: PreviewScreen; className?: string }) {
  const description = screen === "home"
    ? "Family Home dashboard: All Safe, 2 of 2 devices online, Home Wi-Fi connected, and household members."
    : screen === "devices"
      ? "Devices tab: All, Radar and Vest filters, two online Radar cards, and the Add New Device tile."
      : "Notifications with the Alert category selected and example possible-fall notifications.";

  return (
    <div className={`relative shrink-0 w-[calc(410px*var(--phone-scale))] h-[calc(870px*var(--phone-scale))] ${className}`}>
      <div className="absolute left-0 top-0 h-[870px] w-[410px] origin-top-left scale-[var(--phone-scale)] rounded-[48px] border-2 border-[#6d7773] bg-[#23342f] p-2 shadow-[inset_0_0_0_2px_#14251f,0_5px_9px_rgb(0_34_28_/_10%),0_25px_50px_-12px_rgb(0_34_28_/_18%)]" role="img" aria-label={`Eline mobile app reconstruction with example data. ${description}`}>
        <div className="h-[850px] w-[390px] overflow-hidden rounded-[38px] bg-white" aria-hidden="true">
          <div className="flex h-[850px] w-[390px] flex-col text-left font-sans text-[14px] leading-[1.4] tracking-normal text-[#264653] antialiased">
            <div className={`min-h-0 flex-1 overflow-hidden ${screen === "home" ? "bg-[#f5fffe]" : screen === "devices" ? "bg-[radial-gradient(ellipse_60%_65%_at_55%_60%,#b6d7d5,#fff)]" : "bg-[linear-gradient(90deg,white,#ffffff00_48%,#ffffff00_52%,white),linear-gradient(white,#f3faf9_20%,#c5e9e5_50%,#edf8f6_80%,white)]"}`}>
              <div className="overflow-hidden rounded-b-[28px] bg-[linear-gradient(90deg,#17a39e,#093d3b)] text-white">
                <div className="flex h-11 items-center justify-between px-[27px] pt-1 text-[13px] font-semibold">
                  <span>9:41</span>
                  <i className="h-2.5 w-2.5 rounded-full bg-[#132d28] shadow-[inset_0_0_0_2px_#243a35]" />
                  <span className="flex items-center gap-1.5"><WifiHigh size={17} weight="bold" /><MobileIcon name="battery" size={20} /></span>
                </div>
                <div className={`relative flex h-[78px] items-center ${screen === "home" ? "justify-start gap-[7px] pl-[17.5px] pr-[76px]" : "justify-center px-[17.5px]"}`}>
                  <strong className="text-[24px] font-extrabold leading-7">{screen === "home" ? "Family Home" : screen === "devices" ? "DEVICES" : "NOTIFICATION"}</strong>
                  {screen === "home" && <CaretDown size={18} weight="bold" className="text-[#b1e7e6]" />}
                  <span className={screen === "alerts" ? "absolute right-[18px] top-5" : "absolute right-[21.5px] top-[21px] grid h-9 w-9 place-items-center rounded-full bg-[#b1e7e6] text-[#004b48]"}>{screen === "alerts" ? <MobileIcon name="settings" size={36} /> : <Plus size={20} weight="bold" />}</span>
                </div>
              </div>
              {screen === "home" ? (
                <div className="px-3.5">
                  <div className="relative mt-[17.5px] h-[190px] overflow-hidden rounded-[20px] p-[21px] text-white">
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-5">{Array.from({ length: 40 }, (_, index) => <i key={index} className={(Math.floor(index / 8) + index % 8) % 2 === 0 ? "bg-[#197572]" : "bg-[#16615E]"} />)}</div>
                    <p className="relative text-[16px] font-extrabold">Welcome Back, Alex</p>
                    <House size={38} className="absolute right-[21px] top-[21px]" />
                    <strong className="relative mt-[21px] flex items-center gap-[10.5px] text-[29px] font-extrabold leading-[31.5px]"><i className="h-[21px] w-[21px] rounded-full bg-[#1eeb0b]" />All Safe</strong>
                    <span className="relative mt-[10.5px] block max-w-[270px] text-[13px] font-semibold leading-[17.5px]">No falls or unusual activity detected.</span>
                  </div>
                  <div className="mt-3.5 grid grid-cols-2 gap-[10.5px]">
                    <div className="flex h-32 flex-col items-center justify-center rounded-[20px] border border-[#dceceb] bg-white px-[10.5px] py-3.5 shadow-[0_1px_2px_rgb(0_0_0_/_4%)]">
                      <span className="text-[11px] font-extrabold tracking-[1.4px] text-[#67817f]">DEVICES</span>
                      <strong className="mt-[10.5px] flex items-center justify-center gap-[10.5px] whitespace-nowrap text-[25px] font-extrabold leading-7"><i className="h-[17.5px] w-[17.5px] rounded-full bg-[#1eeb0b]" />2/2</strong>
                      <small className="mt-[3.5px] text-[12px] font-semibold text-[#67817f]">Online</small>
                    </div>
                    <div className="flex h-32 flex-col items-center justify-center rounded-[20px] border border-[#dceceb] bg-white px-[10.5px] py-3.5 shadow-[0_1px_2px_rgb(0_0_0_/_4%)]">
                      <span className="text-[11px] font-extrabold tracking-[1.4px] text-[#67817f]">DEVICE WI-FI</span>
                      <strong className="mt-[10.5px] flex items-center justify-center gap-[10.5px] whitespace-nowrap text-[21px] font-extrabold leading-7">Home Wi-Fi</strong>
                      <small className="mt-[3.5px] text-[12px] font-semibold text-[#67817f]">Connected</small>
                    </div>
                  </div>
                  <div className="mt-3.5 rounded-[24px] px-[17.5px] py-[21px]">
                    <strong className="text-[19px] font-extrabold">People At Family Home</strong>
                    <div className="flex gap-[17.5px] pt-[17.5px]">
                      <div className="flex min-h-[116px] flex-[0_0_82px] flex-col items-center">
                        <span className="grid h-[68px] w-[68px] place-items-center rounded-full border-2 border-dashed border-[#2a9d8f] bg-[#f5fffe] text-[24px] font-extrabold text-[#2a9d8f]"><Plus size={29} /></span>
                        <strong className="mt-[7px] text-[12px] font-extrabold">Add</strong>
                      </div>
                      <div className="flex min-h-[116px] flex-[0_0_94px] flex-col items-center">
                        <span className="grid h-[68px] w-[68px] place-items-center rounded-full bg-[#264653] text-[24px] font-extrabold text-white">A</span>
                        <strong className="mt-[7px] text-[12px] font-extrabold">Alex</strong>
                        <small className="text-[10px] font-semibold">Home Owner</small>
                      </div>
                      <div className="flex min-h-[116px] flex-[0_0_94px] flex-col items-center">
                        <span className="grid h-[68px] w-[68px] place-items-center rounded-full bg-[#264653] text-[24px] font-extrabold text-white">J</span>
                        <strong className="mt-[7px] text-[12px] font-extrabold">Jamie</strong>
                        <small className="text-[10px] font-semibold">Administrator</small>
                      </div>
                    </div>
                  </div>
                  <div className="mt-[21px] flex items-center gap-[7px] whitespace-nowrap">
                    <span className="grid h-[38.5px] min-h-[38.5px] w-[38.5px] flex-none place-items-center rounded-[40px] border-2 border-[#2a9d8f] bg-white p-0 text-[13px] font-extrabold text-[#2a9d8f]"><Plus size={22} /></span>
                    <span className="min-h-[38.5px] rounded-[40px] border border-[#004b48] bg-[#004b48] px-[17.5px] py-[9px] text-[13px] font-extrabold text-white">All Rooms</span>
                    <span className="min-h-[38.5px] rounded-[40px] border border-[#74d3ce] bg-white px-[17.5px] py-[9px] text-[13px] font-extrabold">Living room</span>
                    <span className="min-h-[38.5px] rounded-[40px] border border-[#74d3ce] bg-white px-[17.5px] py-[9px] text-[13px] font-extrabold">Bedroom</span>
                  </div>
                  <div className="mt-3.5 rounded-t-[28px] rounded-b-[22px] bg-[linear-gradient(90deg,#17a39e,#093d3b)] px-3.5 py-[21px] text-white">
                    <strong className="block text-center text-[24px] font-extrabold">All Rooms</strong>
                    <p className="mt-[10.5px] flex items-center gap-[10.5px] text-[19px] font-extrabold"><i className="h-[21px] w-[21px] rounded-full bg-[#1eeb0b]" />All Safe</p>
                    <span className="mt-[7px] block text-[13px]">No falls or unusual activity detected.</span>
                    <small className="mt-[7px] block text-[13px]">2 Members – 2 Devices</small>
                  </div>
                </div>
              ) : screen === "devices" ? (
                <div className="px-[30px] py-[18px]">
                  <div className="flex gap-1.5 pb-3.5 pt-[3.5px]">
                    <span className="flex min-h-[31.5px] items-center gap-[7px] rounded-[30px] border border-[#004b48] bg-[#004b48] px-[10.5px] py-[5px] text-[13px] font-extrabold text-white"><MobileIcon name="links" size={16} />All</span>
                    <span className="flex min-h-[31.5px] items-center gap-[7px] rounded-[30px] border border-[#004b48] px-[10.5px] py-[5px] text-[13px] font-extrabold text-[#004b48]"><MobileIcon name="radar" size={16} />Radar</span>
                    <span className="flex min-h-[31.5px] items-center gap-[7px] rounded-[30px] border border-[#004b48] px-[10.5px] py-[5px] text-[13px] font-extrabold text-[#004b48]"><MobileIcon name="vest" size={16} />Vest</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-[26px]">
                    {[{ name: "Living Room Radar", room: "Living room" }, { name: "Bedroom Radar", room: "Bedroom" }].map((device) => (
                      <div className="flex min-h-[206px] flex-col items-center rounded-[16px] border border-[#dce2e2] bg-white px-[10.5px] py-3.5 shadow-[0_0_4px_rgb(0_55_52_/_22%)]" key={device.room}>
                        <span className="rounded-[5.25px] bg-[#a5d89b] px-1.5 text-[14px] font-semibold leading-[18px] text-[#246b18]">ONLINE</span>
                        <div className="grid h-[84px] place-items-center"><Image src="/radar.webp" width={98} height={68} alt="" className="h-[68px] w-[98px] object-contain" /></div>
                        <strong className="text-center text-[16px] font-semibold leading-[19px] text-[#111]">{device.name}</strong>
                        <p className="mt-auto pt-[10.5px] text-center text-[14px] leading-[18px] text-[#7c7c7c]">{device.room}</p>
                      </div>
                    ))}
                    <div className="flex min-h-[206px] flex-col items-center justify-center gap-2.5 rounded-[16px] border border-[#959595] bg-[rgb(124_124_124_/_20%)] text-[#7c7c7c] shadow-[0_0_4px_rgb(0_55_52_/_22%)]"><MobileIcon name="add" size={72} /><span className="text-center text-[16px] leading-[19px]">ADD NEW<br />DEVICE</span></div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col items-center gap-[10.5px] p-[21px]">
                    <strong className="text-[20px] font-extrabold leading-7 text-[#172e2d]">Alert Notification</strong>
                    <div className="flex h-[52px] w-[192px] items-center gap-1 rounded-[9px] bg-[#b6e4e3] p-1">
                      <span className="grid h-[38.5px] flex-1 place-items-center rounded-[7px] text-[#004b48]"><MobileIcon name="home" size={26} /></span>
                      <span className="grid h-[38.5px] flex-1 place-items-center rounded-[7px] text-[#004b48]"><MobileIcon name="radar" size={24} /></span>
                      <span className="grid h-[38.5px] flex-1 place-items-center rounded-[7px] bg-white text-[#004b48]"><MobileIcon name="bell" size={30} /></span>
                    </div>
                  </div>
                  {[{ title: "Possible fall detected", body: "Living Room Radar detected a possible fall. Please check on the resident.", time: "10 min ago" }, { title: "Possible fall detected", body: "Bedroom Radar detected a possible fall. Please check on the resident.", time: "1 day ago" }].map((alert) => (
                    <div className="flex min-h-[80px] items-center gap-3.5 border-b border-[#c9dcda] px-[21px] py-3.5" key={alert.time}>
                      <span className="grid h-[31.5px] w-[31.5px] flex-none place-items-center rounded-full bg-[#cb0c0c] text-white"><MobileIcon name="fall" size={24} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-[7px]">
                          <strong className="text-[15px] font-semibold leading-5 text-[#171717]">{alert.title}</strong>
                          <small className="max-w-[62px] flex-none text-right text-[11px] leading-5 text-[#595959]">{alert.time}</small>
                        </div>
                        <p className="mt-0.5 text-[13px] leading-[18px] text-[#262626]">{alert.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex h-[72px] flex-none items-center justify-around border-t border-[#d1f4f2] bg-white px-3.5">{([{ screen: "home", icon: "home" }, { screen: "devices", icon: "vest" }, { screen: "alerts", icon: "bell" }, { screen: "profile", icon: "profile" }] as const).map((tab) => <span key={tab.screen} className={`grid h-[38.5px] w-14 place-items-center rounded-[14px] ${screen === tab.screen ? "bg-[#d1f4f2] text-[#006b65]" : "text-[#515b5a]"}`}><MobileIcon name={tab.icon} size={30} /></span>)}</div>
            <div className="grid h-6 flex-none place-items-center bg-white"><i className="h-1 w-[100px] rounded bg-[#172e29]" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
