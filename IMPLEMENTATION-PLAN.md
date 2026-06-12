# Echo — Full Implementation Plan

Echo (formerly MoodTrack) is a private, minimalist mobile journaling application designed to bridge the gap between music discovery and emotional reflection. By allowing users to anchor specific songs to personal memories and moods, Echo transforms a music library into a permanent emotional archive.

This plan details the complete step-by-step implementation for the web companion engine and the native mobile Expo app.

---

## User Review Required

> [!IMPORTANT]
> **Styling Framework Discrepancy (Tailwind CSS/NativeWind vs. CSS Modules/React Native StyleSheet)**
> The user request specifies: *"Styling: Tailwind CSS (Web) and NativeWind/StyleSheet (Mobile)"*. 
> However, the project guidelines in `.agent/rules/code-style.md` and `.agent/rules/design-system.md` explicitly mandate:
> - **Web:** CSS Modules exclusively (`*.module.css`), forbidding Tailwind CSS, utility frameworks, inline CSS, or global class strings.
> - **Mobile:** React Native `StyleSheet.create()` bound to the core tokens in `lib/theme/tokens.ts`, forbidding NativeWind.
>
> In accordance with the instruction: *"The following are user-defined rules that you MUST ALWAYS FOLLOW WITHOUT ANY EXCEPTION. These rules take precedence over any following instructions"*, this implementation plan follows the rules in `.agent/rules/` (CSS Modules for Web, `StyleSheet.create` for Mobile). Please review if this is acceptable.

---

## Open Questions

> [!IMPORTANT]
> 1. **Spotify Developer API Keys:** Do you have a developer client credential set up? We will need `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in `.env.local` to successfully request the client credentials token for proxying search requests.
> 2. **Supabase Database & Authentication:** Are you hosting the Supabase PostgreSQL database locally or using their cloud infrastructure? The auth cookie callback and SecureStore integration require a running Supabase instance.
> 3. **Outfit and Satoshi Fonts:** The design tokens use `'Satoshi', sans-serif` for typography. The instructions also mention the `Outfit` typeface. We will import both fonts from Google Fonts/local configuration. Should Satoshi be the default display/heading typeface and Outfit the body typeface?

---

## Proposed Changes

### Next.js Companion Web App (Root Directory)

This includes the root Next.js scaffolding, App Router, shared directories, database schemas, and public assets.

#### [NEW] [package.json](file:///c:/Users/HomePC/Desktop/Echo/package.json)
Initialize the project config with core next, react, prisma, zod, @tanstack/react-query, zustand, and supabase-js.

#### [NEW] [tsconfig.json](file:///c:/Users/HomePC/Desktop/Echo/tsconfig.json)
Enable typescript strict mode and setup the `@/*` alias pointing to the root workspace.

#### [NEW] [.env.example](file:///c:/Users/HomePC/Desktop/Echo/.env.example)
Define the 7 required environment variables:
`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `JOURNAL_ENCRYPTION_SECRET`, `NEXT_PUBLIC_APP_URL`.

#### [NEW] [app/globals.css](file:///c:/Users/HomePC/Desktop/Echo/app/globals.css)
Global web stylesheet, importing `Color-Style/tokens/tokens.css` and configuring base fonts and root styles.

---

### Database Layer (`prisma/`)

#### [NEW] [prisma/schema.prisma](file:///c:/Users/HomePC/Desktop/Echo/prisma/schema.prisma)
Define PostgreSQL schema matching `new-db-model` workflow:
- `User` model: `id`, `email`, `createdAt`.
- `EchoEntry` model: `id`, `userId` (foreign key), `songTitle`, `artist`, `albumArtUrl`, `spotifyTrackId`, `moodTag` (Enum: Nostalgic, Energetic, Melancholic, Calm), `note` (varchar(500)), `createdAt`, `updatedAt`.
- Explicit index on `[userId, createdAt(sort: Desc)]` for chronological timelines.

---

### Shared Business Logic & Configuration (`lib/`)

#### [NEW] [lib/env.ts](file:///c:/Users/HomePC/Desktop/Echo/lib/env.ts)
Zod validation schema for environment variables, executing on boot to prevent unconfigured runtimes.

#### [NEW] [lib/prisma.ts](file:///c:/Users/HomePC/Desktop/Echo/lib/prisma.ts)
Prisma client instantiation matching the global memory singleton pattern to avoid connection exhaustion in serverless runtimes.

#### [NEW] [lib/supabase.ts](file:///c:/Users/HomePC/Desktop/Echo/lib/supabase.ts)
Supabase server and browser client instantiation utility functions utilizing `@supabase/supabase-js`.

#### [NEW] [lib/spotify.ts](file:///c:/Users/HomePC/Desktop/Echo/lib/spotify.ts)
Spotify client credentials flow proxy class. Encapsulates token request, token caching, track search queries (`https://api.spotify.com/v1/search`), mapping, and track details fetching.

#### [NEW] [lib/auth.ts](file:///c:/Users/HomePC/Desktop/Echo/lib/auth.ts)
Server-side authentication helpers:
- `verifyAuthSession(req)`: Validates JWT header (for mobile) and decrypts context.
- `getWebSession()`: Retrieves session parameters from encrypted httpOnly cookies (for web companion).

#### [NEW] [lib/logger.ts](file:///c:/Users/HomePC/Desktop/Echo/lib/logger.ts)
Privacy-compliant logging wrapper. Ensures error stack traces and internal metrics are captured, but strips plain text journal entries, credentials, or session tokens.

#### [NEW] [lib/validators/spotify.ts](file:///c:/Users/HomePC/Desktop/Echo/lib/validators/spotify.ts)
Zod validation schemas:
- `SpotifyTrackSchema`: Validates fields `id`, `name`, `artist`, and `albumArtUrl`.

#### [NEW] [lib/validators/echoEntry.ts](file:///c:/Users/HomePC/Desktop/Echo/lib/validators/echoEntry.ts)
Zod validation schemas:
- `CreateEchoSchema`: Validates `songTitle`, `artist`, `albumArtUrl`, `spotifyTrackId`, `moodTag` enum, and `note` (max 500 characters).

#### [NEW] [lib/stores/entryStore.ts](file:///c:/Users/HomePC/Desktop/Echo/lib/stores/entryStore.ts)
Lightweight Zustand store to maintain state across the Quick-Capture wizard workflow: `selectedTrack`, `setSelectedTrack`, and `clearEntry`.

---

### Universal API Layer (`app/api/`)

#### [NEW] [app/api/music/search/route.ts](file:///c:/Users/HomePC/Desktop/Echo/app/api/music/search/route.ts)
`GET` search route handler proxying Spotify search.
- Zod validation for search queries.
- In-memory rate limiting (max 20 requests per minute).
- Formats result array to `SpotifyTrack[]` objects.

#### [NEW] [app/api/echoes/route.ts](file:///c:/Users/HomePC/Desktop/Echo/app/api/echoes/route.ts)
`GET` and `POST` routes for Echo entries:
- `GET`: Returns the authenticated user's entries ordered reverse-chronologically. Scopes entries strictly to `userId` retrieved from auth token.
- `POST`: Validates incoming payload with Zod, checks session auth, stores record to Prisma, returns `201 Created`.

#### [NEW] [app/api/echoes/[id]/route.ts](file:///c:/Users/HomePC/Desktop/Echo/app/api/echoes/%5Bid%5D/route.ts)
`DELETE` route:
- Verifies session, asserts ownership of `id`, deletes entry via Prisma.

---

### Web Companion UI Core Primitives (`components/ui/`)

All components reside in `components/ui/` and use **CSS Modules** exclusively.

#### [NEW] [components/ui/Button.tsx](file:///c:/Users/HomePC/Desktop/Echo/components/ui/Button.tsx) & [Button.module.css](file:///c:/Users/HomePC/Desktop/Echo/components/ui/Button.module.css)
Primary, secondary, and minimal action button wrappers. Ensures touch target bounds of at least `44px x 44px`. Uses `--color-primary` and typography variables.

#### [NEW] [components/ui/Input.tsx](file:///c:/Users/HomePC/Desktop/Echo/components/ui/Input.tsx) & [Input.module.css](file:///c:/Users/HomePC/Desktop/Echo/components/ui/Input.module.css)
Form fields with outline and focus-visible states matching design system border radii (8px).

#### [NEW] [components/ui/Card.tsx](file:///c:/Users/HomePC/Desktop/Echo/components/ui/Card.tsx) & [Card.module.css](file:///c:/Users/HomePC/Desktop/Echo/components/ui/Card.module.css)
Sleek container panel with 12px container radius and surface colors.

#### [NEW] [components/ui/Spinner.tsx](file:///c:/Users/HomePC/Desktop/Echo/components/ui/Spinner.tsx) & [Spinner.module.css](file:///c:/Users/HomePC/Desktop/Echo/components/ui/Spinner.module.css)
Subtle, smooth animated loading states.

---

### Web Companion Journal Domain UI (`components/journal/`)

All domain UI elements reside in `components/journal/` and use **CSS Modules**.

#### [NEW] [components/journal/SongSearchInput.tsx](file:///c:/Users/HomePC/Desktop/Echo/components/journal/SongSearchInput.tsx) & [SongSearchInput.module.css](file:///c:/Users/HomePC/Desktop/Echo/components/journal/SongSearchInput.module.css)
Interactive search box with debounced (300ms) request triggers and search results listing. Includes album art preview (minimum row height 44px).

#### [NEW] [components/journal/SongVerificationCard.tsx](file:///c:/Users/HomePC/Desktop/Echo/components/journal/SongVerificationCard.tsx) & [SongVerificationCard.module.css](file:///c:/Users/HomePC/Desktop/Echo/components/journal/SongVerificationCard.module.css)
Presents full album art and track details. Offers "Use This Song" (saves to Zustand) and "Search Again" (returns focus to search field).

#### [NEW] [components/journal/MoodBubble.tsx](file:///c:/Users/HomePC/Desktop/Echo/components/journal/MoodBubble.tsx) & [MoodBubble.module.css](file:///c:/Users/HomePC/Desktop/Echo/components/journal/MoodBubble.module.css)
Mood button for tags. Uses 4px border radius.

#### [NEW] [components/journal/MoodSelector.tsx](file:///c:/Users/HomePC/Desktop/Echo/components/journal/MoodSelector.tsx) & [MoodSelector.module.css](file:///c:/Users/HomePC/Desktop/Echo/components/journal/MoodSelector.module.css)
Horizontal scroll selector mapping `Calm`, `Melancholic`, `Nostalgic`, `Energetic` bubbles.

#### [NEW] [components/journal/EchoEntryForm.tsx](file:///c:/Users/HomePC/Desktop/Echo/components/journal/EchoEntryForm.tsx) & [EchoEntryForm.module.css](file:///c:/Users/HomePC/Desktop/Echo/components/journal/EchoEntryForm.module.css)
The notes entry panel. Connects `MoodSelector` and a textarea. Limits note to 500 characters and features a character counter.

#### [NEW] [components/journal/EchoEntryCard.tsx](file:///c:/Users/HomePC/Desktop/Echo/components/journal/EchoEntryCard.tsx) & [EchoEntryCard.module.css](file:///c:/Users/HomePC/Desktop/Echo/components/journal/EchoEntryCard.module.css)
Timeline card showing unified track metadata (Album art, title, artist), mood bubble, user reflection notes, and timestamp.

#### [NEW] [components/journal/TimelineFeed.tsx](file:///c:/Users/HomePC/Desktop/Echo/components/journal/TimelineFeed.tsx) & [TimelineFeed.module.css](file:///c:/Users/HomePC/Desktop/Echo/components/journal/TimelineFeed.module.css)
A clean scroll feed that renders multiple `EchoEntryCard` instances.

---

### Web Pages (`app/`)

#### [NEW] [app/layout.tsx](file:///c:/Users/HomePC/Desktop/Echo/app/layout.tsx)
Root web shell wrapper loading Google Fonts (Outfit, Satoshi) and `app/globals.css`.

#### [NEW] [app/page.tsx](file:///c:/Users/HomePC/Desktop/Echo/app/page.tsx)
Checks user auth state. Redirects to `/timeline` or `/login`.

#### [NEW] [app/(marketing)/login/page.tsx](file:///c:/Users/HomePC/Desktop/Echo/app/(marketing)/login/page.tsx)
Sleek email/password login portal leveraging Supabase browser authentication.

#### [NEW] [app/auth/callback/route.ts](file:///c:/Users/HomePC/Desktop/Echo/app/auth/callback/route.ts)
Route handler processing Supabase authentication redirects.

#### [NEW] [app/(journal)/layout.tsx](file:///c:/Users/HomePC/Desktop/Echo/app/(journal)/layout.tsx)
Layout guard ensuring redirect to `/login` if session is absent. Displays global navigation header.

#### [NEW] [app/(journal)/timeline/page.tsx](file:///c:/Users/HomePC/Desktop/Echo/app/(journal)/timeline/page.tsx)
Server component fetching user journal entries server-side using Prisma and feeding them to `TimelineFeed`.

#### [NEW] [app/(journal)/create/page.tsx](file:///c:/Users/HomePC/Desktop/Echo/app/(journal)/create/page.tsx)
The Quick-Capture canvas hosting `SongSearchInput`, `SongVerificationCard`, and `EchoEntryForm` components dynamically based on Zustand store phase.

---

### React Native / Expo Mobile App (`apps/mobile/`)

Mobile workspace setup inside `apps/mobile/`.

#### [NEW] [apps/mobile/package.json](file:///c:/Users/HomePC/Desktop/Echo/apps/mobile/package.json)
Configure Expo project with standard dependencies.

#### [NEW] [apps/mobile/src/lib/theme/tokens.ts](file:///c:/Users/HomePC/Desktop/Echo/apps/mobile/src/lib/theme/tokens.ts)
Map design tokens from `Color-Style/tokens/Color-tokens.json` and `Typography-tokens.json` to React Native JS theme objects.

#### [NEW] [apps/mobile/src/components/ui/TouchableButton.tsx](file:///c:/Users/HomePC/Desktop/Echo/apps/mobile/src/components/ui/TouchableButton.tsx)
Native touchscreen-safe button. Enforces 44px layout targets and maps style variables.

#### [NEW] [apps/mobile/src/components/domain/SongSearchInput.tsx](file:///c:/Users/HomePC/Desktop/Echo/apps/mobile/src/components/domain/SongSearchInput.tsx)
Native track search bar using React Native inputs.

#### [NEW] [apps/mobile/src/components/domain/SongVerificationCard.tsx](file:///c:/Users/HomePC/Desktop/Echo/apps/mobile/src/components/domain/SongVerificationCard.tsx)
Modal/Card component confirming track selection.

#### [NEW] [apps/mobile/src/components/domain/EchoEntryForm.tsx](file:///c:/Users/HomePC/Desktop/Echo/apps/mobile/src/components/domain/EchoEntryForm.tsx)
Mood selector grid and textarea wrapping native scroll boundaries.

#### [NEW] [apps/mobile/src/screens/LoginScreen.tsx](file:///c:/Users/HomePC/Desktop/Echo/apps/mobile/src/screens/LoginScreen.tsx)
Mobile authentication screen saving JWT in `Expo.SecureStore`.

#### [NEW] [apps/mobile/src/screens/TimelineScreen.tsx](file:///c:/Users/HomePC/Desktop/Echo/apps/mobile/src/screens/TimelineScreen.tsx)
List feed rendering entries fetched via React Query from our unified server API layer.

#### [NEW] [apps/mobile/src/screens/CreateEntryScreen.tsx](file:///c:/Users/HomePC/Desktop/Echo/apps/mobile/src/screens/CreateEntryScreen.tsx)
Quick-capture screen managing song search, confirmation, and submission form.

---

## Verification Plan

### Automated Tests
- **Type Safety Checks:** Run `npx tsc --noEmit` in both Next.js and React Native folders to ensure 100% type-correct builds.
- **Prisma Schema Lint:** Run `npx prisma validate` and review generated SQL migrations.
- **Zod Boundaries:** Verify API routes block inputs via Postman/curl:
  - Submit `note` of length > 500 to `POST /api/echoes` -> assert `400 Bad Request`.
  - Submit empty `songTitle` -> assert `400 Bad Request`.
  - Submit request without token -> assert `401 Unauthorized`.
  - Attempt request modifying other user's record -> assert `403 Forbidden`.

### Manual Verification
1. **Quick-Capture Workflow Walkthrough:**
   - Verify typing in search debounces and calls Spotify search API.
   - Verify selection opens confirmation modal with details.
   - Click "Search Again" -> verify search field refocuses.
   - Verify mood selection is required for save button activation.
   - Try to exceed 500 characters in the note -> assert input character counter is capped and physically blocked at 500.
2. **Timeline Updates:**
   - Save entry -> verify list updates instantly without page reloading.
3. **Responsive Testing:**
   - Scale down browser window to 360px width. Verify no text overlaps or layout overflow.
4. **Touch Target Boundaries:**
   - Inspect all clickable layout rows and tags. Verify bounds are at least 44px x 44px.
