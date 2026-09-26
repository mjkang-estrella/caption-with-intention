// SRT and WebVTT import: parse cues and turn them into an editable CWI project.

import type { Cue, CueType, Project, ProjectMeta, SubtitleCue } from "./types.ts";
import { DEFAULT_FRAME_RATE, SCHEMA_VERSION } from "./schema.ts";
import { stripDecorators } from "./renderer.ts";
import { buildWordsForCueText, createUnknownSpeaker } from "./edit.ts";
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
      const cueText = cleanSubtitleText(lines.slice(timeIndex + 1).join(" "));
      if (!cueText) return [];
      return [{ ...times, text: cueText }];
    });
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
export function createProjectFromSubtitleCues(subtitleCues: SubtitleCue[], captionFileName: string, base: Partial<ProjectMeta> = {}): Project {
  const unknownSpeaker = createUnknownSpeaker();
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
    speakers: [unknownSpeaker],
    cues: [],
    review: { notes: [], validationStatus: "unchecked" }
  };

  subtitleCues.forEach((subtitleCue, index) => {
    const cueType = cueTypeForSubtitleText(subtitleCue.text);
    const text = stripDecorators(subtitleCue.text).trim();
    const cue: Cue = {
      id: `cue-${index + 1}`,
      type: cueType,
      speakerId: cueType === "dialogue" ? unknownSpeaker.id : "",
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

  project.review.notes.push(`Imported ${project.cues.length} cues from ${captionFileName || "caption file"}. Speaker identity is set to Unknown Speaker and word timing is estimated from each cue until manually aligned.`);
  return project;
}
