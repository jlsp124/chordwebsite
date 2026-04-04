# public/packs

This directory is the shipped runtime pack surface for GitHub Pages.

Expected v1 files:
- manifest.json
- kpop.pack.json
- trap.pack.json
- rnb.pack.json
- pop.pack.json
- dance.pack.json

The browser may fetch files from here at runtime.
Do not place authoring fragments here.

These files are generated from `data-src/authoring/` via `node scripts/build-packs.mjs`.
