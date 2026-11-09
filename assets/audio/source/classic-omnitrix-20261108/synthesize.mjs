import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const sampleRate = 44_100;
const tau = Math.PI * 2;
const chirp = (t, start, stop, seconds, partial = 0) => {
    if (t < 0 || t >= seconds) return 0;
    const envelope = Math.min(1, t / .012, (seconds - t) / .031);
    const phase = tau * (start * t + (stop - start) * t * t / (2 * seconds));
    return envelope * (Math.sin(phase) + partial * Math.sin(phase * 2.03));
};
const effects = {
    "classic-omnitrix-dial": [.41, (t) =>
        .27 * chirp(t, 950, 635, .068, .32)
        + .26 * chirp(t - .135, 1280, 890, .080, .28)
        + .32 * chirp(t - .257, 990, 1750, .135, .26)],
    "classic-omnitrix-transform": [.57, (t, noise) =>
        .49 * chirp(t, 100, 44, .25, .31)
        + .17 * chirp(t, 710, 190, .19, .31)
        + .21 * chirp(t - .038, 550, 2380, .27, .39) * (.77 + .23 * Math.sin(t * tau * 46))
        + .22 * chirp(t - .172, 1240, 635, .34, .33)
        + .17 * noise * Math.exp(-t * 16)],
};

for (const [id, [seconds, voice]] of Object.entries(effects)) {
    const pcm = Buffer.alloc(Math.round(seconds * sampleRate) * 2);
    let seed = 83;
    let noise = 0;
    for (let i = 0; i < pcm.length / 2; i += 1) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        noise += (seed / 2 ** 31 - 1 - noise) * .37;
        const t = i / sampleRate;
        const sample = Math.tanh(voice(t, noise) * 1.9) * Math.min(1, t / .007, (seconds - t) / .034);
        pcm.writeInt16LE(Math.round(sample * 29_000), i * 2);
    }
    execFileSync(process.env.FFMPEG_PATH || "ffmpeg", [
        "-y", "-hide_banner", "-loglevel", "error", "-f", "s16le", "-ar", String(sampleRate), "-ac", "1", "-i", "pipe:0",
        "-af", "highpass=f=43,lowpass=f=6500,alimiter=limit=0.81", "-codec:a", "libmp3lame", "-b:a", "96k",
        fileURLToPath(new URL("../../effects/" + id + ".mp3", import.meta.url)),
    ], { input: pcm });
}
