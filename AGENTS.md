# AGENTS.md

## Project Identity
This repository is a **static, browser-only chord progression generator**.

Core stack:
- Vite
- React
- TypeScript
- GitHub Pages deployment
- Tone.js for preview
- @tonejs/midi for MIDI export

## Hard Product Boundaries
- **No backend is required in v1**
- **No auth / accounts / cloud sync**
- **No melody generation**
- **No bassline generation**
- **No raw corpus shipping**
- **No runtime scraping or live web fetching**
- **No piano-roll or keyboard visualization required in v1**
- **No sample-library playback system in v1**

## Data / Runtime Split
- **Shipped runtime packs live in `public/packs/`**
- **Authoring assets live in `data-src/`**
- `public/packs/` is the only browser-loaded pack surface for v1
- `data-src/` is authoring-only and must never be treated as a runtime dependency

## Musical Architecture
- Generation is **Roman-numeral / function first**
- Selected key mapping happens **after** progression selection
- K-pop must preserve **section-aware behavior**
- The v1 shell is **loop-first**
- `full_loop` is a first-class section intent and must not fall back to random verse/chorus rules
- Section-aware internals may remain during transition, but the v1 UI should not expose section mode controls

## Runtime Shape
The engine should work in this order:
1. load manifest
2. lazy-load selected family pack
3. filter by family / substyle / section intent
4. pick archetype from deterministic seeded logic
5. apply cadence / rhythm / spice / variation / special move
6. map Roman numerals to selected key
7. return a structured generation result
8. derive explanations / suggestions / MIDI from that result

## Pack Philosophy
- Runtime packs are **distilled local musical knowledge**
- Runtime packs are **not** raw song dumps
- Scripts may validate, compile, and report on packs
- Scripts should not invent musical identity that was never authored
- K-pop special moves and section behavior should be hand-authored, not guessed

## Frozen Family Placement For V1
- `future_pop` belongs to **pop**
- `house_disco` belongs to **dance**
- If any document conflicts with this, update the document before implementation continues

## Required V1 Layout
- single-screen desktop-first app
- top control bar
- big center result area
- settings/preferences menu
- theme lives inside preferences
- no seed control in the main UI
- no section mode UI
- no multiple MIDI mode UI
- Roman numerals slightly prioritized, but chord names always visible

## Required Enums / Structured Fields
Do not leave these as prose-only:
- `MidiMode`
- `VariationType`
- `CadenceType`
- `SpecialMoveOp`
- section-intent enums
- structured `targets`, `preserve`, `allowedDecorations`, `allowedFunctions`, `operation`, `weight`-style fields

## Quality Bar
Before finishing any task:
- run validation if pack/data code changed
- run build if app/runtime code changed
- keep docs aligned with implementation
- do not silently redesign product scope
- do not add new architecture without documenting why

## If Docs Conflict
When docs conflict:
1. stop
2. identify the contradiction
3. propose the smallest correction
4. do not keep coding until the contradiction is resolved
