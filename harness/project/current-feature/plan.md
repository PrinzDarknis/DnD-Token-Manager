# Feature: Sound board volume

Branch: `Sounds-Volume` (existing, not `feature/<slug>`) · Rules: `harness/core/07-workflow.md` §Feature lifecycle

## Context
The sound board broadcasts a file name on `${BROADCAST}/sound` (destination `ALL`); every client's **background** iframe plays it via `new Audio()` at full volume (`src/owlbear/owlbear-settings.ts` `listenSound`). Problems: no way for a player to turn sounds down, the sound files have unequal loudness, and the manifests lack the `autoplay` permission so browsers may block playback in the background iframe (known issue #14). This feature adds a per-player master volume (slider in the Sound Board), a code-only per-sound `volume` (default 1) for loudness normalization, and the autoplay permission. Effective volume = `clamp(master × sound.volume, 0, 1)`.

User decisions: slider sits **inside the Sound Board fieldset** above the buttons; no Web Audio gain; master volume 0–1, per-sound volume may be > 1, only the product is limited to 0–1.

## Scope
- In: master volume (localStorage, per player/browser), slider UI, `Sound.volume`, autoplay permission in both manifests, allowlist validation of the received sound file (needed for the volume lookup; fixes the sound half of known issue #5), try/catch around the personal-settings write (part of #16).
- Out: UI for per-sound volume, Web Audio gain (real amplification beyond the file level), refactor of `SoundBoard` to a function component (legacy class style stays, deviations.md), backup storage try/catch (rest of #16).

## Structure (files touched / created)
```
public/
  manifest.json, manifest.dev.json      + permissions: [{ name: "autoplay", reason }]
src/
  main-background.tsx                   passes the Sounds catalog into the background setup
  model/misc/sound.interface.ts         + volume?: number (doc: default 1, range 0–1)
  model/settings/
    personal-settings.interface.ts      + "master-volume": number
    personal-settings.default.ts        "master-volume": 1
    personal-settings.parse.ts   (new)  parsePersonalSettings(value: unknown) → merged with defaults, clamped
    personal-settings-controller.ts     load() uses parser + returns a copy; save() in try/catch
    index.ts                            export parser
  utils/volume.service.ts        (new)  clampVolume(value, fallback), effectiveVolume(master, soundVolume)
  utils/index.ts                        export it
  owlbear/owlbear.ts / index.ts         setupBackground(sounds: Sound[]) forwards the catalog
  owlbear/owlbear-settings.ts           setupMessageListener(sounds); listenSound: lookup + volume + autoplay-safe play
  components/sound/sound-board/
    sound-board.constant.ts             entries may set `volume` (all default → no value or 1)
    sound-board.component.tsx           state masterVolume, range slider, saves personal setting
    sound-board.css                     .sound-board__volume styles (theme variables)
```

## Decisions
| Topic | Decision |
| --- | --- |
| Master volume storage | `localStorage` via `PersonalSettingsController` (core 02 §4: personal → localStorage). Key `"master-volume"` (kebab-case like global settings). Existing un-namespaced key `"PersonalSettings"` kept (deviation), no migration needed – only a field is added, old data gets the default. |
| Reading in background | Background reads `PersonalSettingsController.load()` **on every play** (same origin as the popover → no sync channel needed). In private windows the storage is unavailable → default 1. |
| Per-sound volume | `volume?: number` optional on `Sound`, default `1`, may be > 1 (user decision). Only set in `sound-board.constant.ts`. |
| Sound broadcast payload | Changed (user decision) from the file name to `SoundMessage { name, index? }` (`src/model/misc/sound-message.*`), parsed with `parseSoundMessage`. The sender picks the random variant (`index`), so all players hear the same file; missing `index` → first file (0). Receiver looks up `name` in the catalog and takes `file[index]`; unknown name or index → ignore + `Log.warn`. Catalog is **injected** from `main-background.tsx` so `src/owlbear` does not import `src/components`. Old and new clients do not understand each other (both ignore the other format) – fine, because everyone loads the same hosted version. Sound names must stay unique. |
| Volume math | `audio.volume = clampVolume(master × (sound.volume ?? 1))`: only the product is limited to 0–1 (`HTMLAudioElement.volume` rejects values > 1). Master is validated to 0–1 when loaded; sound volume is a trusted code constant. A sound volume > 1 raises quiet sounds as far as the master leaves headroom (at master 1 it plays as with 1). Non-finite product → 1. |
| Autoplay | Add `{ "name": "autoplay", "reason": "Play sound board effects for all players" }` to both manifests. Remove the `muted = true/false` hack; wrap `play()` in try/catch and log `NotAllowedError` as warning instead of an unhandled rejection. |
| Slider | `<input type="range" min=0 max=1 step=0.05>` + percentage label, controlled from component state; write on change (localStorage is synchronous and cheap, no debounce needed). Class-component style kept (legacy file). |
| Mutation bug | `updatePersonalSettings` mutates the object returned by `load()`, which can be `DefaultPersonalSettings` itself → `load()` returns a fresh copy. |

## Steps
- [ ] 1. Autoplay: permission in both manifests; `listenSound` uses try/catch around `play()`, removes muted hack. Close known issue #14 (after live check).
- [ ] 2. Per-sound volume: `Sound.volume?`, `utils/volume.service.ts`, catalog injection (`main-background.tsx` → `Owlbear.setupBackground` → `settings.setupMessageListener`), lookup + allowlist check in `listenSound`, `audio.volume = effectiveVolume(1, sound.volume)`.
- [ ] 3. Master volume setting: interface/default, `personal-settings.parse.ts`, controller `load` (parse + copy) and `save` (try/catch).
- [ ] 4. Apply master volume in `listenSound` (`effectiveVolume(master, sound.volume)`).
- [ ] 5. Slider in `SoundBoard` (state init from `PersonalSettingsController.load()`, save merged settings on change) + CSS.
- [ ] 6. Docs: `data-model.md` (localStorage `master-volume`, sound broadcast now validated against catalog), `known-issues.md` (remove #14, narrow #5 and #16), `entries-and-deploy.md` (manifest permission), `overview.md` (feature).
- [ ] Finish: lint/build green, live test confirmed, `current-feature/` emptied, merge after asking.

## Verification
- `npm run lint` and `npm run build` clean after each step.
- If Vitest is set up: unit tests for `clampVolume`/`effectiveVolume` and `parsePersonalSettings` (invalid JSON shapes, NaN, out-of-range, missing key → 1).
- Live test checklist for the user (dev manifest re-added so the new permission is picked up):
  1. GM + player (second browser profile) in one room; player clicks a sound → both hear it, background console free of `NotAllowedError`.
  2. Player sets slider to 20 % → sounds are quieter only for that player; GM unchanged.
  3. Reload popover / room → slider value persists.
  4. Slider 0 → silent; 100 % → as before.
  5. Temporarily set `volume: 0.3` on one sound in code → noticeably quieter, and combined with master 50 % → ~15 %.
  6. Private window: plugin works, slider defaults to 100 %, no console errors.
