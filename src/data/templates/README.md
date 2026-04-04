# src/data/templates/ Folder Plan

## Purpose

This folder is not the canonical authoring-template surface.

Canonical authoring templates live in `data-src/templates/`.

---

## What Goes Here

Only place runtime TypeScript helpers here if the app later needs local template logic.
Do not put canonical pack authoring JSON or starter content here.

---

## Why This Folder Exists

The canonical split is:
- shipped packs in `public/packs/`
- authoring assets in `data-src/`

---

## Rules

- do not duplicate canonical authoring templates from `data-src/templates/`
- keep any code here aligned with the official docs if this folder is later used
