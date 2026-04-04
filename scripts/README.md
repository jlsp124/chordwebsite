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

---

## Recommended Future Files

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
