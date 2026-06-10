# Workflow: Add a New Expo Mobile Screen

Load this workflow whenever you are adding a new screen to the Expo mobile application. Mobile screens are the user's primary interaction surface — keep them fast, focused, and touch-safe.

**Load before starting:** `skills/component-builder/SKILL.md`, `.agent/rules/design-system.md`, `.agent/rules/architecture.md`

---

## Step 1 — Identify the Screen's Purpose

Before creating any files, answer:

1. **What is the single job of this screen?** (e.g., "Show the timeline of past entries in reverse-chronological order.")
2. **Is it part of the authenticated tab flow or a standalone modal/sheet?**
3. **What data does it need?** Does it fetch from the API, or is it driven purely by local navigation state?
4. **What are the exit paths?** What screens can the user navigate to from here, and what triggers each navigation?

---

## Step 2 — Create the Screen File

Screens live in:
```
apps/mobile/src/screens/<screen-name>/
```

Each screen gets its own subdirectory containing:
```
apps/mobile/src/screens/timeline/
├── TimelineScreen.tsx      ← The screen component
└── _components/            ← Sub-components used only by this screen
    └── EntryRow.tsx
```

Elevate a component from `_components/` to `apps/mobile/src/components/domain/` only when a second screen needs it.

---

## Step 3 — Write the Screen Component

Screens are always functional components. Keep them thin — they orchestrate data fetching and pass data down to dumb UI components.

```tsx
// apps/mobile/src/screens/timeline/TimelineScreen.tsx
import { FlatList, View, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { theme } from '@/lib/theme/tokens';
import { fetchEchoes } from '@/lib/api/echoes';
import { EntryRow } from './_components/EntryRow';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';

export function TimelineScreen() {
  const { data: entries, isLoading, isError } = useQuery({
    queryKey: ['echoes'],
    queryFn: fetchEchoes,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <EmptyState message="Could not load your memories. Try again." />;
  if (!entries?.length) return <EmptyState message="No memories yet. Capture your first one." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EntryRow entry={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
});
```

---

## Step 4 — Set Up Data Fetching

All API calls from the mobile app go through a thin client wrapper in `apps/mobile/src/lib/api/` or `lib/api/` (shared). They should never call `fetch` directly inside a component.

```ts
// lib/api/echoes.ts
import { EchoEntry } from '@/lib/validators/echoEntry';

export async function fetchEchoes(): Promise<EchoEntry[]> {
  const res = await fetch('/api/echoes', {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error.message);
  return json.data;
}
```

Use `useQuery` from TanStack Query for all reads. Use `useMutation` for writes. Never fetch inside a `useEffect`.

---

## Step 5 — Register the Screen in Navigation

Add the screen to the navigation configuration in `apps/mobile/App.tsx` or the relevant Expo Router file:

```tsx
// Using Expo Router (file-based routing in apps/mobile/src/app/)
// Create: apps/mobile/src/app/(tabs)/timeline.tsx

export { TimelineScreen as default } from '@/screens/timeline/TimelineScreen';
```

If using a stack navigator directly, register it inside the navigator configuration and assign a route name that matches the design spec.

---

## Step 6 — Handle Loading, Error, and Empty States

Every screen that fetches data must handle all three states explicitly. Never render a blank screen. Each state must be a visible, non-jarring UI:

| State | Requirement |
|---|---|
| **Loading** | Show a `<LoadingSpinner />` or skeleton placeholder |
| **Error** | Show an `<EmptyState />` with a retry action |
| **Empty** | Show an `<EmptyState />` with a prompt to take action |

---

## Step 7 — Optimistic Updates (For Write Screens)

If the screen triggers a mutation (e.g., saving a new Echo entry), implement optimistic updates via TanStack Query to keep the UI snappy:

```ts
const mutation = useMutation({
  mutationFn: createEchoEntry,
  onMutate: async (newEntry) => {
    // Cancel any in-flight refetches
    await queryClient.cancelQueries({ queryKey: ['echoes'] });
    // Snapshot the previous value for rollback
    const previousEntries = queryClient.getQueryData(['echoes']);
    // Optimistically insert the new entry at the top
    queryClient.setQueryData(['echoes'], (old: EchoEntry[]) => [newEntry, ...old]);
    return { previousEntries };
  },
  onError: (_err, _newEntry, context) => {
    // Roll back on failure
    queryClient.setQueryData(['echoes'], context?.previousEntries);
  },
  onSettled: () => {
    // Always refetch to sync with the server
    queryClient.invalidateQueries({ queryKey: ['echoes'] });
  },
});
```

---

## Step 8 — Verification Checklist

Before committing the new screen:

- [ ] Screen renders correctly on a 360px wide viewport (small Android device).
- [ ] Loading state is visible and does not flash briefly for fast connections (add a minimum spinner duration if needed).
- [ ] Error state is shown when the API returns a non-200 response.
- [ ] All tappable elements meet the 44px minimum touch target requirement.
- [ ] Navigation to and from the screen works correctly (no broken back stack).
- [ ] No `console.log` calls left in the file.
- [ ] TypeScript compiles with no errors (`npx tsc --noEmit`).
