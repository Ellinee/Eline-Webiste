import Image from "next/image";

export function PhoneMockup({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div
      className={`relative aspect-[9/19] overflow-hidden rounded-[2.25rem] border-[8px] border-[#17202A] bg-[#17202A] shadow-eldora ${className}`}
      style={{ width: "min(100%, 275px)" }}
    >
      <div className="absolute left-1/2 top-2 z-10 h-6 w-[5.5rem] -translate-x-1/2 rounded-full bg-[#17202A]" />
      <Image src={src} alt={alt} width={360} height={760} className="h-full w-full object-cover" priority={src.includes("screen-1")} />
    </div>
  );
}
