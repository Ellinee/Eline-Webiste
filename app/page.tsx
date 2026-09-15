import type { Metadata } from "next";
import HomePage from "./_home/HomePage";
import { structuredData } from "./_home/structured-data";
import { getSiteConfig } from "./site-config.mjs";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Page() {
  const { playStoreUrl } = getSiteConfig();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <HomePage playStoreUrl={playStoreUrl} />
    </>
  );
}
