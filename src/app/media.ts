// Media, caption, and project import/export. Media stays in the browser as an object URL; audio
// is decoded locally for volume analysis and the waveform.

import type { Project } from "../core/types.ts";
import { analyzeWordVolumes, computeWaveform } from "../core/audio-analysis.ts";
import { addReviewNote, createEmptyProject } from "../core/edit.ts";
import { validateProject } from "../core/qa.ts";
import { findMissingImportedFields, normalizeProject } from "../core/schema.ts";
import { NEUTRAL_VOLUME } from "../core/style.ts";
import { createProjectFromSubtitleCues, parseSubtitleFile } from "../core/subtitles.ts";
import { slugify } from "../core/util.ts";
import { MAX_ANALYSIS_BYTES } from "./constants.ts";
import { els } from "./dom.ts";
import { qaContext } from "./panels/qa.ts";
import { getDuration } from "./playback.ts";
import { renderAll, renderParts } from "./render.ts";
import { announceStatus } from "./status.ts";
import { state } from "./store.ts";

// Takes the chosen file from a file input and clears it so the same file can be picked again.
function takeFile(event: Event): File | null {
  const input = event.target as HTMLInputElement;
  const file = input.files && input.files[0];
  input.value = "";
  return file || null;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function showImportError(message: string): void {
  state.importError = message;
  state.importWarnings = [];
  state.activeTab = "qa";
  announceStatus(state.importError);
  renderAll();
}

export function handleMediaInput(event: Event): void {
  const file = takeFile(event);
  if (!file) return;

  if (state.mediaObjectUrl) URL.revokeObjectURL(state.mediaObjectUrl);
  state.mediaObjectUrl = URL.createObjectURL(file);
  state.mediaFile = file;
  state.cwi = createEmptyProject({ fileName: file.name, duration: els.video.duration, aspectRatio: state.cwi.project.aspectRatio, frameRate: state.cwi.project.frameRate });
  state.selectedCueId = "";
  state.selectedWordId = "";
  state.selectedSpeakerId = "";
  state.activeTab = "transcript";
  state.previewTimeOverride = null;
  state.audioBuffer = null;
  state.audioSource = null;
  state.audioPromise = null;
  state.waveform = null;
  state.autoAspect = true;
  els.video.src = state.mediaObjectUrl;
  els.video.load();
  state.importError = "";
  state.importWarnings = [];
  renderAll();
  loadMediaAudio(file).then(() => renderParts("timeline"));
}

export async function handleCaptionInput(event: Event): Promise<void> {
  const file = takeFile(event);
  if (!file) return;

  try {
    const subtitleCues = parseSubtitleFile(await file.text(), file.name);
    if (!subtitleCues.length) throw new Error("No subtitle cues were found in the selected file.");

    state.cwi = createProjectFromSubtitleCues(subtitleCues, file.name, { ...state.cwi.project, duration: state.cwi.project.duration || getDuration() });
    state.selectedCueId = state.cwi.cues[0] ? state.cwi.cues[0].id : "";
    state.selectedWordId = "";
    state.activeTab = "qa";
    state.importError = "";
    state.importWarnings = [];
    announceStatus(`Imported ${subtitleCues.length} caption cues from ${file.name}.`);
    renderAll();
    await applyLocalVolumeAnalysis();
  } catch (error) {
    showImportError(errorMessage(error, "The selected caption file could not be imported."));
  }
}

export async function handleJsonInput(event: Event): Promise<void> {
  const file = takeFile(event);
  if (!file) return;

  try {
    const parsed: unknown = JSON.parse(await file.text());
    state.importWarnings = findMissingImportedFields(parsed);
    state.cwi = normalizeProject(parsed, state.cwi.project);
    state.autoAspect = false;
    state.selectedCueId = state.cwi.cues[0] ? state.cwi.cues[0].id : "";
    state.selectedWordId = "";
    state.activeTab = "qa";
    state.importError = "";
    announceStatus(`Imported CWI JSON with ${state.cwi.cues.length} cues.`);
    renderAll();
  } catch (error) {
    showImportError(errorMessage(error, "The selected JSON file could not be imported."));
  }
}

async function applyLocalVolumeAnalysis(): Promise<void> {
  const skip = (note: string, status: string) => {
    addReviewNote(state.cwi, note);
    announceStatus(status);
    renderAll();
  };

  if (!state.mediaFile) {
    skip("Audio analysis skipped because no uploaded media file is available; neutral volume values were kept.", "Audio analysis skipped. Neutral volume values were kept.");
    return;
  }
  if (state.mediaFile.size > MAX_ANALYSIS_BYTES) {
    skip("Audio analysis skipped because the uploaded media is over 120 MB; neutral volume values were kept.", "Audio analysis skipped for large media. Neutral volume values were kept.");
    return;
  }
  if (getDuration() > 180) {
    skip("Audio analysis skipped because the uploaded media is longer than 3 minutes; neutral volume values were kept.", "Audio analysis skipped for long media. Neutral volume values were kept.");
    return;
  }

  try {
    announceStatus("Analyzing local audio for initial volume emphasis.");
    const audioBuffer = await loadMediaAudio(state.mediaFile);
    if (!audioBuffer) throw new Error("The browser could not decode this media's audio.");
    const analysis = analyzeWordVolumes(audioBuffer, state.cwi.cues);
    analysis.words.forEach((item) => {
      item.word.volumePercent = item.volumePercent;
    });
    const emphasized = analysis.words.filter((item) => item.volumePercent !== NEUTRAL_VOLUME).length;
    addReviewNote(state.cwi, `Local audio analysis compared ${analysis.words.length} words with the ${Number.isFinite(analysis.referenceDb) ? `${analysis.referenceDb.toFixed(1)} dBFS` : "unmeasured"} median speech level; ${emphasized} words were marked louder or softer than normal.`);
    announceStatus(`Audio analysis marked ${emphasized} words as louder or softer than normal speech.`);
  } catch (error) {
    addReviewNote(state.cwi, `Audio analysis failed; neutral volume values were kept. ${errorMessage(error, String(error))}`);
    announceStatus("Audio analysis failed. Neutral volume values were kept.");
  }

  renderAll();
}

function loadMediaAudio(file: File): Promise<AudioBuffer | null> {
  if (!file || file.size > MAX_ANALYSIS_BYTES) return Promise.resolve(null);
  if (state.audioBuffer && state.audioSource === file) return Promise.resolve(state.audioBuffer);
  if (state.audioPromise && state.audioSource === file) return state.audioPromise;

  state.audioSource = file;
  state.audioPromise = (async () => {
    try {
      const AudioContextClass: typeof AudioContext | undefined = window.AudioContext
        || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;
      const audioContext = new AudioContextClass();
      const audioBuffer = await audioContext.decodeAudioData((await file.arrayBuffer()).slice(0));
      if (typeof audioContext.close === "function") audioContext.close();
      if (state.mediaFile !== file) return null;
      state.audioBuffer = audioBuffer;
      state.waveform = computeWaveform(audioBuffer);
      return audioBuffer;
    } catch {
      return null;
    }
  })();
  return state.audioPromise;
}

export function exportProjectJson(): void {
  const payload: Project = JSON.parse(JSON.stringify(state.cwi));
  payload.review.validationStatus = validateProject(payload, qaContext()).some((item) => item.status === "fail") ? "needs-review" : "pass";

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(payload.project.title || "cwi-project")}.cwi.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
