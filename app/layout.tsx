import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import SiteChrome from "./SiteChrome";
import "lenis/dist/lenis.css";
import "./globals.css";

const nunito = localFont({
  src: [
    { path: "../public/nunito-regular.ttf", weight: "400", style: "normal" },
    { path: "../public/nunito-semibold.ttf", weight: "600", style: "normal" },
    { path: "../public/nunito-extrabold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-nunito",
  display: "swap",
});

const title = "Eline — Feel closer to those who matter most";
const description = "Stay connected to home with Eline. Check your Eline Radar, follow safety alerts, and share care with your family in one Android app.";

export const metadata: Metadata = {
  metadataBase: new URL("https://eline-id.com"),
  title: { default: title, template: "%s | Eline" },
  description,
  applicationName: "Eline",
  authors: [{ name: "Eline" }],
  openGraph: { type: "website", url: "/", siteName: "Eline", title, description, images: [{ url: "/eline-icon.png", width: 512, height: 512, alt: "Eline app icon" }] },
  twitter: { card: "summary", title, description, images: ["/eline-icon.png"] },
  icons: { icon: "/eline-mark.png", apple: "/eline-icon.png" },
};

export const viewport: Viewport = { themeColor: "#F5FFFE", colorScheme: "light", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${nunito.variable} scroll-pt-[92px] bg-eline-base md:scroll-pt-[110px] motion-reduce:scroll-auto`}>
      <body className="m-0 font-sans text-eline-text antialiased selection:bg-eline-accent selection:text-eline-deep [&_:focus-visible]:outline [&_:focus-visible]:outline-[3px] [&_:focus-visible]:outline-offset-[5px] [&_:focus-visible]:outline-eline-deep motion-reduce:[&_*]:animate-none motion-reduce:[&_*]:transition-none"><SiteChrome>{children}</SiteChrome></body>
    </html>
  );
}
