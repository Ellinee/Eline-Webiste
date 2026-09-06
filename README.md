# Eline Frontend

Eline's public website provides product information, privacy policies, account deletion instructions, and access to the latest Android APK release.

- Website: https://eline-id.com
- Repository: https://github.com/Ellinee/Eline-Webiste
- Mobile releases: https://github.com/Ellinee/Eline-Mobile/releases/latest

## Tech Stack

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 3, Framer Motion, GSAP, and Phosphor Icons.

## Development

Use Node.js 22 and npm.

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
npm start
```

`npm start` runs `next start`, uses Railway's `PORT` (default: `3000`), and listens on `0.0.0.0` without additional configuration.

## Checks

```bash
npm run check
```

Runs lint, typecheck, tests, and build. CI runs `npm ci` followed by the same checks on Node.js 22 for pushes and pull requests.
