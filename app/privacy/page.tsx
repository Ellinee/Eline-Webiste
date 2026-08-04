import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Eldora privacy policy for Google Play and app users.",
  alternates: { canonical: "/privacy" },
};

const dataItems = [
  ["Account information", "Name, email address, mobile number, account ID, role, and authentication tokens used to create and secure your Eldora account."],
  ["Device and safety information", "DoraBot and DoraShield status, device ID, battery level, charging state, firmware version, Wi-Fi SSID/RSSI, local IP during pairing, fall alerts, SOS alerts, offline alerts, and low-battery alerts."],
  ["Home and caregiver information", "Home name, room/category setup, invited members, caregiver role, emergency contact name and phone number, optional home address, and optional map coordinates selected by the user."],
  ["Notifications", "FCM push token, notification preferences, notification read status, alert responses, and message metadata needed to deliver safety and device updates."],
  ["Wellness summaries", "Care signals, interaction summaries, distress level, risk score, and recommendations generated from Eldora device events and family updates."],
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F5] px-5 py-10 text-eldora-text sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-bold text-eldora-coral">Back to Eldora</Link>
        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-[0_20px_70px_rgba(23,32,42,0.08)] sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-eldora-coral">Privacy Policy</p>
          <h1 className="mt-4 text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[0.9] tracking-[-0.08em]">Eldora Privacy Policy</h1>
          <p className="mt-6 text-sm font-semibold text-eldora-muted">Last updated: June 9, 2026</p>
          <p className="mt-6 text-base font-semibold leading-8 text-eldora-muted">
            Eldora helps families monitor elderly care through DoraBot, DoraShield, safety alerts, wellness summaries, and caregiver updates. This policy explains what data we collect, why we collect it, and how users can control or delete their data.
          </p>
        </section>

        <section className="mt-6 grid gap-4">
          <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_14px_50px_rgba(23,32,42,0.06)]">
            <h2 className="text-2xl font-black tracking-[-0.04em]">Information we collect</h2>
            <div className="mt-5 grid gap-4">
              {dataItems.map(([title, text]) => (
                <div key={title} className="rounded-2xl bg-eldora-warm p-4">
                  <h3 className="font-black text-eldora-text">{title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-7 text-eldora-muted">{text}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_14px_50px_rgba(23,32,42,0.06)]">
            <h2 className="text-2xl font-black tracking-[-0.04em]">How we use information</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm font-semibold leading-7 text-eldora-muted">
              <li>Authenticate users and manage caregiver or family access.</li>
              <li>Pair, configure, and monitor DoraBot and DoraShield devices.</li>
              <li>Deliver safety, SOS, fall, device offline, low battery, and home alerts.</li>
              <li>Show home, room, emergency contact, and caregiver management features.</li>
              <li>Generate wellness summaries and care recommendations for caregivers.</li>
              <li>Improve app reliability, security, and user support.</li>
            </ul>
          </article>

          <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_14px_50px_rgba(23,32,42,0.06)]">
            <h2 className="text-2xl font-black tracking-[-0.04em]">Sharing and third parties</h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-eldora-muted">
              Eldora does not sell personal data. We use service providers needed to run the app, including backend hosting, Firebase authentication, Firebase Cloud Messaging, Google Sign-In, and maps. Data may be shared with invited caregivers or family members inside the same Eldora home according to app permissions.
            </p>
          </article>

          <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_14px_50px_rgba(23,32,42,0.06)]">
            <h2 className="text-2xl font-black tracking-[-0.04em]">Security, retention, and deletion</h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-eldora-muted">
              We use authentication, access controls, and transport security to protect data. Data is retained while an account is active or as needed to provide safety, device, and caregiver features. Users can delete their account in the Eldora app from Account and Security, or follow the instructions on the account deletion page.
            </p>
            <Link href="/account-deletion" className="mt-4 inline-flex rounded-full bg-eldora-coral px-5 py-3 text-sm font-black text-white">Account deletion instructions</Link>
          </article>

          <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_14px_50px_rgba(23,32,42,0.06)]">
            <h2 className="text-2xl font-black tracking-[-0.04em]">Children</h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-eldora-muted">
              Eldora is intended for caregivers and family members and is not directed to children under 13. If you believe a child has provided personal information, contact the Eldora team so it can be removed.
            </p>
          </article>

          <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_14px_50px_rgba(23,32,42,0.06)]">
            <h2 className="text-2xl font-black tracking-[-0.04em]">Contact</h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-eldora-muted">
              For privacy questions, data access, or deletion support, contact the Eldora team through the support channel used to distribute the app or through the account owner managing the Eldora deployment.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
