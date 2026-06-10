# Workflow: Add or Modify a Database Model

Load this workflow whenever you are adding a new Prisma model, adding columns to an existing model, adding indexes, or modifying constraints. Treat every step as mandatory — skipping any step risks corrupting user data in production.

**Load before starting:** `skills/db-migration-runner/SKILL.md`, `.agent/rules/architecture.md`

---

## Step 1 — Plan the Schema Change on Paper First

Before touching any file, write out in plain language:

1. What model(s) are being added or modified?
2. What are the data types and constraints for each new field?
3. Does any new field have a `NOT NULL` constraint? If so, does the table already have rows in production? If yes, you must use the expand-contract pattern (see `skills/db-migration-runner/SKILL.md`).
4. Are there any foreign key relationships? Identify the parent model and the cascade behaviour (`onDelete: Cascade` vs `onDelete: Restrict`).
5. Are there any fields that will be queried frequently in combination? Plan your `@@index()` declarations now.

Do not proceed until these questions are answered.

---

## Step 2 — Edit `prisma/schema.prisma`

Open `prisma/schema.prisma`. This is the single source of truth for the database. Make your changes here.

**Naming conventions:**
- Models are `PascalCase` singular: `User`, `EchoEntry`.
- Fields are `camelCase`: `userId`, `albumArtUrl`, `createdAt`.
- Prisma maps `camelCase` fields to `snake_case` columns in PostgreSQL automatically via `@map`.

**Common patterns to follow:**

```prisma
model EchoEntry {
  id           String   @id @default(uuid())
  userId       String
  songTitle    String
  artist       String
  albumArtUrl  String
  spotifyTrackId String
  moodTag      MoodTag
  note         String   @default("")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Composite index for fast reverse-chronological timeline queries per user
  @@index([userId, createdAt(sort: Desc)])
}

enum MoodTag {
  Nostalgic
  Energetic
  Melancholic
  Calm
}
```

---

## Step 3 — Generate the Migration

Run the following command from the project root:

```bash
npx prisma migrate dev --name <descriptive_name>
```

Name the migration clearly in `snake_case`, describing the change:
- ✅ `add_echo_entry_table`
- ✅ `add_spotify_track_id_to_echo_entries`
- ✅ `add_mood_tag_enum`
- ❌ `update_schema`
- ❌ `fix_stuff`

This command will:
1. Compare `schema.prisma` to the current database state.
2. Generate a SQL migration file in `prisma/migrations/<timestamp>_<name>/migration.sql`.
3. Apply it to your local development database.
4. Regenerate the Prisma Client types.

---

## Step 4 — Review the Generated SQL

**This step is mandatory. Do not skip it.**

Open the generated `migration.sql` file and read it completely. Verify:

- [ ] The correct tables and columns are being created or altered.
- [ ] Foreign key constraints reference the correct parent tables.
- [ ] `NOT NULL` constraints are only on new tables or columns with default values.
- [ ] No existing data columns are being accidentally dropped.
- [ ] Index declarations match your intent.

If anything looks wrong, do not proceed. Delete the migration file, fix the schema, and regenerate.

---

## Step 5 — Regenerate and Verify the Prisma Client

After generating the migration, confirm the Prisma Client types are correct:

```bash
npx prisma generate
```

Then open the relevant route handler or server action and verify that:
- The new model/field is available via `prisma.<ModelName>.<method>`.
- TypeScript raises no errors on the new fields.

---

## Step 6 — Test Locally

Start the development server and manually trigger the affected feature:

```bash
npm run dev
```

- Create a new record using the affected UI flow.
- Read it back from the timeline.
- Check the Supabase dashboard (or a local DB client) and confirm the row was written with the correct column values.

---

## Step 7 — Commit Both Files Together

Schema changes and migration files must always be committed in the same git commit. Never commit one without the other.

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "db: add <descriptive_name>"
```

---

## Step 8 — Production Deployment

`prisma migrate deploy` runs automatically in the Vercel build pipeline. It applies all pending migrations that have not yet been run against the production database.

You do not need to run this manually unless you are debugging a deployment issue. If you do run it manually, ensure `DATABASE_URL` in your shell is pointing to the **production** database — double-check before executing.

**Never run `prisma migrate reset` outside of a local development environment.** It drops all tables.
