import { CLASSIC_ORBS } from "./classic-orbs.js?v=20260812-classic-health-reactor-batman-fairy-zeus-frost-snowball1";

export const THEME_IDS = Object.freeze([
  "cream-foundry",
  "botanical-conservatory",
  "frost-laboratory",
  "arcane-library",
  "solar-workshop",
]);

export const ARENA_THEMES = Object.freeze({
  "cream-foundry": Object.freeze({
    id: "cream-foundry",
    name: "Cream Foundry",
    shortName: "Foundry",
    page: "#f4ecdc",
    pageAlt: "#ece0ca",
    surface: "#fffaf0",
    surfaceAlt: "#f5ead8",
    text: "#2c2924",
    muted: "#756c60",
    line: "#cbbda8",
    accent: "#c86632",
    floor: "#eee2cd",
    grid: "#d8c9b2",
    gridStrong: "#cbb79a",
    wall: "#8a7359",
    wallInner: "#f7efdf",
    corner: "#bf6d38",
    ice: "#8bbbc7",
    speed: "#6ba989",
    bumper: "#9a7548",
    portal: "#8c6c9c",
    decor: "gears",
  }),
  "botanical-conservatory": Object.freeze({
    id: "botanical-conservatory",
    name: "Botanical Conservatory",
    shortName: "Garden",
    page: "#edf0dc",
    pageAlt: "#dfe7cf",
    surface: "#fbf9ec",
    surfaceAlt: "#e8edd8",
    text: "#263126",
    muted: "#65705e",
    line: "#b8c2a5",
    accent: "#68854f",
    floor: "#e6ebd8",
    grid: "#cbd5bd",
    gridStrong: "#afc09d",
    wall: "#6c8165",
    wallInner: "#f3f2df",
    corner: "#8b6f43",
    ice: "#91bfc2",
    speed: "#4e9b68",
    bumper: "#8d744e",
    portal: "#817196",
    decor: "leaves",
  }),
  "frost-laboratory": Object.freeze({
    id: "frost-laboratory",
    name: "Frost Laboratory",
    shortName: "Frost",
    page: "#e9f1f1",
    pageAlt: "#d9e7e9",
    surface: "#f8fbf8",
    surfaceAlt: "#e1ecec",
    text: "#243034",
    muted: "#607278",
    line: "#afc3c7",
    accent: "#4d91a0",
    floor: "#dfeaec",
    grid: "#bfd2d6",
    gridStrong: "#9ebbc1",
    wall: "#69848b",
    wallInner: "#f4faf8",
    corner: "#599aaa",
    ice: "#53a9bc",
    speed: "#67a893",
    bumper: "#708c96",
    portal: "#7477a6",
    decor: "crystals",
  }),
  "arcane-library": Object.freeze({
    id: "arcane-library",
    name: "Arcane Library",
    shortName: "Library",
    page: "#eee7ec",
    pageAlt: "#ded2df",
    surface: "#faf5ed",
    surfaceAlt: "#ebe0e8",
    text: "#302832",
    muted: "#756676",
    line: "#c5b3c4",
    accent: "#785a86",
    floor: "#e7dce5",
    grid: "#cdbdce",
    gridStrong: "#b39eb6",
    wall: "#735f75",
    wallInner: "#f7efe9",
    corner: "#8b5d86",
    ice: "#7faebd",
    speed: "#73977c",
    bumper: "#8d704f",
    portal: "#76518a",
    decor: "runes",
  }),
  "solar-workshop": Object.freeze({
    id: "solar-workshop",
    name: "Solar Workshop",
    shortName: "Solar",
    page: "#f3ead3",
    pageAlt: "#e8d7b7",
    surface: "#fff8e8",
    surfaceAlt: "#f1e1c2",
    text: "#352a20",
    muted: "#796957",
    line: "#cfb98e",
    accent: "#bd722c",
    floor: "#eadcbc",
    grid: "#d6c293",
    gridStrong: "#bea86f",
    wall: "#8e7047",
    wallInner: "#fbf0d7",
    corner: "#ce7c2f",
    ice: "#7daebb",
    speed: "#829c58",
    bumper: "#a26e32",
    portal: "#86648d",
    decor: "sundials",
  }),
});

const CLASSIC_PROFILE_EPITHETS = Object.freeze({
  sword: "Damage-Ramping Duelist",
  bow: "Volley-Ramping Archer",
  potion: "Buff-Brewing Battler",
  axe: "Critical-Chance Cleaver",
  dagger: "Spin-Speed Assassin",
  katana: "Delayed-Slice Striker",
  duplicator: "Crowned Lineage Core",
  orbital: "Satellite Swarm",
  unarmed: "Momentum Brawler",
  grower: "Expanding Bruiser",
  slammy: "Impact Specialist",
});

const CLASSIC_ARCHETYPE_COPY = Object.freeze({
  gun: Object.freeze({ epithet: "Precision Ordnance Specialist", strength: "Reliable ranged pressure", weakness: "Reload windows expose its approach" }),
  "wall-hazard": Object.freeze({ epithet: "Arena-Control Engineer", strength: "Permanently reshapes safe routes", weakness: "Needs wall contacts to build control" }),
  summon: Object.freeze({ epithet: "Foundry Summoner", strength: "Adds independent bodies to the fight", weakness: "Summons can be cleared before they connect" }),
  boxer: Object.freeze({ epithet: "Tracking-Fist Bruiser", strength: "Tracks targets at close range", weakness: "Must stay close enough to punch" }),
  beam: Object.freeze({ epithet: "Sustained-Beam Controller", strength: "Applies visible sustained pressure", weakness: "The beam has a readable active window" }),
  "contact-dot": Object.freeze({ epithet: "Contact-Damage Specialist", strength: "Turns contact into lingering damage", weakness: "Must first earn a clean collision" }),
});

function classicProfileCopy(def) {
  const archetype = CLASSIC_ARCHETYPE_COPY[def.classicAbility?.kind] || Object.freeze({
    epithet: `${def.statLabel.replace(/[^A-Z0-9 ]/g, "")} Specialist`,
    strength: "A signature mechanic with readable timing",
    weakness: "Its strongest window can be anticipated",
  });
  return {
    epithet: CLASSIC_PROFILE_EPITHETS[def.id] || archetype.epithet,
    backstory: `${def.name} enters the Classic foundry with one unmistakable promise: ${def.power.toLowerCase()}. That rule shapes every route it takes and every collision it risks. Its ${def.statLabel.toLowerCase()} readout exposes the plan in real time, so opponents always know whether momentum is building. The bright shell, heavy black outline, and compact silhouette keep the action legible through rebounds, summons, and projectiles. There are no hidden rolls outside the seeded simulation. Winning means creating the right angle, protecting the mechanic's setup, and converting its visible advantage before the rival establishes a stronger rhythm.`,
    strengths: [def.power, archetype.strength, `Readable ${def.statLabel.toLowerCase()} progression`],
    weaknesses: [archetype.weakness, "Starts at one base damage", "Positioning still determines conversion"],
  };
}

const ORB_PROFILES_MUTABLE = Object.fromEntries(
  Object.entries(CLASSIC_ORBS).map(([type, def]) => [type, profile({
    title: def.name,
    epithet: classicProfileCopy(def).epithet,
    ability: def.power,
    backstory: classicProfileCopy(def).backstory,
    strengths: classicProfileCopy(def).strengths,
    weaknesses: classicProfileCopy(def).weaknesses,
    modes: { duel: 5, small: 3, large: 2, tournament: 4 },
  })]),
);

export const ORB_PROFILES = Object.freeze(ORB_PROFILES_MUTABLE);
export const WEAPON_ORB_ROSTER = Object.freeze(["sword"]);
export const ORB_ROSTER = Object.freeze(Object.keys(ORB_PROFILES_MUTABLE));
export const ORB_SPRITE_PROFILES = Object.freeze(Object.fromEntries(
  WEAPON_ORB_ROSTER.map((type) => [type, Object.freeze({
    src: `./assets/generated/classic-weapon-rework/final/${type}.png`,
  })]),
));

export function themeById(id) {
  return ARENA_THEMES[id] || ARENA_THEMES["cream-foundry"];
}

export function validateProfileMetadata(profiles = ORB_PROFILES) {
  return Object.entries(profiles).every(([type, entry]) => (
    Boolean(type) &&
    typeof entry.title === "string" &&
    typeof entry.epithet === "string" &&
    typeof entry.ability === "string" &&
    wordCount(entry.backstory) >= 70 &&
    wordCount(entry.backstory) <= 120 &&
    entry.strengths.length >= 2 &&
    entry.weaknesses.length >= 2 &&
    ["duel", "small", "large", "tournament"].every((mode) => (
      Number.isInteger(entry.modes[mode]) && entry.modes[mode] >= 1 && entry.modes[mode] <= 5
    ))
  ));
}

function profile(entry) {
  return Object.freeze({
    ...entry,
    strengths: Object.freeze(entry.strengths),
    weaknesses: Object.freeze(entry.weaknesses),
    modes: Object.freeze(entry.modes),
  });
}

function wordCount(value) {
  return String(value).trim().split(/\s+/).filter(Boolean).length;
}
