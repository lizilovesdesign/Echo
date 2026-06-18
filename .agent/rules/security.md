---
trigger: always_on
---

# Security & Privacy Rules — Echo

Echo handles deeply personal, intimate journal entries and emotional data. Users trust us to keep their memories, thoughts, and reflections completely secure and private. A security mistake here is not just a bug; it is a direct breach of that sacred user trust. Every agent working on this codebase must follow these rules without exception.

## Secrets and Configuration

Never commit secrets, API tokens, or encryption keys to the repository. Sensitive information lives entirely in system environment variables, managed through a strictly validated configuration framework.

The required environment variables are:

DATABASE_URL                # Supavisor transaction pooler connection string (runtime, PrismaClient)
DIRECT_URL                  # Direct connection string (Prisma CLI migrations only)
NEXT_PUBLIC_SUPABASE_URL    # Public Supabase project URL
SUPABASE_SERVICE_ROLE_KEY   # Secret service role key for bypassing RLS rules securely on the server
SPOTIFY_CLIENT_ID           # Public Spotify developer app client ID
SPOTIFY_CLIENT_SECRET       # Secret Spotify developer key (server-side only)
JOURNAL_ENCRYPTION_SECRET   # Cryptographic secret for encrypting journal text content at rest
NEXT_PUBLIC_APP_URL         # Target application deployment URL


Environment variables are validated at runtime during application boot using Zod in `lib/env.ts`. If any required system variable is missing, the application must abort execution immediately rather than operating in an unconfigured, unstable state.

Only variables explicitly prefixed with `NEXT_PUBLIC_` are safely exposed to client runtimes (browser scopes). Never append this prefix to any sensitive secret key under any circumstances.

## Authentication & Session Persistence

Authentication is anchored entirely via Supabase Auth. Passwords must be cryptographically hashed securely using high-entropy primitives (Bcrypt/Argon2id) managed downstream by Supabase. Plaintext passwords must never hit our system buffers or log structures.

- **Web Sessions:** Handled via secure, encrypted cookies configured with:
  - `httpOnly: true` (blocking client-side document cookie extraction scripts)
  - `secure: true` in production deployment tracks
  - `sameSite: 'lax'` to secure cross-site transaction integrity

When a user logs out, clear cookies and issue a termination request to Supabase to invalidate the token layout server-side.

## Input Validation & Sanitization

Every data payload entering an Echo endpoint from an external environment must be parsed and strictly validated using Zod prior to processing business logic or interacting with Prisma. This is mandatory for:
- Journal entry submission payloads (Zod schema checking length, structures, string validation)
- Spotify proxy search queries and matching parameters
- Account modifications and settings parameters

Validation is strictly the server's responsibility. Client code can handle field requirements for clean UX, but the backend proxy routes are the final safety barrier.

## SQL Injection Protection

All database interactions must route directly through the Prisma ORM instance. Prisma parameters are safely escaped by default, preventing traditional SQL injection techniques. 
- Never use string interpolation or unescaped concatenation inside raw template operations.
- If raw SQL manipulations become necessary for database migrations or analytics, use Prisma's safe parameterized wrappers (`prisma.$queryRaw`), never `prisma.$queryRawUnsafe`.

## Cross-Site Scripting (XSS) & Data Sanitization

React safely sanitizes default strings, but the text elements written by users during raw reflection flows demand structural safety:
- **`dangerouslySetInnerHTML` is explicitly banned** across the web companion layout unless evaluating verified, strictly sanitized system text.
- If rendering formatted notes, markdown blocks, or parsed journal highlights, the raw data must first pass through an server-side sanitation pass (e.g., using DOMPurify) before being outputted.
- All user-supplied track references or deep streaming links must be explicitly checked. Ensure they conform strictly to valid, secure protocols (`https://`) matching designated, white-listed streaming endpoints (such as `open.spotify.com`).

## Zero Social Sharing & CSRF Protection

Because Echo is designed to be a strictly private space, there are no public feeds or social routes. Next.js Server Actions automatically include cross-site request forgery protection. 
- For state-mutating Next.js Route Handlers (`POST`, `PUT`, `DELETE`), verify incoming calls against the system `Origin` and `Referer` headers to match the registered platform workspace.
- Rely on proper `sameSite: 'lax'` tracking vectors to fully prevent third-party cross-site request state hijacking.

## Content Safety & Private Logging Rules

To ensure a safe environment while strictly preserving total personal privacy:
- **Server-Side Content Filtering:** Implement an automated, fast dictionary interceptor block within journal persistence route handlers to scrub malicious input anomalies or configuration anomalies.
- **Strict Data Access Bounds:** Database read or write updates must execute queries contextually bound to the authenticated user's verified token parameter (`user_id`). Never query entries via loose, unverified, or client-supplied identifier arguments.

## Privacy-Compliant System Logging

Log system performance and errors to preserve system health, but never leak personal user content or credentials into system logs.

- **Allowed Tracking Parameters:** Log request method wrappers, endpoint path locations, operation durations, server statuses, and unique session tracking indices.
- **Explicitly Banned Log Parameters:** Never emit plain text strings of journal entries (`note`), specific selected mood structures, parsed target track vectors, Supabase authentication tokens, Spotify developer app credentials, or plain text credentials. If an error surfaces inside an active entry routing transaction, catch the exception object, print generic identifiers, and scrub the user content before outputting to log telemetry.

## Image & Asset Ingestion Security

Echo automatically gathers album graphics using track lookup matches retrieved via the Spotify API proxy.
- If the application ever introduces customized image uploading workflows (such as custom collection backdrops or user icons), you must process assets via explicit image byte evaluations (validating true MIME headers like `image/jpeg` or `image/png`), rather than relying on standard file extension strings.
- Enforce strict size gates (e.g., maximum 5MB) and strip structural EXIF geolocation parameters to protect user privacy.

## Dependency Assessment & Mitigation

Every single added framework package represents a potential security or privacy vulnerability. Keep the ecosystem slim, flat, and minimalist:
- Regularly trigger security audit tracking audits (`npm audit`). Patch detected library vulnerabilities within 7 days.
- Do not introduce packages with small user footprints or abandoned repositories. Echo relies on heavily tested primitives to eliminate structural system liabilities.

## Incident Escalation Blueprint

If a vital configuration key, database access parameter, or api certificate leaks into a public repository branch or visible log file, execute rotation sequences immediately using this order:
1. Revoke and rotate the compromised credential token directly inside the parent environment dashboard (Spotify, Supabase, Vercel).
2. Apply the updated key array securely to production configuration parameters.
3. Deploy the patch layout instantly to terminate vulnerable operations.
4. Issue a formal, absolute written documentation briefing to the developer summarizing the exposure event, timeline vector, and recovery resolution steps.