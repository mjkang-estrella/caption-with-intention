import { test } from "node:test";
import assert from "node:assert/strict";
import type { AudioSamples, Cue } from "../src/core/types.ts";
import { analyzeWordVolumes, computeWaveform, volumePercentForDbOffset, windowRms } from "../src/core/audio-analysis.ts";
import { normalizeCue } from "../src/core/schema.ts";

// One second per word at 1 kHz; each word window holds a constant level, so its RMS is that level.
function audioWithLevels(levels: number[]): AudioSamples {
  const sampleRate = 1000;
  const data = new Float32Array(levels.length * sampleRate);
  levels.forEach((level, index) => data.fill(level, index * sampleRate, (index + 1) * sampleRate));
  return { sampleRate, length: data.length, numberOfChannels: 1, getChannelData: () => data };
}

function cueWithWords(type: Cue["type"], firstSecond: number, count: number): Cue {
  return normalizeCue({
    id: `${type}-${firstSecond}`,
    type,
    start: firstSecond,
    end: firstSecond + count,
    words: Array.from({ length: count }, (_, index) => ({ id: `${type}-${firstSecond + index}`, text: "w", start: firstSecond + index, end: firstSecond + index + 1 }))
  }, 0);
}

test("dB offsets map through the dead zone to the whisper and shout limits", () => {
  assert.equal(volumePercentForDbOffset(0), 50);
  assert.equal(volumePercentForDbOffset(3), 50);
  assert.equal(volumePercentForDbOffset(-3), 50);
  assert.equal(volumePercentForDbOffset(7.5), 75);
  assert.equal(volumePercentForDbOffset(12), 100);
  assert.equal(volumePercentForDbOffset(30), 100);
  assert.equal(volumePercentForDbOffset(-12), 0);
  assert.equal(volumePercentForDbOffset(NaN), 50);
});

test("words are sized against the median speech level, and silence stays neutral", () => {
  // -20 dB speech, one word 12 dB louder, one 6 dB softer, one silent; plus a loud sound effect.
  const audio = audioWithLevels([0.1, 0.1, 0.1, 0.1 * 10 ** (12 / 20), 0.1 * 10 ** (-6 / 20), 0, 0.5]);
  const cues = [cueWithWords("dialogue", 0, 6), cueWithWords("sound", 6, 1)];
  const analysis = analyzeWordVolumes(audio, cues);

  assert.ok(Math.abs(analysis.referenceDb - -20) < 1e-6);
  assert.deepEqual(analysis.words.map((item) => item.volumePercent), [50, 50, 50, 100, 33, 50, 100]);
});

test("windowRms clamps to the buffer and returns NaN for empty windows", () => {
  const audio = audioWithLevels([0.5]);
  assert.ok(Math.abs(windowRms(audio, 0, 1) - 0.5) < 1e-6);
  assert.ok(Math.abs(windowRms(audio, -1, 5) - 0.5) < 1e-6);
  assert.ok(Number.isNaN(windowRms(audio, 2, 3)));
});

test("the waveform has ten bars per second with the loudest bar at 0.5", () => {
  const waveform = computeWaveform(audioWithLevels([0.2, 0.4]));
  assert.equal(waveform.length, 20);
  assert.equal(Math.max(...waveform), 0.5);
  assert.equal(waveform[0], 0.25);
});
