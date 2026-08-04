import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account Deletion",
  description: "How Eldora users can delete their account and app data.",
  alternates: { canonical: "/account-deletion" },
};

export default function AccountDeletionPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F5] px-5 py-10 text-eldora-text sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-bold text-eldora-coral">Back to Eldora</Link>
        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-[0_20px_70px_rgba(23,32,42,0.08)] sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-eldora-coral">Account deletion</p>
          <h1 className="mt-4 text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[0.9] tracking-[-0.08em]">Delete your Eldora account</h1>
          <p className="mt-6 text-base font-semibold leading-8 text-eldora-muted">
            Eldora includes an in-app account deletion flow. Deleting an account removes account access and starts removal of user data connected to the account according to Eldora retention and safety requirements.
          </p>
        </section>

        <section className="mt-6 grid gap-4">
          <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_14px_50px_rgba(23,32,42,0.06)]">
            <h2 className="text-2xl font-black tracking-[-0.04em]">Delete from inside the app</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm font-semibold leading-7 text-eldora-muted">
              <li>Open the Eldora mobile app.</li>
              <li>Sign in to the account you want to delete.</li>
              <li>Go to Account or Settings.</li>
              <li>Open Account and Security.</li>
              <li>Select Delete Account.</li>
              <li>Confirm the deletion dialog.</li>
            </ol>
          </article>

          <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_14px_50px_rgba(23,32,42,0.06)]">
            <h2 className="text-2xl font-black tracking-[-0.04em]">Data removed</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm font-semibold leading-7 text-eldora-muted">
              <li>Account profile data such as name, email, mobile number, and role.</li>
              <li>Authentication access for the deleted account.</li>
              <li>Notification preferences and FCM token connected to the account.</li>
              <li>Home membership access for the deleted account.</li>
            </ul>
          </article>

          <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_14px_50px_rgba(23,32,42,0.06)]">
            <h2 className="text-2xl font-black tracking-[-0.04em]">Data that may remain</h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-eldora-muted">
              Some safety records, device events, caregiver invitations, emergency context, and audit records may remain for a limited period when needed for security, fraud prevention, legal compliance, troubleshooting, or continuity for other caregivers in the same home.
            </p>
          </article>

          <article className="rounded-[1.5rem] bg-white p-6 shadow-[0_14px_50px_rgba(23,32,42,0.06)]">
            <h2 className="text-2xl font-black tracking-[-0.04em]">Need help?</h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-eldora-muted">
              If you cannot access the app, contact the Eldora team through the support channel used to distribute the app and include the email address connected to the account you want deleted.
            </p>
            <Link href="/privacy" className="mt-4 inline-flex rounded-full bg-eldora-coral px-5 py-3 text-sm font-black text-white">View privacy policy</Link>
          </article>
        </section>
      </div>
    </main>
  );
}
