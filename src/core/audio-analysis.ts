// Local audio analysis that seeds word volume and draws the timeline waveform.

import type { AudioSamples, Cue, Word } from "./types.ts";
import { CWI_ANALYSIS, NEUTRAL_VOLUME } from "./style.ts";
import { clamp, percentile } from "./util.ts";

export interface WordVolumeAnalysis {
  referenceDb: number;
  words: { word: Word; volumePercent: number }[];
}

// Per-word loudness relative to the median speech level. Words inside the dead zone stay at
// the normal 5% size so that ordinary speech returns to the baseline (doc QA checklist).
export function analyzeWordVolumes(audio: AudioSamples, cues: Cue[]): WordVolumeAnalysis {
  const entries = cues.flatMap((cue) => (cue.words || []).map((word) => ({
    cue,
    word,
    db: rmsDb(audio, word.start, word.end)
  })));
  const speech = entries
    .filter((entry) => entry.cue.type === "dialogue" && Number.isFinite(entry.db) && entry.db > CWI_ANALYSIS.silenceDb)
    .map((entry) => entry.db);
  const referenceDb = speech.length ? percentile(speech, 0.5) : NaN;
  return {
    referenceDb,
    words: entries.map((entry) => ({ word: entry.word, volumePercent: volumePercentForDbOffset(entry.db - referenceDb) }))
  };
}

export function volumePercentForDbOffset(offsetDb: number): number {
  if (!Number.isFinite(offsetDb)) return NEUTRAL_VOLUME;
  const beyondDeadZone = Math.abs(offsetDb) - CWI_ANALYSIS.volumeDeadZoneDb;
  if (beyondDeadZone <= 0) return NEUTRAL_VOLUME;
  const amount = clamp(beyondDeadZone / (CWI_ANALYSIS.volumeFullScaleDb - CWI_ANALYSIS.volumeDeadZoneDb), 0, 1);
  return Math.round(NEUTRAL_VOLUME + Math.sign(offsetDb) * amount * (100 - NEUTRAL_VOLUME));
}

export function rmsDb(audio: AudioSamples, start: number, end: number): number {
  const rms = windowRms(audio, start, end);
  return Number.isFinite(rms) && rms > 0 ? 20 * Math.log10(rms) : NaN;
}

export function windowRms(audio: AudioSamples, start: number, end: number): number {
  const sampleRate = audio.sampleRate;
  const startSample = Math.max(0, Math.floor(Number(start) * sampleRate));
  const endSample = Math.min(audio.length, Math.ceil(Number(end) * sampleRate));
  if (endSample <= startSample) return NaN;

  let sum = 0;
  let count = 0;
  for (let channel = 0; channel < audio.numberOfChannels; channel += 1) {
    const data = audio.getChannelData(channel);
    for (let index = startSample; index < endSample; index += 1) {
      const sample = data[index] || 0;
      sum += sample * sample;
      count += 1;
    }
  }
  return count ? Math.sqrt(sum / count) : NaN;
}

export function computeWaveform(audio: AudioSamples): number[] {
  const duration = audio.length / audio.sampleRate;
  const bars = clamp(Math.ceil(duration * CWI_ANALYSIS.waveformBarsPerSecond), 1, 4000);
  const values = Array.from({ length: bars }, (_, index) => windowRms(audio, (index * duration) / bars, ((index + 1) * duration) / bars) || 0);
  const peak = Math.max(...values, 0.000001);
  // Match the scale of the bundled sample waveform (loudest bar about 0.5).
  return values.map((value) => Math.round((value / peak) * 500) / 1000);
}
