import type { Cue, Word } from "../core/types.ts";
import { liveCues } from "../core/renderer.ts";
import { nearestAspectRatio } from "../core/schema.ts";
import { clamp, formatTime, roundTime } from "../core/util.ts";
import { els } from "./dom.ts";
import { renderAll, renderParts } from "./render.ts";
import { state } from "./store.ts";

// Preview video: transport controls, the playback clock, and seeking.

export function setupPlaybackControls(): void {
  const [backButton, playButton, forwardButton] = els.stepButtons;
  backButton.addEventListener("click", () => stepPlayback(-0.25));
  playButton.addEventListener("click", togglePlayback);
  forwardButton.addEventListener("click", () => stepPlayback(0.25));
  els.soundButton.addEventListener("click", toggleSound);
  setSoundButton();
}

export function setupVideoEvents(): void {
  els.video.addEventListener("loadedmetadata", () => {
    if (Number.isFinite(els.video.duration) && els.video.duration > 0) {
      state.cwi.project.duration = roundTime(els.video.duration);
    }
    if (state.autoAspect && els.video.videoWidth && els.video.videoHeight) {
      state.cwi.project.aspectRatio = nearestAspectRatio(els.video.videoWidth, els.video.videoHeight);
    }
    renderAll();
  });
  els.video.addEventListener("timeupdate", () => {
    if (!els.video.paused) state.previewTimeOverride = null;
    renderParts("playback");
  });
  els.video.addEventListener("seeking", () => {
    if (!els.video.paused) state.previewTimeOverride = null;
    renderParts("playback");
  });
  els.video.addEventListener("play", () => {
    if (state.previewTimeOverride !== null) {
      seekVideoElement(state.previewTimeOverride);
      state.previewTimeOverride = null;
    }
    setPlayButton();
    startPlaybackLoop();
  });
  els.video.addEventListener("pause", setPlayButton);
  els.video.addEventListener("ended", setPlayButton);
  els.video.addEventListener("volumechange", setSoundButton);
}

function togglePlayback(): void {
  if (els.video.paused) {
    els.video.muted = false;
    if (els.video.volume === 0) els.video.volume = 0.85;
    els.video.play().catch(() => {
      state.importError = "Preview playback was blocked by the browser.";
      state.activeTab = "qa";
      renderAll();
    });
  } else {
    els.video.pause();
  }
}

function toggleSound(): void {
  if (els.video.muted || els.video.volume === 0) {
    els.video.muted = false;
    if (els.video.volume === 0) els.video.volume = 0.85;
  } else {
    els.video.muted = true;
  }
  setSoundButton();
}

function stepPlayback(delta: number): void {
  seekPreviewToTime(currentMediaTime() + delta);
  renderParts("playback");
}

// Captions render at display rate. When the browser reports presented video frames, anchor
// caption time to the frame on screen instead of the coarser currentTime.
function startPlaybackLoop(): void {
  state.frameAnchor = null;
  if (typeof els.video.requestVideoFrameCallback === "function") {
    const onVideoFrame = (_now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => {
      state.frameAnchor = { mediaTime: metadata.mediaTime, wallTime: performance.now() };
      if (!els.video.paused && !els.video.ended) els.video.requestVideoFrameCallback(onVideoFrame);
    };
    els.video.requestVideoFrameCallback(onVideoFrame);
  }
  requestAnimationFrame(playbackLoop);
}

function playbackLoop(): void {
  renderParts("playback");
  if (!els.video.paused && !els.video.ended) requestAnimationFrame(playbackLoop);
  else state.frameAnchor = null;
}

export function renderTimeReadout(): void {
  els.timeReadout.textContent = `${formatTime(currentMediaTime())} / ${formatTime(getDuration())}`;
}

function setPlayButton(): void {
  const path = els.video.paused
    ? '<path d="M8 5v14l11-7-11-7Z" fill="currentColor" stroke="none"></path>'
    : '<path d="M8 5v14"></path><path d="M16 5v14"></path>';
  els.playButton.setAttribute("aria-label", els.video.paused ? "Play preview" : "Pause preview");
  els.playButton.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
}

function setSoundButton(): void {
  if (!els.soundButton) return;
  const muted = els.video.muted || els.video.volume === 0;
  const path = muted
    ? '<path d="M4 9v6h4l5 4V5L8 9H4Z"></path><path d="m17 9 4 6"></path><path d="m21 9-4 6"></path>'
    : '<path d="M4 9v6h4l5 4V5L8 9H4Z"></path><path d="M17 9.5a4 4 0 0 1 0 5"></path><path d="M19.5 7a7 7 0 0 1 0 10"></path>';
  els.soundButton.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
  els.soundButton.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
}

export function getCurrentCueAndWord(): { cueId: string; wordId: string } {
  const mediaTime = currentMediaTime();
  const live = liveCues(state.cwi, mediaTime);
  const cue = live[live.length - 1];
  if (!cue) return { cueId: "", wordId: "" };
  if (cue.type !== "dialogue") {
    return { cueId: cue.id, wordId: cue.words && cue.words[0] ? cue.words[0].id : "" };
  }
  const word = currentWordForCue(cue, mediaTime);
  return { cueId: cue.id, wordId: word ? word.id : "" };
}

export function isCueLive(cue: Cue, time: number): boolean {
  return time >= Number(cue.start) && time <= Number(cue.end);
}

function currentWordForCue(cue: Cue, time: number): Word | null {
  const words = cue.words || [];
  return words.find((word) => isWordLive(word, time)) || null;
}

function isWordLive(word: Word, time: number): boolean {
  return time >= Number(word.start) && time <= Number(word.end);
}

export function getDuration(): number {
  if (Number.isFinite(els.video.duration) && els.video.duration > 0) return els.video.duration;
  return Number(state.cwi.project.duration) || 0;
}

export function currentMediaTime(): number {
  if (state.previewTimeOverride !== null && els.video.paused) return state.previewTimeOverride;
  const anchor = state.frameAnchor;
  if (anchor && !els.video.paused) {
    const elapsed = (performance.now() - anchor.wallTime) / 1000;
    if (elapsed >= 0 && elapsed < 0.25) return anchor.mediaTime + elapsed * (els.video.playbackRate || 1);
  }
  return els.video.currentTime || 0;
}

export function seekPreviewToTime(time: number): void {
  const nextTime = clamp(time, 0, getDuration());
  state.previewTimeOverride = nextTime;
  seekVideoElement(nextTime);
}

function seekVideoElement(time: number): void {
  if (typeof els.video.fastSeek === "function") {
    try {
      els.video.fastSeek(time);
      return;
    } catch {
      // Fall back to currentTime assignment below.
    }
  }
  els.video.currentTime = time;
}
