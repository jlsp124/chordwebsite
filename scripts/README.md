# scripts/ Folder Plan

## Purpose

This folder is for local/offline helper scripts only.

Scripts should support:
- pack validation
- loop-source download and normalization
- loop extraction, clustering, and review generation
- sanity checks
- optional maintenance tasks

Scripts in this folder are **not runtime dependencies** for the deployed GitHub Pages app.

---

## Current Scripts

### `build-packs.mjs`
Compiles the hand-authored source modules in `data-src/authoring/` into:
- `public/packs/manifest.json`
- `public/packs/*.pack.json`

### `validate-packs.mjs`
Validates local JSON packs:
- required keys present
- ID uniqueness
- cross-reference integrity
- no empty required arrays

Current implementation validates the shipped runtime pack surface under `public/packs/`.
Use `node scripts/validate-packs.mjs --samples` to validate the smaller sample fixtures.

### `download-sources.mjs`
Downloads pinned offline corpus inputs into:
- `data-src/external/<sourceId>/<version>/raw/`

Also refreshes:
- `data-src/staging/downloads.lock.json`

Supported flags:
- `--source=<sourceId>`
- `--with-weimar`
- `--force`
- `--force-extract`

### `normalize-sources.mjs`
Normalizes source-specific raw inputs into:
- `data-src/staging/normalized/<sourceId>.events.jsonl`
- `data-src/staging/normalized/<sourceId>.works.jsonl`

Supported flags:
- `--fixtures`
- `--source=<sourceId>`
- `--with-weimar`

### `extract-loops.mjs`
Slides 4-bar windows across normalized works and emits only v1-compatible loop candidates:
- `2 chords / 4 bars`
- `4 chords / 4 bars`

Outputs:
- `data-src/staging/windows/4bar.candidates.jsonl`
- `data-src/staging/windows/8bar.analysis.jsonl`
- `data-src/staging/windows/16bar.analysis.jsonl`

### `cluster-loops.mjs`
Exact-dedupes, near-clusters, and scores extracted loop candidates.

Outputs:
- `data-src/staging/clusters/deduped-loops.jsonl`
- `data-src/staging/reports/top-loops-by-style.json`
- `data-src/staging/reports/rejected-loops.json`
- `data-src/staging/reports/license-mix.json`

### `generate-loop-fragments.mjs`
Builds grouped review proposals from scored clusters plus curation rules.

Output:
- `data-src/generated/loop-fragments.json`

### `validate-loop-pipeline.mjs`
Validates:
- `data-src/external/source-registry.json`
- `data-src/generated/loop-fragments.json` if present

---

## Fixture Smoke Flow

Use this when changing the offline pipeline without pulling real corpora:

```bash
npm run pipeline:fixtures
npm run validate:loop-pipeline
node scripts/validate-packs.mjs
```

The fixture path verifies:
- normalized event shape
- 4-bar loop extraction
- dedupe/scoring
- generated review fragment output

---

## Recommended Future Files
- curated pack compilers that consume reviewed loop fragments
- richer source-specific normalizers for ChoCo and Weimar once raw snapshots are available locally

---

## Rules

- scripts should run locally through node, tsx, python, or a documented command
- scripts should not scrape live sites during normal app builds
- scripts should not become required runtime infrastructure
- scripts should fail clearly when pack data is broken
- manifest paths must stay relative and GitHub Pages-safe
- shipped runtime packs must remain aggregate-only and must not leak raw corpus identifiers

---

## What Belongs Elsewhere

Do not put in this folder:
- frontend runtime code
- production app logic used directly in the browser
- backend code for services you do not have

This folder is for authoring and maintenance support.
