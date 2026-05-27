# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Critical: Next.js 16 is breaking

`package.json` pins `next@16.2.6` and `react@19.2.4`. APIs, file conventions, and defaults differ from earlier versions covered by most training data. Before writing or modifying any code under `app/`, `next.config.ts`, route handlers, middleware, or anything touching Next.js APIs, read the relevant guide in `node_modules/next/dist/docs/`. Honor deprecation notices in those docs over prior knowledge.

The user's global skills (`nextjs-16-app-router`, `nextjs-app-router-best-practices`, `supabase-nextjs`) cover the same ground — if they load, follow them; if not, fall back to the bundled docs.

## Commands

- `npm run dev` — start Next.js dev server (port 3000)
- `npm run build` — production build
- `npm run start` — run built app
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next` core-web-vitals + typescript)

No test runner is configured yet. Don't invent one — confirm with the user before adding test infrastructure.

## Architecture

- **Framework**: Next.js 16 App Router, React 19, TypeScript strict mode, Tailwind v4 (PostCSS plugin, no `tailwind.config.*`).
- **Path alias**: `@/*` → repo root (see `tsconfig.json`).
- **App entry**: `app/layout.tsx` (Geist fonts via `next/font/google`) + `app/page.tsx`. Currently the create-next-app starter; treat as scaffolding to replace.
- **Supabase**: `supabase/` holds local CLI config (`config.toml`). Project ID `time-manegur`, local API on 54321, DB Postgres 17 on 54322, Studio on 54323, site URL `http://127.0.0.1:3000`. No client code, migrations, or seeds exist yet — when adding Supabase integration, use the `supabase-nextjs` skill patterns (server/client/proxy clients, `getClaims()` over `getSession()`, RLS).

## Conventions (from global instructions)

- Respond in Japanese; code and identifiers in English.
- Conventional Commits, Japanese body (e.g. `feat: ユーザー認証にOAuth2を追加`). No auto-commit/push without confirmation.
- Functional style, strict types (`unknown` not `any`), errors propagated with meaningful messages.
- Don't generate/modify README or docs, delete tests, or refactor working code without an explicit ask.
