---
title: Manifest Spec
tags:
  - chord-generator
  - manifest
  - data
status: draft
---

# Manifest Spec

## Purpose

Define the shipped runtime manifest used by the static GitHub Pages app to discover available family packs
before lazy-loading the selected pack.

This file is part of the canonical v1 data surface.

## File Location

Shipped manifest:
- `public/packs/manifest.json`

The built app will load this manifest at runtime.

Authoring assets do **not** live beside the shipped manifest.
Authoring assets belong under:
- `data-src/templates/`
- `data-src/authoring/`

## Runtime Path Rule for GitHub Pages

Shipped packs live under `public/packs/` in the repo, but runtime URLs must **not** hardcode absolute root paths like:

- `/packs/kpop.pack.json`

That path will break on repo-subpath GitHub Pages deployments.

### Required rule

Manifest entries must store **relative** pack paths, not absolute-root URLs.

Runtime code must resolve manifest pack paths using `import.meta.env.BASE_URL`.

Acceptable runtime resolution patterns:
- `new URL(relativePath, import.meta.env.BASE_URL).toString()`
- a safe equivalent helper that joins `import.meta.env.BASE_URL` and the manifest path

### Valid manifest path examples
- `packs/kpop.pack.json`
- `packs/trap.pack.json`
- `packs/pop.pack.json`

### Invalid manifest path examples
- `/packs/kpop.pack.json`
- `https://.../packs/kpop.pack.json`

## Root Manifest Type

```ts
export interface PackManifest {
  manifestVersion: string
  packs: ManifestPackEntry[]
}
```

## Manifest Pack Entry

```ts
export interface ManifestPackEntry {
  packId: string
  familyId: string
  familyName: string
  path: string
  version: string
  substyleIds: string[]
  tags?: string[]
}
```

## Field Rules

### `manifestVersion`
- required
- semantic string or frozen version label
- changes when manifest structure changes

### `packId`
- required
- unique across all shipped packs
- should match the compiled pack file identity

Examples:
- `kpop`
- `trap`
- `rnb`
- `pop`
- `dance`

### `familyId`
- required
- normalized family identifier
- one shipped pack per family for v1

Examples:
- `kpop`
- `trap`
- `rnb`
- `pop`
- `dance`

### `familyName`
- required
- human-readable label for UI metadata surfaces

### `path`
- required
- relative runtime path, resolved with `import.meta.env.BASE_URL`
- points to the compiled shipped pack JSON

Examples:
- `packs/kpop.pack.json`
- `packs/trap.pack.json`

### `version`
- required
- version of the shipped compiled pack
- can match `packVersion` inside the target pack

### `substyleIds`
- required
- normalized substyle IDs contained in the pack
- used for startup metadata, filtering, and validation

### `tags`
- optional
- light descriptive metadata only
- do not use this as the source of truth for core musical behavior

## V1 Pack Set

The expected v1 manifest should describe exactly these shipped family packs:

- `kpop.pack.json`
- `trap.pack.json`
- `rnb.pack.json`
- `pop.pack.json`
- `dance.pack.json`

## Validation Rules

The manifest is invalid if:
- two entries share the same `packId`
- two entries share the same `familyId`
- any `path` is absolute-root or remote
- any `substyleIds` entry is missing from the target compiled pack
- any referenced pack file does not exist

## Example Manifest

```json
{
  "manifestVersion": "1.0.0",
  "packs": [
    {
      "packId": "kpop",
      "familyId": "kpop",
      "familyName": "K-pop",
      "path": "packs/kpop.pack.json",
      "version": "1.0.0",
      "substyleIds": [
        "kpop_bright_easy",
        "kpop_dark_synth",
        "kpop_ballad_emotional"
      ],
      "tags": ["section-aware", "flagship"]
    }
  ]
}
```

## What Codex Must Not Guess

Codex must not guess:
- that pack paths can be absolute-root URLs
- that manifest entries can point at authoring assets
- that the browser should fetch from `data-src`
- that runtime path joining can ignore `import.meta.env.BASE_URL`
- that one family can be spread across multiple shipped packs in v1 without a doc change
