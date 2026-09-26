// QA checks for a CWI project. Everything the checks need from the page (caption layout,
// media source, import errors) comes in through the context, so the checks stay testable.

import type { Cue, CueLayout, Project, QaCheck, Speaker } from "./types.ts";
import { CWI_STYLE, NEUTRAL_VOLUME, hueDistance, toneInBand } from "./style.ts";
import { ASPECT_RATIOS, CUE_TYPES, DEFAULT_FRAME_RATE, isOneOf } from "./schema.ts";
import { maxSimultaneousLines } from "./renderer.ts";
import { formatTime, normalizeWordText, toNumber } from "./util.ts";

export const MIN_SPEAKER_HUE_DISTANCE = 30;
export const NEUTRAL_VOLUME_TOLERANCE = 5;
export const MAX_SIZED_WORD_SHARE = 0.5;

export interface QaContext {
  layoutFor(cue: Cue): CueLayout;
  mediaSource: string;
  pageOrigin: string;
  importError?: string;
  importWarnings?: string[];
}

export function validateProject(project: Project, ctx: QaContext): QaCheck[] {
  const checks: QaCheck[] = [];
  const fail = (title: string, body: string) => checks.push({ status: "fail", title, body });
  const pass = (title: string, body: string) => checks.push({ status: "pass", title, body });
  const importWarnings = ctx.importWarnings || [];

  if (ctx.importError) fail("JSON import", ctx.importError);
  if (importWarnings.length) fail("JSON required fields", importWarnings.slice(0, 5).join("; "));

  if (!project.project || !project.project.id || !project.project.title) {
    fail("Project metadata", "Project id and title are required.");
  } else if (!isOneOf(ASPECT_RATIOS, project.project.aspectRatio)) {
    fail("Project metadata", `Aspect ratio ${project.project.aspectRatio || "(missing)"} must be one of ${ASPECT_RATIOS.join(", ")}.`);
  } else {
    pass("Project metadata", `${project.project.title} is ${project.project.aspectRatio} at ${project.project.frameRate || DEFAULT_FRAME_RATE} fps (schema v${project.schemaVersion || 1}).`);
  }

  if (!Array.isArray(project.speakers) || project.speakers.length === 0) {
    fail("Speaker metadata", "At least one speaker with id, name, role, color, and off-camera default is required.");
  } else {
    const missingSpeaker = project.speakers.find((speaker) => !speaker.id || !speaker.name || !speaker.color);
    missingSpeaker ? fail("Speaker metadata", "One or more speakers are missing id, name, or color.") : pass("Speaker metadata", `${project.speakers.length} speaker records are editable.`);
    const colorIssues = speakerColorIssues(project.speakers);
    colorIssues.length
      ? fail("Speaker colors", colorIssues.slice(0, 3).join("; "))
      : pass("Speaker colors", `Main and supporting characters are at least ${MIN_SPEAKER_HUE_DISTANCE}° apart on the hue wheel.`);
  }

  if (!Array.isArray(project.cues) || project.cues.length === 0) {
    fail("CWI cues", "At least one caption cue is required.");
    return checks;
  }

  const cueErrors: string[] = [];
  project.cues.forEach((cue) => {
    if (!cue.id || !isOneOf(CUE_TYPES, cue.type) || !Number.isFinite(Number(cue.start)) || !Number.isFinite(Number(cue.end)) || !cue.text) {
      cueErrors.push(`${cue.id || "unnamed cue"} is missing a required cue field`);
    }
    if (cue.type === "dialogue" && !project.speakers.some((speaker) => speaker.id === cue.speakerId)) {
      cueErrors.push(`${cue.id} needs a valid speaker`);
    }
    if (!Array.isArray(cue.words) || cue.words.length === 0) {
      cueErrors.push(`${cue.id} needs word timing records`);
    } else {
      cue.words.forEach((word) => {
        if (!word.id || !word.text || !Number.isFinite(Number(word.start)) || !Number.isFinite(Number(word.end))) {
          cueErrors.push(`${cue.id} has a word missing id, text, start, or end`);
        }
        if (Number(word.end) <= Number(word.start)) {
          cueErrors.push(`${word.id || "word"} ends before it starts`);
        }
      });
    }
  });
  cueErrors.length ? fail("CWI cues", cueErrors.slice(0, 3).join("; ")) : pass("CWI cues", `${project.cues.length} cues preserve text, word timing, style, exceptions, sound, and music data.`);

  remoteMediaSource(ctx.mediaSource, ctx.pageOrigin)
    ? fail("Media boundary", "Preview media is loaded from another origin. Source media must stay local unless the creator uploads it on purpose.")
    : pass("Media boundary", ctx.mediaSource.startsWith("blob:") ? "Selected media is a browser object URL and stays on this device." : "The bundled sample media is served with the app; nothing is uploaded.");

  const timingIssues = wordTimingIssues(project.cues);
  timingIssues.length
    ? fail("Read-ahead and timing", timingIssues.slice(0, 3).join("; "))
    : pass("Read-ahead and timing", "Dialogue cues keep complete read-ahead text with word onsets in order inside each cue.");

  const estimatedCues = project.cues.filter((cue) => (cue.words || []).length && cue.words.every((word) => word.timing === "estimated"));
  estimatedCues.length
    ? fail("Word sync", `${estimatedCues.length} cues still use estimated word timing (${estimatedCues.slice(0, 3).map((cue) => cue.id).join(", ")}). Set each word start to its first audible sound.`)
    : pass("Word sync", "Every cue has aligned or manually set word onsets.");

  const nonDialogueIssues = nonDialogueCueIssues(project.cues);
  nonDialogueIssues.length
    ? fail("Sound and music cues", nonDialogueIssues.slice(0, 3).join("; "))
    : pass("Sound and music cues", `Sound effects render as white [bracketed] text and music as ${CWI_STYLE.music.glyph} [description] ${CWI_STYLE.music.glyph}, without speaker color.`);

  const volumeIssues = volumeBaselineIssues(project.cues);
  volumeIssues.length
    ? fail("Volume sizing", volumeIssues.join("; "))
    : pass("Volume sizing", "Ordinary speech sits at the 5% baseline; only emphasized words grow toward 12% or shrink toward 3%.");

  const toneIssues = toneOverridePolicyIssues(project.cues);
  toneIssues.length
    ? fail("Tone styling", toneIssues.slice(0, 3).join("; "))
    : pass("Tone styling", "Weight and width stay sparse, editorial, and consistent with the voice.");

  const overflowingCues = project.cues.filter((cue) => ctx.layoutFor(cue).overflow);
  const busiest = maxSimultaneousLines(project, ctx.layoutFor);
  if (overflowingCues.length) {
    fail("Caption work area", `These cues are wider than the ${project.project.aspectRatio} line width even on two lines, or have more than one manual break: ${overflowingCues.slice(0, 3).map((cue) => cue.id).join(", ")}.`);
  } else if (busiest.count > CWI_STYLE.stack.maxLines) {
    fail("Caption work area", `${busiest.count} caption lines are on screen at ${formatTime(busiest.time)}; the system allows ${CWI_STYLE.stack.maxLines}. Shorten or split the overlapping cues.`);
  } else {
    pass("Caption work area", `Every cue fits the ${project.project.aspectRatio} line width, and no more than ${CWI_STYLE.stack.maxLines} lines are on screen at once.`);
  }

  return checks;
}

export function remoteMediaSource(source: string, pageOrigin: string): boolean {
  if (!/^https?:/i.test(source)) return false;
  try {
    return new URL(source).origin !== pageOrigin;
  } catch {
    return true;
  }
}

export function speakerColorIssues(speakers: Speaker[]): string[] {
  const prominent = (speakers || []).filter((speaker) => speaker.role !== "minor");
  const issues: string[] = [];
  prominent.forEach((speaker, index) => {
    prominent.slice(index + 1).forEach((other) => {
      const distance = hueDistance(speaker.color, other.color);
      if (distance < MIN_SPEAKER_HUE_DISTANCE) {
        issues.push(`${speaker.name} and ${other.name} are only ${Math.round(distance)}° apart`);
      }
    });
  });
  return issues;
}

export function nonDialogueCueIssues(cues: Cue[]): string[] {
  return (cues || [])
    .filter((cue) => cue.type !== "dialogue")
    .flatMap((cue) => {
      const issues: string[] = [];
      const text = String(cue.text || "").trim();
      if (/^[[♪♫]|[\]♪♫]$/.test(text)) {
        issues.push(`${cue.id} stores brackets or music notes in its text; store plain text and let rendering add them`);
      }
      if (cue.speakerId) issues.push(`${cue.id} is a ${cue.type} cue and should not have a speaker color`);
      return issues;
    });
}

// Doc QA: normal speaking volume returns to the 5% baseline.
export function volumeBaselineIssues(cues: Cue[]): string[] {
  const words = (cues || []).flatMap((cue) => cue.type === "dialogue" ? (cue.words || []) : []);
  if (!words.length) return [];
  const sized = words.filter((word) => Math.abs(toNumber(word.volumePercent, NEUTRAL_VOLUME) - NEUTRAL_VOLUME) > NEUTRAL_VOLUME_TOLERANCE);
  if (sized.length / words.length > MAX_SIZED_WORD_SHARE) {
    return [`${sized.length} of ${words.length} dialogue words are sized louder or softer than normal; most speech should stay at the 5% baseline`];
  }
  return [];
}

export function wordTimingIssues(cues: Cue[]): string[] {
  return (cues || [])
    .filter((cue) => cue.type === "dialogue")
    .flatMap((cue) => {
      const words = cue.words || [];
      const issues: string[] = [];
      const normalizedCueText = normalizeWordText(cue.text);
      const normalizedWordText = normalizeWordText(words.map((word) => word.text).join(" "));
      if (!normalizedCueText || normalizedCueText !== normalizedWordText) {
        issues.push(`${cue.id} cue text does not match its word read-ahead text`);
      }
      if (words.some((word) => Number(word.start) < Number(cue.start) || Number(word.end) > Number(cue.end))) {
        issues.push(`${cue.id} has word timing outside the cue range`);
      }
      if (words.some((word, index) => index > 0 && Number(word.start) < Number(words[index - 1].start))) {
        issues.push(`${cue.id} has word onsets out of order`);
      }
      return issues;
    });
}

export function toneOverridePolicyIssues(cues: Cue[]): string[] {
  const words = (cues || []).flatMap((cue) => cue.type === "dialogue" ? (cue.words || []) : []);
  if (!words.length) return [];

  const issues: string[] = [];
  const contradicting = words.filter((word) => !toneInBand(word.pitchWeight, word.pitchWidth));
  if (contradicting.length) {
    issues.push(`${contradicting.slice(0, 3).map((word) => `"${word.text}"`).join(", ")} pair weight and width against the voice (heavy with narrow, or light with wide)`);
  }

  const overrideWords = words.filter((word) => {
    const weight = toNumber(word.pitchWeight, CWI_STYLE.type.defaultWeight);
    const width = toNumber(word.pitchWidth, CWI_STYLE.type.defaultWidth);
    return Math.abs(weight - CWI_STYLE.type.defaultWeight) >= 120 || Math.abs(width - CWI_STYLE.type.defaultWidth) >= 10;
  });
  if (overrideWords.length / words.length > 0.2) {
    issues.push(`${overrideWords.length} of ${words.length} dialogue words have tone overrides; keep pitch styling sparse and editorial`);
  }

  return issues;
}
