import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync, statSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { ANNOUNCER_VOICE_CATALOG } from "../src/audio.js";
import { ANNOUNCER_VOICE } from "../src/announcer-voice.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const live = join(root, "assets/audio/announcer");
const sources = join(root, "assets/audio/source/single-voice-20261112");
const ffmpeg = process.env.FFMPEG_PATH || join(root, "node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg");
mkdirSync(join(live, "single-voice"), { recursive: true });
mkdirSync(sources, { recursive: true });
const hash = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const measurements = {};
let completed = 0;
for (const [filename, phrase] of Object.entries(ANNOUNCER_VOICE_CATALOG.phrases)) {
    const destination = join(live, filename);
    if (phrase.reference) {
        if (!existsSync(destination)) throw new Error("Luke's reference announcement is missing");
        measurements[filename] = { ...phrase, sha256: hash(destination) };
        continue;
    }
    const source = join(sources, filename.split("/").at(-1).replace(".mp3", ".aiff"));
    if (process.argv.includes("--force") || !existsSync(destination) || statSync(destination).size < 4096) {
        for (let attempt = 0; attempt < 3; attempt += 1) {
            execFileSync("/usr/bin/say", ["-v", ANNOUNCER_VOICE.name, "-r", String(ANNOUNCER_VOICE.rate), "-o", source, `${phrase.spokenText}.`]);
            if (statSync(source).size > 4096) break;
        }
        if (statSync(source).size <= 4096) throw new Error(`No spoken frames for ${phrase.text}`);
        execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", "-i", source,
            "-af", "silenceremove=start_periods=1:start_duration=0.01:start_threshold=-48dB,loudnorm=I=-18:TP=-2:LRA=7,afade=t=in:d=0.008,apad=pad_dur=0.045:whole_dur=0.45",
            "-map_metadata", "-1", "-ar", "24000", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "96k", destination]);
        if (statSync(destination).size < 4096) throw new Error(`Invalid spoken clip for ${phrase.text}`);
    }
    measurements[filename] = { ...phrase, source: source.split("/").at(-1), sha256: hash(destination) };
    completed += 1;
    if (completed % 20 === 0) console.log(`Prepared ${completed} phrases…`);
}
writeFileSync(join(sources, "manifest.json"), JSON.stringify({ voice: ANNOUNCER_VOICE, generator: "scripts/generate-unified-announcer.mjs", phrases: measurements, cues: ANNOUNCER_VOICE_CATALOG.manifest }, null, 2) + "\n");
console.log(`Unified ${Object.keys(ANNOUNCER_VOICE_CATALOG.manifest).length} cues into ${Object.keys(measurements).length} phrases; Luke's original clip is preserved.`);
