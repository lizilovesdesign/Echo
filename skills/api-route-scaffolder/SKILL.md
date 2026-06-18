# Skill: API Route Scaffolder — Echo

Load this skill when creating or modifying a Next.js route handler (`app/api/**/route.ts`) or a server-side action handler. It dictates the precise operational structure, validation chains, context boundaries, and structural envelopes for every API endpoint within the Echo ecosystem.

## Before You Start

Read `.agent/rules/architecture.md` and `.agent/rules/security.md`. This skill assumes you are fully aware of structural boundaries and that you will validate inputs and protect user privacy exactly as defined in those documents.

Ask: **should this be an internal server helper/action or a route handler?**
- **Server-side components or actions** if the consumer is a Server Component page (dashboard timeline or form submit logic).
- **Route handler** if the endpoint is a third-party lifecycle webhook, or an external verification pipeline.

## Route Handler Template

```ts
// app/api/echoes/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { verifyAuthSession } from '@/lib/auth';

// Define strict validation constraints matching PRD limits
const createEchoSchema = z.object({
  songTitle: z.string().min(1),
  artist: z.string().min(1),
  albumArtUrl: z.string().url(),
  moodTag: z.enum(['Nostalgic', 'Energetic', 'Melancholic', 'Calm']), // Pre-defined validation tags
  note: z.string().max(500), // Strict character ceiling
});

type SuccessEnvelope<T> = { ok: true; data: T };
type FailureEnvelope = { ok: false; error: { code: string; message: string } };

export async function POST(req: NextRequest) {
  try {
    // 1. Intercept payload and parse safely
    const body = await req.json().catch(() => null);
    const parsed = createEchoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<FailureEnvelope>(
        { ok: false, error: { code: 'invalid_input', message: 'Please verify your note length and selections.' } },
        { status: 400 }
      );
    }

    // 2. Extract and authenticate session token securely
    const session = await verifyAuthSession(req);
    if (!session) {
      return NextResponse.json<FailureEnvelope>(
        { ok: false, error: { code: 'unauthenticated', message: 'Session expired or invalid.' } },
        { status: 401 }
      );
    }

    // 3. Authorization Check: Implicitly bind mutations to the user's verified identity.
    //    Never trust or blindly extract a user ID from the raw client body parameter.
    const authenticatedUserId = session.userId;

    // 4. Operational Execution (Keep handler small, offload deep business tasks to lib/ wrappers)
    const newEchoEntry = await prisma.echoEntry.create({
      data: {
        userId: authenticatedUserId,
        songTitle: parsed.data.songTitle,
        artist: parsed.data.artist,
        albumArtUrl: parsed.data.albumArtUrl,
        moodTag: parsed.data.moodTag,
        note: parsed.data.note,
      },
    });

    // 5. Structure a predictable response envelope
    return NextResponse.json<SuccessEnvelope<typeof newEchoEntry>>(
      { ok: true, data: newEchoEntry },
      { status: 201 }
    );
  } catch (error) {
    // Structured backend execution telemetry log. Sensitive payload blocks are scrubbed cleanly.
    logger.error('api.echoes.create.failed', { error });

    return NextResponse.json<FailureEnvelope>(
      { ok: false, error: { code: 'server_error', message: 'An error occurred while preserving your memory.' } },
      { status: 500 }
    );
  }
}
```

## The Core Rules

- **Always validate with Zod runtime blocks.** Query search strings, request bodies, and incoming parameters are untrusted. TypeScript signatures vanish at compilation; runtime Zod validation schemas are our absolute safety shield.

- **Explicitly enforce Tenant Isolation Rules.** After confirming token authentication, you must ensure that all queries are explicitly scoped directly to the authenticated user's ID (`userId === session.userId`). Never allow queries to fetch or alter any journal resource based purely on arbitrary path properties or client arguments.

- **Deliver an invariant data envelope.** Success responses must uniformly expose `{ ok: true, data: ... }`. Failures must uniformly map to `{ ok: false, error: { code, message } }`. This strict consistency simplifies error handling and parsing routines across the client.

- **Sanitize system exception outputs.** Raw backend processing errors, Prisma database crashes, or external Spotify API handshake rejections must never leak to the client. Log detailed technical error metrics securely on the server track, and return a clean, friendly string directly to the end user.

- **Map correct semantic HTTP status metrics:**
  - `200` for successful data updates or telemetry retrieval operations.
  - `201` for the clean persistence of a newly generated resource (e.g., creating an Echo entry).
  - `400` for input validation breaches or bad payload formats.
  - `401` if an active session verification token is missing or corrupted.
  - `403` if a session token is active but fails explicit tenant data authorization limits.
  - `404` if an expected entry or specific journal path is missing.
  - `429` if rate limiting thresholds are triggered.
  - `500` for internal engine faults or server issues.

- **Enforce tight rate limits on unauthenticated endpoints.** Any public-facing logic (such as proxy routes for music searches or initial login workflows) must apply rate-limiting blocks to minimize denial-of-service vulnerabilities. Embody standard processing protections using `lib/rate-limit.ts`.

- **Incorporate structured telemetry metrics.** Never use free-form log strings. Implement structural tracking schemas like `logger.info('echo.entry_persisted', { userId, entryId })` instead of string interpolation. This ensures logs are fully indexable and searchable.

## Server Action Framework (Internal Web Companion Sync)

For routes exclusively serving mutations within the web companion portal framework, utilize standardized server actions configured with accurate runtime tracking blocks:

```ts
// app/(journal)/actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { getWebSession } from '@/lib/auth';

const deleteSchema = z.object({ id: z.string() });

type ActionOutput =
  | { ok: true; data?: unknown }
  | { ok: false; error: { code: string; message: string } };

export async function deleteEchoEntry(formData: FormData): Promise<ActionOutput> {
  try {
    const session = await getWebSession();
    if (!session) {
      return { ok: false, error: { code: 'unauthorized', message: 'Please authenticate to proceed.' } };
    }

    const parsed = deleteSchema.safeParse({ id: formData.get('id') });
    if (!parsed.success) {
      return { ok: false, error: { code: 'invalid_input', message: 'Target record parameter is invalid.' } };
    }

    // Explicit Ownership Verification Phase
    const targetRecord = await prisma.echoEntry.findUnique({ where: { id: parsed.data.id } });
    if (!targetRecord || targetRecord.userId !== session.userId) {
      return { ok: false, error: { code: 'forbidden', message: 'Action not authorized.' } };
    }

    await prisma.echoEntry.delete({ where: { id: parsed.data.id } });

    revalidatePath('/timeline');
    return { ok: true };
  } catch (error) {
    logger.error('action.delete_echo.failed', { error });
    return { ok: false, error: { code: 'server_error', message: 'Failed to purge data asset cleanly.' } };
  }
}
```

## REST Conventions Enforcement

Adhere strictly to semantic operational tracking definitions:

- `POST` for initiating record persistence (creating a new journal log).
- `PATCH` or `PUT` for executing localized modifications or altering core setup preferences.
- `DELETE` for dropping data entries.
- `GET` for retrieval, feed sorting, or metadata lookup queries.

## Common Routing Pitfalls to Avoid

- Skipping runtime Zod checks and relying entirely on static TypeScript definitions.
- Authenticating user presence but forgetting to verify ownership before mutating data.
- Bypassing strict user context parsing by extracting `userId` parameters blindly from user form values or public properties.
- Exposing raw database schemas by allowing stack traces or database errors to leak directly into the response payload.
- Neglecting to invoke explicit cache validation mechanics (`revalidatePath` or `revalidateTag`) within server action layers, causing the client application to display stale interface information.
- Packing complex data extraction workflows directly inside the handler file; isolate dense calculations or external requests into clean wrappers inside the `lib/` directory.