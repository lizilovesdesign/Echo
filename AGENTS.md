# AGENTS.md — Echo

This file is the entry point for any AI agent working on the Echo codebase. Read this first, then load the rule files in `.agent/rules/` and the relevant skill in `skills/` before taking any action.

## What Echo Is
Echo is a private, minimalist journaling application designed to bridge the gap between music discovery and emotional reflection. By allowing users to anchor specific songs to personal memories and moods, Echo transforms a music library into a permanent emotional archive. It is a strictly private, distraction-free environment. It is not a social network, not a music streaming platform, and not a public blogging utility. Every feature decision must be measured against one question: does this help a user anchor a song to a personal memory and a mood in under 20 seconds?

## Who We Are Building For
Individuals seeking intentionality, mindfulness, and personal growth through music. They are mobile-first users who expect an intimate, highly responsive, and secure digital diary. The user experience must prioritize "Quick-Capture" mechanics to remove friction between feeling an emotion and documenting it. Heavy client-side loading states, intrusive popups, multi-step confirmation screens, or social features are entirely wrong for this audience.

Echo is a **responsive single-page web app** — it works beautifully on both desktop and mobile browsers. No separate native app needed.

## Tech Stack
- **Frontend:** Next.js (App Router) — fully responsive, mobile-first
- **Backend/API Layer:** Next.js Route Handlers
- **Database Engine:** PostgreSQL hosted on Supabase
- **Data Layer (ORM):** Prisma ORM
- **Music Data Integration:** Spotify Web API (the absolute source of truth for verified song metadata)
- **Deployment & Hosting:** Vercel
- **PWA:** Installable on mobile home screens via web manifest

## Project Structure
```
echo/
├── AGENTS.md                          (this file)
├── .agent/
│   └── rules/                         (always-on rules for every task)
│       ├── architecture.md
│       ├── code-style.md
│       ├── design-system.md
│       └── security.md
├── skills/                            (load only when relevant to the task)
│   ├── component-builder/
│   │   └── SKILL.md
│   ├── db-migration-runner/
│   │   └── SKILL.md
│   └── api-route-scaffolder/
│       └── SKILL.md
└── workflows/                         (step-by-step recipes for common tasks)
    ├── create-echo-entry.md           ← The core Quick-Capture flow
    ├── new-component.md               ← Building any UI component
    ├── new-api-route.md               ← Scaffolding a Route Handler
    ├── new-db-model.md                ← Adding or modifying a Prisma model
    └── auth-protected-route.md        ← Protecting pages, routes, and screens
```


## How to Use These Files
**Rules in `.agent/rules/` are always in effect.** Load all four before starting any task. They cover architectural boundaries, code style, layout constraints, and privacy/security mandates. Do not override them without explicit permission from the developer.

**Skills in `skills/` are loaded on demand.** When building a UI component, read `skills/component-builder/SKILL.md`. When altering the database schema, read `skills/db-migration-runner/SKILL.md`. When creating a serverless API endpoint, read `skills/api-route-scaffolder/SKILL.md`. Never skip a skill file and try to work from memory.

**Workflows in `workflows/` are step-by-step recipes.** When the task matches a workflow, load it and follow its steps in sequence. Workflows combine rules and skills into a concrete execution plan — they tell you exactly what to build, in what order, and how to verify it.

## Non-Negotiables
1. **Absolute Privacy:** Echo is completely private. There are no public social feeds, likes, comments, or shared timelines. All journal entries belong strictly to the authenticated creator.
2. **Spotify Serialization:** Every song attached to an entry must be fetched and verified against the Spotify Web API. Do not allow users to save arbitrary text as a song title without valid track metadata (Title, Artist, Album Art URL).
3. **Prisma Lifecycle Safety:** The Prisma Client must be instantiated as a strict singleton pattern to completely block connection pool exhaustion across serverless environments.
4. **Secrets Security:** Sensitive credentials (Spotify API client keys, Supabase URLs, database string endpoints) reside exclusively in env variables and must never be exposed or committed to the codebase.
5. **Mobile-First CSS:** Every page and component must work on screens as narrow as 320px. All interactive elements must have a minimum touch target of 44×44px.
6. **PWA-Ready:** The app must be installable on mobile home screens. A web manifest and service worker registration are required.

## When in Doubt
Ask the developer. Do not make guesses regarding authentication hooks, structural schema variations, or data persistence pipelines. Small mistakes in data structure create errors that corrupt personal history logs.