---
title: Chord Generator - Loop Data Model
tags:
  - chord-generator
  - data-model
  - pipeline
status: draft
---

# Chord Generator - Loop Data Model

> [!summary]
> v1 now treats authored **4-bar loop archetypes** as the compact runtime unit.
> Raw corpora stay offline in `data-src/`.
> The browser only loads compiled family packs from `public/packs/`.

## What This Note Freezes
- offline source registry and staging layers
- canonical normalized chord-event schema
- extracted 4-bar loop candidate schema
- deduped/scored loop cluster schema
- compiled loop-pack schema
- aggregate-only provenance rules for shipped packs

## Runtime / Authoring Boundary

### Offline Source / Staging Surface
All corpus intake and machine-generated artifacts stay under:

```text
data-src/
  external/
  staging/
  curation/
  generated/
```

These files are authoring-only and are never loaded by the browser.

### Shipped Runtime Surface
The browser loads only:

```text
public/packs/
  manifest.json
  <family>.pack.json
```

Shipped packs must remain compact, abstract, and non-raw.

---

# Source Registry

## SourceRegistry
```ts
type SourceRegistry = {
  registryVersion: string
  sources: SourceRegistryEntry[]
}
```

## SourceRegistryEntry
```ts
type SourceRegistryEntry = {
  sourceId: string
  version: string
  downloadUrl: string
  format: string
  license: string
  licenseClass: "open" | "mixed" | "noncommercial" | "share_alike_data" | "ambiguous"
  role: "primary_backbone" | "broad_harmony" | "color_vocabulary" | "optional_vocabulary"
  enabledByDefault: boolean
  checksum: string
  notes: string
  downloadTargets?: SourceDownloadTarget[]
}
```

## SourceDownloadTarget
```ts
type SourceDownloadTarget = {
  fileName: string
  kind: "direct" | "github_archive"
  url: string
  notes?: string
}
```

## DownloadLockfile
```ts
type DownloadLockfile = {
  lockVersion: string
  entries: DownloadLockEntry[]
}
```

Each `DownloadLockEntry` records:
- `sourceId`
- `version`
- `fileName`
- `url`
- `checksum`
- `fetchedAt`
- `localPath`

---

# Normalized Offline Schema

Normalized chord events are the canonical offline interchange.

## NormalizedChordEvent
```ts
type NormalizedChordEvent = {
  sourceId: string
  partition: string
  workId: string
  annotationId: string
  licenseClass: SourceLicenseClass
  meter: string
  barIndex: number
  beatStart: number
  beatEnd: number
  chordOriginal: string
  chordNormalized: string
  rootPc: number | null
  quality: string
  extensions: string[]
  bass: string | null
  globalKey: string | null
  localKey: string | null
  mode: "major" | "minor" | "unknown"
  romanNumeral: string
  functionLabel: string
  timeBasis: "measure_beat" | "seconds"
  confidence: number
  parseFlags: string[]
  provenance: Record<string, string | number | boolean | null>
}
```

## NormalizedWorkMetadata
```ts
type NormalizedWorkMetadata = {
  sourceId: string
  partition: string
  workId: string
  annotationId: string
  meter: string
  sectionHints: string[]
  tempoClass: string
  sourceFlags: string[]
  provenance: Record<string, string | number | boolean | null>
}
```

Files:
- `data-src/staging/normalized/<sourceId>.events.jsonl`
- `data-src/staging/normalized/<sourceId>.works.jsonl`

---

# Loop Candidate Schema

The primary extracted unit is a **4-bar loop candidate**.

## ExtractedLoopCandidate
```ts
type ExtractedLoopCandidate = {
  id: string
  mode: "major" | "minor"
  chordCount: 2 | 4
  romanSequence: string[]
  functionPath: string[]
  durationPatternBeats: number[]
  closure: "open" | "soft_resolve" | "strong_resolve" | "turnback" | "contrastive"
  colorProfile: string[]
  loopability: number
  averageConfidence: number
  transformSlots: {
    slotIndex: number
    allowedDecorations: string[]
    allowedSlashBassDegrees: string[]
  }[]
  repeat8Ok: boolean
  repeat16Ok: boolean
  supportCount: number
  sourceRefs: LoopSourceReference[]
  tags: string[]
  rejectionReasons?: string[]
}
```

Files:
- `data-src/staging/windows/4bar.candidates.jsonl`
- `data-src/staging/windows/8bar.analysis.jsonl`
- `data-src/staging/windows/16bar.analysis.jsonl`

---

# Dedupe / Cluster Schema

## DedupeCluster
```ts
type DedupeCluster = {
  clusterId: string
  canonicalCandidateId: string
  supportCount: number
  sourceCount: number
  sourceDiversity: number
  clusterMembers: string[]
  exactDedupeKey: string
  nearDedupeKey: string
}
```

## LoopScoreBreakdown
```ts
type LoopScoreBreakdown = {
  loopFitness: number
  crossSourceSupport: number
  annotationTrust: number
  transformHeadroom: number
  styleFitPrior: number
  harmonicColorValue: number
  penalty: number
  total: number
}
```

## ScoredLoopCluster
```ts
type ScoredLoopCluster = {
  clusterId: string
  canonicalCandidateId: string
  supportCount: number
  sourceCount: number
  sourceDiversity: number
  clusterMembers: string[]
  exactDedupeKey: string
  nearDedupeKey: string
  canonicalLoop: ExtractedLoopCandidate
  score: LoopScoreBreakdown
  styleSupport: Record<string, number>
}
```

Files:
- `data-src/staging/clusters/deduped-loops.jsonl`
- `data-src/staging/reports/top-loops-by-style.json`
- `data-src/staging/reports/rejected-loops.json`
- `data-src/staging/reports/license-mix.json`

---

# Compiled Loop Pack Schema

The runtime pack keeps family-pack loading, but the loop payload is reduced to loop-first units.

## CompiledLoopPack
```ts
type CompiledLoopPack = {
  packVersion: string
  packId: string
  family: {
    id: string
    name: string
    description: string
    tags: string[]
    substyleIds: string[]
  }
  substyles: CompiledSubstyle[]
  loopArchetypes: LoopArchetype[]
  harmonicRhythmProfiles: unknown[]
  spicinessTransforms: unknown[]
  variationRules: unknown[]
  specialMoves: unknown[]
  midiPresets: unknown[]
  provenanceSummary: ProvenanceSummary
}
```

## CompiledSubstyle
```ts
type CompiledSubstyle = {
  id: string
  familyId: string
  name: string
  description: string
  tags: string[]
  loopArchetypeIds: string[]
  harmonicRhythmProfileIds: string[]
  spicinessTransformIds: string[]
  variationRuleIds: string[]
  specialMoveIds: string[]
  midiPresetIds: string[]
}
```

## LoopArchetype
```ts
type LoopArchetype = {
  id: string
  substyleId: string
  name: string
  bars: 4
  chordCount: 2 | 4
  romanNumerals: string[]
  functionPath: string[]
  durationPatternBeats: number[]
  closure: LoopClosure
  colorProfile: string[]
  loopability: number
  transformSlots: {
    slotIndex: number
    allowedDecorations: string[]
    allowedSlashBassDegrees: string[]
    forbidOnLowSpice: boolean
  }[]
  tags: string[]
  weight: number
  repeat8Allowed: boolean
  repeat16Allowed: boolean
  provenanceSummary: ProvenanceSummary
}
```

## ProvenanceSummary
```ts
type ProvenanceSummary = {
  sourceCount: number
  sourceIds: string[]
  partitionCount: number
  evidenceCount: number
  licenseMix: SourceLicenseClass[]
}
```

### Shipped Runtime Restrictions
Compiled runtime packs must not include:
- song titles
- artist names
- raw corpus rows
- direct source file names
- audio or MIDI
- corpus-specific comments
- track-level provenance beyond aggregate counts

---

# Manual Curation Boundary

These are never auto-promoted directly from corpus output:
- K-pop-specific special moves
- K-pop lift/payoff logic
- style mapping into shipped substyles
- blacklist decisions for overfamiliar or weak loops
- final runtime weights and public-pack promotion

Scripts may surface candidates and scores.
Humans decide what becomes public pack identity.

---

# Generated Review Output

Machine-proposed review fragments live in:

```text
data-src/generated/loop-fragments.json
```

Each fragment groups a scored cluster under a candidate substyle with:
- `romanSequence`
- `functionPath`
- `durationPatternBeats`
- `totalScore`
- `styleFitScore`
- `reviewStatus`
- aggregate `provenanceSummary`

`reviewStatus` is one of:
- `ready_for_review`
- `blocked_by_source_policy`
- `blocked_by_blacklist`
