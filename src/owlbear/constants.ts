export const PROJEKT_IDENTIFIER = "de.prinzdarknis.dnd-token-manager";

export const METADATA_CHARACTER = (id: string) =>
  `${PROJEKT_IDENTIFIER}/character/${id}`;
export const DEV_MODE = import.meta.env.DEV ?? false;

export const METADATA_CHARACTER_TOKEN = `${PROJEKT_IDENTIFIER}/character-token`;
export const METADATA_CHARACTER_TOKEN_ACTION = `${PROJEKT_IDENTIFIER}/character-token-action`;

export const METADATA_SYNC = `${PROJEKT_IDENTIFIER}/sync`;
export const METADATA_SETTINGS = `${PROJEKT_IDENTIFIER}/settings`;
export const METADATA_TIME = `${PROJEKT_IDENTIFIER}/time`;
export const METADATA_PUZZLE_CURRENT = `${PROJEKT_IDENTIFIER}/puzzle/current`;
export const METADATA_PUZZLE_LIST = `${PROJEKT_IDENTIFIER}/puzzle/list`;

export const BROADCAST = `${PROJEKT_IDENTIFIER}/broadcast`;
export const BROADCAST_PUZZLE = `${PROJEKT_IDENTIFIER}/broadcast/puzzle`;
export const BROADCAST_PUZZLE_ACTION = `${BROADCAST_PUZZLE}/action`;
export const BROADCAST_PUZZLE_UPDATE = `${BROADCAST_PUZZLE}/update`;

export const HTML_PRODUCTION_PREFIX = "/DnD-Token-Manager";

export const DIR_SOUND = `${DEV_MODE ? "" : HTML_PRODUCTION_PREFIX}/sounds`;

export const STORAGE_KEY_BACKUPS = "dnd-token-manager/backup";
