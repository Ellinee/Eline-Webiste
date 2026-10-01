# Eline Website

Eline's public website presents the product, privacy policies, account deletion information, and Android application downloads.

## Stack

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 3, Framer Motion, GSAP, and Phosphor Icons.

## Install and build

Use Node.js 24 LTS (matching CI); both packages require Node.js >=22.22.0. From the repository root:

```sh
npm ci
npm run build
```

Root `postinstall` runs `npm ci --prefix debug-app --include=dev` against the nested lockfile, so the standard Railway/Railpack install/build path needs no separate nested install or workspace migration. Keep lifecycle scripts enabled; `--ignore-scripts` skips this required step. The build stage needs root dev dependencies too: if installing with `NODE_ENV=production` or `--omit=dev`, use `npm ci --include=dev`. Nested build tools are always explicitly included by the hook.

The root build compiles Vite first into `.debug-dist`, then builds Next.js. Keep `.debug-dist` alongside `.next` for `npm start`; Next production traces include its shell and assets. It is not copied into `public`, and source maps are disabled. `npm run test:debug-build` verifies the artifacts and production traces after a build. For local Next development, run `npm --prefix debug-app run build` before `npm run dev` and rebuild after UI edits; no separate Vite server is required.

Debug runtime configuration is server-only: `DEBUG_API_URL` is the BE origin or `/debug` base and `DEBUG_ALLOWED_ORIGIN` is the exact browser origin (HTTPS in production). Never prefix debug configuration with `NEXT_PUBLIC_` or `VITE_`, or give FE the BE password hash or worker service keys. BE and worker device allowlists intentionally remain empty until approved lab IDs are supplied; empty means no event access, not all devices. Installation and building do not require debug credentials.

## Debug authentication

The `/debug` UI uses BE-owned HttpOnly sessions through the same-origin proxy. Login/session cookies must be host-only, `Path=/debug`, `HttpOnly`, `SameSite=Strict`, and `Secure` in production; Lax cookies are rejected. Logout clears the view and stops diagnostics immediately, but retains the browser cookie until BE returns 200/204 (revoked) or 401 (already invalid/expired). Failures keep the current view locked and login disabled; **Retry logout** resends the same HttpOnly cookie without exposing it to JavaScript. Other statuses, including 202, are not revocation confirmation. An expired-session 401 completes logout rather than prompting an endless retry. This UI lock is in-memory, not revocation: reloads or other tabs may still use an unrevoked session until BE confirms deletion or its fixed 30-minute expiry.

BE deliberately keeps five total login attempts per socket peer per 15 minutes, including successes, with at most two concurrent KDF operations per process. Users behind the same Next/ingress peer share this budget; after 429, wait the `Retry-After` cooldown (currently 900 seconds) before trying again. Correct passwords cannot bypass an exhausted budget. This shared-proxy availability limitation is accepted for low-user lab access rather than weakening brute-force/KDF protection or adding a new identity secret. Forwarded client IP headers are not trusted or relayed. See BE's private diagnostic API contract for configuration and deployment constraints.

Offline verification: `npm run test:debug`, `npm --prefix debug-app test`, `npm run lint`, `npm --prefix debug-app run lint`, `npm run typecheck`, `npm --prefix debug-app run typecheck`, `npm run build`, then `npm run test:debug-build`. Auth regressions use mocked transports and server-rendered UI states, not browser verification.
