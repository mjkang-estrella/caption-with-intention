// Caption with Intention style tokens, palette, and the volume and tone mappings.
//
// Defaults follow the After Effects template (reference/AE PROJECT/Academy_CI_Template.aep):
// a 1920x1080 @ 30 fps comp, Roboto 27 px with a #DDDDDD fill, a box that is the text bounds
// plus 30 px per side and 20 px top/bottom in 80% black, an "Up" range selector that lifts the
// current word 5 px, and an "Antecipate" selector that dips the next word 2 px. The guideline doc
// and design-system PDF fill in what the template does not define: volume sizing, pitch axes,
// off-camera slant, music treatment, two-line stacking, and the minor-character palette.
// Renderer code should read every caption value from here instead of inlining numbers.

import type { AspectRatio, SpeakerRole } from "./types.ts";
import { clamp, toNumber } from "./util.ts";

export interface LayoutTokens {
  maxLineWidthRatio: number;
  bottomMarginRatio: number;
}

export interface PaletteEntry {
  role: SpeakerRole;
  label: string;
  color: string;
  template: boolean;
}

export const NEUTRAL_VOLUME = 50;

export const CWI_STYLE = {
  type: {
    // AE: 27 px on a 1080 px comp. The doc's "5% of screen height" measures the box band
    // (PDF p35-37), which a 2.5% font plus the AE padding reproduces.
    baseSizeRatio: 27 / 1080,
    // Doc volume range 3% / 5% / 12%, expressed relative to normal speech.
    minVolumeScale: 3 / 5,
    maxVolumeScale: 12 / 5,
    minFontPx: 6,
    // Roboto Flex vertical metrics (hhea and OS/2 typo, 2048 units per em).
    ascentEm: 1900 / 2048,
    descentEm: 500 / 2048,
    readAheadColor: "#DDDDDD",
    exceptionSpokenColor: "#FFFFFF",
    defaultWeight: 400,
    defaultWidth: 100,
    // PDF p23: off-camera italics are Roboto Flex's full slant.
    offCameraSlant: -10
  },
  tone: {
    minWeight: 100,
    maxWeight: 1000,
    minWidth: 25,
    maxWidth: 151,
    // PDF p41 only allows the heavy+wide to light+condensed diagonal of the weight x width grid.
    bandTolerance: 0.3
  },
  motion: {
    liftEm: 5 / 27,
    anticipationDipEm: 2 / 27,
    anticipationSeconds: 4 / 30,
    // One AE word slot on the sample footage: 10 words over 60 frames.
    maxRiseSeconds: 0.2,
    settleSeconds: 0.2,
    // AE has no scale animator; the doc's 15% pop is available by setting 1.15.
    popScale: 1,
    // AE ease() between the START and END markers, used when words have no aligned timing.
    estimatedEase: [0.33, 0, 0.667, 1] as [number, number, number, number],
    estimatedEndInsetSeconds: 0.25
  },
  box: {
    fill: "rgba(0, 0, 0, 0.8)",
    padXEm: 30 / 27,
    padYEm: 20 / 27
  },
  stack: {
    maxLines: 2,
    // PDF p45: separate line boxes 2.5% of screen height apart inside the lower 20%.
    lineGapRatio: 0.025,
    workAreaRatio: 0.2
  },
  layout: {
    // AE guide layer: max line width x 423-1497 on 1920; box bottom about 65 px above the frame edge.
    "16:9": { maxLineWidthRatio: 1074 / 1920, bottomMarginRatio: 65 / 1080 },
    // Provisional: the template and PDF only define widescreen formats.
    "9:16": { maxLineWidthRatio: 0.8, bottomMarginRatio: 65 / 1080 },
    "1:1": { maxLineWidthRatio: 0.76, bottomMarginRatio: 65 / 1080 }
  } as Record<AspectRatio, LayoutTokens>,
  // Doc 7.1: sound effects stay white but grow and pop in sync with the sound, as one unit.
  // (The AE sound-effect lines are static; set syncToSound to false for that look.)
  sound: { syncToSound: true },
  music: { glyph: "♫", animate: false }
};

// Local audio analysis that seeds word volume. Speech within the dead zone of the median level
// stays at the normal size; the full-scale offset reaches the whisper or shout limit.
export const CWI_ANALYSIS = {
  silenceDb: -60,
  volumeDeadZoneDb: 3,
  volumeFullScaleDb: 12,
  waveformBarsPerSecond: 10
};

// Main colors in the design-system slot order (PDF p16). Template colors are the eight
// swatches in the AE guide layer.
const MAIN_COLORS = [
  { label: "CI Main Yellow", color: "#E5E517", template: true },
  { label: "CI Main Green", color: "#17E517", template: true },
  { label: "CI Main Blue", color: "#17E5E5", template: true },
  { label: "CI Main Pink", color: "#E517E5", template: false },
  { label: "CI Main Red", color: "#E51717", template: true },
  { label: "CI Main Orange", color: "#E58017", template: false }
];

const SUPPORTING_COLORS = [
  { label: "CI Support Orange", color: "#E85C2E", template: true },
  { label: "CI Support Yellow", color: "#EBC247", template: true },
  { label: "CI Support Green I", color: "#C2EB47", template: false },
  { label: "CI Support Green II", color: "#82ED5E", template: false },
  { label: "CI Support Green III", color: "#47EB70", template: false },
  { label: "CI Support Cyan", color: "#5EEDC9", template: false },
  { label: "CI Support Blue I", color: "#47C2EB", template: true },
  { label: "CI Support Blue II", color: "#5E82ED", template: true },
  { label: "CI Support Purple I", color: "#8C6BED", template: false },
  { label: "CI Support Purple II", color: "#CC6BED", template: false },
  { label: "CI Support Pink I", color: "#EB47C2", template: false },
  { label: "CI Support Pink II", color: "#ED5E82", template: false }
];

// Minor characters: pastel hues at 30% saturation and 90% brightness (PDF p22).
const MINOR_HUES = [0, 342, 327, 313, 298, 282, 267, 251, 240, 222, 207, 193, 178, 162, 149, 133, 120, 102, 87, 73, 58, 40, 24, 7];

export function hsbToHex(hue: number, saturation: number, brightness: number): string {
  const h = ((Number(hue) % 360) + 360) % 360 / 60;
  const chroma = brightness * saturation;
  const x = chroma * (1 - Math.abs((h % 2) - 1));
  const [r, g, b] = h < 1 ? [chroma, x, 0]
    : h < 2 ? [x, chroma, 0]
      : h < 3 ? [0, chroma, x]
        : h < 4 ? [0, x, chroma]
          : h < 5 ? [x, 0, chroma]
            : [chroma, 0, x];
  const m = brightness - chroma;
  return `#${[r, g, b].map((channel) => Math.round((channel + m) * 255).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

export const SPEAKER_PALETTE: PaletteEntry[] = [
  ...MAIN_COLORS.map((entry) => ({ role: "main" as const, ...entry })),
  ...SUPPORTING_COLORS.map((entry) => ({ role: "supporting" as const, ...entry })),
  ...MINOR_HUES.map((hue) => ({ role: "minor" as const, label: `Minor Pastel ${hue}°`, color: hsbToHex(hue, 0.3, 0.9), template: false }))
];

export function hexToRgb(hex: string): [number, number, number] | null {
  const value = String(hex || "").trim().replace(/^#/, "");
  const full = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16)) as [number, number, number];
}

export function mixColor(from: string, to: string, amount: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  if (!a || !b) return amount >= 0.5 ? to : from;
  const t = clamp(amount, 0, 1);
  const mixed = a.map((channel, index) => Math.round(channel + (b[index] - channel) * t));
  return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
}

export function hueOf(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return NaN;
  const [r, g, b] = rgb.map((channel) => channel / 255);
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (delta === 0) return NaN;
  const hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return (hue * 60 + 360) % 360;
}

export function hueDistance(a: string, b: string): number {
  const hueA = hueOf(a);
  const hueB = hueOf(b);
  if (!Number.isFinite(hueA) || !Number.isFinite(hueB)) return 180;
  const distance = Math.abs(hueA - hueB) % 360;
  return Math.min(distance, 360 - distance);
}

// Volume 0-100 maps to a type-size multiplier: 0 = whisper (3%), 50 = normal (5%), 100 = shout (12%).
export function volumeScale(volumePercent: number): number {
  const volume = clamp(toNumber(volumePercent, NEUTRAL_VOLUME), 0, 100);
  const { minVolumeScale, maxVolumeScale } = CWI_STYLE.type;
  if (volume <= NEUTRAL_VOLUME) return minVolumeScale + (volume / NEUTRAL_VOLUME) * (1 - minVolumeScale);
  return 1 + ((volume - NEUTRAL_VOLUME) / (100 - NEUTRAL_VOLUME)) * (maxVolumeScale - 1);
}

// Equivalent share of screen height for the doc's 3% / 5% / 12% vocabulary.
export function volumeScreenPercent(volumePercent: number): number {
  return volumeScale(volumePercent) * 5;
}

export interface Tone {
  weight: number;
  width: number;
}

// Tone slider -1..1 walks the valid diagonal: -1 light+condensed (high, sharp voice),
// 0 Regular 400/100, 1 heavy+wide (deep, full voice).
export function toneFromSlider(tone: number): Tone {
  const value = clamp(toNumber(tone, 0), -1, 1);
  const { defaultWeight, defaultWidth } = CWI_STYLE.type;
  const { minWeight, maxWeight, minWidth } = CWI_STYLE.tone;
  if (value >= 0) {
    return { weight: Math.round(defaultWeight + value * (maxWeight - defaultWeight)), width: Math.round(defaultWidth + value * 50) };
  }
  return { weight: Math.round(defaultWeight + value * (defaultWeight - minWeight)), width: Math.round(defaultWidth + value * (defaultWidth - minWidth)) };
}

export function sliderFromTone(weight: number): number {
  const value = toNumber(weight, CWI_STYLE.type.defaultWeight);
  const { defaultWeight } = CWI_STYLE.type;
  const { minWeight, maxWeight } = CWI_STYLE.tone;
  if (value >= defaultWeight) return clamp((value - defaultWeight) / (maxWeight - defaultWeight), 0, 1);
  return clamp((value - defaultWeight) / (defaultWeight - minWeight), -1, 0);
}

// PDF p40 maps 80 Hz to wght 1000 / wdth 150 and 250 Hz to wght 100 / wdth 25; p39 keeps the
// typical 160-200 Hz voice at Regular 400 / 100. Interpolate between those anchors.
export function toneForPitchHz(hz: number): Tone {
  const value = clamp(toNumber(hz, 180), 80, 250);
  const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
  if (value < 160) {
    const t = (value - 80) / 80;
    return { weight: lerp(1000, 400, t), width: lerp(150, 100, t) };
  }
  if (value <= 200) return { weight: 400, width: 100 };
  const t = (value - 200) / 50;
  return { weight: lerp(400, 100, t), width: lerp(100, 25, t) };
}

export function toneBandOffset(weight: number, width: number): number {
  const { minWeight, maxWeight, minWidth, maxWidth } = CWI_STYLE.tone;
  const w = (toNumber(weight, CWI_STYLE.type.defaultWeight) - minWeight) / (maxWeight - minWeight);
  const d = (toNumber(width, CWI_STYLE.type.defaultWidth) - minWidth) / (maxWidth - minWidth);
  return w - d;
}

export function toneInBand(weight: number, width: number): boolean {
  return Math.abs(toneBandOffset(weight, width)) <= CWI_STYLE.tone.bandTolerance;
}
