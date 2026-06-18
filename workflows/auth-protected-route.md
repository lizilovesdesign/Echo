# Workflow: Add Authentication to a Route or Page

Load this workflow whenever you need to protect a Next.js page or a Route Handler behind authentication. Every piece of content in Echo is private — there are no public-facing journal pages.

**Load before starting:** `.agent/rules/security.md`, `.agent/rules/architecture.md`

---

## Overview

Authentication is handled by Supabase Auth. The session is persisted via secure cookies and produces a verified `userId` that gets bound to every database operation.

```
Secure cookie → Supabase server client → userId
```

---

## Protecting a Next.js Page (Web Companion)

### Server Component Page (Default)

For pages inside `app/(journal)/`, auth check happens at the layout level. The `app/(journal)/layout.tsx` should redirect unauthenticated users before any page renders:

```tsx
// app/(journal)/layout.tsx
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase';

export default async function JournalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return <>{children}</>;
}
```

Do not repeat this check on every individual page inside the group — the layout handles it once for all children.

### Passing the User to Server Components

Once auth is confirmed in the layout, individual pages can fetch the user and pass it down as props:

```tsx
// app/(journal)/timeline/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase';

export default async function TimelinePage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch entries for this user server-side
  const entries = await prisma.echoEntry.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: 'desc' },
  });

  return <TimelineFeed entries={entries} />;
}
```

---

## Protecting a Route Handler (API)

Every state-mutating Route Handler (`POST`, `PATCH`, `DELETE`) and any `GET` that returns personal data must verify the session token.

Use the shared `verifyAuthSession` helper from `lib/auth.ts`:

```ts
// app/api/echoes/route.ts
import { verifyAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await verifyAuthSession(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'unauthenticated', message: 'Session expired or invalid.' } },
      { status: 401 }
    );
  }

  const { userId } = session;
  // All queries from here must be scoped to userId
  const entries = await prisma.echoEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ ok: true, data: entries });
}
```

**Critical rule:** After verifying the session, always derive `userId` from `session.userId`. Never read a `userId` from the request body, query params, or URL path. A user could send a different `userId` to access another user's data.

---

## Implementing Login & Logout

### Login

Use Supabase's `signInWithOAuth` or `signInWithPassword`. Never handle passwords directly — delegate everything to Supabase.

```ts
// lib/auth.ts — web login helper
import { createBrowserSupabaseClient } from '@/lib/supabase';

export async function signInWithEmail(email: string, password: string) {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}
```

### Logout

On logout, invalidate the session on both the client and the server:

```ts
export async function signOut() {
  const supabase = createBrowserSupabaseClient();
  await supabase.auth.signOut(); // Clears auth cookie
}
```

After calling `signOut()`, redirect to `/` or `/login`. Do not leave the user on a protected page with a stale UI.

---

## Verification Checklist

- [ ] Unauthenticated user visiting a protected web page → redirected to `/login`.
- [ ] Unauthenticated `POST` to any `app/api/echoes/` → `401` response.
- [ ] Authenticated user attempting to read/modify another user's entry by passing a different `userId` → `403` response.
- [ ] After logout → auth cookie is cleared, protected pages redirect to `/login`.
- [ ] Session token is never logged, never returned in an API response, and never stored in `localStorage`.
