// Editor entry point: collect element references, wire every region, and render.

import { els, query, queryAll } from "./dom.ts";
import { getCue, state, subscribe } from "./store.ts";
import { invalidate, registerRenderer, renderAll } from "./render.ts";
import { DEFAULT_MEDIA_SRC } from "./sample-media.ts";
import { renderCaptionOverlay, setupCaptionStage, setupGuideToggle } from "./caption-view.ts";
import { currentMediaTime, getCurrentCueAndWord, renderTimeReadout, setupPlaybackControls, setupVideoEvents } from "./playback.ts";
import { renderTimeline, setupTimelineEvents, updatePlayhead, updateTimelineActiveStates } from "./timeline.ts";
import { renderSideContent, renderTabs, setupSidePanelEvents, setupTabs } from "./side-panel.ts";
import { refreshTranscriptCueRow } from "./panels/transcript.ts";
import { renderInspector, setupInspectorEvents } from "./inspector.ts";
import { setupInspectorResize } from "./inspector-resize.ts";
import { renderStageFrame, renderTopbar, setupTopActions } from "./topbar.ts";

document.addEventListener("DOMContentLoaded", init);

function init(): void {
  els.video = query<HTMLVideoElement>(".media");
  els.phoneFrame = query(".phone-frame");
  els.captionSafe = query(".caption-safe");
  els.playButton = query(".play-icon");
  els.stepButtons = queryAll(".preview-button");
  els.soundButton = query(".sound-button");
  els.guideButton = query(".guide-button");
  els.timeReadout = query(".time-readout");
  els.timelineGrid = query(".timeline-grid");
  els.sideContent = query(".transcript");
  els.inspector = query(".inspector");
  els.inspectorResize = query(".inspector-resize");
  els.inspectorHead = query(".inspector-head");
  els.inspectorBody = query(".inspector-body");
  els.projectName = query(".project-name");
  els.mediaBoundary = query(".project-meta .small-pill");
  els.topActions = query(".top-actions");
  els.tabs = queryAll(".tab");
  els.statusRegion = document.createElement("div");
  els.statusRegion.className = "visually-hidden";
  els.statusRegion.setAttribute("role", "status");
  els.statusRegion.setAttribute("aria-live", "polite");
  els.statusRegion.setAttribute("aria-atomic", "true");
  document.body.appendChild(els.statusRegion);

  els.video.src = DEFAULT_MEDIA_SRC;
  els.video.muted = false;
  els.video.volume = 0.85;

  registerRenderer("stage", renderStageFrame);
  registerRenderer("topbar", renderTopbar);
  registerRenderer("tabs", renderTabs);
  registerRenderer("side", renderSideContent);
  registerRenderer("inspector", renderInspector);
  registerRenderer("timeline", renderTimeline);
  registerRenderer("playback", renderPlayback);

  setupCaptionStage();
  setupTopActions();
  setupTabs();
  setupPlaybackControls();
  setupGuideToggle();
  setupSidePanelEvents();
  setupTimelineEvents();
  setupInspectorEvents();
  setupInspectorResize();
  setupVideoEvents();
  // Keep the undo/redo buttons in step with every project change.
  subscribe(() => invalidate("topbar"));
  renderAll();
}

// Everything that follows the playhead: the caption overlay, the time readout, the playhead,
// and the live word highlights in the timeline and transcript.
function renderPlayback(): void {
  renderCaptionOverlay(currentMediaTime());
  renderTimeReadout();
  updatePlayhead();

  const current = getCurrentCueAndWord();
  const key = `${current.cueId || ""}:${current.wordId || ""}`;
  if (key !== state.playbackKey) {
    const previousCueId = state.playbackKey.split(":")[0];
    state.playbackKey = key;
    updateTimelineActiveStates(current);
    if (state.activeTab === "transcript") {
      const previousCue = previousCueId ? getCue(previousCueId) : null;
      const cue = current.cueId ? getCue(current.cueId) : null;
      if (previousCue) refreshTranscriptCueRow(previousCue);
      if (cue && cue !== previousCue) refreshTranscriptCueRow(cue);
    }
  }
}
