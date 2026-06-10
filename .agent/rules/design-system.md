---
trigger: always_on
---

# Design System Rules — Echo

These are the design system and styling execution rules for Echo. They ensure that the interface remains unified, lightweight, and accessible across both the web companion and mobile native ecosystems. Consistency matters more than personal preference.

## Token Files Are the Source of Truth

The project maintains dedicated global token variables that govern the entire visual footprint. The agent must never modify these configurations directly:

- **Web / API Component Tokens:** Exported as CSS Custom Properties (CSS variables) available globally from the project's root styling configurations.
- **Mobile Native Tokens:** Maintained as a centralized theme configuration object exported from the shared library (e.g., `lib/theme/tokens.ts`).

## Mandatory: Use Variables, Never Raw Values

The agent must never write hardcoded hex color codes, absolute pixel fonts, or raw family declarations anywhere in this codebase. You must map styles directly to semantic tokens.

**Wrong:**
```css
color: #1A1A1A;
font-size: 18px;
font-family: 'Outfit', sans-serif;
background: #FAF9F6;
```

**Correct:**
```css
color: var(--color-text-primary);
font-size: var(--font-size-lg);
font-family: var(--font-family-display);
background: var(--color-background-base);
```

Before implementing any style property, inspect the token sheets. If a semantic variable matches your functional requirement, implement it. If an appropriate token does not exist, ask the developer before inventing a new layout value.

## Spacing Scale

To preserve structural balance, all layout spacing properties (margins, padding, element gaps) must strictly follow a geometric 4px scale. Do not introduce arbitrary numbers or uneven increments.

**Allowed spatial values:** `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`

## Border Radius

Echo utilizes a highly disciplined layout rounding configuration. Use only these mapped radii values:

- **Small Elements** (Mood tag bubbles, status badges): `4px`
- **Interactive Triggers** (Form inputs, action control bounds): `8px`
- **Structural Containers** (Timeline entry cards, detail sheets, modals): `12px`

## Styling Method

Echo focuses on standard styling methodologies tailored cleanly to each target runtime environment. No `inline style={{}}` attributes are permitted unless handling fluid runtime dynamics (e.g., audio playback tracking bars or custom animated transitions):

- **Next.js Web Layouts:** Implemented using CSS Modules exclusively (`[ComponentName].module.css` structures). No utility frameworks, inline hacks, or runtime CSS-in-JS engines are allowed on the web interface.
- **Expo Mobile Clients:** Styled using React Native `StyleSheet.create()` primitives bound explicitly to the core design tokens.

## Mobile-First & Quick-Capture Accessibility

Echo is built from the ground up for intimate, single-handed interaction. The architecture requires that writing and navigation feel seamless.

- **Web Responsiveness:** All web companion layouts must be authored mobile-first. Default rules dictate mobile structures; layout modifications for viewports wider than tablet boundaries must be handled safely via `@media (min-width: 768px)` queries.
- **Physical Touch Targets:** To remove input friction and prevent accidental missed inputs, all pressable buttons, mood tag selectors, and search result list rows must maintain an absolute minimum touch bounding box of `44px x 44px`.
- **Introspective Constraints:** Layout presentation must prioritize clean whitespace, strong typography hierarchy, and distraction-free framing to help users reflect and write comfortably.