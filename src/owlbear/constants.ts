export const PROJEKT_IDENTIFIER = "de.prinzdarknis.dnd-token-manager";

export const METADATA_CHARACTER = (id: string) =>
  `${PROJEKT_IDENTIFIER}/character/${id}`;
export const DEV_MODE = import.meta.env.DEV ?? false;

export const METADATA_CHARACTER_TOKEN = `${PROJEKT_IDENTIFIER}/character-token`;
export const METADATA_CHARACTER_TOKEN_ACTION = `${PROJEKT_IDENTIFIER}/character-token-action`;

export const METADATA_SYNC = `${PROJEKT_IDENTIFIER}/sync`;
export const METADATA_SETTINGS = `${PROJEKT_IDENTIFIER}/settings`;

export const METADATA_BROADCAST = `${PROJEKT_IDENTIFIER}/broadcast`;

export const HTML_PRODUCTION_PREFIX = "/DnD-Token-Manager";

export const DIR_SOUND = `${DEV_MODE ? "" : HTML_PRODUCTION_PREFIX}/sounds`;
