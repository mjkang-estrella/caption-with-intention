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

function cwiLayoutTokens(aspectRatio) {
  return CWI_STYLE.layout[aspectRatio] || CWI_STYLE.layout["16:9"];
}

function cwiBaseFontPx(viewport) {
  return Math.max(CWI_STYLE.type.minFontPx, Number(viewport.height) * CWI_STYLE.type.baseSizeRatio);
}

function cwiSmooth(value) {
  const t = cwiClamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function cwiEaseOut(value) {
  const t = cwiClamp(value, 0, 1);
  return 1 - (1 - t) * (1 - t);
}

// CSS-style cubic-bezier timing function solved for x by bisection.
function cwiCubicBezier(progress, curve) {
  const [x1, y1, x2, y2] = curve;
  const t = cwiClamp(progress, 0, 1);
  if (t === 0 || t === 1) return t;
  const sample = (a, b, u) => 3 * a * u * (1 - u) * (1 - u) + 3 * b * u * u * (1 - u) + u * u * u;
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

function cwiStripDecorators(text) {
  return String(text || "")
    .replace(/^\s*[♪♫]\s*/, "")
    .replace(/\s*[♪♫]\s*$/, "")
    .replace(/^\s*\[/, "")
    .replace(/\]\s*$/, "");
}

function cwiCueDisplayText(cue) {
  if (!cue) return "";
  const text = cwiStripDecorators(cue.text);
  if (cue.type === "sound") return `[${text}]`;
  if (cue.type === "music") return `${CWI_STYLE.music.glyph} [${text}] ${CWI_STYLE.music.glyph}`;
  return String(cue.text || "");
}

// Words as they are drawn: sound and music cues get their brackets and notes attached to the
// first and last word, so the decorators never need to live in the stored transcript.
function cwiCueDisplayWords(cue) {
  const stored = Array.isArray(cue.words) && cue.words.length ? cue.words : cwiFallbackWords(cue);
  if (cue.type === "dialogue") return stored.map((word) => ({ word, text: String(word.text || "") }));

  const words = stored
    .map((word) => ({ word, text: cwiStripDecorators(word.text).trim() }))
    .filter((item) => item.text);
  if (!words.length) return [];
  const prefix = cue.type === "music" ? `${CWI_STYLE.music.glyph} [` : "[";
  const suffix = cue.type === "music" ? `] ${CWI_STYLE.music.glyph}` : "]";
  words[0] = { ...words[0], text: `${prefix}${words[0].text}` };
  words[words.length - 1] = { ...words[words.length - 1], text: `${words[words.length - 1].text}${suffix}` };
  return words;
}

function cwiFallbackWords(cue) {
  return String(cwiStripDecorators(cue.text) || "").split(/\s+/).filter(Boolean).map((text, index) => ({
    id: `${cue.id}-generated-${index}`,
    text,
    start: cue.start,
    end: cue.end,
    volumePercent: CWI_NEUTRAL_VOLUME,
    pitchWeight: CWI_STYLE.type.defaultWeight,
    pitchWidth: CWI_STYLE.type.defaultWidth,
    motion: "pop",
    timing: "estimated"
  }));
}

// A word rests in plain caption type (base size, Regular 400/100) before and after it is spoken.
// Its intonation (volume size, pitch weight and width) is the peak style it grows into while it
// is spoken, then settles back from, as the doc's pop returns to the original size (4.3).
function cwiWordStyles(cue, word, baseFontPx) {
  const slant = cue.offCamera ? CWI_STYLE.type.offCameraSlant : 0;
  const rest = { fontPx: baseFontPx, weight: CWI_STYLE.type.defaultWeight, width: CWI_STYLE.type.defaultWidth, slant };
  if (cwiNormalizeException(cue.exception).intonation) return { rest, peak: rest };
  return {
    rest,
    peak: {
      fontPx: baseFontPx * cwiVolumeScale(word.volumePercent),
      weight: cwiClamp(cwiNumber(word.pitchWeight, CWI_STYLE.type.defaultWeight), CWI_STYLE.tone.minWeight, CWI_STYLE.tone.maxWeight),
      width: cwiClamp(cwiNumber(word.pitchWidth, CWI_STYLE.type.defaultWidth), CWI_STYLE.tone.minWidth, CWI_STYLE.tone.maxWidth),
      slant
    }
  };
}

function cwiLerpStyle(rest, peak, amount) {
  if (amount <= 0) return rest;
  if (amount >= 1) return peak;
  const lerp = (a, b) => a + (b - a) * amount;
  return { fontPx: lerp(rest.fontPx, peak.fontPx), weight: lerp(rest.weight, peak.weight), width: lerp(rest.width, peak.width), slant: rest.slant };
}

function cwiLayoutSignature(project, cue, viewport) {
  return JSON.stringify([
    viewport.width,
    viewport.height,
    project.project && project.project.aspectRatio,
    cue.type,
    cue.text,
    cue.offCamera,
    cue.exception,
    cue.lineBreakAfterWordIds,
    (cue.words || []).map((word) => [word.id, word.text, word.volumePercent, word.pitchWeight, word.pitchWidth, word.burst, word.motion, word.units])
  ]);
}

// Static geometry for one cue: which words go on which line and the resting box around each line.
// Emphasized words grow and push their neighbors while spoken (cwiComputeFrame), so line breaks
// are chosen at the widest moment: the resting line plus the largest single-word growth. Adjacent
// words hand the emphasis over (their amounts sum to 1), so a line never grows past that.
// `measure(text, fontPx, weight, width, slant)` returns an advance width.
function cwiLayoutCue(project, cue, viewport, measure) {
  const tokens = cwiLayoutTokens(project.project && project.project.aspectRatio);
  const baseFontPx = cwiBaseFontPx(viewport);
  const padX = baseFontPx * CWI_STYLE.box.padXEm;
  const padY = baseFontPx * CWI_STYLE.box.padYEm;
  const maxBoxWidth = viewport.width * tokens.maxLineWidthRatio;
  const measureStyle = (text, style) => measure(text, style.fontPx, style.weight, style.width, style.slant);

  const items = cwiCueDisplayWords(cue).map(({ word, text }, index) => {
    const { rest, peak } = cwiWordStyles(cue, word, baseFontPx);
    const restWidth = measureStyle(text, rest);
    const peakWidth = peak === rest ? restWidth : measureStyle(text, peak);
    const syllables = Array.isArray(word.units) && word.units.length > 1 && word.units.map((unit) => unit.text).join("") === text;
    const units = word.motion === "syllable" && syllables && cue.type === "dialogue"
      ? word.units.map((unit) => ({ text: String(unit.text) }))
      : null;
    return { index, word, text, rest, peak, restWidth, peakWidth, spaceWidth: measureStyle(" ", rest), units };
  });

  const restLineWidth = (lineItems) => lineItems.reduce((sum, item, index) => sum + item.restWidth + (index < lineItems.length - 1 ? item.spaceWidth : 0), 0) + padX * 2;
  const peakLineWidth = (lineItems) => restLineWidth(lineItems) + Math.max(0, ...lineItems.map((item) => item.peakWidth - item.restWidth));
  const breakIds = new Set(cue.lineBreakAfterWordIds || []);
  const manualBreaks = items.filter((item, index) => index < items.length - 1 && breakIds.has(item.word.id)).map((item) => item.index);

  let groups = [items];
  if (manualBreaks.length) {
    const split = manualBreaks[0] + 1;
    groups = [items.slice(0, split), items.slice(split)];
  } else if (items.length > 1 && peakLineWidth(items) > maxBoxWidth) {
    let best = null;
    for (let split = 1; split < items.length; split += 1) {
      const candidate = [items.slice(0, split), items.slice(split)];
      const widest = Math.max(peakLineWidth(candidate[0]), peakLineWidth(candidate[1]));
      if (!best || widest < best.widest) best = { groups: candidate, widest };
    }
    groups = best.groups;
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
    signature: cwiLayoutSignature(project, cue, viewport),
    baseFontPx,
    padX,
    padY,
    maxBoxWidth,
    lines,
    manualBreakCount: manualBreaks.length,
    overflow: lines.some((line) => line.peakWidth > maxBoxWidth + 0.5) || manualBreaks.length > 1
  };
}

function cwiIsTimedCue(cue) {
  return cue.type === "dialogue" || (cue.type === "sound" && CWI_STYLE.sound.syncToSound) || (cue.type === "music" && CWI_STYLE.music.animate);
}

function cwiUsesEstimatedTiming(words) {
  return !words.length || words.every((word) => word.timing === "estimated") ||
    words.some((word) => !Number.isFinite(Number(word.start)));
}

// AE's START/END markers for a cue without aligned word timing.
function cwiEstimatedWindow(cue) {
  const start = Number(cue.start);
  const end = Number(cue.end);
  const insetEnd = end - CWI_STYLE.motion.estimatedEndInsetSeconds;
  return { start, end: insetEnd > start + 0.05 ? insetEnd : Math.max(start + 0.01, end) };
}

function cwiEstimatedCursor(count, time, window) {
  const p = cwiClamp((time - window.start) / (window.end - window.start), 0, 1);
  return count * cwiCubicBezier(p, CWI_STYLE.motion.estimatedEase) + p;
}

// Time at which the estimated cursor reaches `index` (the cursor is monotonic).
function cwiEstimatedTimeForCursor(count, index, window) {
  let low = window.start;
  let high = window.end;
  for (let iteration = 0; iteration < 40; iteration += 1) {
    const mid = (low + high) / 2;
    if (cwiEstimatedCursor(count, mid, window) < index) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

// Word start/end times that reproduce the AE distribution, used to seed imported cues so the
// timeline shows where each word will animate.
function cwiEstimatedWordTimes(cue, count) {
  const window = cwiEstimatedWindow(cue);
  return Array.from({ length: count }, (_, index) => ({
    start: cwiRoundTime(cwiEstimatedTimeForCursor(count, index, window)),
    end: cwiRoundTime(index === count - 1 ? window.end : cwiEstimatedTimeForCursor(count, index + 1, window))
  }));
}

function cwiAlignedKnots(onsets, ends) {
  const count = onsets.length;
  const { maxRiseSeconds, settleSeconds } = CWI_STYLE.motion;
  const knots = [];
  const push = (time, value) => {
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

function cwiKnotValue(knots, time) {
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
function cwiCueTiming(cue, displayWords, time) {
  const words = displayWords.map((item) => item.word);
  if (cue.type !== "dialogue") {
    const estimated = cwiUsesEstimatedTiming(words);
    const onset = estimated ? Number(cue.start) : Math.min(...words.map((word) => Number(word.start)));
    const end = estimated ? cwiEstimatedWindow(cue).end : Math.max(...words.map((word) => Number(word.end)));
    return { estimated, phrase: true, cursor: cwiKnotValue(cwiAlignedKnots([onset], [end]), time), onsets: [onset] };
  }
  const count = words.length;
  if (cwiUsesEstimatedTiming(words)) {
    const window = cwiEstimatedWindow(cue);
    return {
      estimated: true,
      cursor: cwiEstimatedCursor(count, time, window),
      onsets: words.map((_, index) => cwiEstimatedTimeForCursor(count, index, window))
    };
  }
  const onsets = words.map((word) => Number(word.start));
  const ends = words.map((word) => Number(word.end));
  return { estimated: false, cursor: cwiKnotValue(cwiAlignedKnots(onsets, ends), time), onsets };
}

function cwiSyllableLifts(word, time) {
  const units = word.units || [];
  const start = Number(word.start);
  const end = Math.max(Number(word.end), start + 0.01);
  const onsets = units.map((unit, index) => Number.isFinite(Number(unit.start)) ? Number(unit.start) : start + ((end - start) * index) / units.length);
  const ends = units.map((_, index) => index < units.length - 1 ? onsets[index + 1] : end);
  const cursor = cwiKnotValue(cwiAlignedKnots(onsets, ends), time);
  return units.map((_, index) => cwiSmooth(1 - Math.abs(cursor - (index + 1))));
}

function cwiSpokenColor(project, cue) {
  if (cue.type !== "dialogue") return CWI_STYLE.type.exceptionSpokenColor;
  if (cwiNormalizeException(cue.exception).color) return CWI_STYLE.type.exceptionSpokenColor;
  const speaker = (project.speakers || []).find((item) => item.id === cue.speakerId);
  return speaker ? speaker.color : CWI_STYLE.type.exceptionSpokenColor;
}

function cwiLiveCues(project, time) {
  return (project.cues || [])
    .filter((cue) => time >= Number(cue.start) && time <= Number(cue.end))
    .sort((a, b) => Number(a.start) - Number(b.start));
}

// Full frame state. `getLayout(cue)` returns cwiLayoutCue output (the app caches it; tests call
// cwiLayoutCue directly). Lines stack bottom-up with the earliest line on top (PDF p44-45).
function cwiComputeFrame(project, time, viewport, getLayout, options: any = {}) {
  const tokens = cwiLayoutTokens(project.project && project.project.aspectRatio);
  const reducedMotion = Boolean(options.reducedMotion);
  const readAhead = CWI_STYLE.type.readAheadColor;
  const { liftEm, anticipationDipEm, anticipationSeconds, popScale } = CWI_STYLE.motion;

  const entries = cwiLiveCues(project, time).flatMap((cue) => {
    const layout = getLayout(cue);
    return layout.lines.map((line, lineIndex) => ({ cue, layout, line, lineIndex }));
  });
  const droppedLines = Math.max(0, entries.length - CWI_STYLE.stack.maxLines);
  const visible = entries.slice(droppedLines);

  const cueMotion = new Map();
  const motionFor = (cue) => {
    if (!cueMotion.has(cue.id)) {
      const displayWords = cwiCueDisplayWords(cue);
      cueMotion.set(cue.id, cwiIsTimedCue(cue) ? cwiCueTiming(cue, displayWords, time) : null);
    }
    return cueMotion.get(cue.id);
  };

  // Per-frame line geometry: each word's current style and advance, the neighbors it pushes,
  // and the box that follows the text (the AE box tracks sourceRectAtTime every frame).
  const measured = visible.map(({ cue, layout, line }) => {
    const timing = motionFor(cue);
    const exception = cwiNormalizeException(cue.exception);
    const motionAllowed = !reducedMotion && !exception.motion;

    const states = line.words.map((item) => {
      const wordIndex = item.index;
      let colorAmount = 0;
      let lift = 0;
      let dip = 0;
      let unitLifts = null;
      // Untimed cues (static sound effects and music) are one event, shown at their size throughout.
      let emphasis = timing ? 0 : 1;

      if (timing) {
        const unitIndex = timing.phrase ? 0 : wordIndex;
        const progress = timing.cursor - unitIndex;
        const window = cwiSmooth(1 - Math.abs(timing.cursor - (unitIndex + 1)));
        // Only dialogue takes the speaker color; sound effects stay white (doc 7.1).
        colorAmount = cue.type === "dialogue" ? cwiSmooth(progress) : 0;
        emphasis = reducedMotion ? 0 : window;
        const wordMotion = item.word.motion || "pop";
        if (motionAllowed && wordMotion !== "none") {
          if (item.units && wordMotion === "syllable") unitLifts = cwiSyllableLifts(item.word, time);
          else lift = window;
          const onset = timing.onsets[unitIndex];
          if (time < onset) {
            dip = time >= onset - anticipationSeconds ? cwiEaseOut((time - (onset - anticipationSeconds)) / anticipationSeconds) : 0;
          } else {
            const lead = Math.min(anticipationSeconds, Math.max(0, onset - Number(cue.start)));
            dip = cwiEaseOut(lead / anticipationSeconds) * (1 - cwiSmooth(progress));
          }
        }
      }

      const style = cwiLerpStyle(item.rest, item.peak, emphasis);
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
  const placed = [];
  for (let index = visible.length - 1; index >= 0; index -= 1) {
    const geometry = measured[index];
    const y = bottom - geometry.height;
    placed[index] = { x: (viewport.width - geometry.width) / 2, y };
    bottom = y - gap;
  }

  const lines = visible.map(({ cue, layout, lineIndex }, index) => {
    const geometry = measured[index];
    const spokenColor = cwiSpokenColor(project, cue);

    const words = geometry.states.map((state, wordIndex) => {
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
        color: geometry.timing && cue.type === "dialogue" ? cwiMixColor(readAhead, spokenColor, state.colorAmount) : readAhead,
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
function cwiMaxSimultaneousLines(project, getLayout) {
  let worst = { count: 0, time: 0 };
  (project.cues || []).forEach((cue) => {
    const time = Number(cue.start);
    const count = cwiLiveCues(project, time).reduce((sum, live) => sum + getLayout(live).lines.length, 0);
    if (count > worst.count) worst = { count, time };
  });
  return worst;
}
