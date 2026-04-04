# scripts/ Folder Plan

## Purpose

This folder is for local/offline helper scripts only.

Scripts should support:
- pack validation
- pack building or normalization
- sanity checks
- optional maintenance tasks

Scripts in this folder are **not runtime dependencies** for the deployed GitHub Pages app.

---

## Current Script

### `validate-packs.mjs`
Validates local JSON packs:
- required keys present
- ID uniqueness
- cross-reference integrity
- no empty required arrays

Current implementation validates the hand-authored sample fixtures under `src/data/packs/samples/`.

---

## Recommended Future Files

### `build-packs.ts` or `build-packs.py`
Optional later script to transform curated source material into final pack JSON.

Input should come from `data-src/`.
Output should go to `public/packs/`.

### `build-pack-manifest.ts`
Builds or validates `public/packs/manifest.json` from the compiled pack set.

### `report-packs.ts`
Optional later script to summarize:
- pack counts
- missing templates
- weak coverage
- archetype counts per substyle

---

## Rules

- scripts should run locally through node, tsx, python, or a documented command
- scripts should not scrape live sites during normal app builds
- scripts should not become required runtime infrastructure
- scripts should fail clearly when pack data is broken
- manifest paths must stay relative and GitHub Pages-safe

---

## What Belongs Elsewhere

Do not put in this folder:
- frontend runtime code
- production app logic used directly in the browser
- backend code for services you do not have

This folder is for authoring and maintenance support.
