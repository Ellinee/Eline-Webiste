export const features = [
  {
    id: "home",
    tab: "Home",
    number: "01",
    title: "Know how home is doing.",
    text: "See your home's safety status, connected devices, and household members in one place. Switch between homes without losing the picture.",
    label: "Your home, at a glance",
  },
  {
    id: "alerts",
    tab: "Alerts",
    number: "02",
    title: "See what needs your attention.",
    text: "Keep fall alerts separate from everyday updates. Choose a full-screen alarm or a notification, with sound and vibration that work for you.",
    label: "The important updates, together",
  },
  {
    id: "devices",
    tab: "Devices",
    number: "03",
    title: "Two devices. One Eline app.",
    text: "Eline Radar monitors the room. Eline Vest is the wearable companion. Find both in the device catalog; Radar pairing is available, while Vest currently has a setup guide.",
    label: "A place for every device",
  },
] as const;

export const steps = [
  { number: "01", title: "Make yourself at home.", text: "Create your account, add a home and its rooms, or join a home with an invitation." },
  { number: "02", title: "Choose your Eline device.", text: "Open Add Device. Follow Radar’s Wi-Fi pairing flow, or explore the Vest setup guide while its connection flow is in development." },
  { number: "03", title: "Bring your family along.", text: "Invite the people who care, choose their access, and turn on the notifications you need." },
];
