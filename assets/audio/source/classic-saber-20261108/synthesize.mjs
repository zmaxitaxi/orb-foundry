import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// An original motor-and-air synthesis. The pitch passes the listener as the
// blade crosses the swing. Detuned harmonics keep the motor audible on phones.
const profiles = {
    "classic-luke-swing": { seconds: .34, base: 113, pitch: .58, peaks: [.36], air: .28 },
    "classic-luke-reverse": { seconds: .31, base: 126, pitch: .68, peaks: [.42], air: .25 },
    "classic-vader-swing": { seconds: .42, base: 81, pitch: .54, peaks: [.41], air: .21 },
    "classic-vader-throw": { seconds: .69, base: 85, pitch: .45, peaks: [.16, .40, .67, .88], air: .17 },
    "classic-vader-return": { seconds: .54, base: 94, pitch: .57, peaks: [.17, .48, .76], air: .19 },
    "classic-luke-lunge": { seconds: .28, base: 119, pitch: .44, peaks: [.60], air: .54 },
    "classic-luke-vault": { seconds: .29, base: 72, pitch: .38, peaks: [.39], air: 1.16, motor: .12 },
    "classic-luke-evade": { seconds: .19, base: 91, pitch: .25, peaks: [.33], air: 1.10, motor: .06 },
};

const sampleRate = 44_100;
const tau = Math.PI * 2;
const wave = (phase) => Math.sin(tau * phase);

function synthesize({ seconds, base, pitch, peaks, air, motor = 1 }) {
    const samples = Math.round(seconds * sampleRate);
    const pcm = Buffer.alloc(samples * 2);
    let seed = 101;
    let phase = 0;
    let buzz = 0;
    let lowAir = 0;
    let highAir = 0;
    for (let i = 0; i < samples; i += 1) {
        const t = i / sampleRate;
        const p = t / seconds;
        const nearest = peaks.reduce((a, b) => Math.abs(p - a) < Math.abs(p - b) ? a : b);
        const breadth = peaks.length === 1 ? .26 : .105;
        const sweep = (p - nearest) / breadth;
        const presence = Math.exp(-sweep * sweep * .82);
        const approach = pitch * -Math.tanh(sweep * 1.20);
        const frequency = base * (1 + presence * approach + .027 * wave(t * 27));
        phase += frequency / sampleRate;
        buzz += (frequency * 1.009 + 2.7) / sampleRate;
        const body = .53 * wave(phase) + .26 * wave(phase * 2 + .12 * wave(buzz))
            + .14 * wave(phase * 3.01) + .096 * wave(buzz * 4.03) + .055 * wave(buzz * 6.02 + .17 * wave(phase));
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const noise = seed / 2 ** 31 - 1;
        highAir += (noise - highAir) * .23;
        lowAir += (noise - lowAir) * .045;
        const flutter = .90 + .10 * wave(t * (peaks.length > 1 ? 19 : 29));
        const taper = Math.min(1, t / .023, (seconds - t) / .063);
        const value = taper * ((.15 + presence * .68) * Math.tanh(body * 2.25) * flutter * motor
            + (highAir - lowAir) * presence * air * 2.3);
        pcm.writeInt16LE(Math.round(Math.tanh(value * 1.65) * 30_000), i * 2);
    }
    return pcm;
}

const output = new URL("../../effects/", import.meta.url);
for (const [id, profile] of Object.entries(profiles)) {
    execFileSync(process.env.FFMPEG_PATH || "ffmpeg", [
        "-y", "-hide_banner", "-loglevel", "error", "-f", "s16le", "-ar", String(sampleRate), "-ac", "1", "-i", "pipe:0",
        "-af", "highpass=f=42,lowpass=f=6000,alimiter=limit=0.82", "-codec:a", "libmp3lame", "-b:a", "96k",
        fileURLToPath(new URL(id + ".mp3", output)),
    ], { input: synthesize(profile) });
}
