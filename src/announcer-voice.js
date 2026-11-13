// One local announcer palette for every mode. The reference Luke clip is kept
// byte-for-byte; all remaining phrases use the same macOS Alex voice family.
export const ANNOUNCER_VOICE = Object.freeze({
    id: "alex", name: "Alex", rate: 175, version: "20261112-single-voice1",
    reference: "classic-local/luke-skywalker.mp3",
    referenceSha256: "ff8bfeb08218636320dac383c2556f3fb21379110740e5973da3e60f5c7e230b",
});

const COMMON_PHRASES = Object.freeze({
    three: "Three", two: "Two", one: "One", fight: "Fight", versus: "Versus",
    "pick-your-winner": "Pick your winner", overtime: "Overtime",
    "race-plus": "Plus", "race-versus": "Versus", "race-pick-your-winner": "Pick your winner",
    "world-cup-pick-your-winner": "Pick your winner", "race-buffed": "Buffed", "race-boss": "Boss",
    "intro-race-everyone": "Everyone",
    "legacy-three": "Three", "legacy-two": "Two", "legacy-one": "One", "legacy-fight": "Fight",
    "legacy-overtime": "Overtime", "legacy-versus": "Versus", "legacy-fire": "Cinder", "legacy-ice": "Frost",
    "legacy-wizard": "Hex", "legacy-time": "Chrono", "legacy-volta": "Volta", "legacy-venom": "Venom",
    "legacy-gravis": "Gravis", "legacy-aegis": "Aegon",
});
const TARGETS = Object.freeze({
    10000: "Ten thousand", 100000: "One hundred thousand", 500000: "Five hundred thousand",
    1000000: "One million", 10000000: "Ten million", 500000000: "Five hundred million",
    1000000000: "One billion", 1000000000000000000: "One quintillion",
});

export function createAnnouncerVoiceCatalog({ cues, classicNames, raceNames, countryNames, groupNames, countNames, combos }) {
    const texts = { ...COMMON_PHRASES };
    for (const [id, name] of Object.entries(classicNames)) texts[`intro-${id}`] = name;
    for (const [id, name] of Object.entries(raceNames)) texts[`intro-race-${id}`] = name;
    for (const [id, name] of Object.entries(countryNames)) texts[`intro-country-${id}`] = name;
    for (const [id, name] of Object.entries(groupNames)) texts[`intro-race-group-${id}`] = name;
    for (const [count, name] of Object.entries(countNames)) texts[`race-count-${count}`] = name;
    for (const [value, name] of Object.entries(TARGETS)) texts[`race-target-${value}`] = `First to ${name.toLowerCase()}`;
    for (const [key, definition] of Object.entries(combos)) texts[`intro-race-combo-${key.replaceAll("+", "-")}`] = definition.name;
    const manifest = {};
    const phrases = {};
    for (const cue of cues) {
        const text = texts[cue];
        if (!text) throw new Error(`Missing single-voice announcement text for ${cue}`);
        const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const filename = text === "Luke Skywalker" ? ANNOUNCER_VOICE.reference : `single-voice/${slug}.mp3`;
        manifest[cue] = filename;
        const spokenText = text === "WDC" ? "W D C" : text === "Fibonacci" ? "Fee buh naa chee" : text === "Splodey" ? "Splodee" : text;
        phrases[filename] = { text, spokenText, reference: filename === ANNOUNCER_VOICE.reference };
    }
    return Object.freeze({ manifest: Object.freeze(manifest), phrases: Object.freeze(phrases) });
}
