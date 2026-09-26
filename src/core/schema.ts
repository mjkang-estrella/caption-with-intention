// cwi.json schema constants and the normalizer that turns any v1 or v2 document into a valid
// current-schema Project.

import type { AspectRatio, Cue, CueException, CueType, Project, ProjectMeta, SpeakerRole, Word, WordMotion, WordTiming } from "./types.ts";
import { CWI_STYLE, NEUTRAL_VOLUME, SPEAKER_PALETTE } from "./style.ts";
import { clamp, roundTime, toNumber } from "./util.ts";

// Imported JSON is untrusted and loosely shaped until it has been normalized.
type Raw = Record<string, any>;

export const SCHEMA_VERSION = 2;
export const DEFAULT_FRAME_RATE = 30;
export const ASPECT_RATIOS: readonly AspectRatio[] = ["16:9", "9:16", "1:1"];
export const CUE_TYPES: readonly CueType[] = ["dialogue", "sound", "music"];
export const SPEAKER_ROLES: readonly SpeakerRole[] = ["main", "supporting", "minor"];
export const WORD_MOTIONS: readonly WordMotion[] = ["pop", "none", "syllable"];
export const WORD_TIMINGS: readonly WordTiming[] = ["aligned", "estimated", "manual"];

export function isOneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return (list as readonly unknown[]).includes(value);
}

export function nearestAspectRatio(width: number, height: number): AspectRatio {
  const ratio = Number(width) / Number(height);
  if (!Number.isFinite(ratio) || ratio <= 0) return "16:9";
  const candidates = ASPECT_RATIOS.map((aspect) => {
    const [w, h] = aspect.split(":").map(Number);
    return { aspect, distance: Math.abs(Math.log(ratio / (w / h))) };
  });
  return candidates.sort((a, b) => a.distance - b.distance)[0].aspect;
}

export function normalizeException(value: unknown): CueException {
  if (value && typeof value === "object") {
    const raw = value as Raw;
    return { color: Boolean(raw.color), motion: Boolean(raw.motion), intonation: Boolean(raw.intonation) };
  }
  // Schema v1 stored a boolean; the doc's exception keeps sync and motion and drops speaker color.
  return { color: Boolean(value), motion: false, intonation: false };
}

export function hasException(cue: Pick<Cue, "exception"> | null | undefined): boolean {
  const exception = normalizeException(cue && cue.exception);
  return exception.color || exception.motion || exception.intonation;
}

export function normalizeWord(word: Raw, cue: Raw, cueId: string, wordIndex: number): Word {
  const start = toNumber(word.start, toNumber(cue.start, 0));
  const end = toNumber(word.end, toNumber(cue.end, start + 0.5));
  const units = Array.isArray(word.units)
    ? word.units
      .map((unit: Raw) => ({ text: String((unit && unit.text) || ""), start: toNumber(unit && unit.start, NaN) }))
      .filter((unit: { text: string }) => unit.text)
    : [];
  return {
    id: String(word.id || `${cueId}-word-${wordIndex + 1}`),
    text: String(word.text || ""),
    start: roundTime(start),
    end: roundTime(end),
    volumePercent: clamp(toNumber(word.volumePercent, NEUTRAL_VOLUME), 0, 100),
    pitchWeight: clamp(toNumber(word.pitchWeight, CWI_STYLE.type.defaultWeight), CWI_STYLE.tone.minWeight, CWI_STYLE.tone.maxWeight),
    pitchWidth: clamp(toNumber(word.pitchWidth, CWI_STYLE.type.defaultWidth), CWI_STYLE.tone.minWidth, CWI_STYLE.tone.maxWidth),
    motion: isOneOf(WORD_MOTIONS, word.motion) ? word.motion : "pop",
    timing: isOneOf(WORD_TIMINGS, word.timing) ? word.timing : "aligned",
    burst: Boolean(word.burst),
    ...(units.length ? { units } : {})
  };
}

export function normalizeCue(cue: Raw, index: number): Cue {
  const id = String(cue.id || `cue-${index + 1}`);
  const words: Word[] = Array.isArray(cue.words) ? cue.words.map((word: Raw, wordIndex: number) => normalizeWord(word || {}, cue, id, wordIndex)) : [];
  const start = toNumber(cue.start, words.length ? Math.min(...words.map((word) => word.start)) : 0);
  const end = toNumber(cue.end, Math.max(start + 0.5, ...words.map((word) => word.end)));
  return {
    id,
    type: isOneOf(CUE_TYPES, cue.type) ? cue.type : "dialogue",
    speakerId: String(cue.speakerId || ""),
    start: roundTime(start),
    end: roundTime(end),
    text: String(cue.text || words.map((word) => word.text).join(" ")),
    lineBreakAfterWordIds: Array.isArray(cue.lineBreakAfterWordIds) ? cue.lineBreakAfterWordIds.map(String) : [],
    exception: normalizeException(cue.exception),
    offCamera: Boolean(cue.offCamera),
    words
  };
}

// Normalizes any v1 or v2 CWI document into the current schema. `fallback` supplies project
// fields that belong to the local session (media name, duration) when the file omits them.
export function normalizeProject(raw: unknown, fallback: Partial<ProjectMeta> = {}): Project {
  if (!raw || typeof raw !== "object") throw new Error("JSON must be an object with project, speakers, and cues.");
  const doc = raw as Raw;
  if (!doc.project || !Array.isArray(doc.speakers) || !Array.isArray(doc.cues)) {
    throw new Error("JSON must include project, speakers, and cues arrays.");
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    project: {
      id: String(doc.project.id || "imported-cwi-project"),
      title: String(doc.project.title || "Imported CWI Project"),
      aspectRatio: isOneOf(ASPECT_RATIOS, doc.project.aspectRatio) ? doc.project.aspectRatio : "16:9",
      mediaName: String(doc.project.mediaName || fallback.mediaName || "Local media"),
      duration: toNumber(doc.project.duration, 0) || toNumber(fallback.duration, 0),
      frameRate: toNumber(doc.project.frameRate, 0) > 0 ? Number(doc.project.frameRate) : DEFAULT_FRAME_RATE
    },
    speakers: doc.speakers.map((speaker: Raw, index: number) => ({
      id: String(speaker.id || `speaker-${index + 1}`),
      name: String(speaker.name || `Speaker ${index + 1}`),
      role: isOneOf(SPEAKER_ROLES, speaker.role) ? speaker.role : "supporting",
      color: String(speaker.color || SPEAKER_PALETTE[index % SPEAKER_PALETTE.length].color),
      defaultOffCamera: Boolean(speaker.defaultOffCamera)
    })),
    cues: doc.cues.map((cue: Raw, index: number) => normalizeCue(cue || {}, index)),
    review: {
      notes: doc.review && Array.isArray(doc.review.notes) ? doc.review.notes.map(String) : [],
      validationStatus: doc.review && doc.review.validationStatus ? String(doc.review.validationStatus) : "unchecked"
    }
  };
}

// Required fields a hand-written or older file is missing; normalization fills them with defaults.
export function findMissingImportedFields(raw: unknown): string[] {
  const warnings: string[] = [];
  if (!raw || typeof raw !== "object") return ["JSON root must be an object."];
  const doc = raw as Raw;
  if (!doc.project) warnings.push("project object is missing");
  if (doc.project) {
    ["id", "title", "aspectRatio", "mediaName", "duration"].forEach((field) => {
      if (doc.project[field] === undefined || doc.project[field] === "") warnings.push(`project.${field} is missing`);
    });
  }

  if (!Array.isArray(doc.speakers)) {
    warnings.push("speakers array is missing");
  } else {
    doc.speakers.forEach((speaker: Raw, index: number) => {
      ["id", "name", "role", "color", "defaultOffCamera"].forEach((field) => {
        if (speaker[field] === undefined || speaker[field] === "") warnings.push(`speakers[${index}].${field} is missing`);
      });
    });
  }

  if (!Array.isArray(doc.cues)) {
    warnings.push("cues array is missing");
  } else {
    doc.cues.forEach((cue: Raw, cueIndex: number) => {
      ["id", "type", "start", "end", "text", "words"].forEach((field) => {
        if (cue[field] === undefined || cue[field] === "") warnings.push(`cues[${cueIndex}].${field} is missing`);
      });
      if (cue.type === "dialogue" && !cue.speakerId) warnings.push(`cues[${cueIndex}].speakerId is missing`);
      if (Array.isArray(cue.words)) {
        cue.words.forEach((word: Raw, wordIndex: number) => {
          ["id", "text", "start", "end", "volumePercent"].forEach((field) => {
            if (word[field] === undefined || word[field] === "") warnings.push(`cues[${cueIndex}].words[${wordIndex}].${field} is missing`);
          });
        });
      }
    });
  }

  return warnings;
}
