import type { Metadata } from "next";
import Link from "next/link";
import { getSiteConfig } from "../site-config.mjs";

const description =
  "Delete your Eline account in the app or request help by email. Understand what is removed, what remains, and how to prepare.";

export const metadata: Metadata = {
  title: "Account Deletion",
  description,
  alternates: { canonical: "/account-deletion" },
  openGraph: {
    type: "website",
    url: "/account-deletion",
    title: "Account Deletion | Eline",
    description,
    images: ["/eline-icon.png"],
  },
  twitter: {
    card: "summary",
    title: "Account Deletion | Eline",
    description,
    images: ["/eline-icon.png"],
  },
};

export default function AccountDeletionPage() {
  const { supportEmail } = getSiteConfig();
  const deletionMailto = supportEmail
    ? `mailto:${encodeURIComponent(supportEmail)}?subject=${encodeURIComponent("Eline account deletion request")}&body=${encodeURIComponent(
        "Hello Eline team,\r\n\r\nPlease help me delete my Eline account.\r\n\r\nAccount email address: [enter the email linked to your Eline account]\r\nApp access issue, if any: [describe briefly]\r\n\r\nI understand account deletion is permanent and shared household and device records may remain.\r\n\r\nNever send a password, verification code, or password reset code in this email.",
      )}`
    : "";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-[calc(100%-40px)] max-w-[1256px] pb-[35px] pt-12 text-eline-text md:w-[calc(100%-72px)] md:pb-[100px] md:pt-[78px] xl:w-[calc(100%-112px)]"
    >
      <header className="max-w-[820px] pb-8 md:pb-[50px]">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-eline-deep">Account</p>
        <h1 className="mt-5 text-[clamp(38px,10vw,48px)] font-extrabold leading-[1.08] tracking-[-0.055em] md:text-[clamp(44px,6vw,76px)]">Delete your Eline account</h1>
        <p className="mt-6 max-w-[680px] text-base leading-[1.75] text-eline-muted md:text-lg md:leading-[1.75]">
          Delete your account in the Eline Android app. Review what is removed
          and what remains before you confirm.
        </p>
        <p className="mt-[18px] text-xs text-eline-muted">Last updated: September 14, 2026</p>
      </header>

      <div className="grid grid-cols-1 gap-8 border-t border-eline-line pt-6 md:grid-cols-[170px_minmax(0,1fr)] md:gap-9 md:pt-11 lg:grid-cols-[230px_minmax(0,720px)] lg:gap-[70px]">
        <aside className="self-start md:sticky md:top-[125px]">
          <nav aria-label="On this page" className="flex flex-wrap items-start gap-x-[22px] md:flex-col md:flex-nowrap md:gap-0 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:py-2.5 [&_a]:text-xs [&_a]:font-semibold [&_a:hover]:text-eline-deep [&_a:hover]:underline md:[&_a]:text-[13px]">
            <a href="#before-deleting">Before you delete</a>
            <a href="#in-app">Delete in the app</a>
            <a href="#removed">What is removed</a>
            <a href="#retained">What remains</a>
            <a href="#support">Request help</a>
          </nav>
        </aside>

        <div className="min-w-0 text-eline-muted [&_section]:mb-10 [&_section]:scroll-mt-2.5 [&_h2]:mb-[15px] [&_h2]:text-[25px] [&_h2]:font-extrabold [&_h2]:leading-[1.3] [&_h2]:tracking-[-0.03em] [&_h2]:text-eline-text md:[&_h2]:text-[27px] [&_p]:text-sm [&_p]:leading-[1.85] md:[&_p]:text-[15px] [&_p+p]:mt-3.5 [&_ul]:my-[15px] [&_ul]:list-outside [&_ul]:list-disc [&_ul]:pl-[23px] [&_ol]:my-[15px] [&_ol]:list-outside [&_ol]:list-decimal [&_ol]:pl-[23px] [&_li]:text-sm [&_li]:leading-[1.85] md:[&_li]:text-[15px] [&_li+li]:mt-2.5 [&_strong]:font-extrabold [&_strong]:text-eline-text">
          <section id="before-deleting">
            <h2>Before you delete</h2>
            <p className="rounded-2xl bg-eline-mint p-[22px] md:px-[26px] md:py-6">
              <strong>Account deletion is permanent and cannot be undone.</strong>
              {" "}Uninstalling Eline or clearing its cache does not delete your account.
            </p>
            <p>
              If you own a shared home, we recommend assigning another home owner
              before deleting your account so someone can continue managing it.
              This is a recommendation, not a requirement enforced by account
              deletion.
            </p>
          </section>

          <section id="in-app">
            <h2>Delete in the app</h2>
            <p>Open Eline and sign in to the account you want to delete.</p>
            <p className="rounded-2xl bg-eline-mint p-[22px] md:px-[26px] md:py-6">
              Profile &gt; Settings &gt; Account and Security &gt; Delete Account &gt; confirmation
            </p>
            <ol>
              <li>Open <strong>Profile</strong>, then <strong>Settings</strong>.</li>
              <li>Select <strong>Account and Security</strong>.</li>
              <li>Select <strong>Delete Account</strong>.</li>
              <li>Review the warning and confirm account deletion.</li>
            </ol>
            <p>
              If an error is shown, do not assume deletion is complete. Try again
              or use the <a className="inline-flex min-h-11 max-w-full items-center gap-2.5 text-sm font-extrabold underline-offset-[5px] hover:underline" href="#support">help information below</a>.
            </p>
          </section>

          <section id="removed">
            <h2>What is removed</h2>
            <p>A successful account deletion removes these records from Eline:</p>
            <ul>
              <li>Your user record, including name, email, account identifiers, and profile-photo references.</li>
              <li>Your household memberships.</li>
              <li>Your notification settings and registered push notification tokens.</li>
              <li>Notifications, read states, responses, and invitations directly linked to your account.</li>
              <li>Your password reset records, device pairing requests, and provisioning sessions.</li>
            </ul>
            <p>
              Eline also attempts to delete the linked Firebase Authentication
              account and the current uploaded profile photo. These cleanup
              operations can fail or be skipped. The authentication account or
              uploaded photo may remain; removal is not guaranteed.
            </p>
          </section>

          <section id="retained">
            <h2>What remains</h2>
            <p>
              Deleting your account does not delete every record associated with
              the household or connected devices.
            </p>
            <ul>
              <li>Home, room, device, elder-profile, and reminder records remain.</li>
              <li>Device commands and their payloads remain, including Wi-Fi setup credentials supplied with a command.</li>
              <li>Other shared notifications, records, and invitations not directly linked to your account may retain copied names, email addresses, photo links, identifiers, and response notes.</li>
              <li>Operational logs are not removed by account deletion.</li>
            </ul>
            <p>
              No fixed retention or removal period is currently specified for
              retained records. Account deletion is not erasure of all household
              data, shared copies, logs, or device configuration.
            </p>
            <Link className="inline-flex min-h-11 max-w-full items-center gap-2.5 text-sm font-extrabold text-eline-text underline-offset-[5px] hover:underline" href="/privacy">
              Read the privacy policy
            </Link>
          </section>

          <section id="support" className="rounded-2xl bg-eline-mint p-[22px] text-eline-text md:px-[26px] md:py-6 [&_a]:[overflow-wrap:anywhere]">
            <h2>Need help deleting your account?</h2>
            {supportEmail ? (
              <>
                <p>
                  If you cannot access the app or deletion fails, email
                  {" "}
                  <a className="inline-flex min-h-11 max-w-full items-center gap-2.5 text-sm font-extrabold underline-offset-[5px] hover:underline" href={deletionMailto}>
                    {supportEmail}
                  </a>
                  {" "}with the email address linked to the account you want removed.
                </p>
                <p>
                  The link below opens a draft in your email app. Fill in your
                  account email, review the message, and send it. Opening the link
                  does not submit a request or delete an account.
                </p>
                <p className="rounded-2xl bg-eline-mint p-[22px] md:px-[26px] md:py-6">
                  Never send your password, verification code, or password reset code.
                </p>
                <a className="mt-5 inline-flex min-h-11 max-w-full items-center justify-center gap-[22px] rounded-full bg-eline-deep px-[25px] py-4 text-center text-sm font-extrabold leading-[1.4] text-white transition-[background-color,transform] duration-200 hover:bg-eline-deep/90 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none" href={deletionMailto}>
                  Email a deletion request
                </a>
              </>
            ) : (
              <p>A public email contact will be published here before the Android release.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
