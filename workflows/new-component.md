# Workflow: Build a New UI Component

Load this workflow whenever you are creating a brand-new UI component — either for the Next.js web companion or the Expo mobile app. Follow every step in sequence. Do not skip the pre-flight check.

**Load before starting:** `skills/component-builder/SKILL.md`, `.agent/rules/design-system.md`

---

## Pre-Flight Check

Before writing a single line, answer these three questions:

1. **Does this component already exist?** Search `components/` (web) or `apps/mobile/src/components/` (mobile). If a similar one exists, extend it rather than duplicating it.
2. **Which runtime does it belong to?** Web-only → `components/`. Mobile-only → `apps/mobile/src/components/`. If it is conceptually the same but requires separate implementations (e.g., a card layout), create both independently — do not try to share JSX across Next.js and Expo.
3. **Is it a primitive or a domain component?** Primitives (`Button`, `Input`, `Spinner`) go in `ui/`. Domain-specific pieces (`MoodSelector`, `SongVerificationCard`, `TimelineFeed`) go in the `journal/` or `domain/` subdirectory.

---

## Step 1 — Create the File

**Web:**
```
components/<subdirectory>/<ComponentName>.tsx
components/<subdirectory>/<ComponentName>.module.css
```

**Mobile:**
```
apps/mobile/src/components/<subdirectory>/<ComponentName>.tsx
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

**Web pattern:**
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

**Mobile pattern:**
```tsx
import { Pressable, Text, StyleSheet } from 'react-native';
import { theme } from '@/lib/theme/tokens';

export function MyComponent({ label, onPress, isDisabled }: MyComponentProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 44, // Mandatory accessibility minimum
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.interactive,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize.base,
    color: theme.colors.onPrimary,
  },
});
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
- [ ] Icon-only buttons have an explicit `aria-label` (web) or `accessibilityLabel` (mobile).
- [ ] All `<img>` tags have a descriptive `alt` attribute (or `alt=""` if purely decorative).
- [ ] The component is navigable with the keyboard and shows a visible `:focus-visible` ring on web.
- [ ] Test at 360px viewport width — no text truncation or overlapping.
