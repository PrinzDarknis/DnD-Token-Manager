# Deviations from harness/core

Only what is listed here overrides `harness/core`. This project predates the harness, so most entries are **legacy**: keep them when making small changes in existing files, and use core rules for new modules.

| Rule in core | Deviation in this project | Scope | Reason | New code |
| --- | --- | --- | --- | --- |
| Function components + hooks (04) | **Class components** (`extends Component<Props, State>`) with a `setStatePromise` helper and getter/`async setX()` pairs. Template: `src/~presets/component/`. | all of `src/components/` except small UI pieces (`ImgButton`) | historical | Changes inside an existing class component stay in class style. **New components are function components** using hooks in `src/hooks/` (to be created from `harness/templates/hooks/`). |
| SDK facade in `src/obr/` with `api` object (02) | Facade is **`src/owlbear/`**: `Owlbear` singleton (`src/owlbear/index.ts`) with services `character`, `settings`, `puzzle`, `time`, `player`, `log` (`owlbear-<domain>.ts`). | whole project | historical | Add new services as `src/owlbear/owlbear-<domain>.ts` and register them in `src/owlbear/owlbear.ts`. Do not create a parallel `src/obr/`. Still follow the core rules (await `ready`, return unsubscribe, validate). |
| Namespace constant `PLUGIN_ID` (03) | `PROJEKT_IDENTIFIER` | `src/owlbear/constants.ts` | historical, public export | Keep the name. Never change its value (that would orphan all stored data). |
| Adapters in `src/obr/adapters/` (02) | `src/owlbear/plugin-adapter/<extension>/`, one function per `*.service.ts` | Stat Bubbles adapter | historical | Same location for new adapters. |
| Migrations in `src/obr/migrations/`, GM-only (02) | `src/owlbear/version/<semver>/`, run by every client on ready | 0.1.0 migration | historical | New migrations: same folder, but make them GM-only and idempotent as core says. |
| No `I` prefix (04) | `ICharacter`, `IRessource` in older models; newer ones without a prefix | `src/model/character/` | historical | No prefix for new types. Don't rename existing ones in passing. |
| English identifiers spelled correctly (04) | Misspelled public names: `Ressource`, `PROJEKT_IDENTIFIER`, `valideIds`, `Standart`, `versionUpdata`, `Cancle` … | various | historical | Don't spread them into new code, except when referencing the existing symbol. Rename only in a dedicated refactor, never casually. |
| Model files `*.types.ts` / `*.parse.ts` (04) | `*.interface.ts`, `*.class.ts`, `*.type.ts`, `*.default.ts`; parsing inside the `Character` class (`setValue`, `restore`) | `src/model/` | historical | Follow the existing suffixes inside `src/model/`. New parsers may live in `*.parse.ts`. |
| localStorage keys namespaced (05) | `"PersonalSettings"` without namespace; backups use `STORAGE_KEY_BACKUPS` (not `PROJEKT_IDENTIFIER`) | settings | historical | New keys must be namespaced. Changing the existing keys needs a migration. |
| Commit style `type(scope): summary` (04) | History is informal ("add …", "fix (scope): …") | git | historical | New commits follow core. |
| `version-update.mjs` cross-platform (06) | `version-update.js` invoked with a Windows path | `package.json` scripts | historical | May be replaced by the template in a dedicated change. |
