// Project editing rules shared by the editor, importers, and tests. Functions that change a
// project mutate it in place; callers decide how the change is recorded (undo, re-render).

import type { AspectRatio, Cue, Project, Speaker, SpeakerRole, Word } from "./types.ts";
import { CWI_STYLE, NEUTRAL_VOLUME, SPEAKER_PALETTE, hueDistance } from "./style.ts";
import { DEFAULT_FRAME_RATE, SCHEMA_VERSION, WORD_MOTIONS, isOneOf } from "./schema.ts";
import { estimatedWordTimes } from "./renderer.ts";
import { fileNameStem, roundTime, slugify, toNumber } from "./util.ts";

export function uniqueId(project: Project, prefix: string, reservedIds: Set<string> = new Set()): string {
  const existingIds = new Set([
    ...project.speakers.map((speaker) => speaker.id),
    ...project.cues.map((cue) => cue.id),
    ...project.cues.flatMap((cue) => (cue.words || []).map((word) => word.id)),
    ...reservedIds
  ]);
  let index = existingIds.size + 1;
  let id = `${prefix}-${index}`;
  while (existingIds.has(id)) {
    index += 1;
    id = `${prefix}-${index}`;
  }
  return id;
}

export function tokenizeTranscriptText(text: string): string[] {
  return String(text || "").trim().split(/\s+/).filter(Boolean);
}

export function buildWordsForCueText(project: Project, cue: Cue, text: string): Word[] {
  const tokens = tokenizeTranscriptText(text);
  const oldWords = Array.isArray(cue.words) ? cue.words : [];
  if (!tokens.length) return [];

  if (tokens.length === oldWords.length) {
    return oldWords.map((word, index) => ({
      ...word,
      text: tokens[index]
    }));
  }

  // Adding or removing words invalidates the stored onsets, so seed the AE template's own
  // distribution and mark it estimated until the onsets are aligned.
  const reservedIds = new Set<string>();
  const times = estimatedWordTimes(cue, tokens.length);
  return tokens.map((token, index) => {
    const fallback: Partial<Word> = oldWords[Math.min(index, oldWords.length - 1)] || {};
    const id = uniqueId(project, `${cue.id}-word`, reservedIds);
    reservedIds.add(id);
    return {
      id,
      text: token,
      start: times[index].start,
      end: times[index].end,
      volumePercent: toNumber(fallback.volumePercent, NEUTRAL_VOLUME),
      pitchWeight: toNumber(fallback.pitchWeight, CWI_STYLE.type.defaultWeight),
      pitchWidth: toNumber(fallback.pitchWidth, CWI_STYLE.type.defaultWidth),
      motion: isOneOf(WORD_MOTIONS, fallback.motion) ? fallback.motion : "pop",
      timing: "estimated",
      burst: false
    };
  });
}

export function updateCueTextAndWords(project: Project, cue: Cue, text: string): void {
  cue.text = text;
  cue.words = buildWordsForCueText(project, cue, text);
  const wordIds = new Set((cue.words || []).map((word) => word.id));
  cue.lineBreakAfterWordIds = (cue.lineBreakAfterWordIds || []).filter((wordId) => wordIds.has(wordId));
}

// Estimated words follow the cue's START/END window, so keep them in step with cue edits.
export function reseedEstimatedWords(cue: Cue): void {
  const words = cue.words || [];
  if (!words.length || !words.every((word) => word.timing === "estimated")) return;
  const times = estimatedWordTimes(cue, words.length);
  words.forEach((word, index) => {
    word.start = times[index].start;
    word.end = times[index].end;
  });
}

export function setWordSyllables(word: Word, value: string): void {
  const parts = value.split("-").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2 || parts.join("") !== word.text) {
    delete word.units;
    return;
  }
  const start = Number(word.start);
  const duration = Math.max(0.01, Number(word.end) - start);
  word.units = parts.map((text, index) => ({ text, start: roundTime(start + (duration * index) / parts.length) }));
}

// Widen the cue to cover its words after a word timing edit.
export function normalizeCueTiming(cue: Cue): void {
  const wordTimes = (cue.words || []).flatMap((word) => [Number(word.start), Number(word.end)]).filter(Number.isFinite);
  if (wordTimes.length) {
    cue.start = roundTime(Math.min(cue.start, ...wordTimes));
    cue.end = roundTime(Math.max(cue.end, ...wordTimes));
  }
}

export function syncCueTextFromWords(cue: Cue): void {
  cue.text = (cue.words || []).map((word) => word.text).join(" ");
}

export function hasTimingWarning(cue: Cue, word: Word): boolean {
  return Number(word.start) < Number(cue.start) || Number(word.end) > Number(cue.end) || Number(word.end) <= Number(word.start);
}

// Doc 3.1-3.2: keep speaker colors as far apart on the hue wheel as the palette allows.
export function nextSpeakerColor(project: Project, role: SpeakerRole): string {
  const usedColors = project.speakers.map((speaker) => String(speaker.color));
  const roleColors = SPEAKER_PALETTE.filter((entry) => entry.role === role);
  const available = roleColors.filter((entry) => !usedColors.some((color) => color.toLowerCase() === entry.color.toLowerCase()));
  if (!available.length) return (roleColors[0] || SPEAKER_PALETTE[0]).color;
  if (!usedColors.length) return available[0].color;

  let best = available[0];
  let bestDistance = -1;
  available.forEach((entry) => {
    const distance = Math.min(...usedColors.map((color) => hueDistance(color, entry.color)));
    if (distance > bestDistance) {
      best = entry;
      bestDistance = distance;
    }
  });
  return best.color;
}

export function colorFitsRole(color: string, role: SpeakerRole): boolean {
  return SPEAKER_PALETTE.some((entry) => entry.role === role && entry.color.toLowerCase() === String(color).toLowerCase());
}

export function createUnknownSpeaker(): Speaker {
  return {
    id: "speaker-unknown",
    name: "Unknown Speaker",
    role: "supporting",
    color: "#5E82ED",
    defaultOffCamera: false
  };
}

// Adds a supporting character with the most distinct free color and returns it.
export function addSpeaker(project: Project): Speaker {
  const role: SpeakerRole = "supporting";
  const speaker: Speaker = {
    id: uniqueId(project, "speaker"),
    name: `Character ${project.speakers.length + 1}`,
    role,
    color: nextSpeakerColor(project, role),
    defaultOffCamera: false
  };
  project.speakers.push(speaker);
  return speaker;
}

// Inserts a new dialogue cue after `afterCueId` (or at the end) and returns it.
export function insertCue(project: Project, afterCueId: string): Cue {
  const currentIndex = project.cues.findIndex((cue) => cue.id === afterCueId);
  const anchor = currentIndex >= 0 ? project.cues[currentIndex] : project.cues[project.cues.length - 1];
  const start = anchor ? roundTime(anchor.end + 0.2) : 0;
  const end = roundTime(start + 1.8);
  const speaker = project.speakers[0] || null;
  const cue: Cue = {
    id: uniqueId(project, "cue"),
    type: "dialogue",
    speakerId: speaker ? speaker.id : "",
    start,
    end,
    text: "New caption",
    lineBreakAfterWordIds: [],
    exception: { color: false, motion: false, intonation: false },
    offCamera: speaker ? Boolean(speaker.defaultOffCamera) : false,
    words: []
  };
  cue.words = buildWordsForCueText(project, cue, cue.text);

  if (currentIndex >= 0) project.cues.splice(currentIndex + 1, 0, cue);
  else project.cues.push(cue);
  return cue;
}

// Removes a cue and returns the id of the cue that should be selected next ("" when none).
export function removeCue(project: Project, cueId: string): string {
  const index = project.cues.findIndex((cue) => cue.id === cueId);
  if (index === -1) return "";
  project.cues.splice(index, 1);
  const nextCue = project.cues[Math.min(index, project.cues.length - 1)] || project.cues[index - 1] || null;
  return nextCue ? nextCue.id : "";
}

export function addReviewNote(project: Project, note: string): void {
  if (!project.review) project.review = { notes: [], validationStatus: "unchecked" };
  project.review.notes = Array.isArray(project.review.notes) ? project.review.notes : [];
  project.review.notes.push(String(note));
}

export function createEmptyProject(options: { fileName: string; duration: number; aspectRatio: AspectRatio; frameRate?: number }): Project {
  return {
    schemaVersion: SCHEMA_VERSION,
    project: {
      id: `cwi-${slugify(options.fileName || "local-media")}`,
      title: fileNameStem(options.fileName || "Local Media"),
      aspectRatio: options.aspectRatio || "16:9",
      mediaName: options.fileName || "Local media",
      duration: Number.isFinite(options.duration) && options.duration > 0 ? roundTime(options.duration) : 0,
      frameRate: options.frameRate || DEFAULT_FRAME_RATE
    },
    speakers: [createUnknownSpeaker()],
    cues: [],
    review: {
      notes: ["Media is loaded locally. Import an SRT or WebVTT caption file to create editable CWI cues."],
      validationStatus: "needs-captions"
    }
  };
}
