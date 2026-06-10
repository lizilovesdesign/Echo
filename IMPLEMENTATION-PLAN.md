# Echo — Full Implementation Plan

**Always reference `.agent/rules/` (architecture, code-style, design-system, security) and `Color-Style/tokens/` before building anything.**

---

## Phase 0: Project Scaffolding

| # | Action | Key References |
|---|--------|---------------|
| 0.1 | Initialize Next.js with TypeScript, App Router (`create-next-app`) | `architecture.md` — Stack/Layout |
| 0.2 | Install core deps: `prisma`, `@prisma/client`, `zod`, `@tanstack/react-query`, `zustand`, `date-fns`, `@supabase/supabase-js` | `architecture.md` — State Management |
| 0.3 | Install dev deps: `prettier`, `eslint`, `typescript` strict mode | `code-style.md` — Formatting |
| 0.4 | Configure `tsconfig.json` with `@/` path alias | `code-style.md` — Imports |
| 0.5 | Create `.env.example` with 7 required vars | `security.md` — Secrets |
| 0.6 | Create `.env.local` (gitignored) for dev credentials | `security.md` |
| 0.7 | Create `.gitignore` (node_modules, .env, next-env.d.ts, prisma/migrations) | — |
| 0.8 | Create directory structure per architecture.md (empty folders) | `architecture.md` — Directory Layout |

---

## Phase 1: Shared Library (`lib/`)

| # | File | Purpose | Key Refs |
|---|------|---------|----------|
| 1.1 | `lib/env.ts` | Zod runtime validation of 7 env vars, abort on missing | `security.md:24` |
| 1.2 | `lib/prisma.ts` | Prisma client global singleton | `architecture.md:77` |
| 1.3 | `lib/supabase.ts` | Supabase server & browser client factories | `architecture.md:81`, `auth-protected-route workflow` |
| 1.4 | `lib/spotify.ts` | Spotify API wrapper — Client Credentials flow, search, token caching | `architecture.md:59`, `create-echo-entry workflow` |
| 1.5 | `lib/auth.ts` | `verifyAuthSession()`, `getWebSession()` helpers | `auth-protected-route workflow`, `new-api-route workflow` |
| 1.6 | `lib/logger.ts` | Structured logger (no personal data in logs) | `security.md:74-79` |
| 1.7 | `lib/rate-limit.ts` | In-memory rate limiter for unauthenticated routes | `new-api-route workflow` |
| 1.8 | `lib/theme/tokens.ts` | Mobile theme object (colors, spacing, radii, fonts from design tokens) | `design-system.md:14`, `code-style.md:91` |
| 1.9 | `lib/validators/spotify.ts` | `SpotifyTrackSchema`, `SpotifyTrack` type | `create-echo-entry workflow` |
| 1.10 | `lib/validators/echoEntry.ts` | `CreateEchoSchema`, `EchoEntry` type, mood enum | `create-echo-entry workflow` |
| 1.11 | `lib/api/echoes.ts` | Client-side fetch wrappers (`fetchEchoes`, `createEchoEntry`) | `new-mobile-screen workflow` |
| 1.12 | `lib/stores/entryStore.ts` | Zustand store for Quick-Capture flow state: `selectedTrack`, `setSelectedTrack`, `clearEntry` | `create-echo-entry workflow` |

---

## Phase 2: Database Layer

| # | Action | Key Refs |
|---|--------|----------|
| 2.1 | Write `prisma/schema.prisma` — `User` (id, email), `EchoEntry` (id, userId, songTitle, artist, albumArtUrl, spotifyTrackId, moodTag enum, note, createdAt, updatedAt), composite index on `[userId, createdAt(desc)]` | `new-db-model workflow`, `architecture.md:73-77` |
| 2.2 | Run `npx prisma migrate dev --name init` | `new-db-model workflow` |
| 2.3 | Review generated `migration.sql` | `new-db-model workflow` |
| 2.4 | Run `npx prisma generate` | `new-db-model workflow` |

---

## Phase 3: Authentication System

| # | File | Purpose | Key Refs |
|---|------|---------|----------|
| 3.1 | `app/(marketing)/page.tsx` + `layout.tsx` | Public landing page (unauthenticated) | `architecture.md:17` |
| 3.2 | `app/(marketing)/login/page.tsx` | Login page with email/password form | `auth-protected-route workflow` |
| 3.3 | `app/auth/callback/route.ts` | Supabase OAuth callback handler | `security.md:30-36` |
| 3.4 | `app/(journal)/layout.tsx` | Auth guard — redirect to `/login` if no session | `auth-protected-route workflow` |
| 3.5 | `app/api/auth/logout/route.ts` | Logout — clear cookie, invalidate session | `auth-protected-route workflow` |

---

## Phase 4: API Routes

| # | File | Method | Purpose | Key Refs |
|---|------|--------|---------|----------|
| 4.1 | `app/api/music/search/route.ts` | `GET ?q=` | Zod validate, rate-limit (20/min), call Spotify proxy, return `SpotifyTrack[]` | `create-echo-entry workflow`, `api-route-scaffolder skill` |
| 4.2 | `app/api/echoes/route.ts` | `GET` | Auth-protected, return user's entries reverse-chronological | `architecture.md:63` |
| 4.3 | `app/api/echoes/route.ts` | `POST` | Zod validate body, auth, create entry via Prisma, return 201 | `create-echo-entry workflow` |
| 4.4 | `app/api/echoes/[id]/route.ts` | `DELETE` | Auth, verify ownership, delete, return 200 | `api-route-scaffolder skill` |

---

## Phase 5: Web UI — Design Tokens Integration

| # | Action | Details |
|---|--------|---------|
| 5.0 | Import `Color-Style/tokens/tokens.css` into `app/globals.css` | Makes all `--color-*` and `--font-*` vars available globally |
| 5.1 | Map spacing scale to CSS vars | `--spacing-xs: 4px`, `--spacing-sm: 8px`, `--spacing-md: 16px`, `--spacing-lg: 24px`, `--spacing-xl: 32px`, `--spacing-2xl: 48px`, `--spacing-3xl: 64px` |
| 5.2 | Map border radii to CSS vars | `--radius-small: 4px`, `--radius-interactive: 8px`, `--radius-container: 12px` |

---

## Phase 6: Web UI — Base Primitives (`components/ui/`)

| # | Component | Notes | Key Refs |
|---|-----------|-------|----------|
| 6.1 | `Button.tsx` + `Button.module.css` | Variants: primary/secondary/minimal. Sizes: sm/md. Min 44px. Use token vars | `component-builder skill`, `design-system.md` |
| 6.2 | `Input.tsx` + `Input.module.css` | Text input with label, error state, 8px border radius | `component-builder skill` |
| 6.3 | `Spinner.tsx` + `Spinner.module.css` | Loading indicator | `new-mobile-screen workflow` |
| 6.4 | `Card.tsx` + `Card.module.css` | Surface container, 12px radius, `--color-surface` bg | `component-builder skill` |
| 6.5 | `Modal.tsx` + `Modal.module.css` | Overlay modal for song confirmation | `create-echo-entry workflow` |

---

## Phase 7: Web UI — Journal Domain (`components/journal/`)

| # | Component | Notes | Key Refs |
|---|-----------|-------|----------|
| 7.1 | `SongSearchInput.tsx` + CSS module | Client component. Debounce 300ms. Loading skeleton. Results list with album art, title, artist. 44px rows | `create-echo-entry workflow` |
| 7.2 | `SongVerificationCard.tsx` + CSS module | Full album art, track, artist. "Use This Song" / "Search Again" | `create-echo-entry workflow` |
| 7.3 | `MoodBubble.tsx` + CSS module | Single mood chip. Variant: selected/inactive. 4px radius. 44px min height | `create-echo-entry workflow` |
| 7.4 | `MoodSelector.tsx` + CSS module | Horizontal row of 4 bubbles: Nostalgic, Energetic, Melancholic, Calm | `create-echo-entry workflow` |
| 7.5 | `EchoEntryForm.tsx` + CSS module | MoodSelector + textarea (500 char limit, live counter) + save button | `create-echo-entry workflow` |
| 7.6 | `EchoEntryCard.tsx` + CSS module | Display entry: album art, song, artist, mood, note, timestamp | `component-builder skill` |
| 7.7 | `TimelineFeed.tsx` + CSS module | Server component. Server-fetched data, maps EchoEntryCards | `architecture.md:53` |

---

## Phase 8: Web UI — Pages

| # | File | Purpose | Key Refs |
|---|------|---------|----------|
| 8.1 | `app/page.tsx` | Redirect to landing or journal based on auth | — |
| 8.2 | `app/layout.tsx` | Global root layout, import tokens CSS | `architecture.md:23` |
| 8.3 | `app/(journal)/timeline/page.tsx` | Server component. Fetch echoes server-side, pass to TimelineFeed | `auth-protected-route workflow` |
| 8.4 | `app/(journal)/create/page.tsx` | Quick-Capture: SongSearch → SongVerification → EchoEntryForm | `create-echo-entry workflow` |
| 8.5 | `app/(journal)/layout.tsx` | Auth guard + nav shell | `auth-protected-route workflow` |

---

## Phase 9: Mobile App (Expo)

| # | Action | Key Refs |
|---|--------|----------|
| 9.0 | Initialize Expo project in `apps/mobile/` | `architecture.md:25-33` |
| 9.1 | Import `lib/theme/tokens.ts` for mobile styling | `design-system.md:14` |
| 9.2 | Mobile UI primitives (Button, Input, Spinner, Card) using `StyleSheet.create()` + theme tokens | `component-builder skill` |
| 9.3 | Mobile domain components (SongSearchInput, SongVerificationCard, MoodSelector, EchoEntryForm, EchoEntryCard) | `create-echo-entry workflow` |
| 9.4 | Screens: TimelineScreen, CreateEntryScreen, LoginScreen | `new-mobile-screen workflow` |
| 9.5 | Navigation (Expo Router) — tab navigator for authenticated flow | `new-mobile-screen workflow` |
| 9.6 | `AuthGuard` wrapping authenticated routes | `auth-protected-route workflow` |
| 9.7 | Wire up React Query provider + Zustand stores | `architecture.md:68-69` |

---

## Phase 10: Verification & Polish

| # | What to Verify | Key Refs |
|---|---------------|----------|
| 10.1 | Empty search does nothing (no API call) | `create-echo-entry workflow` |
| 10.2 | Song selection → confirmation card shows correct data | `create-echo-entry workflow` |
| 10.3 | "Search Again" returns to search input, field focused | `create-echo-entry workflow` |
| 10.4 | Save disabled during mutation (no double-submit) | `create-echo-entry workflow` |
| 10.5 | Submit without mood → inline error, no submit | `create-echo-entry workflow` |
| 10.6 | Note 500+ chars blocked from being typed (not just post-submit) | `create-echo-entry workflow` |
| 10.7 | After save, new entry appears at top of timeline (no refresh) | `create-echo-entry workflow` |
| 10.8 | POST without auth cookie → 401 | `create-echo-entry workflow` |
| 10.9 | No leaks: stack traces, tokens, passwords in logs | `security.md:74-79` |
| 10.10 | All touch targets >= 44px | `design-system.md:64` |
| 10.11 | All styles use CSS vars / theme tokens (no raw hex/pixels) | `design-system.md:18` |
| 10.12 | No `console.log`, no `any`, no raw SQL, no leaked secrets | `code-style.md`, `security.md` |
| 10.13 | `npx tsc --noEmit` — zero type errors | `code-style.md:13` |

---

## Design Token Reference (from `Color-Style/tokens/tokens.css`)

| Semantic Use | Light Token | Dark Token |
|---|---|---|
| Page background | `var(--color-background)` | `var(--color-background)` |
| Card/surface | `var(--color-surface)` | `var(--color-surface)` |
| Primary action | `var(--color-primary)` | `var(--color-primary)` |
| Text on primary | `var(--color-on-primary)` | `var(--color-on-primary)` |
| Body text | `var(--color-on-background)` | `var(--color-on-background)` |
| Muted text | `var(--color-on-surface-variant)` | `var(--color-on-surface-variant)` |
| Error states | `var(--color-error)` | `var(--color-error)` |
| Borders/outlines | `var(--color-outline)` | `var(--color-outline)` |
| Body font | `var(--font-body-medium-font-family)`, `var(--font-body-medium-font-size)` | same |
| Labels/buttons | `var(--font-label-large-font-family)`, `var(--font-label-large-font-size)` | same |
| Title/headings | `var(--font-title-small-font-family)`, `var(--font-title-small-font-size)` | same |

Spacing: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`
Radii: `4px` (small/tags), `8px` (interactive/inputs), `12px` (containers/cards)
Touch targets: minimum `44px x 44px`
