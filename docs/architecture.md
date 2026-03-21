# Crumble Architecture and Code Walkthrough

## What this repository is

Crumble is two things in one repo:

1. A **documentation website** built with Next.js App Router and Fumadocs.
2. A **shadcn-compatible registry** of hand-drawn React components powered by Rough.js.

The docs site showcases and explains the components. The registry lets users install those same components as source files with:

```bash
npx shadcn add https://crumble.dev/r/button.json
```

The important design choice is that Crumble is **not** a published black-box component package. The source lives in `registry/new-york/**`, and the registry JSON files in `public/r/**` expose that source to the shadcn CLI.

## High-level file map

### App shell and docs site

- `app/layout.tsx`
  Sets global fonts, injects SVG filters used to wobble borders, wraps the app with `RootProvider` and `CrumbleProvider`.
- `app/layout.config.tsx`
  Shared navigation config for Fumadocs layouts.
- `app/(home)/**`
  Marketing-style homepage that previews the components.
- `app/docs/**`
  Fumadocs docs layout and page renderer.
- `app/api/search/route.ts`
  Search endpoint generated from the Fumadocs source.

### Content and MDX

- `content/docs/**`
  MDX docs content.
- `source.config.ts`
  Fumadocs MDX collection config.
- `lib/source.ts`
  Turns generated docs content into a Fumadocs source object.
- `mdx-components.tsx`
  Registers custom MDX components such as previews and live examples.

### Rough.js core

- `lib/rough.ts`
  Theme presets, component-specific option overrides, seeding helpers, and global Crumble config.
- `hooks/use-rough.ts`
  Shared React hook that creates a Rough.js SVG renderer and exposes draw helpers.
- `lib/crumble-context.tsx`
  React provider that synchronizes theme and animation flags into the global config object.
- `lib/styles.ts`
  Small shared inline style constants.
- `lib/utils.ts`
  `cn()` helper for merging class names.

### Installable registry source

- `registry/new-york/primitives/**`
  Low-level visual building blocks like rough rectangles, lines, circles, arrows, highlights.
- `registry/new-york/ui/**`
  Higher-level interactive components like `Button`, `Input`, `Checkbox`, `Slider`, etc.
- `registry/new-york/lib/**`
  Re-export wrappers so registry items can ship core helpers.
- `registry/new-york/hooks/**`
  Re-export wrappers for hooks.
- `registry.json`
  Master shadcn registry manifest describing installable items and their dependencies.
- `public/r/*.json`
  Built registry item JSON files served by the website.

## Core idea: every component is HTML plus a visual SVG layer

Nearly every Crumble component follows the same pattern:

1. Render a **real semantic HTML control** such as `button`, `input`, `select`, or `textarea`.
2. Render an **SVG overlay** positioned absolutely on top of or alongside that element.
3. Use Rough.js to draw sketchy shapes into that SVG.
4. Keep the SVG `aria-hidden` and `pointer-events: none` so accessibility and browser behavior still come from the real HTML control.

That pattern is visible in:

- `registry/new-york/ui/button.tsx`
- `registry/new-york/ui/input.tsx`
- `registry/new-york/ui/textarea.tsx`
- `registry/new-york/ui/select.tsx`
- `registry/new-york/ui/card.tsx`
- `registry/new-york/primitives/rough-rect.tsx`

This is the main architectural decision in the repo. Rough.js handles appearance only. Native HTML handles interaction.

## `lib/rough.ts`: the central rendering config

`lib/rough.ts` is the most important file in the project.

### 1. Theme presets

It defines three named themes:

- `pencil`
- `ink`
- `crayon`

Each theme is a Rough.js `Options` object. These control how sketchy the line looks:

- `roughness`
  How imperfect the lines look.
- `bowing`
  How curved or bowed the line becomes.
- `strokeWidth`
  Base stroke thickness.
- `fillStyle`
  How fills are rendered, such as `hachure`, `solid`, or `zigzag`.
- `fillWeight`, `hachureGap`, `hachureAngle`
  Fine-grained fill texture controls.

Intent by theme:

- `pencil` is light and sketchy.
- `ink` is tighter and cleaner.
- `crayon` is thick, loose, and exaggerated.

### 2. Variant overrides

The file also defines `ComponentVariant`:

- `border`
- `fill`
- `interactive`
- `chart`

Each variant slightly overrides the base theme. This lets the same theme behave differently depending on use case.

Examples:

- `border` reduces noise a bit so outlines stay readable.
- `interactive` increases roughness and bowing so controls feel more alive.
- `fill` changes fill behavior for highlight-like shapes.

### 3. `getRoughOptions()`

`getRoughOptions(theme, variant, extra)` merges:

1. Base theme options
2. Variant overrides
3. Per-call overrides

This is the single resolution point for most rendering decisions.

### 4. Seeding helpers

Two helpers control visual stability:

- `stableSeed(id)`
  Deterministically hashes a string into a numeric seed.
- `randomSeed()`
  Creates a new random seed.

Why this matters:

- Stable seeds make the same component render with the same wobble every time.
- Random seeds make the component redraw differently on hover or interaction.

This is how Crumble gets its "alive" feel without doing continuous animation.

### 5. Global config store

`config` is a module-level mutable object containing:

- `theme`
- `animateOnMount`
- `animateOnHover`

Two functions expose it:

- `configureCrumble(options)`
- `getCrumbleConfig()`

This is not React state. It is a plain module singleton. React components read from it when they draw.

## `lib/crumble-context.tsx`: React bridge for the global config

The provider exists because a plain module config alone is not enough for React-driven theme switching.

`CrumbleProvider`:

- Accepts `theme`, `animateOnMount`, and `animateOnHover`.
- Stores the active theme in React state.
- Calls `configureCrumble()` in an effect whenever those values change.
- Exposes the values plus `setTheme()` through context.
- Wraps children in a `div` with `data-crumble-theme={currentTheme}`.

That `data-crumble-theme` attribute is important because `app/global.css` uses it to adjust CSS variables like `--cr-weight` and `--cr-sketch-duration`.

So there are really **two theme channels**:

1. JS-side theme selection for Rough.js draw options.
2. CSS-side theme selection for filters and timing variables.

## `hooks/use-rough.ts`: the shared Rough.js hook

This hook is the main abstraction over Rough.js.

### Inputs

It accepts:

- `variant`
- `options`
- `stableId`
- `theme`
- `svgRef`

### What it does

1. Creates an internal `svgRef` unless one is passed in.
2. Lazily creates a `rough.svg(svgElement)` renderer.
3. Caches the renderer in `rcRef`.
4. Resolves effective Rough.js options via `getOptions()`.
5. Returns drawing helpers:
   - `drawRect`
   - `drawCircle`
   - `drawLine`
   - `drawPath`

### How seeding works in the hook

`getOptions(extra)` chooses a seed in this order:

1. `extra.seed` if explicitly passed.
2. `stableSeed(stableId)` if a stable id exists.
3. `randomSeed()` if hover animation is enabled and there is no stable id.
4. A fallback stable seed from `"crumble-default"`.

That means components can opt into:

- stable repeated renders
- random redraws on demand
- explicit one-off reseeding

### Why the current implementation is slightly better than the generated registry JSON version

The live file in `hooks/use-rough.ts` accepts an external `svgRef` and recreates the renderer if the underlying SVG element changes. That makes it more robust than the inlined older copy visible in `public/r/use-rough.json`, which only initializes the renderer once in an effect.

The repo source is the version that matters for understanding current behavior.

## CSS and visual treatment

`app/global.css` does several jobs:

### 1. Tailwind and Fumadocs setup

It imports:

- Tailwind v4
- Fumadocs neutral and preset styles
- `tw-animate-css`

### 2. Global design tokens

It defines app-wide color variables, radius values, and semantic colors used by the docs site.

### 3. Crumble-specific CSS variables

Important variables:

- `--cr-stroke`
- `--cr-fill`
- `--cr-sketch-duration`
- `--cr-wiggle-duration`
- `--cr-weight`

These support theme-sensitive styling around the sketch effect.

### 4. Theme-specific CSS via `data-crumble-theme`

Examples:

- `[data-crumble-theme="pencil"]`
- `[data-crumble-theme="ink"]`
- `[data-crumble-theme="crayon"]`

These adjust values like stroke weight and sketch duration.

### 5. SVG filters

`app/layout.tsx` injects three SVG `<filter>` definitions:

- `crumble-wobble-pencil`
- `crumble-wobble-ink`
- `crumble-wobble-crayon`

Then CSS applies them on `.crumble-border[data-crumble-theme="..."]`.

This means the hand-drawn look is coming from **both**:

- Rough.js geometry randomness
- post-process SVG displacement filters

## Primitive components

The primitives are the cleanest place to learn the library's patterns.

### `rough-rect.tsx`

Purpose:

- Draws a sketchy rectangular frame around content.

How it works:

- Measures container width and height with `ResizeObserver`.
- Clears the SVG with `replaceChildren()`.
- Draws a rectangle inset slightly from the edges.
- Supports hover redraw by reseeding with `randomSeed()`.
- Supports optional `rounded` mode by lowering `roughness`.

Use this file to understand the standard "measure -> clear SVG -> redraw" lifecycle.

### `rough-circle.tsx`

Purpose:

- Draws a rough circle of a fixed diameter.

How it works:

- Uses a fixed width and height rather than observing layout.
- Places any children in a centered content layer above the SVG.
- Redraws on hover if global hover animation is enabled.

### `rough-line.tsx`

Purpose:

- Draws a horizontal or vertical rough line.

How it works:

- Uses a container ref to derive length when not explicitly provided.
- Chooses line coordinates based on `orientation`.
- Observes container size changes.

### `rough-path.tsx`

Purpose:

- Draw any arbitrary SVG `path` string with Rough.js styling.

How it works:

- Delegates rendering to `drawPath(d, options)`.
- Useful when you already know the exact path geometry you want.

### `rough-arrow.tsx`

Purpose:

- Draws a curved arrow between two points.

How it works:

- Builds a quadratic Bezier path for the body.
- Computes arrowhead angles using `Math.atan2`.
- Draws the two arrowhead segments as separate rough lines.

This component shows that not every shape comes from one Rough.js call. Composite graphics are assembled from multiple nodes.

### `rough-highlight.tsx`

Purpose:

- Draws annotation-like marks around inline text.

Supported `type` values:

- `underline`
- `box`
- `circle`
- `highlight`
- `strike-through`
- `bracket`

How it works:

- Measures inline text using a `span` container.
- Creates a local Rough.js renderer directly with `rough.svg(svg)`.
- Draws different shapes depending on `type`.
- For animated appearance, it calculates path lengths and uses `strokeDasharray` / `strokeDashoffset` transitions.

This is one of the more specialized files in the repo because it implements mount animation, multiple annotation modes, and inline text measurement.

## UI components

The UI components take the primitive drawing ideas and combine them with native form controls.

### `button.tsx`

Behavior:

- Real HTML `button`.
- SVG border overlay sized to the button's measured width.
- Hover and mouse-down can force a redraw with a new seed.

Notable detail:

- Uses `variant="interactive"` in `useRough()` so buttons get a livelier line style than simple borders.

### `card.tsx`

Behavior:

- Container with one main sketch border.
- Optional `stacked` mode adds two more lightly rotated rough rectangles behind it.

Why it matters:

- This is the clearest example of layered SVG composition in the UI set.
- It uses three different SVG refs for the stacked paper effect.

### `input.tsx`

Behavior:

- Real HTML `input`.
- Either a box border or underline style.
- Border color changes based on:
  - default
  - focus
  - error

Key pattern:

- Focus state is local React state.
- Draw logic reads that state and re-renders the SVG.

### `textarea.tsx`

Behavior:

- Real HTML `textarea`.
- Rough rectangular border.
- Optional `autoGrow` mode.

How auto-grow works:

- On change, it temporarily sets the textarea height to `auto`.
- Then sets it to `scrollHeight`.
- Then redraws the border so the SVG matches the new height.

### `select.tsx`

Behavior:

- Real HTML `select`.
- Rough outer rectangle plus a second SVG for the chevron.

Why it uses two SVGs:

- One SVG handles the border box.
- One small SVG handles the dropdown arrow independently.

### `checkbox.tsx`

Behavior:

- Real HTML checkbox input is fully transparent but still handles state.
- Rough.js draws the box and optional tick mark.
- Hover can reseed the same checked or unchecked state.

Implementation note:

- This component bypasses `useRough()` and uses `rough.svg()` directly because it only needs a very local one-off drawing routine.

### `radio.tsx`

Behavior:

- Each radio item draws a rough outer circle.
- If selected, it draws a filled inner circle.

Pattern:

- Very similar to `checkbox.tsx`.
- Uses an internal `RadioItem` subcomponent for each option.

### `slider.tsx`

Behavior:

- Transparent native `input[type="range"]` handles interaction.
- One SVG draws the track and the filled progress segment.
- Another SVG draws the thumb.

Why this file is important:

- It shows a multi-layered control where drawing depends on derived value percentage (`pct`).
- It uses stable seeds per subpart:
  - base track
  - fill track
  - thumb

That keeps each piece visually consistent across rerenders.

### `toggle.tsx`

Behavior:

- Real hidden checkbox input exists for semantics.
- SVG draws the track and thumb.
- Clicking toggles local state unless a controlled `checked` prop is provided.

Implementation detail:

- Uses stable seeds for both the track and the thumb so the toggle does not visually jitter on ordinary rerenders.

## Patterns repeated throughout the repo

### 1. Measure, clear, redraw

Most files do this:

1. Read container size.
2. `svg.replaceChildren()`
3. Recompute geometry.
4. Append one or more Rough.js nodes.

This keeps rendering deterministic and simple.

### 2. `ResizeObserver` instead of layout assumptions

Whenever the component size can change with content, the code uses `ResizeObserver` and redraws the SVG. This is how borders stay aligned with dynamic content.

### 3. Stable seeds for identity, random seeds for life

This is one of the best design ideas in the project:

- Stable seed:
  same shape identity
- Random seed on hover:
  subtle animation-like redraw

It gives motion without complex animation state.

### 4. Native elements stay in charge

Crumble never tries to replace browser semantics with SVG. The real controls still handle:

- focus
- keyboard input
- checked state
- range interaction
- form semantics

The SVG is decoration only.

## Docs site flow

### `source.config.ts`

Defines the docs collection for Fumadocs MDX.

### `lib/source.ts`

Creates the runtime source object:

```ts
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});
```

That `source` object powers:

- page lookup
- route generation
- page tree creation
- search source generation

### `app/docs/layout.tsx`

Wraps docs pages in `DocsLayout` using:

- `source.pageTree`
- shared nav options from `app/layout.config.tsx`

### `app/docs/[[...slug]]/page.tsx`

This is the main docs page renderer:

1. Reads route params.
2. Finds the page with `source.getPage(params.slug)`.
3. Renders title, description, and MDX body.
4. Injects custom MDX components using `getMDXComponents(...)`.
5. Generates static params and metadata.

### `mdx-components.tsx`

This file wires MDX content to real React components. It registers:

- Fumadocs default MDX components
- tabs and code blocks
- `PreviewContainer`
- all Crumble primitives and UI components
- `AutoTypeTable` from `fumadocs-typescript`

That is why docs pages can embed live previews directly in MDX.

### `components/preview/PreviewContainer.tsx`

This is the interactive docs preview wrapper.

It provides:

- a preview tab
- a code tab
- theme switcher buttons (`pencil`, `ink`, `crayon`)
- a generated install command
- clipboard copy for the install command

It also wraps previews in a nested `CrumbleProvider`, which is how individual docs demos can switch theme without affecting the whole app.

## Homepage and showcase files

### `app/(home)/page.tsx`

This is a straightforward marketing page built from the components themselves. It is useful as a real-world integration example because it uses:

- `Button`
- `Card`
- `RoughHighlight`
- `RoughLine`

### `components/ShowcaseComponents/*`

These are simple presentation helpers for grids of component cards. They are not central to the rough.js system, but they support the docs browsing experience.

## Registry and distribution model

### `registry.json`

This file is the master registry manifest. For each item it defines:

- `name`
- `type`
- `title`
- `description`
- npm `dependencies`
- `registryDependencies`
- source `files`
- target install path

This is what teaches shadcn CLI how to install a component and which shared building blocks must come with it.

Examples:

- `button` depends on `use-rough` and `rough-lib`.
- `input` depends on `use-rough`, `rough-lib`, and `styles-lib`.
- `checkbox` only depends on `rough-lib` because it draws directly with Rough.js.

### `public/r/*.json`

These are per-item registry payloads served by the site. They contain actual source code text under `files[].content`.

Important distinction:

- `registry/new-york/**` is the source of truth inside the repo.
- `public/r/*.json` is the served install artifact.

If behavior ever looks inconsistent, compare those two layers first.

## How a component actually renders, step by step

Using `Button` as the example:

1. React renders a real `<button>`.
2. An absolutely positioned `<svg>` sits inside it.
3. `useRough()` resolves the active theme and seed policy.
4. `drawRect()` creates a Rough.js rectangle node.
5. The component appends that node into the SVG.
6. On hover or mouse down, it redraws with `randomSeed()` for a new hand-drawn variation.
7. If the button width changes, `ResizeObserver` triggers another redraw.

The same loop explains most other files in the repo.

## Rough.js-specific mental model for this codebase

When reading Crumble files, think in this order:

1. What is the real semantic HTML element?
2. Where is the SVG mounted?
3. Does the file use `useRough()` or direct `rough.svg()`?
4. Which variant is it using: `border`, `interactive`, `fill`, or `chart`?
5. What determines the seed:
   - stable id
   - random reseed
   - explicit seed override
6. What triggers redraw:
   - mount
   - hover
   - focus
   - value change
   - resize

If you answer those six questions, the file usually becomes easy to understand.

## Important tradeoffs and limitations

### Strengths

- Clear architecture.
- Good separation between semantics and decoration.
- Easy to copy components into user projects.
- Theme system is simple and predictable.
- Seeding strategy creates a strong visual identity.

### Constraints

- Rendering is imperative: many components manually clear and repopulate SVG nodes.
- There is repeated drawing logic across files.
- The mutable module config in `lib/rough.ts` is simple, but it is not as explicit as keeping everything in React state.
- Generated `public/r/*.json` can drift from source files if not rebuilt carefully.

## Best files to study first

If someone is new to the repo, read in this order:

1. `lib/rough.ts`
2. `hooks/use-rough.ts`
3. `lib/crumble-context.tsx`
4. `registry/new-york/primitives/rough-rect.tsx`
5. `registry/new-york/ui/button.tsx`
6. `registry/new-york/ui/input.tsx`
7. `registry/new-york/primitives/rough-highlight.tsx`
8. `registry.json`
9. `mdx-components.tsx`
10. `app/docs/[[...slug]]/page.tsx`

That sequence moves from the rendering core to the installable components to the docs delivery pipeline.

## Short summary

Crumble works by combining:

- Rough.js option presets in `lib/rough.ts`
- a shared SVG drawing hook in `hooks/use-rough.ts`
- a context/provider bridge in `lib/crumble-context.tsx`
- semantic HTML controls plus decorative SVG overlays in each component
- Fumadocs for the docs site
- shadcn registry manifests for source-based distribution

The "rough" effect is not magic. It is a very consistent loop of:

- resolve theme
- choose a seed
- measure size
- draw SVG nodes
- redraw on hover, resize, or state changes

Once that pattern clicks, the whole repository becomes much easier to read.
