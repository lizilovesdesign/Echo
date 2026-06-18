# Workflow: Build a New UI Component

Load this workflow whenever you are creating a brand-new UI component. Follow every step in sequence. Do not skip the pre-flight check.

**Load before starting:** `skills/component-builder/SKILL.md`, `.agent/rules/design-system.md`

---

## Pre-Flight Check

Before writing a single line, answer these three questions:

1. **Does this component already exist?** Search `components/`. If a similar one exists, extend it rather than duplicating it.
2. **Which category does it belong to?** Primitives (`Button`, `Input`, `Spinner`) go in `components/ui/`. Domain-specific pieces (`MoodSelector`, `SongVerificationCard`, `TimelineFeed`) go in `components/journal/`.
3. **Is it a primitive or a domain component?** Primitives go in `ui/`. Domain-specific pieces go in `journal/`.

---

## Step 1 — Create the File

```
components/<subdirectory>/<ComponentName>.tsx
components/<subdirectory>/<ComponentName>.module.css
```

File naming must be `PascalCase`. One component per file. Never use a default export — always use a named export.

---

## Step 2 — Write the Props Interface

Define the props interface at the top of the file, before the component function. Required props come first, optional props last.

```ts
interface MyComponentProps {
  // Required
  label: string;
  onPress: () => void;
  // Optional
  isDisabled?: boolean;
  className?: string; // web only — always accept className on single-root web wrappers
}
```

Do not use `any` for prop types. If the shape is unknown, use `unknown` and narrow it.

---

## Step 3 — Write the Component

Use a named function export. Destructure all props in the signature.

```tsx
import styles from './MyComponent.module.css';

export function MyComponent({ label, onPress, isDisabled, className }: MyComponentProps) {
  const rootStyles = `${styles.root} ${className || ''}`.trim();
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={isDisabled}
      className={rootStyles}
      aria-label={label}
    >
      {label}
    </button>
  );
}
```

---

## Step 4 — Write the CSS Module (Web Only)

Create the `.module.css` file alongside the component. Never write raw hex values or pixel sizes — map everything to CSS custom properties.

```css
/* components/ui/MyComponent.module.css */
.root {
  min-height: 44px;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-interactive);
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  font-family: var(--font-family-display);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: opacity 150ms ease;
}

.root:hover {
  opacity: 0.9;
}

.root:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.root:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

---

## Step 5 — Determine Client vs. Server Boundary (Web Only)

Ask: does this component use `useState`, `useEffect`, `useContext`, Zustand, or any browser API?

- **No** → It is a Server Component by default. No directive needed.
- **Yes** → Add `'use client';` as the very first line of the file.

If only a small part of the component needs interactivity (e.g., one button inside a large card), extract just that interactive piece into its own `'use client'` child file. Keep the parent a Server Component.

---

## Step 6 — Accessibility Checklist

Before committing, verify:

- [ ] All interactive elements have a minimum bounding box of `44px x 44px`.
- [ ] Icon-only buttons have an explicit `aria-label`.
- [ ] All `<img>` tags have a descriptive `alt` attribute (or `alt=""` if purely decorative).
- [ ] The component is navigable with the keyboard and shows a visible `:focus-visible` ring.
- [ ] Test at 360px viewport width — no text truncation or overlapping.
