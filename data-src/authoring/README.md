# data-src/authoring

This directory contains hand-authored pack source modules for the shipped runtime packs.

Current source modules cover:
- `kpop_bright_easy`
- `kpop_dark_synth`
- `kpop_ballad_emotional`
- `melodic_trap`
- `trap_soul_rnb_rap`
- `modern_rnb`
- `house_disco`
- `future_pop`

`node scripts/build-packs.mjs` compiles these sources into `public/packs/*.pack.json`.
The browser should never load files from here directly.
