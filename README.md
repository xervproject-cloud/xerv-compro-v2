# XERV Frontend Site

Next.js (App Router) port of the XERV Project marketing site.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4 (theme tokens) + `src/styles/xerv.css` (ported visual/motion system)
- Content in `src/data/*.json`
- Motion: Lenis, Three.js crystal, Paper Shaders dock foil

## Setup

```bash
npm install
cp .env.example .env   # set NEXT_PUBLIC_GA_ID
npm run dev
```

## Routes

- `/` — Home
- `/about` — About
- `/works` — Works index
- `/works/[slug]` — Project detail
