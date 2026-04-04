# src/data/validators/ Folder Plan

## Purpose

This folder stores validation code only.

Validation should catch broken data early.

---

## What Goes Here

Examples:
- schema validators
- ID/reference integrity checks
- helper functions for required-field validation
- pack version compatibility checks

---

## Validation Targets

Validation should check:
- required root keys
- unique IDs
- valid references between entities
- no missing explanation template references
- no missing MIDI preset references
- no empty required arrays
- valid substyle/family links

---

## Rules

- validators should be reusable by scripts and app startup checks where appropriate
- validators should return useful error messages
- validators should not silently coerce broken data into validity
- validation should stay focused on pack integrity, not UI logic
- source data still lives in `data-src/`, and shipped pack JSON still lives in `public/packs/`
