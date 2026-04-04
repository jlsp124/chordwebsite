---
title: Chord Generator - Pack Authoring Guidelines
tags:
  - chord-generator
  - authoring
  - guidelines
status: draft
---

# Chord Generator — Pack Authoring Guidelines

> [!summary]
> A pack is not a song dump.
> A pack is a compact, reusable model of style behavior.

## Core Rule
Author packs as **style behavior**, not as disguised song transcription.

Good pack authoring answers:
- what kinds of progression shapes belong here?
- how does this style resolve?
- how open or closed are its sections?
- what special moves feel authentic here?
- what chord color is normal vs exceptional here?

Bad pack authoring answers:
- “this is basically Song X”
- “copy a famous progression and rename it”
- “same pop loop with different adjectives”
- “huge pile of unstructured chord ideas”

---

# What To Author

For each substyle, author:
- archetypes
- cadence profiles
- harmonic rhythm profiles
- section behavior
- spiciness transforms
- variation rules
- special moves
- explanation templates
- MIDI presets

Each authored object should be:
- specific
- reusable
- deterministic enough for code
- musical enough to feel real

---

# Archetype Authoring Rules

Each archetype should define:
- Roman numerals
- function path
- bars
- allowed section intents
- loopability
- tension curve
- tags
- weight
- slot options for decoration and slash-bass behavior

## Good Archetype Signs
- reusable
- clear emotional/job identity
- not just “random good chords”
- fits the substyle
- distinct from neighboring archetypes

## Bad Archetype Signs
- vague name + vague tags
- same progression duplicated 4 times
- no section relevance
- no style-specific role
- weird chord sequence justified only by “it sounds cool”

---

# Section Behavior Rules

Section behavior must be explicit for:
- `full_loop`
- `verse`
- `pre_chorus`
- `chorus`
- `bridge`

Especially for K-pop:
- `pre_chorus` should usually increase directional pull or contrast
- `chorus` should usually feel like arrival, drop payoff, or memorable loop release
- `bridge` should justify contrast
- `full_loop` must remain stable and loop-friendly

Do not make `full_loop` a fallback.
It is a first-class intent.

---

# Spiciness Rules

Spice is not random weirdness.

Each spice level should:
- allow specific decoration types
- allow or forbid specific functions/contexts
- remain consistent with style identity

Good spice design:
- low spice = safer surface color
- high spice = bolder but still stylistically believable

Bad spice design:
- every level changes everything
- high spice becomes unusable
- low spice removes all identity

---

# Variation Rules

Variation rules should preserve identity while changing behavior.

Each variation rule must define:
- its exact `VariationType`
- what it preserves
- what it targets
- where it is allowed
- what tags it requires or forbids

Good variation logic:
- related
- controlled
- audible
- useful for producers

Bad variation logic:
- becomes a totally different progression
- repeats the same harmonic result with new labels
- breaks the style boundary

---

# Special Move Rules

Special moves are reusable musical tricks that create style-specific moments.

They must use normalized operations, not vague prose.

Use only frozen operations such as:
- `delay_tonic_arrival`
- `borrowed_iv_darken`
- `bass_climb_lead_in`
- `dominant_pressure`
- `drop_simplify`
- `chorus_payoff_widen`
- `bridge_reframe`
- `groove_lock`
- `trap_soul_enrich`
- `last_bar_tilt`

Good special move authoring:
- captures a recognizable effect
- is reusable
- is tied to section/style context

Bad special move authoring:
- “make it cooler”
- “add spice”
- “more cinematic”
- prose with no executable meaning

---

# Explanation Template Rules

Explanation templates should be:
- concise
- practical
- producer-friendly
- tied to actual generation metadata

They should explain:
- what the progression is doing
- what creates tension/release
- what changed in a variation
- why the current section feels like verse/pre/chorus/bridge/full loop

Avoid:
- vague mood-only writing
- textbook paragraphs
- exact-song claims
- generic “this adds emotion” filler

---

# MIDI Preset Rules

MIDI presets should define:
- mode
- voicing style
- register range
- rhythm pattern
- velocity profile
- sustain behavior

They must feel style-aware and usable in a DAW.
They must not try to simulate a huge production system in v1.

---

# Naming / ID Rules

Use stable, lowercase snake_case IDs.

Examples:
- `kpop_bright_easy`
- `trap_soul_rnb_rap`
- `future_pop`
- `house_disco`

Do not mix multiple naming styles across docs and packs.

---

# Required Pack Review Questions

Before approving a pack, ask:
1. does it feel different from neighboring packs?
2. does it have enough archetypes?
3. is `full_loop` explicit?
4. do the cadence/rhythm profiles actually differ?
5. do special moves feel executable?
6. do explanations sound useful?
7. does the pack sound like a style, not a placeholder?
