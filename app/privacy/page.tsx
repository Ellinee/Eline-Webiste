import type { Metadata } from "next";
import Link from "next/link";
import { getSiteConfig } from "../site-config.mjs";

const description =
  "How Eline handles account, household, device, and alert information, including your choices and what remains after account deletion.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    url: "/privacy",
    title: "Privacy Policy | Eline",
    description,
    images: ["/eline-icon.png"],
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Eline",
    description,
    images: ["/eline-icon.png"],
  },
};

export default function PrivacyPage() {
  const { supportEmail } = getSiteConfig();

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-[calc(100%-40px)] max-w-[1256px] pb-[35px] pt-12 text-eline-text md:w-[calc(100%-72px)] md:pb-[100px] md:pt-[78px] xl:w-[calc(100%-112px)]"
    >
      <header className="max-w-[820px] pb-8 md:pb-[50px]">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-eline-deep">Privacy</p>
        <h1 className="mt-5 text-[clamp(38px,10vw,48px)] font-extrabold leading-[1.08] tracking-[-0.055em] md:text-[clamp(44px,6vw,76px)]">Privacy policy</h1>
        <p className="mt-6 max-w-[680px] text-base leading-[1.75] text-eline-muted md:text-lg md:leading-[1.75]">
          How Eline handles information when you use the Android app to manage
          your home, connect Eline Radar devices, and receive care alerts.
        </p>
        <p className="mt-[18px] text-xs text-eline-muted">Last updated: September 14, 2026</p>
      </header>

      <div className="grid grid-cols-1 gap-8 border-t border-eline-line pt-6 md:grid-cols-[170px_minmax(0,1fr)] md:gap-9 md:pt-11 lg:grid-cols-[230px_minmax(0,720px)] lg:gap-[70px]">
        <aside className="self-start md:sticky md:top-[125px]">
          <nav aria-label="On this page" className="flex flex-wrap items-start gap-x-[22px] md:flex-col md:flex-nowrap md:gap-0 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:py-2.5 [&_a]:text-xs [&_a]:font-semibold [&_a:hover]:text-eline-deep [&_a:hover]:underline md:[&_a]:text-[13px]">
            <a href="#information">Information we process</a>
            <a href="#uses">How information is used</a>
            <a href="#sharing">Sharing and services</a>
            <a href="#choices">Your choices</a>
            <a href="#retention">Retention and deletion</a>
            <a href="#contact">Privacy contact</a>
          </nav>
        </aside>

        <div className="min-w-0 text-eline-muted [&_section]:mb-10 [&_section]:scroll-mt-2.5 [&_h2]:mb-[15px] [&_h2]:text-[25px] [&_h2]:font-extrabold [&_h2]:leading-[1.3] [&_h2]:tracking-[-0.03em] [&_h2]:text-eline-text md:[&_h2]:text-[27px] [&_p]:text-sm [&_p]:leading-[1.85] md:[&_p]:text-[15px] [&_p+p]:mt-3.5 [&_ul]:my-[15px] [&_ul]:list-outside [&_ul]:list-disc [&_ul]:pl-[23px] [&_li]:text-sm [&_li]:leading-[1.85] md:[&_li]:text-[15px] [&_li+li]:mt-2.5 [&_strong]:font-extrabold [&_strong]:text-eline-text">
          <section id="information">
            <h2>Information we process</h2>
            <p>
              The information processed depends on the features you use, what you
              and other household members provide, and what connected devices send.
            </p>
            <ul>
              <li>
                <strong>Account information.</strong> Your name, email address,
                account and authentication identifiers, role, and profile photo
                if supplied. Sign-in and password reset flows also process
                authentication tokens and reset verification information.
              </li>
              <li>
                <strong>Household information.</strong> Home and room names,
                memberships and roles, invitations and recipient email addresses,
                elder profiles, and optional addresses, location labels, and
                coordinates.
              </li>
              <li>
                <strong>Connected devices.</strong> Eline Radar identifiers, pairing
                and provisioning information, telemetry, online status, battery and
                charging status, firmware version, and Wi-Fi details such as network
                name, signal strength, and local IP address. Wi-Fi setup credentials,
                including passwords, are processed and stored in backend device
                commands if supplied for configuration. These categories also apply
                to Vest device records where present; Eline Vest integration in the
                app is still pending.
              </li>
              <li>
                <strong>Alerts and notifications.</strong> Device, motion, and
                alert events, timestamps, confidence values, optional event
                coordinates, notification content, read status, responses and
                notes, notification preferences, and push notification tokens.
              </li>
              <li>
                <strong>Optional spoken reminders.</strong> When enabled, reminder
                titles, messages, schedules, and language and voice settings are
                processed to prepare and deliver text-to-speech reminders.
              </li>
              <li>
                <strong>Operational logs.</strong> Logs can include IP addresses,
                request paths, timestamps, response status, processing time, and
                limited request and response contents, which can include personal
                information.
              </li>
            </ul>
          </section>

          <section id="uses">
            <h2>How information is used</h2>
            <ul>
              <li>Sign you in, maintain account access, and support password resets.</li>
              <li>Manage households, rooms, invitations, and member permissions.</li>
              <li>Pair and configure devices, display their status, and send commands.</li>
              <li>Deliver alerts and notifications and record responses and notes.</li>
              <li>Schedule and deliver spoken reminders when enabled.</li>
              <li>Investigate errors, troubleshoot connections, and respond to support requests.</li>
            </ul>
          </section>

          <section id="sharing">
            <h2>Sharing and services</h2>
            <p>
              Household members can access information made available to their
              role, including shared home, room, device, and alert information.
              Names, email addresses, and notes may also appear in invitations
              and shared records.
            </p>
            <ul>
              <li>
                <strong>Firebase Authentication and Google sign-in</strong> process
                sign-in information. Google sign-in provides account identifiers,
                name, email address, and a profile photo when available.
              </li>
              <li>
                <strong>Firebase Cloud Messaging</strong> processes push tokens
                and notification payloads to deliver app notifications.
              </li>
              <li>
                <strong>Hosting and database providers</strong> process application
                records and operational logs to run Eline.
              </li>
              <li>
                <strong>S3-compatible storage</strong> stores uploaded profile
                photos. <strong>SMTP email providers</strong> process recipient
                email addresses and message content for account emails, including
                password reset messages. The providers depend on the deployment.
              </li>
              <li>
                <strong>Text-to-speech services</strong> process reminder text and
                voice settings when spoken reminders are enabled.
              </li>
            </ul>
          </section>

          <section id="choices">
            <h2>Your choices</h2>
            <p>
              Use the app to update account and household details that you have
              permission to manage. Review notification preferences in Eline and
              notification permissions in your phone settings. Only provide
              optional household locations or reminder content when needed.
            </p>
            <p>
              For questions about accessing, correcting, or removing information,
              use the <a className="inline-flex min-h-11 max-w-full items-center gap-2.5 text-sm font-extrabold underline-offset-[5px] hover:underline" href="#contact">privacy contact</a>
              {" "}below. Account removal is available in the app; the steps and
              limits are explained on the account deletion page.
            </p>
          </section>

          <section id="retention">
            <h2>Retention and deletion</h2>
            <p>
              Successful account deletion removes the Eline user record and its
              directly linked household memberships, notification settings, push
              tokens, password reset records, pairing requests, and provisioning
              sessions. Directly linked invitations and notifications, including
              their read states and responses, are also removed.
            </p>
            <p>
              Home, room, device, elder-profile, and reminder records remain, as do
              device commands and their payloads. Wi-Fi setup credentials supplied
              in retained commands can remain. Other shared notifications and
              records can retain copied names, email addresses, photo links,
              identifiers, and response notes.
            </p>
            <p>
              Eline attempts to remove the linked Firebase Authentication account
              and the current uploaded profile photo. These cleanup operations can
              fail or be skipped, so their removal is not guaranteed.
            </p>
            <p>
              Account deletion does not erase operational logs or every copy in
              shared records. No fixed retention or removal period is currently
              specified for retained records. Account deletion is permanent, but
              it is not a promise that all data is erased. Uninstalling Eline or
              clearing its cache does not delete your account.
            </p>
            <Link className="mt-5 inline-flex min-h-11 max-w-full items-center justify-center gap-[22px] rounded-full bg-eline-deep px-[25px] py-4 text-center text-sm font-extrabold leading-[1.4] text-white transition-[background-color,transform] duration-200 hover:bg-eline-deep/90 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none" href="/account-deletion">
              Account deletion instructions
            </Link>
          </section>

          <section id="contact" className="rounded-2xl bg-eline-mint p-[22px] text-eline-text md:px-[26px] md:py-6 [&_a]:[overflow-wrap:anywhere]">
            <h2>Privacy contact</h2>
            {supportEmail ? (
              <>
                <p>
                  For privacy questions or requests about your information, email
                  {" "}
                  <a className="inline-flex min-h-11 max-w-full items-center gap-2.5 text-sm font-extrabold underline-offset-[5px] hover:underline" href={`mailto:${encodeURIComponent(supportEmail)}`}>
                    {supportEmail}
                  </a>.
                </p>
                <p>
                  Include the email address associated with your Eline account
                  and describe your request. Never send your password or a
                  verification or reset code.
                </p>
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
