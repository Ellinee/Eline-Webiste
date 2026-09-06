# Eline Frontend

Situs publik Eline untuk informasi produk, kebijakan privasi, panduan penghapusan akun, dan unduhan APK Android terbaru.

- Situs: https://eline-id.com
- Repository: https://github.com/Ellinee/Eline-Webiste
- Rilis mobile: https://github.com/Ellinee/Eline-Mobile/releases/latest

## Tech Stack

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 3, Framer Motion, GSAP, dan Phosphor Icons.

## Pengembangan

Gunakan Node.js 22 dan npm.

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
npm start
```

`npm start` menjalankan `next start`, menerima `PORT` dari Railway (default `3000`), dan mendengarkan pada `0.0.0.0` tanpa konfigurasi tambahan.

## Pemeriksaan

```bash
npm run check
```

Menjalankan lint, typecheck, test, dan build. CI menjalankan `npm ci` lalu pemeriksaan yang sama pada Node.js 22 untuk push dan pull request.
