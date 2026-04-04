---
title: Chord Generator - Special Moves
tags:
  - chord-generator
  - special-moves
status: draft
---

# Chord Generator — Special Moves

> [!summary]
> Special moves are reusable, style-aware musical transformations.
> They create distinctive moments without turning the engine into random chaos.

## What This Note Freezes
- normalized special-move operations
- when they are useful
- where they should appear
- which v1 substyles need them most

---

# Frozen Operations

## delay_tonic_arrival
Hold back expected arrival so the next phrase/section hits harder.

Useful for:
- K-pop pre-chorus
- emotional pop lift
- future pop setup

## borrowed_iv_darken
Use borrowed iv color to darken or emotionalize the move.

Useful for:
- K-pop ballad/emotional
- modern R&B
- emotional pop

## bass_climb_lead_in
Use upward bass motion to create anticipation into the next section.

Useful for:
- K-pop pre-chorus
- pop chorus setup
- future pop lift

## dominant_pressure
Increase pull by introducing or strengthening dominant behavior.

Useful for:
- chorus payoff
- stronger resolves
- soulful tension moments

## drop_simplify
Strip harmonic density to make a drop or groove section hit cleaner.

Useful for:
- K-pop dark synth / futuristic
- house/disco
- future pop

## chorus_payoff_widen
Make chorus arrival feel bigger through broader harmonic release or voicing logic.

Useful for:
- K-pop chorus
- emotional pop chorus
- future pop chorus

## bridge_reframe
Reframe the progression so the bridge feels outside the main cycle.

Useful for:
- K-pop bridge
- ballad contrast
- dramatic pop bridge

## groove_lock
Keep harmony stable and repetitive to preserve groove dominance.

Useful for:
- house/disco
- melodic trap
- loop-first sections

## trap_soul_enrich
Add richer R&B-compatible color without losing trap-loop identity.

Useful for:
- trap_soul_rnb_rap
- melodic trap enrichment
- modern R&B crossover

## last_bar_tilt
Change the last bar enough to create direction without replacing the whole progression.

Useful for:
- full_loop refresh
- verse-to-pre transition
- chorus turnback

---

# Priority Substyles For V1

## K-pop
Priority:
- `kpop_bright_easy`
- `kpop_dark_synth`
- `kpop_ballad_emotional`

Recommended moves:
- `delay_tonic_arrival`
- `bass_climb_lead_in`
- `chorus_payoff_widen`
- `bridge_reframe`
- `borrowed_iv_darken`
- `drop_simplify`

## Trap
Priority:
- `melodic_trap`
- `trap_soul_rnb_rap`

Recommended moves:
- `groove_lock`
- `trap_soul_enrich`
- `last_bar_tilt`
- `dominant_pressure` (used carefully)

## R&B
Priority:
- `modern_rnb`

Recommended moves:
- `borrowed_iv_darken`
- `dominant_pressure`
- `trap_soul_enrich`
- `last_bar_tilt`

## Pop
Priority:
- `future_pop`

Recommended moves:
- `delay_tonic_arrival`
- `chorus_payoff_widen`
- `bass_climb_lead_in`
- `bridge_reframe`

## Dance
Priority:
- `house_disco`

Recommended moves:
- `groove_lock`
- `drop_simplify`
- `last_bar_tilt`

---

# Usage Rules

## Good Use
A special move should:
- be tied to section intent
- preserve style identity
- create a recognizable effect
- remain small enough to combine with archetype logic

## Bad Use
Do not use special moves as:
- random flavor buttons
- prose-only ideas
- excuses for style drift
- hidden full rewrites of the progression

---

# Authoring Rule

Every special move in pack data must include:
- stable `id`
- human-readable `name`
- `styleScope`
- `allowedSectionIntents`
- `triggerTags`
- frozen `operation`
- `weight`

No freeform “applyStrategy” prose should remain in runtime pack data.
