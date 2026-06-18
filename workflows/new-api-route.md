# Workflow: Scaffold a New API Route

Load this workflow whenever you are adding a new Next.js Route Handler under `app/api/`. Follow every step. Do not skip validation or auth steps — they are security requirements, not suggestions.

**Load before starting:** `skills/api-route-scaffolder/SKILL.md`, `.agent/rules/security.md`, `.agent/rules/architecture.md`

---

## Step 1 — Decide: Route Handler or Server Action?

**Use a Route Handler** (`app/api/**/route.ts`) when:
- The endpoint is a third-party webhook (e.g., a future payment or notification callback).
- You need fine-grained HTTP method control.

**Use a Server Action** (`app/(journal)/actions.ts`, marked `'use server'`) when:
- The consumer is exclusively a Server Component page (e.g., a form submission).

If in doubt, use a Route Handler.

---

## Step 2 — Create the File

Route handlers live at:
```
app/api/<resource>/<optional-sub-resource>/route.ts
```

Examples:
```
app/api/echoes/route.ts              ← GET list, POST create
app/api/echoes/[id]/route.ts         ← GET one, PATCH update, DELETE
app/api/music/search/route.ts        ← GET Spotify proxy search
```

One file per resource segment. Export a separate named async function per HTTP method (`GET`, `POST`, `PATCH`, `DELETE`).

---

## Step 3 — Define the Zod Validation Schema

For any handler that receives a body or query params, define the schema at the top of the file before the handler function.

```ts
import { z } from 'zod';

// For POST body validation
const createSchema = z.object({
  fieldA: z.string().min(1),
  fieldB: z.enum(['Option1', 'Option2']),
  optionalNote: z.string().max(500).optional(),
});

// For GET query param validation
const searchSchema = z.object({
  q: z.string().min(1),
});
```

Reusable schemas that are shared across multiple routes belong in `lib/validators/`.

---

## Step 4 — Write the Handler

Use this exact structure every time. Do not deviate from the ordering.

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { verifyAuthSession } from '@/lib/auth';

const bodySchema = z.object({ /* ... */ });

type SuccessEnvelope<T> = { ok: true; data: T };
type FailureEnvelope = { ok: false; error: { code: string; message: string } };

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate the request body
    const body = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<FailureEnvelope>(
        { ok: false, error: { code: 'invalid_input', message: 'Invalid request data.' } },
        { status: 400 }
      );
    }

    // 2. Authenticate the session
    const session = await verifyAuthSession(req);
    if (!session) {
      return NextResponse.json<FailureEnvelope>(
        { ok: false, error: { code: 'unauthenticated', message: 'Session expired or invalid.' } },
        { status: 401 }
      );
    }

    // 3. Extract userId from the verified session — never from the request body
    const { userId } = session;

    // 4. Business logic (keep thin — delegate to lib/ for complexity)
    const result = await prisma.myModel.create({
      data: { userId, ...parsed.data },
    });

    // 5. Return success envelope
    return NextResponse.json<SuccessEnvelope<typeof result>>(
      { ok: true, data: result },
      { status: 201 }
    );
  } catch (error) {
    logger.error('api.myroute.post.failed', { error });
    return NextResponse.json<FailureEnvelope>(
      { ok: false, error: { code: 'server_error', message: 'Something went wrong.' } },
      { status: 500 }
    );
  }
}
```

---

## Step 5 — Register the Validator in `lib/validators/`

If the schema is non-trivial or will be reused elsewhere, extract it:

```
lib/validators/echoEntry.ts
lib/validators/spotify.ts
```

Export both the schema and the inferred type:

```ts
export const mySchema = z.object({ ... });
export type MyInput = z.infer<typeof mySchema>;
```

---

## Step 6 — Add Rate Limiting (Unauthenticated Routes Only)

If the route is public-facing or unauthenticated (e.g., the Spotify search proxy, which runs before a user is logged in):

```ts
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 });
  try {
    await limiter.check(req, 20, 'MUSIC_SEARCH'); // 20 requests per minute
  } catch {
    return NextResponse.json<FailureEnvelope>(
      { ok: false, error: { code: 'rate_limited', message: 'Too many requests. Slow down.' } },
      { status: 429 }
    );
  }
  // ... rest of handler
}
```

---

## Step 7 — Verify

Before committing, verify the following manually with a REST client (e.g., Postman or `curl`):

- [ ] `POST` with a valid body and valid session → returns `201` and the created resource.
- [ ] `POST` with a missing required field → returns `400` with `code: 'invalid_input'`.
- [ ] `POST` with no auth cookie/token → returns `401`.
- [ ] `POST` with a valid session but a `userId` belonging to a different user's resource → returns `403`.
- [ ] Deliberately trigger a database error (e.g., disconnect DB) → returns `500` without leaking a stack trace.
- [ ] Confirm nothing sensitive (journal note text, tokens, passwords) appears in server logs.
