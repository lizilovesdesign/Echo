---
trigger: always_on
---

# Architecture Rules — Echo

These rules describe how Echo is put together. Every agent building features must follow this architecture. Do not introduce new patterns without discussing them with the developer first.

## The Stack

Echo is a modern mobile and web-companion ecosystem utilizing a "Web-First" foundation for logic. The core engine is a Next.js application using the App Router, written in TypeScript, backed by PostgreSQL on Supabase through the Prisma ORM[cite: 7]. The mobile application is built using React Native and Expo[cite: 7]. External music data is integrated strictly via the Spotify Web API[cite: 7]. There is no separate backend service; serverless Next.js Route Handlers act as the unified API layer handling core logic for both the web and native mobile apps[cite: 7].

## Directory Layout

echo/
├── app/                              # Next.js Web App & Universal API Layer
│   ├── (marketing)/                  # Public landing pages and logged-out web views
│   ├── (journal)/                    # Web companion authenticated dashboard & feed
│   ├── api/
│   │   ├── auth/                     # Supabase authentication helper endpoints
│   │   ├── music/                    # Spotify API search and metadata verification proxy
│   │   └── echoes/                   # Core Journal Entry CRUD operations
│   ├── layout.tsx                    # Global root web layout
│   └── page.tsx                      # Web entry page
├── apps/
│   └── mobile/                       # React Native (Expo) Mobile client
│       ├── assets/                   # Local application icons and splash graphics
│       ├── src/
│       │   ├── components/           # Mobile native UI components
│       │   ├── hooks/                # Native state hooks (React Query, Zustand)
│       │   └── screens/              # Core mobile views (Timeline, Search, Entry)
│       ├── App.tsx                   # Expo entry point
│       └── app.json                  # Expo app configuration
├── components/                       # Shared Web UI components
│   ├── ui/                           # Base design primitives (Buttons, Inputs, Cards)
│   ├── journal/                      # Journal and timeline specific layouts
│   └── shared/                       # Global web utilities
├── lib/                              # Shared Business Logic & Configurations
│   ├── prisma.ts                     # Prisma client singleton instance
│   ├── supabase.ts                   # Supabase authentication server client
│   ├── spotify.ts                    # Spotify Web API integration wrapper
│   └── validators/                   # Zod parsing structures for structural data validation
├── prisma/
│   ├── schema.prisma                 # Database schema source of truth
│   └── migrations/                   # Generated PostgreSQL migration scripts
└── public/                           # Static assets for the web ecosystem


## Rendering & Performance Rules

The mobile application running on Expo is client-side rendered, requiring aggressive loading states, optimistic UI updates, and heavy server-state caching to achieve the target sub-20 second "Quick-Capture" workflow[cite: 7]. 

For the web companion interface, journal layout feeds must utilize server-side data fetching via Next.js Server Components by default to load user logs instantly without client-side waterfalls. Client components (`'use client'`) must be restricted to interactive nodes such as buttons, search query strings, and input shells.

## Data Flow

Data interactions follow three clean, decoupled patterns across the architecture:

1. **Spotify Song Verification:** When a user types a song title or artist, the client queries `app/api/music/search/route.ts`[cite: 7]. The route handler queries the Spotify Web API, structures the unified track metadata (Track ID, Title, Artist, Album Art URL), and passes it back to the client[cite: 7]. The client must explicitly confirm the track metadata layout before starting a journal entry[cite: 7].

2. **Journal Ingestion Flow (Writes):** When a user triggers "Save Echo", the client issues an asynchronous mutation payload to `app/api/echoes/route.ts`[cite: 7]. The route handler catches the payload, validates structural integrity through a strict Zod schema layer, validates user identity context from the active Supabase authentication token, and writes to PostgreSQL via Prisma[cite: 7].

3. **Timeline Hydration (Reads):** The timeline uses React Query (TanStack Query) to manage remote server state synchronization. Reads target the user's secure route handler, sorting results in reverse-chronological order[cite: 7]. Upon successful creation of an entry, the React Query cache is automatically invalidated to seamlessly update the UI timeline without manual page refreshes.

## State Management

To keep the application responsive and clean, global state libraries are restricted to specialized concerns:
- **Server State:** React Query (TanStack Query) is the absolute standard for data queries, cache synchronization, API error management, and mutation tracking across both Web and Mobile interfaces.
- **Client UI State:** Zustand is utilized exclusively for lightweight, ephemeral global UI configurations (e.g., managing the current selected song state during the entry flow or maintaining active filter states). 

Do not add Redux, Recoil, or complex context providers without explicit permission from the developer.

## Database Access

All database access goes through the Prisma ORM[cite: 7]. Raw SQL execution is forbidden unless explicitly required for a migration script. Every query accepting user input must utilize Prisma's parameterized query engine; string interpolation is completely banned to avoid SQL injection vulnerabilities.

The Prisma Client instance must be loaded from `lib/prisma.ts`, which exports a global memory singleton. Do not instantiate `new PrismaClient()` inline anywhere else in the application, as doing so will exhaust the database connection pool in serverless environments.

## Authentication

Authentication is handled securely via Supabase Auth[cite: 7]. Next.js route handlers verify JWT authorization headers passed from client requests, ensuring unauthenticated traffic is short-circuited with a `401 Unauthorized` status[cite: 7]. React Native stores auth tokens securely using Expo SecureStore. Client components receive auth parameters passed down as props from parent server environments or read securely from established custom authentication providers.

## Error Handling

Serverless route handlers return consistent, structured JSON objects:
- On Success: `NextResponse.json({ ok: true, data })`
- On Failure: `NextResponse.json({ ok: false, error: { code, message } }, { status })`

Raw runtime execution faults, server stack traces, or internal database engine logs must never be exposed to the client. Errors must be captured and logged internally on the server, while a sanitized, user-friendly string is passed back to the user interface[cite: 7].

## Environments

- `development` runs locally using a local or test PostgreSQL instance, simulated Expo clients, and developer Spotify API keys.
- `production` runs on Vercel and the live Expo distribution track, tied to the production Supabase PostgreSQL engine and production-tier API keys[cite: 7].

## What Not to Do

- Do not add social logic, public feeds, or profile sharing mechanics; Echo is entirely private[cite: 7].
- Do not let a user save a journal entry with an unverified song string; all tracks must check out against Spotify metadata[cite: 7].
- Do not make direct client-side requests to the Spotify API from the UI layer; all integrations must route through the Next.js backend proxy route handlers to secure client secrets.
- Do not store user entries or cached album artwork directly on the local mobile filesystem. Rely on the production Supabase database instance to avoid data loss[cite: 7].