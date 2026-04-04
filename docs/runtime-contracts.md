---
title: Runtime Contracts
tags:
  - chord-generator
  - runtime
  - contracts
status: draft
---

# Runtime Contracts

## Purpose

Freeze the runtime request/result shapes shared by:
- control bar state
- generation engine
- result area
- MIDI/export layer

This file exists so Code Mode does not invent payload shapes.

The current v1 shell uses a loop-first subset of these contracts.
Legacy explanation and suggestion fields may still exist in runtime payloads during transition,
but they are not rendered in the simplified shell.

## Core Enums

```ts
export type SectionIntent =
  | "full_loop"
  | "verse"
  | "pre_chorus"
  | "chorus"
  | "bridge"

export type MidiMode =
  | "block"
  | "comp"
  | "arp"

export type VariationType =
  | "safer"
  | "richer"
  | "darker"
  | "brighter"
  | "more_open"
  | "more_resolved"
  | "pre_chorus_lift"
  | "chorus_payoff"
  | "bridge_contrast"

export type ExplanationType =
  | "why_it_works"
  | "add_notes"
  | "transition"
  | "section_idea"
  | "learn"

export type CadenceType =
  | "open_loop"
  | "soft_resolve"
  | "strong_resolve"
  | "lift_without_arrival"
  | "contrastive"
```

## Generation Request

```ts
export interface GenerationRequest {
  seed: string
  familyId: string
  substyleId: string
  key: string
  scaleMode: string
  sectionIntent: SectionIntent
  spiceLevel: number
  midiMode: MidiMode
}
```

## Generation Result

```ts
export interface GenerationResult {
  seed: string
  packId: string
  familyId: string
  substyleId: string
  sectionIntent: SectionIntent
  archetypeId: string
  cadenceProfileId: string
  harmonicRhythmProfileId: string
  romanNumerals: string[]
  functionPath: string[]
  chordSlots: ChordSlot[]
  appliedVariationIds: string[]
  appliedSpecialMoveIds: string[]
  explanations: ExplanationItem[]
  suggestions: SuggestionItem[]
  midiPresetId: string
}
```

## Chord Slot

```ts
export interface ChordSlot {
  index: number
  romanNumeral: string
  functionLabel: string
  chordName: string
  durationBeats: number
  decorationTags: string[]
  slashBassDegree?: string | null
}
```

### ChordSlot notes
- `index` is zero-based display order inside the generated progression
- `romanNumeral` is the style-logic identity
- `functionLabel` is the functional bucket shown to the learning layer
- `chordName` is the selected-key output shown beside the Roman numeral
- `durationBeats` drives playback and MIDI note timing
- `decorationTags` records applied harmonic color
- `slashBassDegree` is optional and only present when a slash-bass move is used

## Explanation Item

```ts
export interface ExplanationItem {
  id: string
  type: ExplanationType
  title: string
  body: string
  relatedChordIndexes?: number[]
}
```

### ExplanationItem notes
- `type` maps directly to tabs
- `title` is short UI copy
- `body` is concise producer-facing text
- `relatedChordIndexes` is optional for highlighting one or more chord slots

## Suggestion Item

```ts
export interface SuggestionItem {
  id: string
  type: VariationType
  title: string
  summary: string
  previewRomanNumerals?: string[]
  appliesVariationIds: string[]
  appliesSpecialMoveIds: string[]
}
```

### SuggestionItem notes
- `type` maps directly to the right-side suggestion rail categories
- `title` is user-facing label
- `summary` is one short explanation of what will change
- `previewRomanNumerals` is optional lightweight preview data
- `appliesVariationIds` and `appliesSpecialMoveIds` are explicit so the engine remains traceable

## UI Expectations

### Top control bar consumes
- family / substyle selection
- key + scale
- loop length
- chord-change rate
- spice level

### Big result area consumes
- `GenerationResult`
- especially:
  - `romanNumerals`
  - `chordSlots`
  - `familyId`
  - `substyleId`

### MIDI/export layer consumes
- `chordSlots`
- `midiPresetId`

## full_loop rule

`full_loop` is first-class.

It must not inherit verse/chorus behavior by accident.

At runtime:
- `sectionIntent: "full_loop"` means the engine should apply `fullLoopRules`
- the simplified v1 shell keeps loop generation explicit and does not expose section-switching controls

## What Codex Must Not Guess

Codex must not guess:
- that `chordSlots`, `explanations`, or `suggestions` can remain `unknown[]`
- that `full_loop` can be treated as a fallback alias
- that the suggestion rail can invent categories outside `VariationType`
- that the tabs need extra hidden payload shapes not declared here
