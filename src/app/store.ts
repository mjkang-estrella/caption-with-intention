// Editor state: the CWI project being edited plus selection, media, and view state, with the
// selection helpers the panels share.

import type { Cue, Project, Speaker, SpeakerRole, Word } from "../core/types.ts";
import { createSampleProject } from "../core/sample.ts";
import { clamp } from "../core/util.ts";
import { INSPECTOR_COLUMN_DEFAULT } from "./constants.ts";

export type SideTab = "transcript" | "speakers" | "qa";

export interface AppState {
  cwi: Project;
  activeTab: SideTab;
  selectedCueId: string;
  selectedWordId: string;
  selectedSpeakerId: string;
  mediaObjectUrl: string;
  mediaFile: File | null;
  importError: string;
  importWarnings: string[];
  playbackKey: string;
  inspectorSize: number;
  speakerSelectorOpen: boolean;
  activeSpeakerOptionId: string;
  previewTimeOverride: number | null;
  statusMessage: string;
  audioBuffer: AudioBuffer | null;
  audioSource: File | null;
  audioPromise: Promise<AudioBuffer | null> | null;
  waveform: number[] | null;
  autoAspect: boolean;
  reducedMotion: boolean;
  showGuides: boolean;
  // Presentation time of the last video frame on screen, used to extrapolate caption time.
  frameAnchor: { mediaTime: number; wallTime: number } | null;
}

export const state: AppState = {
  cwi: createSampleProject(),
  activeTab: "transcript",
  selectedCueId: "cue-riverside-drive",
  selectedWordId: "",
  selectedSpeakerId: "",
  mediaObjectUrl: "",
  mediaFile: null,
  importError: "",
  importWarnings: [],
  playbackKey: "",
  inspectorSize: INSPECTOR_COLUMN_DEFAULT,
  speakerSelectorOpen: false,
  activeSpeakerOptionId: "",
  previewTimeOverride: null,
  statusMessage: "",
  audioBuffer: null,
  audioSource: null,
  audioPromise: null,
  waveform: null,
  autoAspect: false,
  reducedMotion: false,
  showGuides: false,
  frameAnchor: null
};

export function getCue(cueId: string): Cue | null {
  return state.cwi.cues.find((cue) => cue.id === cueId) || null;
}

export function getSelectedCue(): Cue | null {
  return getCue(state.selectedCueId);
}

export function getSelectedWord(): Word | null {
  const cue = getSelectedCue();
  if (!cue || !cue.words) return null;
  return cue.words.find((word) => word.id === state.selectedWordId) || null;
}

export function getSpeaker(speakerId: string): Speaker | null {
  return state.cwi.speakers.find((speaker) => speaker.id === speakerId) || null;
}

export function ensureSelection(): void {
  if (!state.cwi.cues.length) {
    state.selectedCueId = "";
    state.selectedWordId = "";
    return;
  }
  let cue = getSelectedCue();
  if (!cue) {
    cue = state.cwi.cues[0];
    state.selectedCueId = cue.id;
  }
  if (state.selectedWordId && (!cue.words || !cue.words.some((word) => word.id === state.selectedWordId))) state.selectedWordId = "";
}

export function selectAdjacentWord(direction: number): void {
  const cue = getSelectedCue();
  const words = cue && cue.words ? cue.words : [];
  if (!words.length) {
    state.selectedWordId = "";
    return;
  }

  const currentIndex = words.findIndex((word) => word.id === state.selectedWordId);
  const fallbackIndex = direction > 0 ? 0 : words.length - 1;
  const nextIndex = currentIndex === -1
    ? fallbackIndex
    : clamp(currentIndex + direction, 0, words.length - 1);
  state.selectedWordId = words[nextIndex].id;
}

export function speakerName(speakerId: string): string {
  const speaker = getSpeaker(speakerId);
  return speaker ? speaker.name : "no speaker";
}

export function mediaExtensionLabel(): string {
  const media = state.cwi.project.mediaName || "";
  const extension = media.includes(".") ? media.slice(media.lastIndexOf(".")) : "";
  return extension && !state.cwi.project.title.endsWith(extension) ? extension : "";
}

export function roleLabel(value: SpeakerRole): string {
  if (value === "main") return "Main character";
  if (value === "minor") return "Minor character";
  return "Supporting character";
}
