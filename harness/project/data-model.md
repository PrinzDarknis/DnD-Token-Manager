# Data Model

Namespace constant: `PROJEKT_IDENTIFIER` in `src/owlbear/constants.ts`. All keys below are built from it. Refer to them by constant name.

## Room metadata
| Key (constant) | Shape (type) | Written by | Notes |
| --- | --- | --- | --- |
| `METADATA_CHARACTER(id)` → `<ns>/character/<id>` | `ICharacter` (`src/model/character/character.interface.ts`), via `Character.toSimpleObject()` / `Character.restore()` | anyone editing a character, debounced (`OwlbearCharacter.save`) | **One key per character.** Found by prefix (`METADATA_CHARACTER("")`). Last write wins by `lastUpdate`. |
| `METADATA_SETTINGS` | `GlobalSettings` (`src/model/settings/global-settings.interface.ts`) | GM | Includes the `plugin-bubbles` toggle and `debug-trace`. |
| `METADATA_TIME` | `TimeInfo` (`gameDay`, `tasks`) | GM | Read with defaults in `OwlbearTime.extractTimeInfo`. |
| `METADATA_PUZZLE_CURRENT` | current `PuzzleInfo` incl. master connection id | GM / puzzle master | Master/slave pattern, see broadcast. |
| `METADATA_PUZZLE_LIST` | `PuzzleInfo[]` | GM | **Single growing array.** Size risk, see known issues. |
| `<ns>/characters` (legacy, v0.1.0) | `ICharacter[]` | none (migration source) | Migrated by `src/owlbear/version/0.1.0/`; cleanup still TODO. |

## Item metadata
| Key (constant) | Shape | Notes |
| --- | --- | --- |
| `METADATA_CHARACTER_TOKEN` | `string` character id | Links a CHARACTER-layer token to a character. Set via the context-menu embed. |
| `com.owlbear-rodeo-bubbles-extension/metadata` (foreign, `METADATA_TAG` in the adapter) | Stat Bubbles object (`"armor class"`, `health`, `"max health"`, `"temporary health"`) plus our `METADATA_SYNC` timestamp inside it | Written by the adapter when `plugin-bubbles` is on. |

## Broadcast channels
| Channel (constant) | Payload | Destination | Listener (context) |
| --- | --- | --- | --- |
| `` `${BROADCAST}/sound` `` | `SoundMessage { name, index? }` (`src/model/misc/sound-message.*`); sender picks the variant `index` (missing → first file) | ALL | background (`OwlbearSettings.setupMessageListener`): `parseSoundMessage`, looks up `name` in the sound catalog (allowlist), plays `${DIR_SOUND}/<file[index]>` with master × sound volume. Unknown name/index → ignored. Sound names must be unique. |
| `BROADCAST_PUZZLE_ACTION` | puzzle action, addressed to the master connection id | ALL | popover (puzzle view of the master) |
| `BROADCAST_PUZZLE_UPDATE` | `PuzzleInfo` state | ALL | popover (puzzle views). Takeover after 5 s without an update. |
| `` `${BROADCAST}/log` `` | log entry | REMOTE | GM clients, only when `debug-trace` is on |

## Context menu ids
| Id (constant) | Purpose |
| --- | --- |
| `METADATA_CHARACTER_TOKEN_ACTION` | "Set Current Character" (GM only, CHARACTER layer, embed) |

## localStorage
| Key | Content | Deletion path |
| --- | --- | --- |
| `` `${STORAGE_KEY_BACKUPS}/${OBR.room.id}` `` | `Backup[]` per room | via the backup UI in settings |
| `"PersonalSettings"` (`PersonalSettingsController.StorageKey`) | `PersonalSettings` (`master-volume`: 0–1, default 1), parsed with `parsePersonalSettings` | none in the UI. Not namespaced (deviation). Read by the popover (slider) and by the background on every sound. |

## Migrations
| Version | What changes | Status |
| --- | --- | --- |
| 0.1.0 | array key `<ns>/characters` → one key per character | runs on every `OBR.onReady` in every iframe; deleting the old key is commented out (`// TODO fix`) |

## Foreign extensions (adapters)
| Extension | Foreign key | Read / write | Toggle |
| --- | --- | --- | --- |
| Stat Bubbles for D&D | `com.owlbear-rodeo-bubbles-extension/metadata` (item metadata) | both: `charUpdateBubbles` (character → token), `bubblesUpdateChar` (token → character) | global setting `plugin-bubbles` |

Loop guard for token → character: only the client with `item.lastModifiedUserId === OBR.player.id` processes the change (`OwlbearCharacter.onTokenUpdate`).
