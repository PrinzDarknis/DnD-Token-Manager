# Status

Snapshot of the current state. **Overwrite** this file after each step; never append history.

- **Current step:** 2. Per-sound volume (implemented, awaiting live check together with step 1)
- **Done last:** `Sound.volume?` added; `utils/volume.service.ts` (`DEFAULT_VOLUME`, `clampVolume`, `effectiveVolume`); `main-background.tsx` imports the `Sounds` catalog directly (no React in the background bundle, checked) and passes it via `Owlbear.setupBackground` → `settings.setupMessageListener`; `listenSound` ignores files not in the catalog and sets `audio.volume`. Lint and build green.
- **Next action:** after the user's go-ahead, step 3 (personal setting `master-volume`, `personal-settings.parse.ts`, controller `load` copy + `save` try/catch)
- **Open questions:** live check of steps 1–2 still open (autoplay; sound with a temporary `volume` in `sound-board.constant.ts` plays quieter)
- **Blockers:** none
