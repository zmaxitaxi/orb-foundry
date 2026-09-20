export const CLASSIC_MODE = "classic";

const weapon = (
    length,
    width,
    angularSpeed,
    hitCooldown,
    damage = 0,
    geometry = {},
) => Object.freeze({
    length,
    width,
    damage,
    angularSpeed,
    hitCooldown,
    orbitRadiusOffset: geometry.orbitRadiusOffset ?? 0,
    hitboxStartOffset: geometry.hitboxStartOffset ?? 1,
    collisionReachScale: geometry.collisionReachScale ?? 1,
    collisionWidthScale: geometry.collisionWidthScale ?? 1,
    collisionAngleOffset: geometry.collisionAngleOffset ?? 0,
    collisionCentered: geometry.collisionCentered === true,
    renderScale: geometry.renderScale ?? 1,
    spriteAngleOffset: geometry.spriteAngleOffset ?? 0,
});

const collision = (damage = 0, hitCooldown = 0.42) => Object.freeze({
    damage,
    hitCooldown,
});

const orb = (id, name, color, accent, {
    power = "DETERMINISTIC ABILITY",
    statLabel = "ABILITY",
    collisionDamage = 0,
    collisionEnabled = false,
    ability = {},
    orbWeapon = weapon(0, 0, 0, 999, 0),
} = {}) => Object.freeze({
    id,
    name,
    color,
    accent,
    ability: name,
    power,
    statLabel,
    weapon: orbWeapon,
    collision: collision(collisionDamage),
    defaultCollisionDamage: collisionEnabled,
    classicAbility: Object.freeze({ ...ability }),
});

// Stable Classic IDs. Race implementations with the same display name remain
// independent; Classic consumes only the deterministic metadata below.
export const CLASSIC_ORBS = Object.freeze({
    sword: orb("sword", "SWORD", "#d8c9a7", "#fff7df", {
        power: "SWING 5 · EXTENDED POKE 3",
        statLabel: "DAMAGE",
        ability: {
            kind: "sword",
            interval: 1.8,
            swingDamage: 5,
            pokeDamage: 3,
            attackRange: 4.4,
        },
        orbWeapon: weapon(56, 12, 2.25, 0.46, 5, {
            orbitRadiusOffset: -5,
            hitboxStartOffset: -5,
            collisionReachScale: 1.35,
            collisionWidthScale: 0.72,
            renderScale: 1.24,
            spriteAngleOffset: Math.PI * 0.75,
        }),
    }),
    duplicator: orb("duplicator", "DUPLICATOR", "#f13bc1", "#ffd8f6", {
        power: "DUPLICATES EVERY 10 WALL BOUNCES",
        statLabel: "DUPLICATES",
        collisionEnabled: true,
    }),
    orbital: orb("orbital", "ORBITAL", "#123b72", "#7aa9e6", {
        power: "+1 ORBITER PER WALL BOUNCE · ORBITERS BREAK ON HIT",
        statLabel: "ORBS",
    }),
    unarmed: orb("unarmed", "UNARMED", "#9da3aa", "#f4f6f8", {
        power: "+1 DAMAGE PER WALL BOUNCE",
        statLabel: "DAMAGE",
        collisionDamage: 1,
        collisionEnabled: true,
    }),
    slammy: orb("slammy", "SLAMMY", "#ff8a24", "#ffe1c2", {
        power: "+1 DAMAGE PER WALL BOUNCE",
        statLabel: "DAMAGE",
        collisionDamage: 1,
        collisionEnabled: true,
    }),
    vampire: orb("vampire", "VAMPIRE", "#7d1538", "#ffffff", {
        power: "DIRECTIONAL TEETH LATCH · 3 HP/SEC FOR 5S",
        statLabel: "LATCH",
        ability: {
            kind: "vampire",
            duration: 5,
            dps: 3,
            heal: 3,
            tickInterval: 1,
            teethLength: 1.55,
            latchGap: 0,
        },
    }),
    turret: orb("turret", "TURRET", "#ff7900", "#ffd3a8", {
        power: "SPAWNS ONE PERMANENT PHYSICAL TURRET · 3 DAMAGE/BALL · EVERY 4 SECONDS",
        statLabel: "TURRETS",
        ability: {
            kind: "turret",
            interval: 1,
            spawnInterval: 4,
            damage: 3,
            projectileSpeed: 330,
        },
    }),
    flash: orb("flash", "FLASH", "#f6e21d", "#fffbd0", {
        power: "PERIODIC SPEED BURST",
        statLabel: "BURSTS",
        collisionEnabled: true,
        ability: { kind: "flash", interval: 5, duration: 0.5 },
    }),
    reactor: orb("reactor", "REACTOR", "#168cff", "#9de9ff", {
        power: "7 DAMAGE HALF-MAP CORE EXPLOSION",
        statLabel: "BLASTS",
        ability: { kind: "reactor", interval: 6, damage: 7, radiusScale: 0.25 },
    }),
    sniper: orb("sniper", "SNIPER", "#53606e", "#e6edf5", {
        power: "AIMED BOUNCING 8 DAMAGE SHOT",
        statLabel: "SHOTS",
        ability: { kind: "gun", interval: 3, damage: 8, projectileSpeed: 560, count: 1 },
    }),
    draftmaster: orb("draftmaster", "DRAFTMASTER", "#485f73", "#d5e8f8", {
        power: "GUNS 3–8 · PROXIMITY SWORD 5–8",
        statLabel: "ATTACKS",
        ability: { kind: "draftmaster", interval: 2.4, projectileSpeed: 470 },
    }),
    "blue-sun": orb("blue-sun", "BLUE SUN", "#0a59d6", "#8dc7ff", {
        power: "RANDOM 8 LASERS · 1 DAMAGE/0.5 SEC",
        statLabel: "LASERS",
        ability: { kind: "beam", interval: 4, duration: 2, dps: 2, tickInterval: 0.5, laserCount: 8 },
    }),
    "black-hole": orb("black-hole", "BLACK HOLE", "#19142a", "#be8cff", {
        power: "CENTER PULL · 25 TOTAL DAMAGE",
        statLabel: "PULLS",
        ability: { kind: "black-hole", interval: 12, duration: 5, damage: 25 },
    }),
    tripwire: orb("tripwire", "TRIPWIRE", "#f7f7f7", "#cfd6df", {
        power: "PERMANENT WALL WIRES · 1 DAMAGE/SEC",
        statLabel: "WIRES",
        ability: { kind: "wall-hazard", spawn: "bounce", hazard: "tripwire", dps: 1, tickInterval: 1, permanent: true },
    }),
    "hydrogen-bomb": orb("hydrogen-bomb", "HYDROGEN BOMB", "#d62323", "#ffe3a2", {
        power: "DETONATES AFTER 60 SECONDS",
        statLabel: "COUNTDOWN",
        ability: { kind: "hydrogen", duration: 60 },
    }),
    necromancer: orb("necromancer", "NECROMANCER", "#4b384f", "#d7d0da", {
        power: "SKULL LIFT · CHARGE · TWO 1 HP SOLDIERS · 3 DAMAGE/ARROW",
        statLabel: "SOLDIERS",
        // Necromancer is not a contact-damage fighter. Its living soldiers
        // are the damage source, while the orb body remains a normal body.
        collisionDamage: 0,
        collisionEnabled: false,
        ability: {
            kind: "summon",
            interval: 6,
            count: 2,
            minionHealth: 1,
            damage: 3,
            liftDuration: 0.35,
            chargeDuration: 0.65,
            summonDuration: 0.35,
        },
    }),
    poison: orb("poison", "POISON", "#8e36b8", "#eecfff", {
        power: "CONTACT POISON · 1 DAMAGE/SEC FOR 5S",
        statLabel: "POISON",
        ability: { kind: "contact-dot", duration: 5, dps: 1 },
    }),
    spikey: orb("spikey", "SPIKEY", "#bb2f3b", "#ffd5d9", {
        power: "PERMANENT 3 DAMAGE WALL SPIKES",
        statLabel: "SPIKES",
        ability: { kind: "wall-hazard", spawn: "bounce", hazard: "spike", damage: 3, permanent: true },
    }),
    snake: orb("snake", "SNAKE", "#319b48", "#9bf0a9", {
        power: "3 DAMAGE HEAD/TAIL · GROWS EVERY 3 BOUNCES",
        statLabel: "TAIL",
        collisionDamage: 3,
        collisionEnabled: true,
        ability: { kind: "snake", damage: 3 },
    }),
    virus: orb("virus", "VIRUS", "#39ff5a", "#d7ffdd", {
        power: "CONTACT VIRUS · STACKING 1→2→… DAMAGE/SEC · 5S WINDOWS",
        statLabel: "VIRUS",
        ability: { kind: "contact-dot", duration: 5, dps: 1, stacking: true },
    }),
    shrapnel: orb("shrapnel", "SHRAPNEL", "#7b858e", "#e5ebef", {
        power: "3 DAMAGE FRAGMENTS ON WALL HIT",
        statLabel: "FRAGMENTS",
        ability: { kind: "shrapnel", spawn: "bounce", damage: 3, count: 4 },
    }),
    cobwebs: orb("cobwebs", "COBWEBS", "#f4f4f1", "#bdc4c9", {
        power: "PERSISTENT ORB-TO-WALL CONNECTORS · 1 DAMAGE/SEC",
        statLabel: "WEBS",
        ability: { kind: "wall-hazard", spawn: "bounce", hazard: "cobweb", dps: 1, tickInterval: 1, permanent: true },
    }),
    apple: orb("apple", "APPLE", "#d8322e", "#75cc43", {
        power: "THROWS EVERY 2S · OWNER +3 HP · OPPONENT -5 HP",
        statLabel: "APPLES",
        ability: { kind: "apple", interval: 2 },
    }),
    absorber: orb("absorber", "ABSORBER", "#7050c8", "#ded4ff", {
        power: "ABSORBS A SEEDED OPPONENT ABILITY",
        statLabel: "ABSORBED",
        ability: { kind: "absorber", interval: 8 },
    }),
    batman: orb("batman", "BATMAN", "#f0d329", "#171717", {
        power: "BOUNCING BATARANGS",
        statLabel: "BATARANGS",
        ability: { kind: "gun", interval: 2.5, damage: 3, projectileSpeed: 430, count: 2 },
    }),
    "ying-yang": orb("ying-yang", "YING YANG", "#f4f4f4", "#111111", {
        power: "ALTERNATES DAMAGE AND SPEED EVERY 5S",
        statLabel: "PHASE",
        collisionDamage: 1,
        collisionEnabled: true,
        ability: { kind: "ying-yang", interval: 5 },
    }),
    // Stable ID retained for saved links/replays; the public name is Cowboy.
    trapper: orb("trapper", "COWBOY", "#9b5c2e", "#f0c190", {
        power: "THREE LASSOS · 4 DAMAGE/SEC",
        statLabel: "TRAPS",
        ability: { kind: "trapper", interval: 5, duration: 8, dps: 4, tickInterval: 1, count: 3 },
    }),
    "hive-ball": orb("hive-ball", "HIVE BALL", "#d9a91a", "#fff0a8", {
        power: "TRACKING BEES · -3 DAMAGE PER HIT",
        statLabel: "BEES",
        ability: { kind: "hive", interval: 3, damage: 3 },
    }),
    zeus: orb("zeus", "ZEUS", "#75c9ff", "#f1e3a0", {
        power: "RANDOM-ORIENTATION TRIANGLE LIGHTNING · 10 DAMAGE/SEC",
        statLabel: "STORMS",
        ability: {
            kind: "zeus",
            interval: 3,
            duration: 3,
            dps: 10,
            tickInterval: 1,
            radiusScale: 1.5,
            nodeRadiusScale: 1.7,
            randomNodes: true,
            formation: "triangle",
        },
    }),
    "glass-ball": orb("glass-ball", "GLASS BALL", "#bcecff", "#ffffff", {
        power: "LEAVES 3–5 WHITE GLASS SHARDS · 2 DAMAGE",
        statLabel: "SHARDS",
        ability: {
            kind: "wall-hazard",
            spawn: "bounce",
            hazard: "glass",
            damage: 2,
            permanent: true,
            shardCountMin: 3,
            shardCountMax: 5,
        },
    }),
    pistol: orb("pistol", "PISTOL", "#464a50", "#bfc4ca", {
        power: "TWO CONSECUTIVE PISTOL SHOTS · 5 DAMAGE",
        statLabel: "AMMO",
        ability: {
            kind: "gun",
            interval: 2,
            damage: 5,
            projectileSpeed: 500,
            count: 2,
            consecutiveShots: 2,
            consecutivePause: 0.1,
        },
    }),
    shotgun: orb("shotgun", "SHOTGUN", "#34383d", "#c5a56d", {
        power: "WIDE SHOTGUN SPREAD · 4 DAMAGE",
        statLabel: "SHELLS",
        ability: { kind: "gun", interval: 3, damage: 4, projectileSpeed: 430, count: 7, spread: 0.16 },
    }),
    rifle: orb("rifle", "RIFLE", "#596068", "#cdd2d6", {
        power: "FIVE RIFLE ROUNDS · TWO WALL RICOCHETS",
        statLabel: "AMMO",
        ability: { kind: "gun", interval: 2.6, damage: 5, projectileSpeed: 570, count: 5, maxWallBounces: 2 },
    }),
    sawball: orb("sawball", "SAWBALL", "#42a94f", "#dbffe0", {
        power: "TWIN ROTATING SAWS · 5 DAMAGE",
        statLabel: "SAWS",
        ability: { kind: "saw", damage: 5 },
    }),
    cutter: orb("cutter", "CUTTER", "#d62626", "#ffb6b6", {
        power: "8S RED AREAS · 2 DAMAGE/0.5 SEC IN RED ZONE",
        statLabel: "CUTS",
        ability: {
            kind: "cutter",
            spawn: "bounce",
            hazard: "cutter-zone",
            geometry: "wall-to-wall-half-plane",
            zoneBelow: true,
            zoneMode: "smallest-half-plane",
            zoneFill: "#9f123944",
            lineColor: "#ff2738",
            lineWidth: 2,
            // Cutter emits a whole -2 marker every half-second while the
            // target is in each active smallest-half-plane zone.
            dps: 4,
            tickInterval: 0.5,
            areaLifetime: 8,
            permanent: true,
        },
    }),
    trident: orb("trident", "TRIDENT", "#33cbd0", "#c9ffff", {
        power: "20 DAMAGE THROW · 3S WALL/ORB STICK",
        statLabel: "THROWS",
        ability: {
            kind: "gun",
            interval: 4,
            damage: 20,
            callbackDamage: 20,
            projectileSpeed: 420,
            count: 1,
            stickDuration: 3,
        },
    }),
    lazer: orb("lazer", "LAZER", "#ff325d", "#ffc1cf", {
        power: "WALL-TO-WALL LASER · 2 DAMAGE/SEC",
        statLabel: "LASERS",
        ability: {
            kind: "wall-hazard",
            spawn: "bounce",
            hazard: "laser",
            damage: 0,
            dps: 2,
            tickInterval: 1,
            lineWidth: 8,
            hitWidth: 8,
            lineColor: "#ff325d",
            permanent: true,
        },
    }),
    charger: orb("charger", "CHARGER", "#f18b20", "#ffe0ad", {
        power: "CHARGE / TELEPORT SLAM · 5 DAMAGE",
        statLabel: "CHARGES",
        ability: { kind: "charger", interval: 5, damage: 5, chargeDuration: 0.75, teleportDuration: 0.35 },
    }),
    parasites: orb("parasites", "PARASITES", "#778d3d", "#d6e8a6", {
        power: "STATIONARY PHYSICAL LATCH · 2 DAMAGE/SEC",
        statLabel: "LATCHES",
        ability: { kind: "parasite", interval: 4, dps: 2, tickInterval: 1 },
    }),
    grappler: orb("grappler", "GRAPPLER", "#78523c", "#e5c5ae", {
        power: "5 WEAPON + 5 COLLISION DAMAGE",
        statLabel: "HOOKS",
        collisionDamage: 5,
        collisionEnabled: true,
        ability: { kind: "gun", interval: 3, damage: 5, projectileSpeed: 500, count: 1 },
    }),
    train: orb("train", "TRAIN", "#3e4c58", "#d6a63f", {
        power: "TRAIN AFTER THREE WALL BOUNCES · 10 DAMAGE",
        statLabel: "TRACKS",
        ability: { kind: "train", damage: 10 },
    }),
    "frost-ball": orb("frost-ball", "SNOWBALL", "#eafcff", "#70d9ff", {
        power: "FADING FROST TRAIL · -3 ON ENTRY · FREEZES ORBS",
        statLabel: "FROST",
        ability: {
            kind: "frost",
            interval: 0.25,
            duration: 4,
            damage: 3,
            dps: 0,
            tickInterval: 0,
            fadeDelay: 3,
            fadeDuration: 1,
            slowFactor: 0.5,
            cooldownScale: 2,
            freeze: true,
        },
    }),
    jackpot: orb("jackpot", "JACKPOT", "#e0b51a", "#fff0a0", {
        power: "SEEDED SPIN · 100+ GUARANTEED BY SPIN 7",
        statLabel: "SPINS",
        collisionDamage: 1,
        collisionEnabled: true,
        ability: { kind: "jackpot", interval: 4 },
    }),
    boxer: orb("boxer", "BOXER", "#c83a32", "#ffd0ca", {
        power: "DIRECT SEEK · RETRACT / EXTEND / IMPACT / RECOVER",
        statLabel: "PUNCHES",
        ability: {
            kind: "boxer",
            interval: 1.5,
            damage: 5,
            phaseDurations: Object.freeze({ retract: 0.12, extend: 0.16, impact: 0.1, recover: 0.18 }),
        },
    }),
    artist: orb("artist", "ARTIST", "#e870ba", "#fff0fa", {
        power: "SUMMONS MONSTER, FAIRY, OR SOLDIER",
        statLabel: "PAINTINGS",
        ability: { kind: "artist", interval: 5 },
    }),
    monster: orb("monster", "MONSTER", "#397f4b", "#9fd3a9", {
        power: "MONSTER FISTS · 5 DAMAGE",
        statLabel: "PUNCHES",
        collisionDamage: 1,
        collisionEnabled: true,
        ability: {
            kind: "boxer",
            interval: 1.5,
            damage: 5,
            phaseDurations: Object.freeze({ retract: 0.12, extend: 0.16, impact: 0.1, recover: 0.18 }),
        },
    }),
    fairy: orb("fairy", "FAIRY", "#e594ff", "#fff0ff", {
        power: "TRACKING WAND MAGIC",
        statLabel: "MAGIC",
        ability: { kind: "gun", interval: 2, damage: 3, projectileSpeed: 440, count: 1 },
    }),
    commander: orb("commander", "COMMANDER", "#36527f", "#d6e5ff", {
        power: "TRACKING DRONES · 2/5 DAMAGE RAIN",
        statLabel: "DRONES",
        ability: { kind: "commander", interval: 2 },
    }),
});

export const CLASSIC_ORB_SIZE_PROFILES = Object.freeze({
    mini: Object.freeze({ id: "mini", label: "MINI", scale: 0.55 }),
    compact: Object.freeze({ id: "compact", label: "COMPACT", scale: 0.75 }),
    regular: Object.freeze({ id: "regular", label: "REGULAR", scale: 1 }),
    large: Object.freeze({ id: "large", label: "LARGE", scale: 1.25 }),
    "extra-large": Object.freeze({ id: "extra-large", label: "EXTRA LARGE", scale: 1.5 }),
});
export const CLASSIC_ORB_SCALE_OPTIONS = Object.freeze(
    Object.values(CLASSIC_ORB_SIZE_PROFILES).map(({ scale, label }) => Object.freeze({ value: scale, label })),
);

export const CLASSIC_ORB_IDS = Object.freeze(Object.keys(CLASSIC_ORBS));
export const CLASSIC_DEFAULT_CLASSES = Object.freeze(["sword", "orbital"]);
export const CLASSIC_DEFAULT_TEAMS = Object.freeze([
    Object.freeze(["sword"]),
    Object.freeze(["orbital"]),
]);
export const CLASSIC_MAX_ORB_COPIES = 50;

// Classic teams use the same compact naming language as Orb Race. Keep these
// category IDs aligned with Orb Race's generated category clips so a Classic
// matchup can reuse the exact `+`, category, and EVERYONE announcements.
export const CLASSIC_ORB_GROUPS = Object.freeze([
    Object.freeze({
        id: "power-math",
        label: "VERY POWERFUL MATH ORBS",
        orbIds: Object.freeze([]),
    }),
    Object.freeze({
        id: "math",
        label: "MATH ORBS",
        orbIds: Object.freeze(["jackpot"]),
    }),
    Object.freeze({
        id: "superhero",
        label: "SUPERHERO ORBS",
        orbIds: Object.freeze(["flash", "batman"]),
    }),
    Object.freeze({
        id: "weapon",
        label: "WEAPON ORBS",
        orbIds: Object.freeze([
            "sword", "turret", "reactor", "sniper", "draftmaster", "blue-sun", "black-hole",
            "tripwire", "hydrogen-bomb", "necromancer", "poison", "spikey", "shrapnel", "cobwebs",
            "trapper", "hive-ball", "zeus", "glass-ball", "pistol", "shotgun", "rifle", "sawball",
            "cutter", "trident", "lazer", "grappler", "train", "boxer", "artist", "monster", "fairy", "commander",
        ]),
    }),
    Object.freeze({
        id: "growth",
        label: "GROWTH ORBS",
        orbIds: Object.freeze(["duplicator", "orbital", "vampire", "snake", "virus", "apple", "absorber", "parasites", "artist"]),
    }),
    Object.freeze({
        id: "motion",
        label: "MOTION ORBS",
        orbIds: Object.freeze(["unarmed", "slammy", "ying-yang", "charger", "frost-ball"]),
    }),
]);

// This electric royal blue is deliberately separate from the Orb Race cyan,
// speed blue, and Classic orb-theme blues. Team two uses a saturated red that
// remains legible against the warm Classic backgrounds and red orb themes.
export const CLASSIC_TEAM_OUTLINE_COLORS = Object.freeze({
    0: "#0057ff",
    1: "#e11d48",
});

export function classicTeamOutlineColorFor(teamIndex) {
    return CLASSIC_TEAM_OUTLINE_COLORS[Number(teamIndex) === 1 ? 1 : 0];
}

export function classicOrbDisplayName(orbId, options = null) {
    const definition = CLASSIC_ORBS[orbId];
    if (!definition) return "";
    const count = normalizeClassicOrbCount(options?.count, 1);
    const bossLabel = options?.boss === true ? " BOSS" : "";
    return `${count > 1 ? `${count}× ` : ""}${definition.name}${bossLabel}`;
}

export function classicTeamDisplayParts(value, options = null) {
    const ids = [...new Set(
        (Array.isArray(value) ? value : []).filter((id) => Object.hasOwn(CLASSIC_ORBS, id)),
    )];
    if (ids.length <= 2) {
        return ids.map((orbId, index) => ({
            kind: "orb",
            id: orbId,
            label: classicOrbDisplayName(orbId, options?.[orbId]),
            orbIds: [orbId],
            order: index,
            announcerCue: `intro-${orbId}`,
            boss: options?.[orbId]?.boss === true,
        }));
    }
    const consumed = new Set();
    const parts = [];
    for (const definition of CLASSIC_ORB_GROUPS) {
        const matches = ids.filter((id) => definition.orbIds.includes(id));
        if (matches.length < 2) continue;
        const order = Math.min(...matches.map((id) => ids.indexOf(id)));
        matches.forEach((id) => consumed.add(id));
        parts.push({
            kind: "group",
            id: definition.id,
            label: definition.label,
            orbIds: matches,
            order,
            announcerCue: `intro-race-group-${definition.id}`,
        });
    }
    ids.forEach((orbId, index) => {
        if (consumed.has(orbId)) return;
        parts.push({
            kind: "orb",
            id: orbId,
            label: classicOrbDisplayName(orbId, options?.[orbId]),
            orbIds: [orbId],
            order: index,
            announcerCue: `intro-${orbId}`,
            boss: options?.[orbId]?.boss === true,
        });
    });
    const orderedParts = parts.sort((left, right) => left.order - right.order);
    if (orderedParts.length >= 4) {
        return [{
            kind: "everyone",
            id: "everyone",
            label: "EVERYONE",
            orbIds: ids,
            order: 0,
            announcerCue: "intro-race-everyone",
        }];
    }
    return orderedParts;
}

export function classicTeamDisplayName(value, options = null) {
    const ids = [...new Set(
        (Array.isArray(value) ? value : []).filter((id) => Object.hasOwn(CLASSIC_ORBS, id)),
    )];
    if (ids.length === 1) return classicOrbDisplayName(ids[0], options?.[ids[0]]);
    return classicTeamDisplayParts(ids, options).map((part) => (
        part.kind === "orb" ? classicOrbDisplayName(part.id, options?.[part.id]) : part.label
    )).join(" + ");
}

export function normalizeClassicClasses(value) {
    const source = Array.isArray(value) ? value : CLASSIC_DEFAULT_CLASSES;
    const normalized = source.filter((id) => CLASSIC_ORB_IDS.includes(id));
    const unique = [...new Set(normalized)];
    if (unique.length >= 2) return unique.slice(0, 2);
    if (unique.length === 1) {
        const opponent = CLASSIC_DEFAULT_CLASSES.find((id) => id !== unique[0])
            || CLASSIC_ORB_IDS.find((id) => id !== unique[0]);
        return [unique[0], opponent];
    }
    return [...CLASSIC_DEFAULT_CLASSES];
}

export function normalizeClassicTeams(value, fallback = CLASSIC_DEFAULT_TEAMS) {
    const hasExplicitTeams = Array.isArray(value);
    const source = hasExplicitTeams ? value : fallback;
    return Array.from({ length: 2 }, (_, teamIndex) => {
        const fallbackTeam = Array.isArray(fallback?.[teamIndex]) && fallback[teamIndex].length
            ? fallback[teamIndex]
            : CLASSIC_DEFAULT_TEAMS[teamIndex];
        const hasExplicitTeam = hasExplicitTeams && Array.isArray(source[teamIndex]);
        const rawTeam = hasExplicitTeam ? source[teamIndex] : fallbackTeam;
        const team = [...new Set(rawTeam.filter((id) => CLASSIC_ORB_IDS.includes(id)))];
        if (team.length || (hasExplicitTeam && rawTeam.length === 0)) return team;
        return [...fallbackTeam];
    });
}

export function normalizeClassicOrbCount(value, fallback = 1) {
    const number = Math.floor(Number(value));
    const safeFallback = Math.max(1, Math.min(CLASSIC_MAX_ORB_COPIES, Math.floor(Number(fallback) || 1)));
    return Number.isFinite(number)
        ? Math.max(1, Math.min(CLASSIC_MAX_ORB_COPIES, number))
        : safeFallback;
}

export function normalizeClassicOrbHealth(value, fallback = 100) {
    const number = Math.floor(Number(value));
    const safeFallback = Math.max(1, Math.min(1_000_000, Math.floor(Number(fallback) || 100)));
    return Number.isFinite(number)
        ? Math.max(1, Math.min(1_000_000, number))
        : safeFallback;
}

export function normalizeClassicTeamOptions(value, teams = CLASSIC_DEFAULT_TEAMS, legacy = {}) {
    const normalizedTeams = normalizeClassicTeams(teams);
    return normalizedTeams.map((team, teamIndex) => Object.fromEntries(team.map((orbId) => {
        const raw = value?.[teamIndex]?.[orbId] && typeof value[teamIndex][orbId] === "object"
            ? value[teamIndex][orbId]
            : {};
        const legacyOption = legacy?.[orbId] && typeof legacy[orbId] === "object" ? legacy[orbId] : {};
        const registryDefaultCollision = CLASSIC_ORBS[orbId]?.defaultCollisionDamage === true;
        return [orbId, {
            count: normalizeClassicOrbCount(raw.count, legacyOption.count),
            health: normalizeClassicOrbHealth(raw.health, legacyOption.health),
            orbScale: normalizeClassicOrbScale(raw.orbScale, legacyOption.orbScale ?? 1),
            speedMode: normalizeClassicSpeedMode(raw.speedMode ?? legacyOption.speedMode),
            fadingTrails: raw.fadingTrails == null
                ? legacyOption.fadingTrails === true
                : raw.fadingTrails === true,
            solidTrails: raw.solidTrails == null
                ? legacyOption.solidTrails === true
                : raw.solidTrails === true,
            collisionDamage: raw.collisionDamage == null
                ? legacyOption.collisionDamage == null
                    ? registryDefaultCollision
                    : legacyOption.collisionDamage === true
                : raw.collisionDamage === true,
            boss: raw.boss === true || raw.classicBoss === true
                || legacyOption.boss === true || legacyOption.classicBoss === true,
        }];
    })));
}

export function classicTeamMemberCount(teams, options) {
    return normalizeClassicTeams(teams).reduce((total, team, teamIndex) => (
        total + team.reduce((teamTotal, orbId) => (
            teamTotal + normalizeClassicOrbCount(options?.[teamIndex]?.[orbId]?.count)
        ), 0)
    ), 0);
}

export function classicCollisionDamageEnabled(orbId, overrides = null) {
    if (typeof overrides === "boolean") return overrides;
    if (overrides && Object.hasOwn(overrides, orbId)) return overrides[orbId] !== false;
    return CLASSIC_ORBS[orbId]?.defaultCollisionDamage === true;
}

export function normalizeClassicSpeedMode(value) {
    return ["regular", "slow", "fast"].includes(value) ? value : "regular";
}

export function normalizeClassicOrbScale(value, fallback = 1) {
    const safeFallback = CLASSIC_ORB_SCALE_OPTIONS.some(({ value: optionValue }) => optionValue === fallback)
        ? fallback
        : 1;
    const number = Number(value);
    if (!Number.isFinite(number)) return safeFallback;
    return CLASSIC_ORB_SCALE_OPTIONS.reduce((closest, option) => (
        Math.abs(option.value - number) < Math.abs(closest - number) ? option.value : closest
    ), 0.55);
}
