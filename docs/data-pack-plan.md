---
title: Chord Generator - Loop Pack Plan
tags:
  - chord-generator
  - data-packs
  - pipeline
status: draft
---

# Chord Generator - Loop Pack Plan

> [!summary]
> v1 uses a two-layer pipeline:
> broad offline corpus intake under `data-src/`,
> then narrow curated runtime packs in `public/packs/`.

## What This Note Freezes
- offline source priorities
- automatic download boundaries
- normalization and loop-extraction stages
- dedupe/scoring reports
- manual curation checkpoints
- aggregate-only runtime pack policy

---

# Source Priorities

## Primary
- `cocopops`
  - role: pop backbone
  - default: enabled
- `choco`
  - role: broad harmony intake
  - default: enabled

## Secondary
- `jht`
  - role: richer harmony color and turnaround vocabulary
  - default: enabled

## Optional
- `weimar`
  - role: extra jazz harmony vocabulary and chorus-section data
  - default: disabled
  - enabled manually with `--with-weimar`

---

# Automatic Download Rules

Automatic download scripts may fetch:
- metadata-bearing symbolic corpora
- repository archives
- JSON/JAMS/TSV/SQLite source files
- license files and README files

Automatic download scripts must never fetch:
- audio files
- stems
- MIDI packs for runtime use
- scraped live webpages as build inputs

Expected script:
- `scripts/download-sources.mjs`

Expected outputs:
- `data-src/external/source-registry.json`
- `data-src/external/<sourceId>/<version>/raw/`
- `data-src/staging/downloads.lock.json`

---

# Normalization Plan

Expected script:
- `scripts/normalize-sources.mjs`

Expected outputs:
- `data-src/staging/normalized/<sourceId>.events.jsonl`
- `data-src/staging/normalized/<sourceId>.works.jsonl`

Normalization rules:
- all sources must map into one canonical event schema
- all chord symbols must be preserved as `chordOriginal`
- all extracted harmonic logic must be normalized into:
  - `romanNumeral`
  - `functionLabel`
  - `mode`
  - bar/beat positioning
- source-specific metadata stays in `provenance`
- parser uncertainty must surface through `confidence` and `parseFlags`

---

# Loop Extraction Plan

Expected script:
- `scripts/extract-loops.mjs`

Primary runtime unit:
- 4-bar loop candidates

Supported v1 change rates:
- `2 chords / 4 bars` -> `[8,8]`
- `4 chords / 4 bars` -> `[4,4,4,4]`

Extraction rules:
1. bar-grid all normalized events
2. drop ambiguous or unstable spans
3. slide 4-bar windows by 1 bar
4. keep only v1-compatible change rates
5. mark 8-bar and 16-bar repeat suitability offline

Expected outputs:
- `data-src/staging/windows/4bar.candidates.jsonl`
- `data-src/staging/windows/8bar.analysis.jsonl`
- `data-src/staging/windows/16bar.analysis.jsonl`

---

# Dedupe / Scoring Plan

Expected script:
- `scripts/cluster-loops.mjs`

Exact dedupe key:
- `mode + romanSequence + functionPath + durationPattern + closure`

Near-dedupe key:
- same chord-count
- same function path
- Roman edit distance `<= 1` or same root-motion skeleton

Score weights:
- `0.30` loop fitness
- `0.20` cross-source support
- `0.15` annotation trust
- `0.15` transform headroom
- `0.10` style-fit prior
- `0.10` harmonic color value

Penalties:
- exact-song fingerprint risk
- unstable tonic inference
- meter irregularity
- over-dense change pattern
- unsupported oddity

Expected outputs:
- `data-src/staging/clusters/deduped-loops.jsonl`
- `data-src/staging/reports/top-loops-by-style.json`
- `data-src/staging/reports/rejected-loops.json`
- `data-src/staging/reports/license-mix.json`

---

# Curation / Generated Layers

Human review files live in:

```text
data-src/curation/
```

Expected curation files:
- `source-policy.json`
- `style-mapping.json`
- `loop-blacklist.json`

Machine-proposed outputs live in:

```text
data-src/generated/
```

Expected generated outputs:
- `loop-fragments.json`

The generated layer may propose:
- loop fragments
- candidate tags
- provenance summaries
- style-support scores
- review status gates

The generated layer must not auto-approve:
- K-pop special moves
- style identity labels
- final pack weights
- runtime pack promotion

---

# Runtime Pack Promotion Rules

Compiled runtime packs continue to load by family:
- `public/packs/manifest.json`
- `public/packs/<family>.pack.json`

Promotion rules:
- only approved loop archetypes may enter runtime packs
- runtime packs must contain aggregate provenance only
- mixed-license intake may exist offline, but source-policy review decides whether a cluster may become runtime-derived
- public runtime packs must remain compact and browser-safe

Bad promotion signs:
- loops trace too closely to a single overfamiliar song
- style labels come from frequency only with no human review
- K-pop behavior is inferred without manual curation
- raw corpus identifiers leak into runtime JSON

Validation requirement:
- `public/packs/` must fail validation if raw corpus identifiers such as `workId`, `annotationId`, `sourceRefs`, or direct source files leak into runtime JSON

---

# Required Scripts

Required now:
- `download-sources`
- `normalize-sources`
- `extract-loops`
- `cluster-loops`
- `generate-loop-fragments`
- `validate-packs`

Scripts must:
- run offline after initial download
- fail clearly when staging data is malformed
- keep runtime packs and offline corpora separate
- never become browser runtime dependencies
