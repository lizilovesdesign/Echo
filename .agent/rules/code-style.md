---
trigger: always_on
---

# Code Style Rules — Echo

These are the code-style rules for Echo. They exist so the codebase reads the same way no matter who (or which agent) wrote a given file. Consistency matters more than personal preference.

## Language

TypeScript everywhere. No JavaScript files in `app/`, `components/`, or `lib/`. Configuration files like `next.config.mjs` are the only exceptions.

Strict mode is on. Do not disable `strict`, `noImplicitAny`, or `strictNullChecks` to make an error go away. Fix the type instead.

## Naming

- Components are `PascalCase` in `PascalCase.tsx` files. `EchoEntryCard.tsx` exports `EchoEntryCard`.
- Hooks start with `use` and live in `hooks/` or alongside the component that uses them if strictly local.
- Utility functions are `camelCase` in `camelCase.ts` files.
- Constants are `SCREAMING_SNAKE_CASE` when they represent fixed configuration values, `camelCase` otherwise.
- Database models in Prisma are `PascalCase` singular: `User`, `EchoEntry`. Table columns are `snake_case` in the database, mapped to `camelCase` in the Prisma client.
- Boolean variables read as yes/no questions: `isLoading`, `hasError`, `isPlaybackActive`, not `loading`, `error`, `playing`.

## File Organization

One component per file. If a helper function is only used inside one component, define it in the same file below the component. If it gets used anywhere else, lift it to `lib/` or the shared business logic layer.

Order inside a component file:
1. Imports (React/React Native first, third-party next, local last, separated by blank lines)
2. Types and interfaces
3. Constants
4. The component itself
5. Helper functions used only by this component

## TypeScript

Prefer `interface` for structural object shapes (like domain entries or component props) to maintain consistency with the database schemas defined in `schema.prisma`. Use `type` for strict unions, closed option arrays (like mood choices), or custom primitive handlers.

Do not use `any`. If you genuinely do not know the shape of something (e.g., raw payloads from the Spotify Web API), use `unknown` and narrow it with a runtime check or a explicit type guard. `any` is a last resort and must have a comment explaining why.

Use zod for anything that comes from outside the application boundary: Spotify API search results, API request bodies, authentication state payloads, and environment variables. Do not trust the compiler's types at these boundaries.

## React

Write function components, not class components. Use hooks. Destructure props in the function signature. Rely on TypeScript type inference for component returns unless an explicit return type improves clarity.

Server Components are the default. Add `"use client"` only when the component needs interactivity, browser APIs, or client-side global state management (Zustand). If a component is marked `"use client"` but lacks state, hooks, or event handlers, it must be rewritten as a server component.

Keep components small. If any component file exceeds roughly 200 lines, extract internal layout fragments into smaller sub-components.

## Formatting

Prettier handles formatting automatically based on the project root settings. Two-space indentation, single quotes for strings, semicolons required, trailing commas where valid.

Imports are sorted: Node built-ins, then third-party packages, then local imports (aliased with `@/`), with a blank line between each group. The ESLint configuration enforces this.

## Comments

Write comments that explain *why*, not *what*. The code already says what it does. If a comment is paraphrasing the line below it, delete it.

Good comment: `// Spotify API occasionally groups different master pressings under separate IDs; the search parser picks the most popular track array to minimize duplicate clutter.`

Bad comment: `// Query the database using Prisma.`

JSDoc blocks must be written for public utility functions in `lib/`, especially anything related to Spotify API parsing, data sanitation filtering, or encryption validation.

## Error Handling

Use try/catch around anything that can throw: database calls, external network requests, Spotify API fetches, and JSON parsing. Catch the error, log it internally with enough context to debug, and return the structured error response defined in `architecture.md`.

Never swallow errors silently. A bare `catch (e) {}` with no log and no rethrow is forbidden.

Never expose raw error messages, database exceptions, or Spotify token exceptions to the end user. They may leak configuration setups or internal system paths. Log the full exception on the server and return a friendly, sanitized string to the user layer.

## Async Code

Prefer `async`/`await` over `.then()` chains. It reads better and makes error handling cleaner.

Do not fire off a promise without awaiting it unless you intentionally mean to. If you are deliberately running something in the background (like an optimistic UI sync or logging telemetry), add a descriptive comment explaining the reason.

## Imports

Use the `@/` alias for local imports across both apps. `import { EchoEntryCard } from '@/components/journal/EchoEntryCard'`, not `import { EchoEntryCard } from '../../../components/journal/EchoEntryCard'`.

Do not import from the `app/` folder into `components/` or `lib/`. Dependencies flow one way: `lib` is the baseline foundation, `components` sits on top of `lib`, and the `app` execution layers sit on top of both.

## Styling

**Styling:** Use CSS Modules exclusively. Every component that requires styles must have a co-located `[ComponentName].module.css` file. Import it as `import styles from './ComponentName.module.css'` and apply classes via `className={styles.myClass}`. No Tailwind, no `styled-components`, no runtime CSS-in-JS, and no global CSS class strings.

Inline `style={{}}` attributes are forbidden except for dynamic, runtime-computed values that cannot be expressed through static class definitions (e.g., an animated playback progress bar width).

## What Not to Do

- Do not add Lodash or external utility toolkits. Modern JavaScript/TypeScript native methods handle array operations natively.
- Do not add heavy date manipulation libraries (like Moment.js). Use `date-fns` if advanced date processing is required.
- Do not install large external UI component systems (MUI, NativeBase, etc.). Echo is minimalist and built using primitives aligned with `design-system.md`.
- Do not leave `console.log` calls in committed files. Use the configured system logger.
- Do not introduce dependencies without discussing them with the developer. Every dependency increases compilation sizes and overhead.