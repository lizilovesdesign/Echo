# Workflow: Create a New Echo Entry (Quick-Capture Flow)

This is the most important workflow in the entire project. It covers the complete end-to-end path from a user feeling an emotion to a saved, verified journal entry. Every piece of this flow must be airtight because it is the product's singular core loop.

**Load before starting:** `skills/component-builder/SKILL.md`, `skills/api-route-scaffolder/SKILL.md`

---

## Overview

The Quick-Capture flow has four sequential stages:

```
[1] Song Search  →  [2] Song Confirm  →  [3] Mood + Note  →  [4] Save & Sync
```

No stage can be skipped. A user must explicitly confirm a Spotify-verified track before they can write a note. This is a Non-Negotiable.

---

## Step 1 — Build the Song Search UI

The search input is a client component because it requires `useState` for the query string and `useQuery` for the async search results.

**File location:** `components/journal/SongSearchInput.tsx` + `SongSearchInput.module.css`

**Rules:**
- Debounce the search query by at least 300ms before firing a request. Do not hit the API on every keystroke.
- Display a loading skeleton while results are fetching. Never show a blank space.
- Each result row must show: album art thumbnail, track title, and artist name.
- Minimum touch target per result row: `44px` height.
- The input must have `aria-label="Search for a song"` on web.

**State shape (Zustand — `lib/stores/entryStore.ts`):**
```ts
interface EntryStore {
  selectedTrack: SpotifyTrack | null;
  setSelectedTrack: (track: SpotifyTrack | null) => void;
  clearEntry: () => void;
}
```

---

## Step 2 — Proxy the Spotify Search (API Route)

The client must never call Spotify directly. All search requests go through the internal proxy.

**File:** `app/api/music/search/route.ts`

**Method:** `GET` with query param `?q=<search_term>`

**Steps inside the handler:**
1. Validate `q` is a non-empty string using Zod (`z.string().min(1)`).
2. Call `lib/spotify.ts` to fetch an application-level access token (Client Credentials flow — no user auth needed for search).
3. Call `https://api.spotify.com/v1/search?q=<q>&type=track&limit=8`.
4. Parse and map the response into a clean `SpotifyTrack[]` array — extract only `id`, `name`, `artists[0].name`, and `album.images[0].url`.
5. Return `{ ok: true, data: tracks }`.

**The `SpotifyTrack` type lives in `lib/validators/spotify.ts`:**
```ts
import { z } from 'zod';

export const SpotifyTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  artist: z.string(),
  albumArtUrl: z.string().url(),
});

export type SpotifyTrack = z.infer<typeof SpotifyTrackSchema>;
```

---

## Step 3 — Build the Song Confirmation Card

Once a user taps a search result, transition to a confirmation screen/modal. The user must explicitly tap "Use This Song" before proceeding.

**File location:** `components/journal/SongVerificationCard.tsx`

**Displays:** Album art (full-size), track title, artist name.

**Actions:**
- "Use This Song" → writes track to the Zustand `entryStore` and advances to Step 3.
- "Search Again" → clears `selectedTrack` and returns to the search input.

---

## Step 4 — Build the Mood + Note Form

This form is shown only after a track has been confirmed in the Zustand store.

**File location:** `components/journal/EchoEntryForm.tsx` + `EchoEntryForm.module.css`

**Fields:**
- **Mood selector:** A horizontally scrollable row of `MoodBubble` components. Valid options are exactly: `Nostalgic`, `Energetic`, `Melancholic`, `Calm`. At least one must be selected before saving.
- **Note textarea:** Optional free-text field. Hard-enforced character limit of **500 characters**. Show a live character counter (e.g., `"247 / 500"`). Do not disable the save button when the note is empty — notes are optional.

**Validation (client-side, for UX only):**
- A mood must be selected. Show an inline error message if the user tries to save without one.
- Note length must not exceed 500 characters. The textarea must block additional input at the limit.

---

## Step 5 — Save the Echo Entry (API Route + Mutation)

**File:** `app/api/echoes/route.ts` — `POST` handler

Refer to `skills/api-route-scaffolder/SKILL.md` for the full route handler template.

**Payload sent from the client:**
```ts
{
  songTitle: string;   // from confirmed SpotifyTrack
  artist: string;      // from confirmed SpotifyTrack
  albumArtUrl: string; // from confirmed SpotifyTrack
  spotifyTrackId: string; // store this for future reference
  moodTag: 'Nostalgic' | 'Energetic' | 'Melancholic' | 'Calm';
  note: string;        // may be empty string, max 500 chars
}
```

**Handler steps:**
1. Validate payload with Zod (see `lib/validators/echoEntry.ts`).
2. Verify auth session — extract `userId` from session, never from the request body.
3. Write to `prisma.echoEntry.create(...)`.
4. Return `{ ok: true, data: newEntry }` with status `201`.

**On the client after success:**
- Call `queryClient.invalidateQueries({ queryKey: ['echoes'] })` to refresh the timeline.
- Call `entryStore.clearEntry()` to reset the Zustand flow state.
- Navigate to the timeline.

---

## Step 6 — Verify

Before calling this feature done, manually verify the following:

- [ ] Searching an empty string does nothing (no API call fired).
- [ ] Selecting a song shows the confirmation card with the correct data.
- [ ] Tapping "Search Again" from the confirmation card returns to the search input with the field focused.
- [ ] The save button is disabled while the mutation is in-flight (prevent double-submit).
- [ ] Submitting without a mood selected shows an inline error without submitting.
- [ ] A 500+ character note is physically blocked from being typed (not just a validation error after submit).
- [ ] After a successful save, the new entry appears at the top of the timeline without a page refresh.
- [ ] Auth check: manually delete the auth cookie and attempt to POST — must receive a `401` response.
