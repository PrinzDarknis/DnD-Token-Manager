# Overview

## Purpose
Lets players and the GM manage the limited resources of their D&D characters (HP, AC, hit dice, spell slots and other resources, magic items) directly in Owlbear Rodeo. Characters can be linked to tokens, and HP/AC sync with the "Stat Bubbles for D&D" extension. The plugin also has a few table utilities: a sound board, in-game time with moon phases and tasks, and interactive puzzles.

## Features
| Feature | Who | Where | Main code |
| --- | --- | --- | --- |
| Character resources (HP, AC, hit dice, resources, magic items) | both, editing gated by the GM | popover tab "Character" | `src/components/character/`, `src/model/character/`, `src/owlbear/owlbear-character.ts` |
| Link a token to a character | GM | context menu on CHARACTER-layer items (embed) | `src/context-menu-token-set-character.tsx`, `character-select/`, `OwlbearCharacter.setupCharacterAction` |
| Token ↔ character stat sync (Stat Bubbles) | background, per client | background | `src/owlbear/plugin-adapter/stat-bubbles-for-dnd/`, `OwlbearCharacter.onTokenUpdate` |
| Settings (global and personal), backups, import/export | GM (global, backups); everyone (personal) | popover tab "⚙" | `src/components/settings/settings-controller/`, `src/owlbear/owlbear-settings.ts`, `src/model/settings/` |
| Sound board (plays on every client) | both | popover tab "𝅘𝅥𝅮", playback in the background | `src/components/sound/sound-board/` (sound list in `sound-board.constant.ts`), `OwlbearSettings.setupMessageListener` |
| Sound volume: per-player master volume (slider + local test sound) × per-sound `volume` from code, result limited to 0–1 | everyone (own volume) | popover tab "𝅘𝅥𝅮" | `sound-board.component.tsx`, `src/utils/volume.service.ts`, personal setting `master-volume` |
| Game day, moon phase, tasks | both, editing by the GM | popover tab "☾" | `src/components/settings/time-manager/`, `src/owlbear/owlbear-time.ts` |
| Puzzles (T9, cube device) | players solve, GM edits | tabs "⚄" (view) and "⚄⚙" (GM only) | `src/components/puzzle/`, `src/components/abstract/abstract-puzzle/`, `src/owlbear/owlbear-puzzle.ts` |
| Remote debug logging to the GM | opt-in global setting `debug-trace` | broadcast | `src/owlbear/owlbear-log.ts`, `src/utils/logging/` |

## Roles
- **GM:** edit mode for characters and time, global settings, backups, puzzle editor tab, token-link context menu.
- **Player:** views and uses their characters' resources, sound board, time view, solves puzzles.
- All role checks are UI-only (see core/03 §Roles and trust).

## Scripts
| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server (load `http://localhost:5173/manifest.dev.json` in Owlbear) |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | ESLint |
| `npm run version-update` | Patch bump in package.json + both manifests (`version-update.js`) |
| `npm run deploy` | `predeploy` (version-update + build), then `gh-pages -d dist` |

There are no tests yet.
