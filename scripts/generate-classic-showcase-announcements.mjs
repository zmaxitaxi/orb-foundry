import { execFileSync } from "node:child_process";
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CLASSIC_SHOWCASE_FIGHTERS } from "../src/classic-showcase.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sources = join(root, "assets/audio/source/classic-eight-20261110");
const live = join(root, "assets/audio/announcer/classic-local");
const voice = process.env.CLASSIC_ANNOUNCER_VOICE || "Alex";
const rate = "175";
mkdirSync(sources, { recursive: true });
mkdirSync(live, { recursive: true });
const manifest = { voice, rate: Number(rate), generator: "scripts/generate-classic-showcase-announcements.mjs", clips: {} };
for (const [id, def] of Object.entries(CLASSIC_SHOWCASE_FIGHTERS)) {
    const source = join(sources, `${id}.aiff`);
    const output = join(live, `${id}.mp3`);
    const title = def.name.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
    execFileSync("/usr/bin/say", ["-v", voice, "-r", rate, "-o", source, `${title}.`]);
    if (statSync(source).size < 4096) throw new Error(`Empty spoken cue for ${id}`);
    execFileSync(process.env.FFMPEG_PATH || "ffmpeg", [
        "-y", "-hide_banner", "-loglevel", "error", "-i", source,
        "-map_metadata", "-1", "-ar", "24000", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "96k", output,
    ]);
    if (statSync(output).size < 4096) throw new Error(`Empty encoded cue for ${id}`);
    manifest.clips[id] = { text: title, source: `${id}.aiff`, live: `classic-local/${id}.mp3` };
}
writeFileSync(join(sources, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`Generated ${Object.keys(manifest.clips).length} Classic fighter announcements.`);
