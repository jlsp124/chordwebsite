---
title: Chord Generator - Data Pack Plan
tags:
  - chord-generator
  - data-packs
  - runtime
status: draft
---

# Chord Generator - Data Pack Plan

> [!summary]
> v1 ships compiled family packs from `public/packs/`.
> Musical authoring happens in `data-src/`.
> Scripts validate, compile, and report.
> Scripts do not invent core musical identity.

## What This Note Freezes
- shipped family-pack strategy
- authoring/runtime split
- minimum pack depth for v1
- family placement for ambiguous substyles
- manifest-first loading strategy
- first pack expansion priorities

---

# Shipped Runtime Surface

Runtime pack files live in:

```text
public/packs/
```

Expected v1 files:
- `manifest.json`
- `kpop.pack.json`
- `trap.pack.json`
- `rnb.pack.json`
- `pop.pack.json`
- `dance.pack.json`

The browser loads:
1. `manifest.json` first
2. the selected family pack second

No authoring fragments are fetched at runtime.

---

# Authoring Surface

Authoring assets live in:

```text
data-src/
```

Expected authoring layout:
```text
data-src/
  templates/
  authoring/
    kpop/
    trap/
    rnb/
    pop/
    dance/
```

These files are source material for scripts and human editing only.

Current repo scaffolding also includes:
- starter schema mirrors in `src/data/templates/`
- validator sample fixtures in `src/data/packs/samples/`

Those are implementation scaffolding only. They do not replace `data-src/`.

---

# Manifest-First Strategy

The app should:
1. load family metadata from `manifest.json`
2. show family/substyle choices without loading all packs
3. lazy-load only the selected family pack
4. use the selected pack for generation, explanations, suggestions, and MIDI preset selection
5. resolve manifest pack paths with `import.meta.env.BASE_URL` per `docs/manifest-spec.md`

This keeps GitHub Pages hosting simple and keeps startup lighter than eagerly loading all family data.

---

# V1 Shipped Packs

Use exactly **1 shipped pack per family** in v1.

## kpop.pack.json
Contains:
- `kpop_bright_easy`
- `kpop_dark_synth`
- `kpop_ballad_emotional`

## trap.pack.json
Contains:
- `melodic_trap`
- `trap_soul_rnb_rap`

## rnb.pack.json
Contains:
- `modern_rnb`

## pop.pack.json
Contains:
- `future_pop`

## dance.pack.json
Contains:
- `house_disco`

---

# Frozen Family Placement

This is now explicit and must be consistent everywhere:

- `future_pop` belongs to **pop**
- `house_disco` belongs to **dance**

These are no longer ambiguous.

---

# Hand-Authored vs Script-Generated

## Must Be Hand-Authored
These define musical identity and should not be auto-invented:
- family/substyle identity
- archetypes
- cadence intent
- section behavior
- special moves
- explanation templates
- MIDI preset intent
- K-pop section and special-move semantics

## May Be Script-Generated
Scripts may generate:
- `manifest.json`
- compiled pack JSON from authoring fragments
- cross-reference integrity reports
- missing-ID reports
- coverage reports
- optional fixtures for tests

## Must Not Be Script-Invented For V1
Do not auto-generate from corpus or prose:
- K-pop archetypes
- K-pop section behavior
- explanation text semantics
- special-move semantics
- style identity

---

# Minimum Authoring Depth

## K-pop Substyles
Each K-pop substyle should reach:
- 15-20 archetypes
- full section rules
- 4-6 special moves
- 2-4 cadence profiles
- 2-3 harmonic rhythm profiles
- 3-6 spice transforms
- 5-8 variation rules
- 2-3 MIDI presets

## Other Priority Substyles
Each non-K-pop v1 substyle should reach:
- 12-15 archetypes
- lighter section rules unless strongly section-aware
- 2-4 cadence profiles
- 2-3 harmonic rhythm profiles
- 3-6 spice transforms
- 5-8 variation rules
- 2-3 MIDI presets

---

# Pack Quality Rules

A substyle pack is not "usable" unless it has:
- real archetype diversity
- distinct cadence behavior
- distinct rhythm behavior
- non-generic explanation templates
- non-generic special-move or variation identity
- tags that separate it from neighboring substyles

Bad pack signs:
- same archetypes repeated with tiny wording changes
- generic filler tags
- no meaningful section distinction
- every substyle resolving the same way
- K-pop behaving like flat loop-pop
- trap behaving like pop with darker wording

---

# First Expansion Priority

Expand these first:
1. `kpop_bright_easy`
2. `kpop_dark_synth`
3. `kpop_ballad_emotional`
4. `melodic_trap`
5. `trap_soul_rnb_rap`
6. `modern_rnb`
7. `house_disco`
8. `future_pop`

K-pop gets priority because it has the highest section complexity and the highest chance of sounding fake if under-authored.

---

# Required Scripts

Expected script responsibilities:
- `validate-packs`
- `build-packs`
- `build-pack-manifest`
- `report-pack-coverage`

The scripts should compile and validate.
They should not act as hidden music generators.

Current repo implementation includes `scripts/validate-packs.mjs`, which validates the in-repo sample fixtures
without treating them as shipped runtime packs.

---

# Pack Readiness Before Engine Work

Before serious engine work starts, at minimum:
- manifest shape must exist
- 1 real K-pop pack must validate
- 1 non-K-pop pack must validate
- `full_loop` behavior must be explicit
- special moves must be normalized
- prose-only rule fields must be reduced to structured enums/arrays

Only then is engine work worth doing.
