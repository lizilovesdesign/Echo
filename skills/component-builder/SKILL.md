# Skill: Component Builder — Echo

Load this skill whenever you are creating or modifying a React component in Echo. It governs directory placement, code structure, runtime boundary tracking, environment constraints, and explicit theme hookups without reinventing layout configurations.

## Before You Start

Read `.agent/rules/design-system.md` and `.agent/rules/architecture.md` first. Components that do not integrate cleanly with existing theme variables or logic constraints will be rejected at code review. This skill assumes you are fully aware of global tokens, the 4px geometric spacing metric, and minimal interface constraints.

Then ask: **does this component already exist?** Search the target repository directory structure completely before generating any brand-new visual node. Maintaining two distinct versions of a playback element or a text container is how repositories rot.

## Where Components Live

Place elements according to their structural tier:

```
components/
├── ui/                 # Core primitive structures (Button, Input, Card, Modal, Spinner)
├── journal/            # Specialized domain layouts (TimelineFeed, MoodSelector, ReflectionForm, SongVerificationCard)
└── shared/             # Structural elements used across multiple layouts (EmptyState, LoaderOverlay)
```

If a component is exceptionally complex and used exactly once, keep it inside local directories next to the matching path route (e.g., `app/(journal)/_components/`). Elevate the element to the global component tree only when a second structural boundary requests ingestion.

## Component Layout Standards

Always expose strict structural exports instead of default declarations. Accept custom interface references via a standard component property shape named `<ComponentName>Props`. Required types must appear first, followed by optional settings.

### Component Structural Pattern (CSS Modules)

```tsx
// components/journal/SongVerificationCard.tsx
import styles from './SongVerificationCard.module.css';

interface SongVerificationCardProps {
  trackTitle: string;
  artistName: string;
  albumArtUrl: string;
  onConfirm: () => void;
  className?: string; // Always accept className on single root wrappers
}

export function SongVerificationCard({
  trackTitle,
  artistName,
  albumArtUrl,
  onConfirm,
  className,
}: SongVerificationCardProps) {
  // Combine internal CSS modules cleanly with incoming layout references
  const componentStyles = `${styles.cardContainer} ${className || ''}`.trim();

  return (
    <div className={componentStyles}>
      <img src={albumArtUrl} alt={`Album art for ${trackTitle}`} className={styles.artwork} />
      <div className={styles.metaDataBlock}>
        <h3 className={styles.title}>{trackTitle}</h3>
        <p className={styles.artist}>{artistName}</p>
      </div>
      <button type="button" onClick={onConfirm} className={styles.actionButton}>
        Confirm Song
      </button>
    </div>
  );
}
```

## Server vs. Client Boundaries (Web-Specific)

Default cleanly to React Server Components. Introduce the `"use client"` directive on the absolute first line of a file only when a component explicitly requires:

- Client-side data storage cycles (`useState`, `useReducer`)
- Component lifetime tracking side effects (`useEffect`, `useLayoutEffect`)
- Standard browser properties and interfaces (`window`, `document`, `navigator`)
- Interactions that exceed standard navigational transitions (e.g., streaming searches, audio monitoring, modal drawers)
- Reading reactive context environments or interacting directly with Zustand state maps.

Keep client boundaries tightly focused. If a timeline page layout contains extensive text properties and metadata alongside a single interactive button, isolate the button into its own client component file, keeping the parent frame a pristine server component.

## Variant Handling Pattern

For highly dynamic interactive elements containing structural alterations (e.g., standard action paths, alert prompts, toggle states), use declarative variants mapping instead of sprawling inline if/else checks.

Use unified object configurations mapping tokens to matching CSS Modules definitions:

```ts
const BUTTON_VARIANTS = {
  primary: styles.btnPrimary,
  secondary: styles.btnSecondary,
  minimal: styles.btnMinimal,
};

const BUTTON_SIZES = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
};
```

## Physical Accessibility Controls (Touch Targets & Core Focus)

- **Minimum Hit Bounds:** In perfect synchronization with `design-system.md`, all pressable icons, tag triggers, list options, and buttons must offer a hardware touch field of at least 44px x 44px.
- **Keyboard Navigation (Web):** Components must maintain fully visible focus rings when navigated using the tab key. Ensure input wrappers maintain explicit focus definitions (`:focus-visible`).
- **Screen Reader Labeling:** Components that lack static visual characters (e.g., icon-only buttons for deleting entries, close actions, audio icons) must feature an explicit `aria-label` attribute.
- **Image Contexts:** `alt` data tags are mandatory for images on web components. Structural track elements must output descriptive values (`alt="Album art for [Track] by [Artist]"`). Wholly stylistic backdrops must enforce an explicit empty value (`alt=""`).

## Properties to Avoid

- **No Raw Hex or Pixel Values:** Do not create properties that accept loose layout details (`color="#5E5DFF"` or `fontSize={16}`). Force properties to match predefined semantic layout arrays or variant types (`variant="primary"`, `size="md"`).
- **No Dynamic Inline Style Property Pools:** Avoid injecting variable definitions dynamically into common style arrays unless capturing dynamic, runtime values that are impossible to express via CSS modules or fixed layouts (e.g., sliding volume percentages, audio processing bars).

## Local Testing Validation Checklist

When deploying a core primitive wrapper layer, verify interface performance by reviewing interactions against these conditions under local developer modes:

- Verify default appearance matching mockups precisely.
- Confirm active behavior transitions during hover states, touch states, active presses, and focus selections.
- Validate loading loops, verification errors, and disabled control paths.
- Scale screen sizes directly down to a 360px wide layout viewport using browser tools to verify that layout lines wrap cleanly without causing text truncation or visual overlapping errors.
- Ensure complex structural computations are stored safely in standalone helper statements or React hooks, keeping the final component markup readable and clear.