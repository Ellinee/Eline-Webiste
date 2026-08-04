import type { Variants } from "framer-motion";

export const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Eldora",
  applicationCategory: "HealthApplication",
  operatingSystem: "Android, iOS",
  description:
    "Eldora helps families monitor elderly care through safety alerts, DoraBot device status, wellness summaries, and caregiver updates.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  downloadUrl: "https://eldora.my.id/download",
};

export const downloadUrl = "/download";
export const releaseUrl = "https://github.com/Eldoraaa/Eldora-Mobile/releases/latest";

export const mockups = [
  { src: "/mockups/screen-1.jpg", alt: "Eldora home dashboard preview", title: "Home overview" },
  { src: "/mockups/screen-2.jpg", alt: "Eldora device monitoring preview", title: "Device status" },
  { src: "/mockups/screen-3.jpg", alt: "Eldora alert center preview", title: "Alert center" },
  { src: "/mockups/screen-4.jpg", alt: "Eldora scene automation preview", title: "Care scenes" },
  { src: "/mockups/screen-5.jpg", alt: "Eldora device setup preview", title: "Pairing flow" },
  { src: "/mockups/screen-6.jpg", alt: "Eldora caregiver settings preview", title: "Family access" },
];

export const heroStats = [
  ["Real-time", "DoraBot and DoraShield updates"],
  ["2 devices", "DoraBot plus DoraShield"],
  ["Care scenes", "automated family follow-ups"],
];

export const heroChecks = ["DoraShield alerts", "DoraBot pairing", "Care automation"];

export const marqueeItems = [
  "DoraBot status",
  "DoraShield alerts",
  "Wellness summaries",
  "Family updates",
  "Scene automation",
  "Caregiver approval",
  "DoraBot status",
  "DoraShield alerts",
  "Wellness summaries",
  "Family updates",
  "Scene automation",
  "Caregiver approval",
];

export const pillars = [
  {
    eyebrow: "Safety",
    title: "DoraShield alerts stay impossible to miss.",
    text: "Fall detection and urgent updates from DoraShield are surfaced with clear priority so caregivers can act quickly.",
  },
  {
    eyebrow: "Devices",
    title: "DoraBot and DoraShield stay close at hand.",
    text: "Eldora keeps pairing, connection health, and status for both devices organized in one calm dashboard.",
  },
  {
    eyebrow: "Wellness",
    title: "Care insights without the noise.",
    text: "Signals from DoraBot, DoraShield, and family updates are shaped into meaningful context without feeling invasive.",
  },
];

export const features = [
  {
    title: "Know when everything is okay",
    text: "A warm overview of family updates, DoraBot status, and DoraShield safety signals in one focused experience.",
    image: "/illustrations/care.png",
  },
  {
    title: "Respond faster when it matters",
    text: "DoraShield alerts are separated from everyday updates, helping families understand what needs attention now.",
    image: "/illustrations/alerts.png",
  },
  {
    title: "Follow care over time",
    text: "Wellness summaries help caregivers spot meaningful changes from Eldora devices without turning care into surveillance.",
    image: "/illustrations/wellness.png",
  },
];

export const steps = [
  ["01", "Power on DoraBot", "Turn on DoraBot and keep your phone on the same Wi-Fi network."],
  ["02", "Pair from Eldora", "Open Eldora, choose add device, select DoraBot, and follow the pairing flow."],
  ["03", "Monitor calmly", "After pairing, Eldora shows DoraBot status, home check-ins, and family follow-ups."],
];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0 },
};
