import { clamp, escapeAttr, escapeHtml, formatTime } from "../core/util.ts";
import { PX_PER_SECOND } from "./constants.ts";
import { closestElement, els, queryAll } from "./dom.ts";
import { currentMediaTime, getCurrentCueAndWord, getDuration, isCueLive, seekPreviewToTime } from "./playback.ts";
import { invalidateAll, renderParts } from "./render.ts";
import { AUDIO_WAVEFORM } from "./sample-media.ts";
import { announceStatus } from "./status.ts";
import { speakerName, state } from "./store.ts";

// Timeline under the preview: waveform, word and cue segments, playhead, and seeking.

export function setupTimelineEvents(): void {
  els.timelineGrid.addEventListener("click", (event) => {
    const segment = closestElement(event, "[data-cue-id]");
    if (!segment) {
      if (closestElement(event, "[data-timeline-seek]")) seekTimelineFromPointer(event);
      return;
    }

    state.selectedCueId = segment.dataset.cueId || "";
    state.selectedWordId = segment.dataset.wordId || "";
    invalidateAll();
  });

  els.timelineGrid.addEventListener("keydown", (event) => {
    if (!closestElement(event, ".timeline-scroll")) return;

    const duration = getDuration();
    let nextTime = currentMediaTime();
    if (event.key === "ArrowLeft") nextTime -= event.shiftKey ? 1 : 0.25;
    else if (event.key === "ArrowRight") nextTime += event.shiftKey ? 1 : 0.25;
    else if (event.key === "Home") nextTime = 0;
    else if (event.key === "End") nextTime = duration;
    else return;

    event.preventDefault();
    seekPreviewToTime(nextTime);
    renderParts("playback");
    announceStatus(`Preview time ${formatTime(currentMediaTime())}`);
  });
}

export function renderTimeline(): void {
  const scroller = els.timelineGrid.querySelector<HTMLElement>(".timeline-scroll");
  const previousScrollLeft = scroller ? scroller.scrollLeft : 0;
  const duration = getDuration();
  const contentWidth = Math.max(760, Math.ceil(duration * PX_PER_SECOND) + 40);
  const ticks: number[] = [];
  const tickStep = duration <= 12 ? 2 : 5;
  for (let tick = 0; tick <= duration; tick += tickStep) ticks.push(tick);
  if (!ticks.includes(Math.floor(duration))) ticks.push(Math.floor(duration));

  els.timelineGrid.style.minWidth = "0";
  els.timelineGrid.innerHTML = `
    <div class="timeline-corner" aria-hidden="true"></div>
    <div class="row-label" style="grid-row: 2">Audio</div>
    <div class="row-label" style="grid-row: 3">Words</div>
    <div class="row-label" style="grid-row: 4">CWI</div>
    <div class="timeline-scroll" tabindex="0" role="slider" aria-label="Timeline seek control" aria-valuemin="0" aria-valuemax="${Math.round(duration)}" aria-valuenow="${currentMediaTime().toFixed(2)}" aria-valuetext="${formatTime(currentMediaTime())}">
      <div class="playhead" aria-hidden="true" style="left: ${currentMediaTime() * PX_PER_SECOND}px"></div>
      <div class="ruler" style="min-width: ${contentWidth}px">
        ${ticks.map((tick) => `<span style="left: ${tick * PX_PER_SECOND}px">${formatTime(tick)}</span>`).join("")}
      </div>
      <div class="row-content" data-timeline-seek style="min-width: ${contentWidth}px">
        <div class="wave">${renderWaveform()}</div>
      </div>
      <div class="row-content" data-timeline-seek style="min-width: ${contentWidth}px">
        ${renderWordSegments()}
      </div>
      <div class="row-content" data-timeline-seek style="min-width: ${contentWidth}px">
        ${renderCueSegments()}
      </div>
    </div>
  `;
  const nextScroller = els.timelineGrid.querySelector<HTMLElement>(".timeline-scroll");
  if (nextScroller) nextScroller.scrollLeft = previousScrollLeft;
}

function renderWaveform(): string {
  // The bundled sample ships a precomputed waveform; imported media uses its decoded audio.
  const values = state.mediaObjectUrl ? state.waveform || [] : AUDIO_WAVEFORM;
  return values.map((value) => {
    const height = Math.max(3, Math.round(6 + value * 38));
    return `<i style="height: ${height}px"></i>`;
  }).join("");
}

function renderWordSegments(): string {
  const current = getCurrentCueAndWord();
  return state.cwi.cues.flatMap((cue) => (cue.words || []).map((word) => {
    const active = word.id === state.selectedWordId || word.id === current.wordId;
    const estimated = word.timing === "estimated";
    return `<button type="button" class="segment${active ? " active" : ""}${estimated ? " estimated" : ""}" style="left: ${word.start * PX_PER_SECOND}px; width: ${Math.max(34, (word.end - word.start) * PX_PER_SECOND)}px" data-cue-id="${escapeAttr(cue.id)}" data-word-id="${escapeAttr(word.id)}"${estimated ? ' title="Estimated timing"' : ""}>${escapeHtml(word.text)}</button>`;
  })).join("");
}

function renderCueSegments(): string {
  return state.cwi.cues.map((cue) => {
    const active = cue.id === state.selectedCueId || isCueLive(cue, currentMediaTime());
    const label = cue.type === "dialogue" ? `dialogue · ${speakerName(cue.speakerId)}` : `${cue.type} cue`;
    return `<button type="button" class="segment${active ? " active" : ""}" style="left: ${cue.start * PX_PER_SECOND}px; width: ${Math.max(58, (cue.end - cue.start) * PX_PER_SECOND)}px" data-cue-id="${escapeAttr(cue.id)}">${escapeHtml(label)}</button>`;
  }).join("");
}

function seekTimelineFromPointer(event: MouseEvent): void {
  const scroller = els.timelineGrid.querySelector<HTMLElement>(".timeline-scroll");
  if (!scroller) return;

  const rect = scroller.getBoundingClientRect();
  const x = event.clientX - rect.left + scroller.scrollLeft;
  const time = clamp(x / PX_PER_SECOND, 0, getDuration());
  seekPreviewToTime(time);
  renderParts("playback");
}

export function updateTimelineActiveStates(current = getCurrentCueAndWord()): void {
  queryAll(".segment", els.timelineGrid).forEach((segment) => {
    const active = (segment.dataset.wordId && segment.dataset.wordId === current.wordId) ||
      (!segment.dataset.wordId && segment.dataset.cueId && segment.dataset.cueId === current.cueId) ||
      (segment.dataset.cueId && segment.dataset.cueId === state.selectedCueId) ||
      (segment.dataset.wordId && segment.dataset.wordId === state.selectedWordId);
    segment.classList.toggle("active", Boolean(active));
  });
}

export function updatePlayhead(): void {
  const playhead = els.timelineGrid.querySelector<HTMLElement>(".playhead");
  if (playhead) playhead.style.left = `${currentMediaTime() * PX_PER_SECOND}px`;
  const scroller = els.timelineGrid.querySelector(".timeline-scroll");
  if (scroller) {
    scroller.setAttribute("aria-valuenow", currentMediaTime().toFixed(2));
    scroller.setAttribute("aria-valuetext", formatTime(currentMediaTime()));
  }
}
