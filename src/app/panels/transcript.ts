// Transcript tab: cue list with live word highlights and the inline cue editor.

import type { Cue } from "../../core/types.ts";
import { hasTimingWarning, insertCue, removeCue, updateCueTextAndWords } from "../../core/edit.ts";
import { cueDisplayText } from "../../core/renderer.ts";
import { CUE_TYPES, hasException, isOneOf } from "../../core/schema.ts";
import { capitalize, escapeAttr, escapeHtml, formatTime } from "../../core/util.ts";
import { els, queryAll } from "../dom.ts";
import type { Control } from "../dom.ts";
import { getCurrentCueAndWord } from "../playback.ts";
import { commit, getCue, getSpeaker, state } from "../store.ts";

export function renderTranscriptPanel(): void {
  const current = getCurrentCueAndWord();
  if (!state.cwi.cues.length) {
    els.sideContent.innerHTML = `
      <div class="panel-list transcript-panel">
        <div class="empty-card import-guidance">
          <div class="empty-title">Import captions to start editing</div>
          <p>The selected media is loaded locally. Import an SRT or WebVTT file to create editable CWI cues with approximate word timing and local volume emphasis.</p>
          <button type="button" class="primary-button" data-import-captions>Import Captions</button>
        </div>
        <div class="panel-action-row transcript-actions">
          <button type="button" class="primary-button" data-add-cue>Add cue</button>
        </div>
      </div>
    `;
    return;
  }

  els.sideContent.innerHTML = `
    <div class="panel-list transcript-panel">
      <div class="transcript-list">
        ${state.cwi.cues.map((cue) => {
    const speaker = getSpeaker(cue.speakerId);
    const active = cue.id === state.selectedCueId;
    const editId = cueEditDomId(cue.id);
    const cueTypeClass = cue.type === "dialogue" ? "" : ` ${cue.type}`;
    const speakerMarkup = speaker
      ? `<div class="speaker"><i style="background: ${escapeAttr(speaker.color)}"></i>${escapeHtml(speaker.name)}</div>`
      : `<div class="speaker"><i style="background: var(--ink-dim)"></i>${escapeHtml(cue.type)}</div>`;

    return `
      <div class="cue${active ? " active" : ""}" data-cue-id="${escapeAttr(cue.id)}">
        <button type="button" class="cue-select-surface" data-cue-select="${escapeAttr(cue.id)}" aria-expanded="${active}"${active ? ` aria-controls="${escapeAttr(editId)}"` : ""}>
          <div>
            <div class="cue-time">${formatTime(cue.start)}</div>
            ${speakerMarkup}
          </div>
          <div class="cue-copy${cueTypeClass}">
            ${renderCueWordsForTranscript(cue, current.wordId)}
          </div>
        </button>
        ${active ? renderTranscriptCueEditor(cue, editId) : ""}
      </div>
    `;
  }).join("")}
      </div>
      <div class="panel-action-row transcript-actions">
        <button type="button" class="primary-button" data-add-cue>Add cue</button>
      </div>
    </div>
  `;
}

function renderTranscriptCueEditor(cue: Cue, editId: string): string {
  return `
    <div class="cue-edit-grid" id="${escapeAttr(editId)}">
      <div class="control-group">
        <label class="control-label" for="${escapeAttr(cue.id)}TranscriptType">Cue type</label>
        <select class="control-select" id="${escapeAttr(cue.id)}TranscriptType" data-transcript-control="type" data-cue-id="${escapeAttr(cue.id)}">
          ${CUE_TYPES.map((type) => `<option value="${type}"${cue.type === type ? " selected" : ""}>${capitalize(type)}</option>`).join("")}
        </select>
      </div>

      <div class="control-group">
        <label class="control-label" for="${escapeAttr(cue.id)}TranscriptText">Transcript text</label>
        <textarea class="control-textarea" id="${escapeAttr(cue.id)}TranscriptText" data-transcript-control="text" data-cue-id="${escapeAttr(cue.id)}">${escapeHtml(cue.text || "")}</textarea>
      </div>

      <div class="cue-edit-actions">
        <button type="button" class="danger-button" data-delete-cue="${escapeAttr(cue.id)}">Delete cue</button>
      </div>
    </div>
  `;
}

function renderCueWordsForTranscript(cue: Cue, liveWordId: string): string {
  if (!cue.words || cue.words.length === 0) {
    return `<span class="word">${escapeHtml(cueDisplayText(cue))}</span>`;
  }

  return cue.words.map((word) => {
    const live = word.id === liveWordId;
    const warn = hasException(cue) || hasTimingWarning(cue, word);
    const estimated = word.timing === "estimated";
    return `<span class="word${live ? " live" : ""}${warn ? " warn" : ""}${estimated ? " estimated" : ""}"${estimated ? ' title="Estimated timing"' : ""}>${escapeHtml(word.text)}</span>`;
  }).join(" ");
}

export function updateTranscriptCueFromControl(control: Control): void {
  const cue = getCue(control.dataset.cueId || "");
  if (!cue) return;

  const value = control.value;
  if (control.dataset.transcriptControl === "type") {
    commit("Cue type", (project) => {
      cue.type = isOneOf(CUE_TYPES, value) ? value : "dialogue";
      if (cue.type !== "dialogue") {
        cue.speakerId = "";
        cue.offCamera = false;
      } else if (!cue.speakerId && project.speakers[0]) {
        cue.speakerId = project.speakers[0].id;
      }
    });
  } else if (control.dataset.transcriptControl === "text") {
    commit("Transcript text", (project) => updateCueTextAndWords(project, cue, String(value)), { coalesceKey: `transcript-text:${cue.id}` });
    refreshTranscriptCueRow(cue);
  }

  if (state.selectedWordId && (!cue.words || !cue.words.some((word) => word.id === state.selectedWordId))) state.selectedWordId = "";
}

export function addCueToTranscript(): void {
  let cueId = "";
  commit("Add cue", (project) => {
    cueId = insertCue(project, state.selectedCueId).id;
  });
  state.selectedCueId = cueId;
  state.selectedWordId = "";
  state.activeTab = "transcript";
}

export function deleteCueFromTranscript(cueId: string): void {
  commit("Delete cue", (project) => {
    state.selectedCueId = removeCue(project, cueId);
  });
  state.selectedWordId = "";
}

export function refreshTranscriptCueRow(cue: Cue): void {
  const row = queryAll(".cue[data-cue-id]", els.sideContent).find((item) => item.dataset.cueId === cue.id);
  if (!row) return;

  const copy = row.querySelector(".cue-copy");
  if (copy) copy.innerHTML = renderCueWordsForTranscript(cue, getCurrentCueAndWord().wordId);
}

function cueEditDomId(cueId: string): string {
  return `cueEdit-${cueId}`;
}
