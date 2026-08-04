# Eldora Frontend

Eldora Frontend is the public Next.js site served at `https://eldora.my.id`. It presents the Eldora mobile application, renders privacy and account-deletion information, and redirects download requests to an Android package published through GitHub Releases.

This repository is a landing and distribution site. It does not implement caregiver accounts, device pairing, monitoring, alerts, wellness analysis, automations, or account deletion itself; those capabilities are described through site content and belong to the mobile application and its supporting services.

## Technology Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI runtime | React 19 |
| Language | TypeScript 5.9 with strict checking |
| Styling | Tailwind CSS 3, PostCSS, Autoprefixer |
| Animation | Framer Motion 12 and GSAP 3 |
| Icons | Phosphor Icons for React |
| Images | Next.js Image with AVIF and WebP negotiation |

## Public Routes

| Path | Type | Responsibility |
| --- | --- | --- |
| `/` | Client-rendered page | Product landing content, mobile-app previews, navigation, and download links |
| `/privacy` | Page | Published Eldora privacy-policy content |
| `/account-deletion` | Page | Instructions for using the mobile application's account-deletion flow |
| `/download` | Dynamic route handler | Resolve an APK from GitHub Releases and return an HTTP redirect |

All routes are public. There is no login, authenticated dashboard, browser API client, or server action in this repository.

## Site Behavior

The landing page is a single client component composed of these sections:

- Full-viewport introduction with in-page navigation and APK download actions
- Animated feature marquee
- Product and device feature descriptions
- Mobile application previews sourced from `public/mockups/`
- Three-step mobile pairing narrative
- Download call to action
- Links to the privacy and account-deletion pages

Framer Motion provides scroll progress, parallax, entry transitions, and the mockup carousel. GSAP runs floating, pulse, orbit, and marquee loops after the page mounts. The root layout defines canonical metadata for `https://eldora.my.id`, Open Graph and Twitter metadata, favicons, and the web manifest. The landing page also emits `SoftwareApplication` structured data.

The privacy and account-deletion routes are static informational pages. Account removal is performed inside the mobile application; this site only publishes the instructions.

## Download Route Behavior

`GET /download` is the only route with server-side integration behavior.

1. The route requests the latest release from `Eldoraaa/Eldora-Mobile` through the GitHub Releases API.
2. It selects the first release asset whose name ends with `.apk`, case-insensitively.
3. It returns an HTTP `302` redirect to that asset's `browser_download_url`.
4. If the request fails, GitHub returns a non-success response, or the release has no APK asset, it redirects to the hard-coded `v1.0.0-build.24/app-release.apk` fallback in the same repository.

The route is forced dynamic. Its GitHub API fetch declares a 300-second revalidation interval. It does not download, proxy, verify, sign, or store the APK.

The exact release source is:

```text
https://github.com/Eldoraaa/Eldora-Mobile/releases/latest
```

## Getting Started

### Prerequisites

- Node.js and npm compatible with the committed lockfile
- Network access to GitHub when testing latest-release resolution

### Installation

```bash
npm ci
```

### Development

```bash
npm run dev
```

The default Next.js development origin is `http://localhost:3000` unless overridden by the Next.js CLI environment.

### Production Build and Start

```bash
npm run build
npm start
```

No application environment variables or `.env.example` are currently defined. The site URL and GitHub release repository are constants in source code.

## Scripts and Quality Checks

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run typecheck` | Run TypeScript with `--noEmit` |
| `npm run build` | Create the production Next.js build |
| `npm start` | Serve the completed production build |

The repository does not define separate lint or test scripts. Run both available static checks before release:

```bash
npm run typecheck
npm run build
```

## Project Structure

```text
app/
|-- account-deletion/page.tsx # Mobile account-deletion instructions
|-- download/route.ts         # Latest APK lookup and redirect
|-- privacy/page.tsx          # Privacy-policy content
|-- globals.css               # Tailwind layers and global styles
|-- layout.tsx                # Root metadata, viewport, and document shell
`-- page.tsx                  # Public landing page

src/
|-- components/common/
|   |-- MiniIcon.tsx          # Small feature icon variants
|   |-- PhoneMockup.tsx       # Mobile screenshot frame
|   `-- index.ts              # Component exports
`-- constants/data.tsx        # Site copy, links, mockups, and motion variant

public/
|-- brand/                    # Eldora logos
|-- favicon_io/               # Favicons and web manifest
|-- illustrations/            # Landing-page feature images
`-- mockups/                  # Mobile application preview images
```

Root configuration covers Next.js image output, Tailwind theme extensions, PostCSS processing, and TypeScript path aliases.

## Backend and Download Contracts

This site has no contract with `https://api.eldora.my.id` and makes no requests to the Eldora backend. Product descriptions, legal text, and screenshots are static frontend content rather than live backend state.

The active external runtime contract is GitHub Releases for `Eldoraaa/Eldora-Mobile`:

- The latest-release endpoint must return JSON with an `assets` array.
- A downloadable Android build must be attached as an asset with a name ending in `.apk`.
- The asset must expose a valid `browser_download_url`.
- The checked-in fallback URL remains a single point-in-time release and must be updated deliberately if that asset is removed.

GitHub availability, unauthenticated API limits, repository visibility, release publishing, and asset integrity are outside this site's control. A successful `/download` response confirms only that the browser was redirected; it does not confirm installation or application compatibility.

## Accessibility and Operational Boundaries

- The document language is English, route pages use semantic headings, the landing navigation has an accessible home label, and meaningful app screenshots receive alt text.
- Decorative landing images use empty alt text where they do not add information beyond nearby copy.
- Links are native anchors or Next.js links and remain keyboard-operable without custom handlers.
- The landing page contains continuous and scroll-linked animation. The current source does not implement a `prefers-reduced-motion` alternative, pause control, or motion-free rendering path.
- Some navigation is hidden at smaller breakpoints, while the home and download actions remain available.
- The site does not collect form input, request browser permissions, manage user sessions, or store account data.
- Privacy and deletion statements are published content, not enforcement implemented by this frontend. Keep them synchronized with the actual mobile and backend behavior.
- `https://eldora.my.id` is the canonical production origin. TLS, DNS, hosting, cache policy, monitoring, and rollback are deployment responsibilities outside this repository.
- The download route depends on an outbound GitHub API request and a valid fallback asset. Monitor redirects after each mobile release and when changing repository or asset naming conventions.
