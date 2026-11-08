import raw from "../../data/characters.json";
import { isShapeId, type ShapeId } from "./barrier";

export type Character = {
  id: string;
  name: string;
  mode: "orb-race" | "classic";
  family: "math" | "contact" | "special" | "classic";
  color: string;
  accent: string;
  symbol?: string;
  statLabel?: string;
  formula: string;
  images: {
    animated: string;
    stick: string;
    portrait?: string;
  };
  duplicateEvery?: number;
  imageLettering?: string;
};

type CatalogFile = {
  description: string;
  modes: {
    "orb-race": string;
    classic: string;
  };
  characters: Character[];
};

const catalog = raw as CatalogFile;

export const characters = catalog.characters;
export const modeCopy = catalog.modes;

export function characterById(id: string): Character | undefined {
  return characters.find((character) => character.id === id);
}

export function shapeCharacter(id: ShapeId): Character {
  const character = characterById(id);
  if (!character || !isShapeId(character.id)) {
    throw new Error(`Missing shape ${id}`);
  }
  return character;
}

export function assetPath(relativePath: string): string {
  return `/showcase/${relativePath}`;
}

export const FAMILIES = [
  { id: "all", label: "All" },
  { id: "math", label: "Math" },
  { id: "contact", label: "Contact" },
  { id: "special", label: "Special" },
  { id: "classic", label: "Classic" },
] as const;

export const CHANNEL_URL = "https://www.youtube.com/@OrbBattlegroundSimulator";
