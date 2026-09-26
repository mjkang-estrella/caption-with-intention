// Speakers tab: character list, roles, and attribution colors.

import { addSpeaker, colorFitsRole, nextSpeakerColor } from "../../core/edit.ts";
import { SPEAKER_ROLES, isOneOf } from "../../core/schema.ts";
import { SPEAKER_PALETTE } from "../../core/style.ts";
import { escapeAttr, escapeHtml } from "../../core/util.ts";
import { controlValue, els } from "../dom.ts";
import type { Control } from "../dom.ts";
import { commit, getSpeaker, roleLabel, state } from "../store.ts";

export function renderSpeakersPanel(): void {
  els.sideContent.innerHTML = `
    <div class="panel-list speakers-panel">
      <div class="speaker-list">
        ${state.cwi.speakers.map((speaker) => {
        const isEditing = speaker.id === state.selectedSpeakerId;
        return `
        <div class="speaker-card${isEditing ? " is-editing" : ""}" data-speaker-card="${escapeAttr(speaker.id)}">
          <div class="speaker-card-head" role="button" tabindex="0" data-speaker-edit="${escapeAttr(speaker.id)}" aria-expanded="${isEditing}">
            <div class="speaker-select-content">
              <span class="speaker-chip" style="background: ${escapeAttr(speaker.color)}"></span>
              <span class="speaker-select-copy">
                <span class="speaker-name">${escapeHtml(speaker.name || "Unnamed speaker")}</span>
                <span class="speaker-meta">${escapeHtml(roleLabel(speaker.role))}</span>
              </span>
            </div>
          </div>

          ${isEditing ? `
          <div class="speaker-edit-grid">
            <div class="control-group">
              <label class="control-label" for="${escapeAttr(speaker.id)}Name">Character name</label>
              <input class="control-input" id="${escapeAttr(speaker.id)}Name" data-speaker-control="name" data-speaker-id="${escapeAttr(speaker.id)}" value="${escapeAttr(speaker.name)}">
            </div>

            <div class="speaker-edit-row">
              <div class="control-group">
                <label class="control-label" for="${escapeAttr(speaker.id)}Role">Character class</label>
                <select class="control-select" id="${escapeAttr(speaker.id)}Role" data-speaker-control="role" data-speaker-id="${escapeAttr(speaker.id)}">
                  ${SPEAKER_ROLES.map((role) => `<option value="${role}"${speaker.role === role ? " selected" : ""}>${roleLabel(role)}</option>`).join("")}
                </select>
              </div>

              <div class="control-group">
                <label class="control-label" for="${escapeAttr(speaker.id)}Color">Attribution color</label>
                <div class="speaker-color-select">
                  <span class="speaker-chip-large" style="background: ${escapeAttr(speaker.color)}"></span>
                  <select class="control-select" id="${escapeAttr(speaker.id)}Color" data-speaker-control="color" data-speaker-id="${escapeAttr(speaker.id)}">
                    ${renderSpeakerColorOptions(speaker.color)}
                  </select>
                </div>
              </div>
            </div>

            <label class="checkbox-row">
              <input type="checkbox" data-speaker-control="defaultOffCamera" data-speaker-id="${escapeAttr(speaker.id)}"${speaker.defaultOffCamera ? " checked" : ""}>
              Default this character to off-camera italics
            </label>
          </div>
          ` : ""}
        </div>
      `;
      }).join("")}
      </div>
      <div class="panel-action-row speaker-actions">
        <button type="button" class="primary-button" data-add-speaker>Add character</button>
        <span class="speaker-help">
          <button type="button" class="speaker-help-button" aria-label="Speaker color guidance" aria-describedby="speakerGuidance">?</button>
          <span class="speaker-help-text" id="speakerGuidance" role="tooltip">Use main colors for primary characters, supporting colors for secondary voices, and softer pastel colors for minor characters.</span>
        </span>
      </div>
    </div>
  `;
}

function renderSpeakerColorOptions(selectedColor: string): string {
  const groups = SPEAKER_ROLES.map((role) => {
    const colors = SPEAKER_PALETTE.filter((entry) => entry.role === role);
    return `
      <optgroup label="${escapeAttr(roleLabel(role))}">
        ${colors.map((entry) => `<option value="${escapeAttr(entry.color)}"${entry.color.toLowerCase() === String(selectedColor).toLowerCase() ? " selected" : ""}>${escapeHtml(entry.label)} · ${escapeHtml(entry.color)}${entry.template ? " · AE template" : ""}</option>`).join("")}
      </optgroup>
    `;
  }).join("");

  const isKnownColor = SPEAKER_PALETTE.some((entry) => entry.color.toLowerCase() === String(selectedColor).toLowerCase());
  return `${isKnownColor ? "" : `<option value="${escapeAttr(selectedColor)}" selected>Custom · ${escapeHtml(selectedColor)}</option>`}${groups}`;
}

export function updateSpeakerFromControl(control: Control): void {
  const speaker = getSpeaker(control.dataset.speakerId || "");
  if (!speaker) return;

  const value = controlValue(control);
  const field = control.dataset.speakerControl || "";
  commit(SPEAKER_FIELD_LABELS[field] || "Character", (project) => {
    if (field === "name") {
      speaker.name = String(value).trim() || "Unnamed speaker";
    } else if (field === "role") {
      speaker.role = isOneOf(SPEAKER_ROLES, value) ? value : "supporting";
      if (!colorFitsRole(speaker.color, speaker.role)) speaker.color = nextSpeakerColor(project, speaker.role);
    } else if (field === "color") {
      speaker.color = String(value);
    } else if (field === "defaultOffCamera") {
      speaker.defaultOffCamera = Boolean(value);
    }
  }, { coalesceKey: `speaker-${field}:${speaker.id}` });
}

const SPEAKER_FIELD_LABELS: Record<string, string> = {
  name: "Character name",
  role: "Character class",
  color: "Attribution color",
  defaultOffCamera: "Off-camera default"
};

export function addSpeakerToProject(): void {
  commit("Add character", (project) => {
    state.selectedSpeakerId = addSpeaker(project).id;
  });
  state.activeTab = "speakers";
}
