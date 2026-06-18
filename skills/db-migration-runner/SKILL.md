# Skill: DB Migration Runner — Echo

Load this skill when changing the database schema, creating a new relational model, adding a column, configuring indexes, or handling database backfills. Migrations represent highly critical operations because structural adjustments are the most difficult to undo and can break data persistence if misconfigured. Treat every schema adjustment as a production-critical commit.

## The Stack

Echo uses PostgreSQL hosted on Supabase. The single source of truth for the database layout lives at `prisma/schema.prisma`. Generated migrations live at `prisma/migrations/`. The Prisma client type definitions are regenerated automatically during migrations and are consumed via the global memory singleton at `lib/prisma.ts`.

## The Workflow

Schema changes must follow this exact sequential cadence:

1. Modify model parameters inside `prisma/schema.prisma`.
2. Execute `npx prisma migrate dev --name <descriptive_name>` to generate a local migration tracking script.
3. Review the generated SQL script inside `prisma/migrations/<timestamp>_<name>/migration.sql` completely from end to end. Do not bypass this validation step. Prisma is highly reliable, but it can misinterpret complex relational intentions.
4. Launch the application locally, trigger the affected UI components, and ensure data reads/writes work correctly.
5. Commit the schema changes and the generated `migration.sql` files together in the same version control batch.
6. Deploy. Within the continuous integration track or the deployment host (Vercel), `npx prisma migrate deploy` is triggered automatically to safely apply pending scripts to production.

Never alter or edit an existing migration file that has already been deployed. If you need to correct a structural mistake, generate a new migration that safely overrides it.

## Naming

Migrations must be written in `snake_case`, cleanly describing the architectural intent:
- `add_echo_entry_table`
- `add_user_id_index_to_echoes`
- `add_mood_tag_enum_constraint`

Clear, semantic names preserve readability within the code history. Abstract names like `update_models` or `fix_schema` are forbidden.

## Common Schema Patterns

### 1. Adding a Nullable Column (Safe)

```prisma
model EchoEntry {
  // ... Existing fields
  updatedAt DateTime? @updatedAt
}
```

Nullable columns are additive and completely safe to execute. Existing data rows are immediately padded with `NULL`, requiring no application downtime or manual backfilling.

### 2. Adding a Non-Nullable Column (Careful)

You cannot inject a `NOT NULL` restriction into an existing table containing live data records without providing a clear fallback constraint or default parameter. For production preservation, manage this using the expand-contract strategy:

1. Provision the new model attribute as completely nullable.
2. Run a data migration script to hydrate all existing entries with matching data values.
3. Apply a subsequent migration to change the column definition from nullable to required (`NOT NULL`).

On an unseeded or brand-new database this layer can be bypassed, but it is strictly enforced once user records are captured.

### 3. Implementing Unique Constraints (Idempotency Shields)

Unique constraints act as the absolute database boundary preventing data duplication anomalies. In Echo, the `id` configurations must be mapped cleanly to avoid structural conflicts.

```prisma
model User {
  id    String @id @default(uuid())
  email String @unique
}
```

Before applying a unique restriction to any active column containing live rows, ensure that no duplicate values exist. The migration engine will throw a hard error and abort if conflicts are discovered.

### 4. Database Indexing

Add explicit database indexes when filtering or query performance experiences latency. In Echo, lookups on timelines are executed continuously. Do not index every column speculatively; each index introduces runtime write overhead to the PostgreSQL engine.

```prisma
model EchoEntry {
  id        String   @id @default(uuid())
  userId    String
  createdAt DateTime @default(now())

  // Accelerates reverse-chronological user timeline hydration
  @@index([userId, createdAt(sort: Desc)])
}
```

## Data Migrations vs. Schema Changes

Prisma handles structural schema alterations exclusively; data backfills or parsing corrections are treated as separate data migrations. If you need to sweep existing rows to sanitize text records or backfill empty structures, write an isolated script within `scripts/data-migrations/`. This code must access the database via the Prisma singleton client and be executed manually via deployment hooks. Never write raw, unparameterized ad-hoc SQL against live production databases.

## Runtime Environments

- **Development:** `npx prisma migrate dev` tracks model updates, produces the SQL output, and executes it against the local test database. This action may prompt to reset your test database if schema drift is encountered; ensure you accept this only in local test environments. Never target production connection strings with this command.
- **Production:** `npx prisma migrate deploy` reads and runs pending migration scripts sequentially without flashing interactive developer prompts. This is the only command permitted within live application deployment cycles.

## Rollback Protocol

Prisma does not build automated down-migration tracking scripts. Rolling back a structural modification means moving forward by deploying a fresh migration that cleanly reverses the previous state.

For high-risk adjustments (such as changing constraint configurations or dropping specific historical properties), rely on the **Expand-Contract Pattern**:

1. Deploy the updated database models with completely additive parameters, keeping older parameters active.
2. Deploy code updates that write and read against both states.
3. Purge the legacy database attributes and clean the source files in a final cleanup deployment pass.

## Character Boundaries and Enums

Echo strictly optimizes for constraints defined in the product specification:

- **Journal Text Bounds:** Track user notes with explicit length structures. The text body must have structural validation matching the 500-character ceiling outlined in the PRD.
- **Mood Tag Enums:** Mood values must map directly to the strict predefined list (`Nostalgic`, `Energetic`, `Melancholic`, `Calm`). Ensure structural consistency by using Prisma enums or database-level text constraints.

## Common Mistakes to Avoid

- Directly modifying a migration file that has already been executed elsewhere in the system.
- Injecting a required, non-nullable attribute into an existing, live database table without setting an explicit default string or running an initial fallback step.
- Failing to verify the raw, compiled `migration.sql` output locally before committing it to git.
- Accidentally running `prisma migrate reset` on a non-development database, which completely drops all production tracking tables.
- Storing transactional or analytical counters using volatile, floating-point data structures instead of precise integer types.
- Committing model changes inside `schema.prisma` while failing to include the matching generated migration files in the same pull request.