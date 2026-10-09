# Entries and Deployment

## Iframe contexts
| Context | HTML | TS entry | Registered via |
| --- | --- | --- | --- |
| Action popover | `html/index.html` | `src/main-character.tsx` (TabManager with tabs) | `manifest.action.popover` (`/html/`, 400×600) |
| Background | `html/background.html` | `src/main-background.tsx` (calls `Owlbear.setupBackground(Sounds)`; imports the sound catalog directly from `sound-board.constant.ts` so React stays out of the background bundle) | `manifest.background_url` |
| Context-menu embed | `html/context-menu/token-set-character.html` | `src/context-menu-token-set-character.tsx` | `OBR.contextMenu.create({ embed })` in `src/owlbear/owlbear-character.ts` |

All three are registered in `vite.config.ts` → `build.rollupOptions.input`.

## Manifest permissions
| Permission | Reason | Needed by |
| --- | --- | --- |
| `autoplay` | Play sound board effects for all players | background playback after a broadcast (no user gesture there) |

Both manifests must list the same permissions. After changing them, re-add the extension in Owlbear.

## Hosting
- Host: **GitHub Pages**, `gh-pages` branch, published with `gh-pages -d dist`.
- Production base path: `HTML_PRODUCTION_PREFIX` in `src/owlbear/constants.ts`. It must match every path in `public/manifest.json`.
- Dev manifest: `public/manifest.dev.json`, no prefix. Use `http://localhost:5173/manifest.dev.json`.
- Asset URLs handed to Owlbear (context-menu icon and embed, sounds) switch on `import.meta.env.DEV` between `""` and `HTML_PRODUCTION_PREFIX`. `DIR_SOUND` is in `constants.ts`.

## Release specifics
- `predeploy` already runs `version-update`, so **do not bump separately** before `npm run deploy`.
- `version-update.js` is called with a Windows path (`node .\\version-update.js`) and only bumps the patch version. The cross-platform template is `harness/templates/config/version-update.mjs`.
- Version bumps have historically been committed together with features or as "update Version". New releases follow core: `chore(release): vX.Y.Z`.
- There is no CI. Deploys are run manually from a local machine.
