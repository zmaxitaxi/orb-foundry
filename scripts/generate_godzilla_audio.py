#!/usr/bin/env python3
"""Create the small deterministic Godzilla effect set used by Orb Foundry."""

from pathlib import Path
import math
import random
import struct
import wave


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets/audio/source/race-effects-20260806"
ACTIVE_DIR = ROOT / "assets/audio/effects"
SAMPLE_RATE = 44_100


def clamp(value, low=-1.0, high=1.0):
    return max(low, min(high, value))


def write_wav(path, samples):
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = b"".join(struct.pack("<h", round(clamp(sample) * 32767)) for sample in samples)
    with wave.open(str(path), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(SAMPLE_RATE)
        output.writeframes(pcm)


def smoothed_noise(rng, state):
    state[0] = state[0] * 0.965 + rng.uniform(-1.0, 1.0) * 0.035
    return state[0]


def pulse(t, center, width):
    distance = (t - center) / max(width, 0.0001)
    return math.exp(-(distance * distance))


def tail_smack():
    duration = 0.95
    rng = random.Random(0x7461696C)
    noise_state = [0.0]
    samples = []
    for index in range(round(duration * SAMPLE_RATE)):
        t = index / SAMPLE_RATE
        whoosh = smoothed_noise(rng, noise_state) * 0.2 * math.exp(-t * 7.5)
        body_frequency = 142.0 - 76.0 * min(1.0, t / duration)
        body = math.sin(math.tau * body_frequency * t) * 0.46 * math.exp(-t * 3.7)
        body += math.sin(math.tau * body_frequency * 0.51 * t) * 0.16 * math.exp(-t * 4.8)
        crack = math.sin(math.tau * (1480.0 - 960.0 * min(1.0, t / 0.2)) * t) * 0.27 * pulse(t, 0.105, 0.042)
        impact = math.sin(math.tau * 74.0 * t) * 0.34 * pulse(t, 0.13, 0.12)
        samples.append((whoosh + body + crack + impact) * 0.9)
    return samples


def beam_charge():
    duration = 2.2
    rng = random.Random(0x636861726765)
    noise_state = [0.0]
    samples = []
    for index in range(round(duration * SAMPLE_RATE)):
        t = index / SAMPLE_RATE
        progress = min(1.0, t / duration)
        swell = min(1.0, progress * 1.8) * (1.0 - 0.18 * progress)
        rumble_frequency = 48.0 + 70.0 * progress
        harmonic_frequency = 96.0 + 156.0 * progress
        vibrato = 1.0 + 0.018 * math.sin(math.tau * 4.5 * t)
        rumble = math.sin(math.tau * rumble_frequency * vibrato * t) * 0.28 * swell
        harmonic = math.sin(math.tau * harmonic_frequency * vibrato * t) * 0.16 * swell
        subharmonic = math.sin(math.tau * (rumble_frequency * 0.5) * t) * 0.1 * swell
        noise = smoothed_noise(rng, noise_state) * 0.12 * swell
        charge_glint = math.sin(math.tau * (520.0 + 920.0 * progress) * t) * 0.055 * progress
        end_pulse = math.sin(math.tau * 640.0 * t) * 0.18 * pulse(t, duration - 0.06, 0.045)
        samples.append((rumble + harmonic + subharmonic + noise + charge_glint + end_pulse) * 0.92)
    return samples


for filename, generator in (
    ("godzilla-tail-smack.wav", tail_smack),
    ("godzilla-beam-charge.wav", beam_charge),
):
    generated = generator()
    write_wav(SOURCE_DIR / filename, generated)
    write_wav(ACTIVE_DIR / f"race-godzilla-{filename.removeprefix('godzilla-')}", generated)
