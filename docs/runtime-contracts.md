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
The current v1 runtime is loop-only.

## Core Enums

```ts
export type ScaleMode = "major" | "minor"
export type LoopBarCount = 4 | 8 | 16
export type ChordChangeRate = "one_bar" | "two_bars"
```

## Generation Request

```ts
export interface GenerationRequest {
  familyId: string
  substyleId: string
  key: string
  scaleMode: ScaleMode
  loopBars: LoopBarCount
  chordChangeRate: ChordChangeRate
  spiceLevel: number
}
```

## Generation Result

```ts
export interface GenerationResult {
  packId: string
  familyId: string
  substyleId: string
  loopArchetypeId: string
  harmonicRhythmProfileId: string
  totalBars: LoopBarCount
  chordChangeRate: ChordChangeRate
  romanNumerals: string[]
  functionPath: string[]
  chordSlots: ChordSlot[]
  appliedSpicinessTransformIds: string[]
  appliedVariationIds: string[]
  appliedSpecialMoveIds: string[]
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

## Generation Metadata

```ts
export interface GenerationMetadata {
  familyName: string
  substyleName: string
  loopName: string
  rhythmName: string
  rhythmDensity: string
  baseLoopBars: 4
  renderedBars: LoopBarCount
  loopTags: string[]
  colorSummary: string[]
  activeSpicinessTransformIds: string[]
  selectedVariationIds: string[]
  selectedSpecialMoveIds: string[]
}
```

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

## What Codex Must Not Guess

Codex must not guess:
- that loops may be invented from scratch when pack-backed loops exist
- that the engine may silently ignore the requested chord-change rate
- that 8-bar or 16-bar loops may mutate the 4-bar source instead of repeating it exactly
- that runtime payloads still need section, suggestion, or tab fields
