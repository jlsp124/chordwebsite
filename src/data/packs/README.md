# src/data/packs/ Folder Plan

## Purpose

This folder is not the shipped JSON pack surface.

Shipped runtime packs live in `public/packs/`.
Authoring pack source material lives in `data-src/`.

Use this folder only for runtime TypeScript helpers if pack-loading code needs a local home later.

---

## What Does Not Go Here

Do not put shipped JSON packs here:
- `kpop.pack.json`
- `trap.pack.json`
- `rnb.pack.json`
- `pop.pack.json`
- `dance.pack.json`

Those belong in `public/packs/`.

---

## Rules

- do not duplicate the runtime pack source of truth here
- do not point future work back to the old `src/data/packs` layout
- keep any code here aligned with `docs/data-model.md` and `docs/manifest-spec.md`

---

## Loading Strategy

Runtime pack loading should fetch from `public/packs/` via the manifest.
Do not use direct JSON imports from this folder for shipped pack content.
