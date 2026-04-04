---
title: Chord Generator - Data Model
tags:
  - chord-generator
  - data-model
  - runtime
status: draft
---

# Chord Generator - Data Model

> [!summary]
> This note freezes the runtime data model and the authoring-to-runtime boundary for v1.
>
> Runtime packs are compiled JSON files shipped in `public/packs/`.
> Authoring assets live in `data-src/`.

## What This Note Freezes
- shipped pack surface
- authoring surface
- manifest contract
- family pack contract
- runtime request/result contract
- first-class `full_loop` handling
- deterministic enums
- required entity structure

## Runtime / Authoring Boundary

## Shipped Runtime Surface
Shipped pack files must live in:

```text
public/packs/
```

Expected v1 runtime files:
- `public/packs/manifest.json`
- `public/packs/kpop.pack.json`
- `public/packs/trap.pack.json`
- `public/packs/rnb.pack.json`
- `public/packs/pop.pack.json`
- `public/packs/dance.pack.json`

These are the only pack files the browser loads in v1.

## Authoring Surface
Authoring assets must live in:

```text
data-src/
```

Expected authoring areas:
- `data-src/templates/`
- `data-src/authoring/`

Authoring assets are never fetched by the browser at runtime.

## Current Repo Scaffolding
The canonical authoring path is still `data-src/`, but this repo currently also includes:
- starter schema mirrors in `src/data/templates/`
- validator sample fixtures in `src/data/packs/samples/`

Those files are implementation scaffolding only. They are not shipped runtime assets.

---

# Frozen Enums

## ModeBias
- `loop_first`
- `section_first`

## SectionIntent
- `full_loop`
- `verse`
- `pre_chorus`
- `chorus`
- `bridge`

## MidiMode
- `block`
- `comp`
- `arp`

## CadenceType
- `open_loop`
- `soft_resolve`
- `strong_resolve`
- `lift_without_arrival`
- `contrastive`

## HarmonicRhythmDensity
- `slow`
- `medium`
- `active`
- `variable`

## VariationType
- `safer`
- `richer`
- `darker`
- `brighter`
- `more_open`
- `more_resolved`
- `pre_chorus_lift`
- `chorus_payoff`
- `bridge_contrast`

## SpecialMoveOp
- `delay_tonic_arrival`
- `borrowed_iv_darken`
- `bass_climb_lead_in`
- `dominant_pressure`
- `drop_simplify`
- `chorus_payoff_widen`
- `bridge_reframe`
- `groove_lock`
- `trap_soul_enrich`
- `last_bar_tilt`

---

# Manifest Contract

The app must load family metadata first, then lazy-load the selected family pack.

## PackManifest
```ts
type PackManifest = {
  manifestVersion: string
  packs: PackManifestEntry[]
}
```

## PackManifestEntry
```ts
type PackManifestEntry = {
  packId: string
  familyId: FamilyId
  familyName: string
  path: string
  version: string
  substyleIds: SubstyleId[]
  tags?: string[]
}
```

### Required Rules
- `path` must be a relative runtime path under `public/packs/`
- runtime code must resolve `path` with `import.meta.env.BASE_URL`
- every `substyleId` listed in the manifest must exist in the pack
- every `familyId` must map to exactly one shipped pack in v1
- one shipped pack per family in v1

---

# Family Pack Contract

## FamilyPack
```ts
type FamilyPack = {
  packVersion: string
  packId: string
  family: Family
  substyles: Substyle[]
  archetypes: ProgressionArchetype[]
  cadenceProfiles: CadenceProfile[]
  harmonicRhythmProfiles: HarmonicRhythmProfile[]
  sectionBehaviors: SectionBehavior[]
  spicinessTransforms: SpicinessTransform[]
  variationRules: VariationRule[]
  specialMoves: SpecialMove[]
  explanationTemplates: ExplanationTemplate[]
  midiPresets: MidiPreset[]
}
```

---

# Required Runtime Entities

## Family
```ts
type Family = {
  id: FamilyId
  name: string
  description: string
  tags: string[]
  defaultModeBias: ModeBias
  substyleIds: SubstyleId[]
}
```

## Substyle
```ts
type Substyle = {
  id: SubstyleId
  familyId: FamilyId
  name: string
  description: string
  tags: string[]
  modeBias: ModeBias
  defaultSectionIntents: SectionIntent[]
  archetypeIds: string[]
  cadenceProfileIds: string[]
  harmonicRhythmProfileIds: string[]
  sectionBehaviorId: string
  spicinessTransformIds: string[]
  variationRuleIds: string[]
  specialMoveIds: string[]
  explanationTemplateIds: string[]
  midiPresetIds: string[]
  mustIncludeTags: string[]
  mustAvoidTags: string[]
}
```

## ProgressionArchetype
```ts
type ProgressionArchetype = {
  id: string
  substyleId: SubstyleId
  name: string
  romanNumerals: string[]
  functionPath: string[]
  bars: number
  harmonicRhythmProfileId: string
  allowedSectionIntents: SectionIntent[]
  resolutionBias: CadenceType
  loopability: number
  tensionCurve: string[]
  tags: string[]
  weight: number
  slotOptions: ArchetypeSlotOption[]
}
```

## ArchetypeSlotOption
```ts
type ArchetypeSlotOption = {
  slotIndex: number
  allowedDecorations: string[]
  allowedSlashBassDegrees: string[]
  forbidOnLowSpice: boolean
}
```

## CadenceProfile
```ts
type CadenceProfile = {
  id: string
  name: string
  type: CadenceType
  allowedEndFunctions: string[]
  strength: number
  commonUseCases: SectionIntent[]
  weight: number
}
```

## HarmonicRhythmProfile
```ts
type HarmonicRhythmProfile = {
  id: string
  name: string
  density: HarmonicRhythmDensity
  beatsPerChangePattern: number[]
  commonUseCases: SectionIntent[]
}
```

## SectionBehavior
`full_loop` is first-class and must not be implied from other sections.

```ts
type SectionBehavior = {
  id: string
  substyleId: SubstyleId
  fullLoopRules: SectionRuleBlock
  verseRules: SectionRuleBlock
  preChorusRules: SectionRuleBlock
  chorusRules: SectionRuleBlock
  bridgeRules: SectionRuleBlock
}
```

## SectionRuleBlock
```ts
type SectionRuleBlock = {
  preferredCadenceTypes: CadenceType[]
  preferredRhythmDensities: HarmonicRhythmDensity[]
  preferredArchetypeTags: string[]
  allowedVariationTypes: VariationType[]
  allowedSpecialMoveIds: string[]
  forbiddenTags: string[]
  energyShape: string
}
```

## SpicinessTransform
```ts
type SpicinessTransform = {
  id: string
  name: string
  level: number
  styleScope: (FamilyId | SubstyleId)[]
  allowedDecorations: string[]
  allowedFunctions: string[]
  forbiddenSectionIntents: SectionIntent[]
  forbiddenTags: string[]
  weight: number
}
```

## VariationRule
```ts
type VariationRule = {
  id: string
  name: string
  type: VariationType
  styleScope: (FamilyId | SubstyleId)[]
  allowedSectionIntents: SectionIntent[]
  preserve: string[]
  targets: string[]
  requiredTags: string[]
  forbiddenTags: string[]
  weight: number
}
```

## SpecialMove
```ts
type SpecialMove = {
  id: string
  name: string
  category: string
  styleScope: (FamilyId | SubstyleId)[]
  allowedSectionIntents: SectionIntent[]
  triggerTags: string[]
  operation: SpecialMoveOp
  weight: number
}
```

## ExplanationTemplate
```ts
type ExplanationTemplate = {
  id: string
  templateType: string
  styleScope: (FamilyId | SubstyleId)[]
  sectionIntentScope: SectionIntent[]
  tone: string
  content: string
  requiredPlaceholders: string[]
}
```

## MidiPreset
```ts
type MidiPreset = {
  id: string
  name: string
  mode: MidiMode
  styleTags: string[]
  voicingStyle: string
  registerRange: [number, number]
  rhythmPattern: string
  velocityProfile: string
  sustainBehavior: string
  weight: number
}
```

---

# Runtime Request / Result Contracts

## GenerationRequest
```ts
type GenerationRequest = {
  seed: string
  familyId: FamilyId
  substyleId: SubstyleId
  key: string
  scaleMode: string
  sectionIntent: SectionIntent
  spiceLevel: number
  midiMode: MidiMode
}
```

## GenerationResult
```ts
type GenerationResult = {
  seed: string
  packId: string
  familyId: FamilyId
  substyleId: SubstyleId
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

`ChordSlot`, `ExplanationItem`, and `SuggestionItem` are defined in `docs/runtime-contracts.md`.

`full_loop` must produce deterministic loop-specific behavior through:
- `sectionIntent: "full_loop"`
- `SectionBehavior.fullLoopRules`
- loop-aware cadence and variation choices

## Current Implementation Sources
- `src/core/types/data-model.ts`
- `src/data/validators/pack-validator.ts`
- `src/data/templates/*.json`
- `src/data/packs/samples/*.json`

---

# Family Placement Frozen For V1

- `future_pop` belongs to **pop**
- `house_disco` belongs to **dance**

Any conflicting docs must be updated before implementation continues.

---

# Explicit V1 Exclusions
Do not add runtime entities for:
- melody generation
- bassline generation
- song-level corpus records
- backend service references
- user account fields
