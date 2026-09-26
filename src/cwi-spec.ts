// Caption with Intention style tokens, palette, and project schema helpers.
//
// Defaults follow the After Effects template (reference/AE PROJECT/Academy_CI_Template.aep):
// a 1920x1080 @ 30 fps comp, Roboto 27 px with a #DDDDDD fill, a box that is the text bounds
// plus 30 px per side and 20 px top/bottom in 80% black, an "Up" range selector that lifts the
// current word 5 px, and an "Antecipate" selector that dips the next word 2 px. The guideline doc
// and design-system PDF fill in what the template does not define: volume sizing, pitch axes,
// off-camera slant, music treatment, two-line stacking, and the minor-character palette.
// Renderer code should read every caption value from here instead of inlining numbers.

const CWI_SCHEMA_VERSION = 2;
const CWI_ASPECT_RATIOS = ["16:9", "9:16", "1:1"];
const CWI_WORD_MOTIONS = ["pop", "none", "syllable"];
const CWI_WORD_TIMINGS = ["aligned", "estimated", "manual"];
const CWI_NEUTRAL_VOLUME = 50;
const CWI_DEFAULT_FRAME_RATE = 30;

const CWI_STYLE = {
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
    estimatedEase: [0.33, 0, 0.667, 1],
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
  },
  // Doc 7.1: sound effects stay white but grow and pop in sync with the sound, as one unit.
  // (The AE sound-effect lines are static; set syncToSound to false for that look.)
  sound: { syncToSound: true },
  music: { glyph: "♫", animate: false }
};

// Local audio analysis that seeds word volume. Speech within the dead zone of the median level
// stays at the normal size; the full-scale offset reaches the whisper or shout limit.
const CWI_ANALYSIS = {
  silenceDb: -60,
  volumeDeadZoneDb: 3,
  volumeFullScaleDb: 12
};

// Main colors in the design-system slot order (PDF p16). Template colors are the eight
// swatches in the AE guide layer.
const CWI_MAIN_COLORS = [
  { label: "CI Main Yellow", color: "#E5E517", template: true },
  { label: "CI Main Green", color: "#17E517", template: true },
  { label: "CI Main Blue", color: "#17E5E5", template: true },
  { label: "CI Main Pink", color: "#E517E5", template: false },
  { label: "CI Main Red", color: "#E51717", template: true },
  { label: "CI Main Orange", color: "#E58017", template: false }
];

const CWI_SUPPORTING_COLORS = [
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
const CWI_MINOR_HUES = [0, 342, 327, 313, 298, 282, 267, 251, 240, 222, 207, 193, 178, 162, 149, 133, 120, 102, 87, 73, 58, 40, 24, 7];

const SPEAKER_PALETTE = [
  ...CWI_MAIN_COLORS.map((entry) => ({ role: "main", ...entry })),
  ...CWI_SUPPORTING_COLORS.map((entry) => ({ role: "supporting", ...entry })),
  ...CWI_MINOR_HUES.map((hue) => ({ role: "minor", label: `Minor Pastel ${hue}°`, color: cwiHsbToHex(hue, 0.3, 0.9), template: false }))
];

function cwiHsbToHex(hue, saturation, brightness) {
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

function cwiHexToRgb(hex) {
  const value = String(hex || "").trim().replace(/^#/, "");
  const full = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16));
}

function cwiMixColor(from, to, amount) {
  const a = cwiHexToRgb(from);
  const b = cwiHexToRgb(to);
  if (!a || !b) return amount >= 0.5 ? to : from;
  const t = cwiClamp(amount, 0, 1);
  const mixed = a.map((channel, index) => Math.round(channel + (b[index] - channel) * t));
  return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
}

function cwiHueOf(hex) {
  const rgb = cwiHexToRgb(hex);
  if (!rgb) return NaN;
  const [r, g, b] = rgb.map((channel) => channel / 255);
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  if (delta === 0) return NaN;
  const hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return (hue * 60 + 360) % 360;
}

function cwiHueDistance(a, b) {
  const hueA = cwiHueOf(a);
  const hueB = cwiHueOf(b);
  if (!Number.isFinite(hueA) || !Number.isFinite(hueB)) return 180;
  const distance = Math.abs(hueA - hueB) % 360;
  return Math.min(distance, 360 - distance);
}

function cwiClamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function cwiNumber(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

// Volume 0-100 maps to a type-size multiplier: 0 = whisper (3%), 50 = normal (5%), 100 = shout (12%).
function cwiVolumeScale(volumePercent) {
  const volume = cwiClamp(cwiNumber(volumePercent, CWI_NEUTRAL_VOLUME), 0, 100);
  const { minVolumeScale, maxVolumeScale } = CWI_STYLE.type;
  if (volume <= CWI_NEUTRAL_VOLUME) return minVolumeScale + (volume / CWI_NEUTRAL_VOLUME) * (1 - minVolumeScale);
  return 1 + ((volume - CWI_NEUTRAL_VOLUME) / (100 - CWI_NEUTRAL_VOLUME)) * (maxVolumeScale - 1);
}

// Equivalent share of screen height for the doc's 3% / 5% / 12% vocabulary.
function cwiVolumeScreenPercent(volumePercent) {
  return cwiVolumeScale(volumePercent) * 5;
}

// Tone slider -1..1 walks the valid diagonal: -1 light+condensed (high, sharp voice),
// 0 Regular 400/100, 1 heavy+wide (deep, full voice).
function cwiToneFromSlider(tone) {
  const value = cwiClamp(cwiNumber(tone, 0), -1, 1);
  const { defaultWeight, defaultWidth } = CWI_STYLE.type;
  const { minWeight, maxWeight, minWidth } = CWI_STYLE.tone;
  if (value >= 0) {
    return { weight: Math.round(defaultWeight + value * (maxWeight - defaultWeight)), width: Math.round(defaultWidth + value * 50) };
  }
  return { weight: Math.round(defaultWeight + value * (defaultWeight - minWeight)), width: Math.round(defaultWidth + value * (defaultWidth - minWidth)) };
}

function cwiSliderFromTone(weight) {
  const value = cwiNumber(weight, CWI_STYLE.type.defaultWeight);
  const { defaultWeight } = CWI_STYLE.type;
  const { minWeight, maxWeight } = CWI_STYLE.tone;
  if (value >= defaultWeight) return cwiClamp((value - defaultWeight) / (maxWeight - defaultWeight), 0, 1);
  return cwiClamp((value - defaultWeight) / (defaultWeight - minWeight), -1, 0);
}

// PDF p40 maps 80 Hz to wght 1000 / wdth 150 and 250 Hz to wght 100 / wdth 25; p39 keeps the
// typical 160-200 Hz voice at Regular 400 / 100. Interpolate between those anchors.
function cwiToneForPitchHz(hz) {
  const value = cwiClamp(cwiNumber(hz, 180), 80, 250);
  const lerp = (a, b, t) => Math.round(a + (b - a) * t);
  if (value < 160) {
    const t = (value - 80) / 80;
    return { weight: lerp(1000, 400, t), width: lerp(150, 100, t) };
  }
  if (value <= 200) return { weight: 400, width: 100 };
  const t = (value - 200) / 50;
  return { weight: lerp(400, 100, t), width: lerp(100, 25, t) };
}

function cwiToneBandOffset(weight, width) {
  const { minWeight, maxWeight, minWidth, maxWidth } = CWI_STYLE.tone;
  const w = (cwiNumber(weight, CWI_STYLE.type.defaultWeight) - minWeight) / (maxWeight - minWeight);
  const d = (cwiNumber(width, CWI_STYLE.type.defaultWidth) - minWidth) / (maxWidth - minWidth);
  return w - d;
}

function cwiToneInBand(weight, width) {
  return Math.abs(cwiToneBandOffset(weight, width)) <= CWI_STYLE.tone.bandTolerance;
}

function cwiNearestAspectRatio(width, height) {
  const ratio = Number(width) / Number(height);
  if (!Number.isFinite(ratio) || ratio <= 0) return "16:9";
  const candidates = CWI_ASPECT_RATIOS.map((aspect) => {
    const [w, h] = aspect.split(":").map(Number);
    return { aspect, distance: Math.abs(Math.log(ratio / (w / h))) };
  });
  return candidates.sort((a, b) => a.distance - b.distance)[0].aspect;
}

function cwiNormalizeException(value) {
  if (value && typeof value === "object") {
    return { color: Boolean(value.color), motion: Boolean(value.motion), intonation: Boolean(value.intonation) };
  }
  // Schema v1 stored a boolean; the doc's exception keeps sync and motion and drops speaker color.
  return { color: Boolean(value), motion: false, intonation: false };
}

function cwiHasException(cue) {
  const exception = cwiNormalizeException(cue && cue.exception);
  return exception.color || exception.motion || exception.intonation;
}

function cwiNormalizeWord(word, cue, cueId, wordIndex) {
  const start = cwiNumber(word.start, cwiNumber(cue.start, 0));
  const end = cwiNumber(word.end, cwiNumber(cue.end, start + 0.5));
  const units = Array.isArray(word.units)
    ? word.units
      .map((unit) => ({ text: String(unit && unit.text || ""), start: cwiNumber(unit && unit.start, NaN) }))
      .filter((unit) => unit.text)
    : [];
  return {
    id: String(word.id || `${cueId}-word-${wordIndex + 1}`),
    text: String(word.text || ""),
    start: cwiRoundTime(start),
    end: cwiRoundTime(end),
    volumePercent: cwiClamp(cwiNumber(word.volumePercent, CWI_NEUTRAL_VOLUME), 0, 100),
    pitchWeight: cwiClamp(cwiNumber(word.pitchWeight, CWI_STYLE.type.defaultWeight), CWI_STYLE.tone.minWeight, CWI_STYLE.tone.maxWeight),
    pitchWidth: cwiClamp(cwiNumber(word.pitchWidth, CWI_STYLE.type.defaultWidth), CWI_STYLE.tone.minWidth, CWI_STYLE.tone.maxWidth),
    motion: CWI_WORD_MOTIONS.includes(word.motion) ? word.motion : "pop",
    timing: CWI_WORD_TIMINGS.includes(word.timing) ? word.timing : "aligned",
    burst: Boolean(word.burst),
    ...(units.length ? { units } : {})
  };
}

function cwiNormalizeCue(cue, index) {
  const id = String(cue.id || `cue-${index + 1}`);
  const words = Array.isArray(cue.words) ? cue.words.map((word, wordIndex) => cwiNormalizeWord(word || {}, cue, id, wordIndex)) : [];
  const start = cwiNumber(cue.start, words.length ? Math.min(...words.map((word) => word.start)) : 0);
  const end = cwiNumber(cue.end, Math.max(start + 0.5, ...words.map((word) => word.end)));
  return {
    id,
    type: CUE_TYPES.includes(cue.type) ? cue.type : "dialogue",
    speakerId: String(cue.speakerId || ""),
    start: cwiRoundTime(start),
    end: cwiRoundTime(end),
    text: String(cue.text || words.map((word) => word.text).join(" ")),
    lineBreakAfterWordIds: Array.isArray(cue.lineBreakAfterWordIds) ? cue.lineBreakAfterWordIds.map(String) : [],
    exception: cwiNormalizeException(cue.exception),
    offCamera: Boolean(cue.offCamera),
    words
  };
}

// Normalizes any v1 or v2 CWI document into the current schema. `fallback` supplies project
// fields that belong to the local session (media name, duration) when the file omits them.
function cwiNormalizeProject(raw, fallback: any = {}) {
  if (!raw || typeof raw !== "object") throw new Error("JSON must be an object with project, speakers, and cues.");
  if (!raw.project || !Array.isArray(raw.speakers) || !Array.isArray(raw.cues)) {
    throw new Error("JSON must include project, speakers, and cues arrays.");
  }

  return {
    schemaVersion: CWI_SCHEMA_VERSION,
    project: {
      id: String(raw.project.id || "imported-cwi-project"),
      title: String(raw.project.title || "Imported CWI Project"),
      aspectRatio: CWI_ASPECT_RATIOS.includes(raw.project.aspectRatio) ? raw.project.aspectRatio : "16:9",
      mediaName: String(raw.project.mediaName || fallback.mediaName || "Local media"),
      duration: cwiNumber(raw.project.duration, 0) || cwiNumber(fallback.duration, 0),
      frameRate: cwiNumber(raw.project.frameRate, 0) > 0 ? Number(raw.project.frameRate) : CWI_DEFAULT_FRAME_RATE
    },
    speakers: raw.speakers.map((speaker, index) => ({
      id: String(speaker.id || `speaker-${index + 1}`),
      name: String(speaker.name || `Speaker ${index + 1}`),
      role: SPEAKER_ROLES.includes(speaker.role) ? String(speaker.role) : "supporting",
      color: String(speaker.color || SPEAKER_PALETTE[index % SPEAKER_PALETTE.length].color),
      defaultOffCamera: Boolean(speaker.defaultOffCamera)
    })),
    cues: raw.cues.map((cue, index) => cwiNormalizeCue(cue || {}, index)),
    review: {
      notes: raw.review && Array.isArray(raw.review.notes) ? raw.review.notes.map(String) : [],
      validationStatus: raw.review && raw.review.validationStatus ? String(raw.review.validationStatus) : "unchecked"
    }
  };
}

function cwiRoundTime(value) {
  return Math.round(Number(value) * 100) / 100;
}
