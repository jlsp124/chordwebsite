---
title: Chord Generator - MIDI Rules
tags:
  - chord-generator
  - midi
status: draft
---

# Chord Generator — MIDI Rules

> [!summary]
> v1 MIDI should be **useful immediately in a DAW**.
> It should be simple, style-aware, and deterministic enough to test.

## What This Note Freezes
- MIDI modes
- preset expectations
- runtime export behavior
- v1 limitations

---

# Frozen MIDI Modes

## block
Use direct chord hits.
Best for:
- fast sketching
- easy DAW editing
- checking harmonic shape clearly

## comp
Use rhythmic chord patterns / stabs.
Best for:
- groove-aware writing
- house/disco
- some pop and R&B contexts

## arp
Use broken/arpeggiated realization.
Best for:
- future pop
- lighter K-pop support patterns
- idea generation with motion

---

# MIDI Preset Rules

Every preset must define:
- `mode`
- `voicingStyle`
- `registerRange`
- `rhythmPattern`
- `velocityProfile`
- `sustainBehavior`
- `weight`

Presets should be deterministic enough to test and compare.
They may still include small controlled variation if seeded and reproducible.

---

# Style-Aware Defaults

## kpop_bright_easy
- allow `block`
- allow `arp`
- lighter register
- clean sustain
- moderate velocity curve

## kpop_dark_synth
- allow `block`
- allow `comp`
- slightly tighter / lower register
- cleaner rhythmic emphasis
- avoid over-busy arp behavior

## kpop_ballad_emotional
- prioritize `block`
- allow light `arp`
- broader sustain
- wider voicing allowed

## melodic_trap
- prioritize `block`
- comp only if restrained
- lower-mid register
- simple and repeatable

## trap_soul_rnb_rap
- allow `block`
- allow softer `comp`
- richer voicing color
- smooth sustain

## modern_rnb
- allow all three modes
- medium register
- richer voicing
- smoother velocity shape

## future_pop
- allow `block`
- allow `arp`
- polished repeating patterns
- brighter movement

## house_disco
- prioritize `comp`
- allow `block`
- keep groove stable
- avoid over-complex arp figures

---

# Export Rules

The app should:
1. generate a progression result
2. select the active MIDI mode
3. choose a matching MIDI preset
4. turn chord slots into note events
5. create a `.mid` file client-side
6. download it directly

The browser should handle export locally.
No backend is required for MIDI export in v1.

---

# Preview vs Export

Preview is for:
- fast listening
- basic comparison
- checking timing/feel

MIDI export is for:
- actual DAW use
- editing
- arranging
- long-term saving in projects

Preview should stay simple.
MIDI export is the more important workflow.

---

# V1 Limitations

Do not add in v1:
- audio file export
- rendered stems
- multi-track arrangement export
- giant preset matrix
- instrument-specific sample playback
- piano-roll view requirement

The MIDI system should stay compact and testable.
