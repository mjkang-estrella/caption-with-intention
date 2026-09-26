// SRT and WebVTT import: parse cues and turn them into an editable CWI project.

import type { Cue, CueType, Project, ProjectMeta, Speaker, SubtitleCue } from "./types.ts";
import { DEFAULT_FRAME_RATE, SCHEMA_VERSION } from "./schema.ts";
import { stripDecorators } from "./renderer.ts";
import { buildWordsForCueText, createUnknownSpeaker, nextSpeakerColor, uniqueId } from "./edit.ts";
import { fileNameStem, roundTime, slugify } from "./util.ts";

export function parseSubtitleFile(text: string, fileName: string): SubtitleCue[] {
  const trimmed = String(text || "").replace(/^﻿/, "").trim();
  if (!trimmed) return [];
  if (/^\s*WEBVTT\b/i.test(trimmed) || /\.vtt$/i.test(fileName || "")) return parseWebVtt(trimmed);
  return parseSrt(trimmed);
}

export function parseSrt(text: string): SubtitleCue[] {
  return String(text || "")
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .flatMap((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (!lines.length) return [];
      if (/^\d+$/.test(lines[0])) lines.shift();
      const timeIndex = lines.findIndex((line) => line.includes("-->"));
      if (timeIndex === -1) return [];
      const times = parseSubtitleTiming(lines[timeIndex]);
      if (!times) return [];
      const cueText = cleanSubtitleText(lines.slice(timeIndex + 1).join(" "));
      if (!cueText) return [];
      return [{ ...times, text: cueText }];
    });
}

export function parseWebVtt(text: string): SubtitleCue[] {
  const body = String(text || "").replace(/^\s*WEBVTT[^\n]*(\n|$)/i, "");
  return body
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .flatMap((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (!lines.length || /^WEBVTT\b/i.test(lines[0]) || /^(NOTE|STYLE|REGION)\b/i.test(lines[0])) return [];
      const timeIndex = lines.findIndex((line) => line.includes("-->"));
      if (timeIndex === -1) return [];
      const times = parseSubtitleTiming(lines[timeIndex]);
      if (!times) return [];
      const rawText = lines.slice(timeIndex + 1).join(" ");
      const cueText = cleanSubtitleText(rawText);
      if (!cueText) return [];
      const voices = parseVoiceTags(rawText);
      return [voices.length ? { ...times, text: cueText, voices } : { ...times, text: cueText }];
    });
}

// WebVTT voice spans: <v Name> or <v.class1.class2 Name>. Returns distinct names in order.
export function parseVoiceTags(text: string): string[] {
  const names = Array.from(String(text || "").matchAll(/<v(?:\.[^\s>]*)?\s+([^>]+?)\s*>/g), (match) => decodeHtmlEntities(match[1]).trim());
  return names.filter((name, index) => name && names.indexOf(name) === index);
}

export function parseSubtitleTiming(line: string): { start: number; end: number } | null {
  const parts = String(line || "").split("-->");
  if (parts.length < 2) return null;
  const start = parseSubtitleTime(parts[0].trim());
  const end = parseSubtitleTime(parts[1].trim().split(/\s+/)[0]);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return { start: roundTime(start), end: roundTime(end) };
}

export function parseSubtitleTime(value: string): number {
  const normalized = String(value || "").replace(",", ".");
  const parts = normalized.split(":");
  if (parts.length < 2 || parts.length > 3) return NaN;
  const seconds = Number(parts.pop());
  const minutes = Number(parts.pop());
  const hours = parts.length ? Number(parts.pop()) : 0;
  if (![hours, minutes, seconds].every(Number.isFinite)) return NaN;
  return hours * 3600 + minutes * 60 + seconds;
}

export function cleanSubtitleText(text: string): string {
  return decodeHtmlEntities(String(text || "")
    .replace(/<[^>]+>/g, "")
    .replace(/\{[^}]+\}/g, "")
    .replace(/\s+/g, " ")
    .trim());
}

// WebVTT defines these named character references; numeric references cover everything else.
const NAMED_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " ", lrm: "‎", rlm: "‏" };

export function decodeHtmlEntities(text: string): string {
  return String(text || "").replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code = entity[1] === "x" || entity[1] === "X" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

export function cueTypeForSubtitleText(text: string): CueType {
  const value = String(text || "").trim();
  if (/^[♪♫]|[♪♫]$/.test(value)) return "music";
  if (/^\[.+\]$/.test(value)) return "sound";
  return "dialogue";
}

// `base` carries the current session's project fields (media name, aspect ratio, duration).
// WebVTT voice tags become speakers; dialogue without one is attributed to Unknown Speaker.
export function createProjectFromSubtitleCues(subtitleCues: SubtitleCue[], captionFileName: string, base: Partial<ProjectMeta> = {}): Project {
  const unknownSpeaker = createUnknownSpeaker();
  const isDialogue = (subtitleCue: SubtitleCue) => cueTypeForSubtitleText(subtitleCue.text) === "dialogue";
  const hasVoices = subtitleCues.some((subtitleCue) => subtitleCue.voices && subtitleCue.voices.length);
  const needsUnknown = !hasVoices || subtitleCues.some((subtitleCue) => isDialogue(subtitleCue) && !(subtitleCue.voices && subtitleCue.voices.length));
  const project: Project = {
    schemaVersion: SCHEMA_VERSION,
    project: {
      id: `cwi-${slugify(fileNameStem(base.mediaName || captionFileName || "imported-media"))}`,
      title: base.title || fileNameStem(captionFileName || "Imported Captions"),
      aspectRatio: base.aspectRatio || "16:9",
      mediaName: base.mediaName || "Local media",
      duration: base.duration || 0,
      frameRate: base.frameRate || DEFAULT_FRAME_RATE
    },
    // Unknown Speaker goes first so the voice speakers' colors are chosen around its color.
    speakers: needsUnknown ? [unknownSpeaker] : [],
    cues: [],
    review: { notes: [], validationStatus: "unchecked" }
  };

  const speakersByVoice = new Map<string, Speaker>();
  const speakerForVoice = (name: string): Speaker => {
    const existing = speakersByVoice.get(name);
    if (existing) return existing;
    const speaker: Speaker = {
      id: uniqueId(project, `speaker-${slugify(name)}`),
      name,
      role: "supporting",
      color: nextSpeakerColor(project, "supporting"),
      defaultOffCamera: false
    };
    project.speakers.push(speaker);
    speakersByVoice.set(name, speaker);
    return speaker;
  };
  const multiVoiceCues: string[] = [];

  subtitleCues.forEach((subtitleCue, index) => {
    const cueType = cueTypeForSubtitleText(subtitleCue.text);
    const text = stripDecorators(subtitleCue.text).trim();
    const voices = subtitleCue.voices || [];
    const cueId = `cue-${index + 1}`;
    if (cueType === "dialogue" && voices.length > 1) multiVoiceCues.push(`${cueId} (${voices.join(", ")})`);
    const cue: Cue = {
      id: cueId,
      type: cueType,
      speakerId: cueType !== "dialogue" ? "" : voices.length ? speakerForVoice(voices[0]).id : unknownSpeaker.id,
      start: subtitleCue.start,
      end: subtitleCue.end,
      text,
      lineBreakAfterWordIds: [],
      exception: { color: false, motion: false, intonation: false },
      offCamera: false,
      words: []
    };
    cue.words = buildWordsForCueText(project, cue, text);
    project.cues.push(cue);
  });

  const attribution = speakersByVoice.size
    ? `Created ${speakersByVoice.size} speakers from WebVTT voice tags${needsUnknown ? "; untagged dialogue is set to Unknown Speaker" : ""}.`
    : "Speaker identity is set to Unknown Speaker until manually corrected.";
  project.review.notes.push(`Imported ${project.cues.length} cues from ${captionFileName || "caption file"}. ${attribution} Word timing is estimated from each cue until manually aligned.`);
  if (multiVoiceCues.length) {
    project.review.notes.push(`These cues have more than one voice tag and were attributed to the first voice; split them to credit each speaker: ${multiVoiceCues.join("; ")}.`);
  }
  return project;
}
