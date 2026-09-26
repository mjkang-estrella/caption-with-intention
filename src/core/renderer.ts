// Pure Caption with Intention renderer: (project, time, viewport) -> caption frame state.
//
// Nothing here touches the DOM. The editor preview projects the frame state onto persistent
// nodes, the tests assert against it directly, and a burned-in export can draw the same state.
//
// Motion model (AE template): every live cue has a continuous word cursor. Word i starts to
// color and lift when the cursor passes i, is fully colored and at peak lift at i + 1, and
// settles back as the next word rises (the "Up" selector is one word wide). Aligned word
// timing drives the cursor through each word's audible onset; cues without aligned timing use
// the template's own formula, cursor = N * ease(p) + p between the START and END markers.

import type {
  AspectRatio, Cue, CueLayout, CueTiming, DisplayWord, FrameLine, FrameState, FrameWord, LayoutWord,
  MeasureFn, Project, TypeStyle, Viewport, Word
} from "./types.ts";
import { CWI_STYLE, NEUTRAL_VOLUME, mixColor, volumeScale } from "./style.ts";
import type { LayoutTokens } from "./style.ts";
import { normalizeException } from "./schema.ts";
import { clamp, roundTime, toNumber } from "./util.ts";

export type LayoutProvider = (cue: Cue) => CueLayout;

interface TimeWindow {
  start: number;
  end: number;
}

type Knot = [time: number, value: number];

export function layoutTokens(aspectRatio: AspectRatio | undefined): LayoutTokens {
  return (aspectRatio && CWI_STYLE.layout[aspectRatio]) || CWI_STYLE.layout["16:9"];
}

export function baseFontPxFor(viewport: Viewport): number {
  return Math.max(CWI_STYLE.type.minFontPx, Number(viewport.height) * CWI_STYLE.type.baseSizeRatio);
}

export function smooth(value: number): number {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

export function easeOut(value: number): number {
  const t = clamp(value, 0, 1);
  return 1 - (1 - t) * (1 - t);
}

// CSS-style cubic-bezier timing function solved for x by bisection.
export function cubicBezier(progress: number, curve: [number, number, number, number]): number {
  const [x1, y1, x2, y2] = curve;
  const t = clamp(progress, 0, 1);
  if (t === 0 || t === 1) return t;
  const sample = (a: number, b: number, u: number) => 3 * a * u * (1 - u) * (1 - u) + 3 * b * u * u * (1 - u) + u * u * u;
  let low = 0;
  let high = 1;
  let u = t;
  for (let iteration = 0; iteration < 32; iteration += 1) {
    u = (low + high) / 2;
    if (sample(x1, x2, u) < t) low = u;
    else high = u;
  }
  return sample(y1, y2, u);
}

export function stripDecorators(text: string): string {
  return String(text || "")
    .replace(/^\s*[♪♫]\s*/, "")
    .replace(/\s*[♪♫]\s*$/, "")
    .replace(/^\s*\[/, "")
    .replace(/\]\s*$/, "");
}

export function cueDisplayText(cue: Cue | null | undefined): string {
  if (!cue) return "";
  const text = stripDecorators(cue.text);
  if (cue.type === "sound") return `[${text}]`;
  if (cue.type === "music") return `${CWI_STYLE.music.glyph} [${text}] ${CWI_STYLE.music.glyph}`;
  return String(cue.text || "");
}

// Words as they are drawn: sound and music cues get their brackets and notes attached to the
// first and last word, so the decorators never need to live in the stored transcript.
export function cueDisplayWords(cue: Cue): DisplayWord[] {
  const stored = Array.isArray(cue.words) && cue.words.length ? cue.words : fallbackWords(cue);
  if (cue.type === "dialogue") return stored.map((word) => ({ word, text: String(word.text || "") }));

  const words = stored
    .map((word) => ({ word, text: stripDecorators(word.text).trim() }))
    .filter((item) => item.text);
  if (!words.length) return [];
  const prefix = cue.type === "music" ? `${CWI_STYLE.music.glyph} [` : "[";
  const suffix = cue.type === "music" ? `] ${CWI_STYLE.music.glyph}` : "]";
  words[0] = { ...words[0], text: `${prefix}${words[0].text}` };
  words[words.length - 1] = { ...words[words.length - 1], text: `${words[words.length - 1].text}${suffix}` };
  return words;
}

export function fallbackWords(cue: Cue): Word[] {
  return String(stripDecorators(cue.text) || "").split(/\s+/).filter(Boolean).map((text, index) => ({
    id: `${cue.id}-generated-${index}`,
    text,
    start: cue.start,
    end: cue.end,
    volumePercent: NEUTRAL_VOLUME,
    pitchWeight: CWI_STYLE.type.defaultWeight,
    pitchWidth: CWI_STYLE.type.defaultWidth,
    motion: "pop",
    timing: "estimated"
  }));
}

// A word rests in plain caption type (base size, Regular 400/100) before and after it is spoken.
// Its intonation (volume size, pitch weight and width) is the peak style it grows into while it
// is spoken, then settles back from, as the doc's pop returns to the original size (4.3).
export function wordStyles(cue: Cue, word: Word, baseFontPx: number): { rest: TypeStyle; peak: TypeStyle } {
  const slant = cue.offCamera ? CWI_STYLE.type.offCameraSlant : 0;
  const rest = { fontPx: baseFontPx, weight: CWI_STYLE.type.defaultWeight, width: CWI_STYLE.type.defaultWidth, slant };
  if (normalizeException(cue.exception).intonation) return { rest, peak: rest };
  return {
    rest,
    peak: {
      fontPx: baseFontPx * volumeScale(word.volumePercent),
      weight: clamp(toNumber(word.pitchWeight, CWI_STYLE.type.defaultWeight), CWI_STYLE.tone.minWeight, CWI_STYLE.tone.maxWeight),
      width: clamp(toNumber(word.pitchWidth, CWI_STYLE.type.defaultWidth), CWI_STYLE.tone.minWidth, CWI_STYLE.tone.maxWidth),
      slant
    }
  };
}

export function lerpStyle(rest: TypeStyle, peak: TypeStyle, amount: number): TypeStyle {
  if (amount <= 0) return rest;
  if (amount >= 1) return peak;
  const lerp = (a: number, b: number) => a + (b - a) * amount;
  return { fontPx: lerp(rest.fontPx, peak.fontPx), weight: lerp(rest.weight, peak.weight), width: lerp(rest.width, peak.width), slant: rest.slant };
}

export function layoutSignature(project: Project, cue: Cue, viewport: Viewport): string {
  return JSON.stringify([
    viewport.width,
    viewport.height,
    project.project?.aspectRatio,
    cue.type,
    cue.text,
    cue.offCamera,
    cue.exception,
    cue.lineBreakAfterWordIds,
    (cue.words || []).map((word) => [word.id, word.text, word.volumePercent, word.pitchWeight, word.pitchWidth, word.burst, word.motion, word.units])
  ]);
}

// Static geometry for one cue: which words go on which line and the resting box around each line.
// Emphasized words grow and push their neighbors while spoken (computeFrame), so line breaks
// are chosen at the widest moment: the resting line plus the largest single-word growth. Adjacent
// words hand the emphasis over (their amounts sum to 1), so a line never grows past that.
export function layoutCue(project: Project, cue: Cue, viewport: Viewport, measure: MeasureFn): CueLayout {
  const tokens = layoutTokens(project.project?.aspectRatio);
  const baseFontPx = baseFontPxFor(viewport);
  const padX = baseFontPx * CWI_STYLE.box.padXEm;
  const padY = baseFontPx * CWI_STYLE.box.padYEm;
  const maxBoxWidth = viewport.width * tokens.maxLineWidthRatio;
  const measureStyle = (text: string, style: TypeStyle) => measure(text, style.fontPx, style.weight, style.width, style.slant);

  const items: LayoutWord[] = cueDisplayWords(cue).map(({ word, text }, index) => {
    const { rest, peak } = wordStyles(cue, word, baseFontPx);
    const restWidth = measureStyle(text, rest);
    const peakWidth = peak === rest ? restWidth : measureStyle(text, peak);
    const units = word.units;
    const syllables = Array.isArray(units) && units.length > 1 && units.map((unit) => unit.text).join("") === text;
    return {
      index,
      word,
      text,
      rest,
      peak,
      restWidth,
      peakWidth,
      spaceWidth: measureStyle(" ", rest),
      units: word.motion === "syllable" && syllables && units && cue.type === "dialogue" ? units.map((unit) => ({ text: String(unit.text) })) : null,
      x: 0
    };
  });

  const restLineWidth = (lineItems: LayoutWord[]) => lineItems.reduce((sum, item, index) => sum + item.restWidth + (index < lineItems.length - 1 ? item.spaceWidth : 0), 0) + padX * 2;
  const peakLineWidth = (lineItems: LayoutWord[]) => restLineWidth(lineItems) + Math.max(0, ...lineItems.map((item) => item.peakWidth - item.restWidth));
  const breakIds = new Set(cue.lineBreakAfterWordIds || []);
  const manualBreaks = items.filter((item, index) => index < items.length - 1 && breakIds.has(item.word.id)).map((item) => item.index);

  let groups = [items];
  if (manualBreaks.length) {
    const split = manualBreaks[0] + 1;
    groups = [items.slice(0, split), items.slice(split)];
  } else if (items.length > 1 && peakLineWidth(items) > maxBoxWidth) {
    let best: { groups: LayoutWord[][]; widest: number } | null = null;
    for (let split = 1; split < items.length; split += 1) {
      const candidate = [items.slice(0, split), items.slice(split)];
      const widest = Math.max(peakLineWidth(candidate[0]), peakLineWidth(candidate[1]));
      if (!best || widest < best.widest) best = { groups: candidate, widest };
    }
    if (best) groups = best.groups;
  }

  const restAscent = baseFontPx * CWI_STYLE.type.ascentEm;
  const restDescent = baseFontPx * CWI_STYLE.type.descentEm;
  const lines = groups.filter((group) => group.length).map((group) => {
    let x = padX;
    const words = group.map((item, index) => {
      const placed = { ...item, x };
      x += item.restWidth + (index < group.length - 1 ? item.spaceWidth : 0);
      return placed;
    });
    return {
      words,
      width: x + padX,
      peakWidth: peakLineWidth(group),
      height: restAscent + restDescent + padY * 2,
      baseline: padY + restAscent
    };
  });

  return {
    cueId: cue.id,
    signature: layoutSignature(project, cue, viewport),
    baseFontPx,
    padX,
    padY,
    maxBoxWidth,
    lines,
    manualBreakCount: manualBreaks.length,
    overflow: lines.some((line) => line.peakWidth > maxBoxWidth + 0.5) || manualBreaks.length > 1
  };
}

export function isTimedCue(cue: Cue): boolean {
  return cue.type === "dialogue" || (cue.type === "sound" && CWI_STYLE.sound.syncToSound) || (cue.type === "music" && CWI_STYLE.music.animate);
}

export function usesEstimatedTiming(words: Word[]): boolean {
  return !words.length || words.every((word) => word.timing === "estimated") ||
    words.some((word) => !Number.isFinite(Number(word.start)));
}

// AE's START/END markers for a cue without aligned word timing.
export function estimatedWindow(cue: Pick<Cue, "start" | "end">): TimeWindow {
  const start = Number(cue.start);
  const end = Number(cue.end);
  const insetEnd = end - CWI_STYLE.motion.estimatedEndInsetSeconds;
  return { start, end: insetEnd > start + 0.05 ? insetEnd : Math.max(start + 0.01, end) };
}

export function estimatedCursor(count: number, time: number, window: TimeWindow): number {
  const p = clamp((time - window.start) / (window.end - window.start), 0, 1);
  return count * cubicBezier(p, CWI_STYLE.motion.estimatedEase) + p;
}

// Time at which the estimated cursor reaches `index` (the cursor is monotonic).
export function estimatedTimeForCursor(count: number, index: number, window: TimeWindow): number {
  let low = window.start;
  let high = window.end;
  for (let iteration = 0; iteration < 40; iteration += 1) {
    const mid = (low + high) / 2;
    if (estimatedCursor(count, mid, window) < index) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

// Word start/end times that reproduce the AE distribution, used to seed imported cues so the
// timeline shows where each word will animate.
export function estimatedWordTimes(cue: Pick<Cue, "start" | "end">, count: number): { start: number; end: number }[] {
  const window = estimatedWindow(cue);
  return Array.from({ length: count }, (_, index) => ({
    start: roundTime(estimatedTimeForCursor(count, index, window)),
    end: roundTime(index === count - 1 ? window.end : estimatedTimeForCursor(count, index + 1, window))
  }));
}

export function alignedKnots(onsets: number[], ends: number[]): Knot[] {
  const count = onsets.length;
  const { maxRiseSeconds, settleSeconds } = CWI_STYLE.motion;
  const knots: Knot[] = [];
  const push = (time: number, value: number) => {
    const previous = knots.length ? knots[knots.length - 1][0] : -Infinity;
    knots.push([Math.max(time, previous), value]);
  };
  for (let index = 0; index < count; index += 1) {
    const onset = onsets[index];
    push(onset, index);
    if (index < count - 1) {
      push(Math.min(onsets[index + 1], onset + maxRiseSeconds), index + 1);
    } else {
      const end = Math.max(Number.isFinite(ends[index]) ? ends[index] : onset, onset);
      const peak = Math.min(end > onset ? end : onset + maxRiseSeconds, onset + maxRiseSeconds);
      push(peak, count);
      push(Math.max(end, peak), count);
      push(Math.max(end, peak) + settleSeconds, count + 1);
    }
  }
  return knots;
}

export function knotValue(knots: Knot[], time: number): number {
  if (!knots.length || time < knots[0][0]) return 0;
  // Walk back to the latest knot at or before `time`; equal-time knots resolve to the later one.
  for (let index = knots.length - 1; index >= 0; index -= 1) {
    const [knotTime, value] = knots[index];
    if (time >= knotTime) {
      const next = knots[index + 1];
      if (!next) return value;
      return value + (next[1] - value) * ((time - knotTime) / (next[0] - knotTime));
    }
  }
  return 0;
}

// Per-word cursor state for a cue at `time`: the continuous cursor and each word's onset.
// Sound effects are one event: every word shares a single unit that rises at the sound's onset,
// holds while the sound lasts, and settles when it ends.
export function cueTiming(cue: Cue, displayWords: DisplayWord[], time: number): CueTiming {
  const words = displayWords.map((item) => item.word);
  if (cue.type !== "dialogue") {
    const estimated = usesEstimatedTiming(words);
    const onset = estimated ? Number(cue.start) : Math.min(...words.map((word) => Number(word.start)));
    const end = estimated ? estimatedWindow(cue).end : Math.max(...words.map((word) => Number(word.end)));
    return { estimated, phrase: true, cursor: knotValue(alignedKnots([onset], [end]), time), onsets: [onset] };
  }
  const count = words.length;
  if (usesEstimatedTiming(words)) {
    const window = estimatedWindow(cue);
    return {
      estimated: true,
      cursor: estimatedCursor(count, time, window),
      onsets: words.map((_, index) => estimatedTimeForCursor(count, index, window))
    };
  }
  const onsets = words.map((word) => Number(word.start));
  const ends = words.map((word) => Number(word.end));
  return { estimated: false, cursor: knotValue(alignedKnots(onsets, ends), time), onsets };
}

export function syllableLifts(word: Word, time: number): number[] {
  const units = word.units || [];
  const start = Number(word.start);
  const end = Math.max(Number(word.end), start + 0.01);
  const onsets = units.map((unit, index) => Number.isFinite(Number(unit.start)) ? Number(unit.start) : start + ((end - start) * index) / units.length);
  const ends = units.map((_, index) => index < units.length - 1 ? onsets[index + 1] : end);
  const cursor = knotValue(alignedKnots(onsets, ends), time);
  return units.map((_, index) => smooth(1 - Math.abs(cursor - (index + 1))));
}

export function spokenColorFor(project: Project, cue: Cue): string {
  if (cue.type !== "dialogue") return CWI_STYLE.type.exceptionSpokenColor;
  if (normalizeException(cue.exception).color) return CWI_STYLE.type.exceptionSpokenColor;
  const speaker = (project.speakers || []).find((item) => item.id === cue.speakerId);
  return speaker ? speaker.color : CWI_STYLE.type.exceptionSpokenColor;
}

export function liveCues(project: Project, time: number): Cue[] {
  return (project.cues || [])
    .filter((cue) => time >= Number(cue.start) && time <= Number(cue.end))
    .sort((a, b) => Number(a.start) - Number(b.start));
}

interface WordState {
  item: LayoutWord;
  style: TypeStyle;
  advance: number;
  emphasis: number;
  colorAmount: number;
  lift: number;
  dip: number;
  unitLifts: number[] | null;
}

// Full frame state. `getLayout(cue)` returns layoutCue output (the app caches it; tests call
// layoutCue directly). Lines stack bottom-up with the earliest line on top (PDF p44-45).
export function computeFrame(
  project: Project,
  time: number,
  viewport: Viewport,
  getLayout: LayoutProvider,
  options: { reducedMotion?: boolean } = {}
): FrameState {
  const tokens = layoutTokens(project.project?.aspectRatio);
  const reducedMotion = Boolean(options.reducedMotion);
  const readAhead = CWI_STYLE.type.readAheadColor;
  const { liftEm, anticipationDipEm, anticipationSeconds, popScale } = CWI_STYLE.motion;

  const entries = liveCues(project, time).flatMap((cue) => {
    const layout = getLayout(cue);
    return layout.lines.map((line, lineIndex) => ({ cue, layout, line, lineIndex }));
  });
  const droppedLines = Math.max(0, entries.length - CWI_STYLE.stack.maxLines);
  const visible = entries.slice(droppedLines);

  const cueMotion = new Map<string, CueTiming | null>();
  const motionFor = (cue: Cue): CueTiming | null => {
    if (!cueMotion.has(cue.id)) {
      cueMotion.set(cue.id, isTimedCue(cue) ? cueTiming(cue, cueDisplayWords(cue), time) : null);
    }
    return cueMotion.get(cue.id) ?? null;
  };

  // Per-frame line geometry: each word's current style and advance, the neighbors it pushes,
  // and the box that follows the text (the AE box tracks sourceRectAtTime every frame).
  const measured = visible.map(({ cue, layout, line }) => {
    const timing = motionFor(cue);
    const exception = normalizeException(cue.exception);
    const motionAllowed = !reducedMotion && !exception.motion;

    const states: WordState[] = line.words.map((item) => {
      const wordIndex = item.index;
      let colorAmount = 0;
      let lift = 0;
      let dip = 0;
      let unitLifts: number[] | null = null;
      // Untimed cues (static sound effects and music) are one event, shown at their size throughout.
      let emphasis = timing ? 0 : 1;

      if (timing) {
        const unitIndex = timing.phrase ? 0 : wordIndex;
        const progress = timing.cursor - unitIndex;
        const window = smooth(1 - Math.abs(timing.cursor - (unitIndex + 1)));
        // Only dialogue takes the speaker color; sound effects stay white (doc 7.1).
        colorAmount = cue.type === "dialogue" ? smooth(progress) : 0;
        emphasis = reducedMotion ? 0 : window;
        const wordMotion = item.word.motion || "pop";
        if (motionAllowed && wordMotion !== "none") {
          if (item.units && wordMotion === "syllable") unitLifts = syllableLifts(item.word, time);
          else lift = window;
          const onset = timing.onsets[unitIndex];
          if (time < onset) {
            dip = time >= onset - anticipationSeconds ? easeOut((time - (onset - anticipationSeconds)) / anticipationSeconds) : 0;
          } else {
            const lead = Math.min(anticipationSeconds, Math.max(0, onset - Number(cue.start)));
            dip = easeOut(lead / anticipationSeconds) * (1 - smooth(progress));
          }
        }
      }

      const style = lerpStyle(item.rest, item.peak, emphasis);
      const advance = item.restWidth + (item.peakWidth - item.restWidth) * emphasis;
      return { item, style, advance, emphasis, colorAmount, lift, dip, unitLifts };
    });

    let x = layout.padX;
    const positions = states.map((state, index) => {
      const position = x;
      x += state.advance + (index < states.length - 1 ? state.item.spaceWidth : 0);
      return position;
    });
    // Loud "burst" words may break out of the box vertically (doc 5.3).
    const boxed = states.filter((state) => !state.item.word.burst);
    const ascent = Math.max(layout.baseFontPx * CWI_STYLE.type.ascentEm, ...boxed.map((state) => state.style.fontPx * CWI_STYLE.type.ascentEm));
    const descent = Math.max(layout.baseFontPx * CWI_STYLE.type.descentEm, ...boxed.map((state) => state.style.fontPx * CWI_STYLE.type.descentEm));
    return { timing, states, positions, width: x + layout.padX, height: ascent + descent + layout.padY * 2, baseline: layout.padY + ascent };
  });

  let bottom = viewport.height * (1 - tokens.bottomMarginRatio);
  const gap = viewport.height * CWI_STYLE.stack.lineGapRatio;
  const placed: { x: number; y: number }[] = [];
  for (let index = visible.length - 1; index >= 0; index -= 1) {
    const geometry = measured[index];
    const y = bottom - geometry.height;
    placed[index] = { x: (viewport.width - geometry.width) / 2, y };
    bottom = y - gap;
  }

  const lines: FrameLine[] = visible.map(({ cue, layout, lineIndex }, index) => {
    const geometry = measured[index];
    const spokenColor = spokenColorFor(project, cue);

    const words: FrameWord[] = geometry.states.map((state, wordIndex) => {
      const { item, style, lift, dip, unitLifts } = state;
      return {
        id: item.word.id,
        text: item.text,
        x: geometry.positions[wordIndex],
        baseline: geometry.baseline,
        fontPx: style.fontPx,
        weight: style.weight,
        width: style.width,
        slant: style.slant,
        advance: state.advance,
        emphasis: state.emphasis,
        color: geometry.timing && cue.type === "dialogue" ? mixColor(readAhead, spokenColor, state.colorAmount) : readAhead,
        colorAmount: state.colorAmount,
        lift,
        dip,
        offsetY: style.fontPx * (anticipationDipEm * dip - liftEm * lift),
        scale: 1 + (popScale - 1) * lift,
        units: item.units ? item.units.map((unit, unitIndex) => ({
          text: unit.text,
          lift: unitLifts ? unitLifts[unitIndex] : 0,
          offsetY: unitLifts ? -style.fontPx * liftEm * unitLifts[unitIndex] : 0
        })) : null
      };
    });

    return {
      key: `${cue.id}:${lineIndex}`,
      cueId: cue.id,
      cueType: cue.type,
      lineIndex,
      signature: layout.signature,
      box: { x: placed[index].x, y: placed[index].y, width: geometry.width, height: geometry.height },
      words
    };
  });

  const maxLineWidth = viewport.width * tokens.maxLineWidthRatio;
  return {
    time,
    width: viewport.width,
    height: viewport.height,
    boxFill: CWI_STYLE.box.fill,
    lines,
    droppedLines,
    guide: {
      left: (viewport.width - maxLineWidth) / 2,
      width: maxLineWidth,
      top: viewport.height * (1 - CWI_STYLE.stack.workAreaRatio),
      bottom: viewport.height * (1 - tokens.bottomMarginRatio)
    }
  };
}

// Largest number of caption lines that are on screen together, sampled at every cue start.
export function maxSimultaneousLines(project: Project, getLayout: LayoutProvider): { count: number; time: number } {
  let worst = { count: 0, time: 0 };
  (project.cues || []).forEach((cue) => {
    const time = Number(cue.start);
    const count = liveCues(project, time).reduce((sum, live) => sum + getLayout(live).lines.length, 0);
    if (count > worst.count) worst = { count, time };
  });
  return worst;
}
