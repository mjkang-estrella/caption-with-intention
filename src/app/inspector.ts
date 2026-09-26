// Editor panel on the right: cue editor (timing, speaker, flags, exceptions) and word editor
// (timing, volume, motion, syllables, line breaks, tone).

import type { Cue, CueException, Speaker, Word } from "../core/types.ts";
import { normalizeCueTiming, reseedEstimatedWords, setWordSyllables, syncCueTextFromWords } from "../core/edit.ts";
import { cueDisplayText } from "../core/renderer.ts";
import { WORD_MOTIONS, isOneOf, normalizeException } from "../core/schema.ts";
import { CWI_STYLE, NEUTRAL_VOLUME, sliderFromTone, toneForPitchHz, toneFromSlider, toneInBand, volumeScreenPercent } from "../core/style.ts";
import { capitalize, clamp, escapeAttr, escapeHtml, roundTime, toNumber } from "../core/util.ts";
import { closestElement, controlValue, els, eventElement } from "./dom.ts";
import type { Control } from "./dom.ts";
import { renderAll, renderParts } from "./render.ts";
import { getSelectedCue, getSelectedWord, getSpeaker, roleLabel, selectAdjacentWord, state } from "./store.ts";

export function setupInspectorEvents(): void {
  // While typing or dragging, update everything except the inspector itself so focus stays put.
  els.inspector.addEventListener("input", (event) => {
    const control = eventElement(event) as Control | null;
    if (!control || !control.dataset.control || control.dataset.commit === "change") return;
    applyInspectorControl(control);
    syncInspectorTitle();
    renderParts("side", "timeline", "playback");
    updateRangeOutputs();
  });

  els.inspector.addEventListener("change", (event) => {
    const control = eventElement(event) as Control | null;
    if (!control || !control.dataset.control) return;
    applyInspectorControl(control);
    renderAll();
  });

  els.inspector.addEventListener("click", (event) => {
    if (closestElement(event, "[data-speaker-trigger]")) {
      toggleSpeakerSelector();
      return;
    }

    const speakerOption = closestElement(event, "[data-cue-speaker-option]");
    if (speakerOption) {
      selectCueSpeaker(speakerOption.dataset.cueSpeakerOption || "");
      return;
    }

    const wordPick = closestElement(event, "[data-inspector-word-id]");
    if (wordPick) {
      state.selectedCueId = wordPick.dataset.cueId || "";
      state.selectedWordId = wordPick.dataset.inspectorWordId || "";
      renderAll();
      return;
    }

    const wordNav = closestElement(event, "[data-word-nav]");
    if (wordNav) {
      selectAdjacentWord(Number(wordNav.dataset.wordNav));
      renderAll();
      return;
    }

    const preset = closestElement(event, "[data-volume-preset]");
    if (preset) {
      const word = getSelectedWord();
      if (word) {
        word.volumePercent = Number(preset.dataset.volumePreset);
        renderAll();
      }
      return;
    }
  });

  els.inspector.addEventListener("keydown", handleSpeakerSelectorKeydown);
}

export function renderInspector(): void {
  const cue = getSelectedCue();
  const word = getSelectedWord();

  if (!cue) {
    els.inspectorHead.innerHTML = '<div class="inspector-title">EDITOR</div>';
    els.inspectorBody.innerHTML = '<div class="empty-card">Import a CWI JSON file or select a cue to edit caption intent.</div>';
    return;
  }

  els.inspectorHead.innerHTML = '<div class="inspector-title">EDITOR</div>';

  els.inspectorBody.innerHTML = `
    ${renderCueEditor(cue)}
    ${renderWordEditor(cue, word)}
  `;
}

function renderCueEditor(cue: Cue): string {
  const speaker = getSpeaker(cue.speakerId);
  const words = cue.words || [];
  const selectedIndex = words.findIndex((item) => item.id === state.selectedWordId);
  const exception = normalizeException(cue.exception);
  const estimatedCount = words.filter((word) => word.timing === "estimated").length;

  return `
    <section class="editor-section" aria-label="Cue Editor">
      <div class="editor-section-head">
        <div class="editor-section-title">Cue Editor</div>
        <span class="small-pill">${escapeHtml(capitalize(cue.type))}</span>
      </div>

      <div class="field-row">
        <div class="control-group">
          <label class="control-label" for="cueStart">Cue start</label>
          <input class="control-input" id="cueStart" type="number" min="0" step="0.01" data-control="cue-start" value="${cue.start}">
        </div>
        <div class="control-group">
          <label class="control-label" for="cueEnd">Cue end</label>
          <input class="control-input" id="cueEnd" type="number" min="0" step="0.01" data-control="cue-end" value="${cue.end}">
        </div>
      </div>

      ${renderSpeakerSelector(cue, speaker)}

      <div class="control-group">
        <label class="control-label" for="cueText">Cue text</label>
        <textarea class="control-textarea" id="cueText" data-control="cue-text">${escapeHtml(cue.text || "")}</textarea>
      </div>

      <div class="control-group">
        <div class="control-label">Cue flags</div>
        <div class="checkbox-grid">
          <label class="checkbox-row"><input type="checkbox" data-control="off-camera"${cue.offCamera ? " checked" : ""}> Off-camera voice</label>
        </div>
      </div>

      <fieldset class="control-group exception-group">
        <legend class="control-label">Scene exception</legend>
        <p class="control-help">Turn off parts of the system for this cue when the full treatment would distract from the picture.</p>
        <div class="checkbox-grid">
          <label class="checkbox-row"><input type="checkbox" data-control="exception-color"${exception.color ? " checked" : ""}> No speaker color</label>
          <label class="checkbox-row"><input type="checkbox" data-control="exception-motion"${exception.motion ? " checked" : ""}> No motion</label>
          <label class="checkbox-row"><input type="checkbox" data-control="exception-intonation"${exception.intonation ? " checked" : ""}> No size or tone</label>
        </div>
      </fieldset>

      <div class="control-group">
        <div class="control-label">Words in cue${selectedIndex >= 0 ? ` · ${selectedIndex + 1} of ${words.length}` : ""}</div>
        ${estimatedCount ? `<p class="control-help timing-note">${estimatedCount === words.length ? "Word timing is estimated from the cue" : `${estimatedCount} words use estimated timing`}. Set each word start to its first audible sound.</p>` : ""}
        ${renderCueWordPicker(cue)}
      </div>
    </section>
  `;
}

function renderCueWordPicker(cue: Cue): string {
  const words = cue.words || [];
  if (!words.length) return '<div class="empty-card">This cue has no word timing records yet.</div>';

  return `
    <div class="word-picker">
      ${words.map((word) => `<button type="button" class="word-picker-button${word.id === state.selectedWordId ? " active" : ""}${word.timing === "estimated" ? " estimated" : ""}" data-cue-id="${escapeAttr(cue.id)}" data-inspector-word-id="${escapeAttr(word.id)}">${escapeHtml(word.text)}</button>`).join("")}
    </div>
  `;
}

function renderSpeakerSelector(cue: Cue, speaker: Speaker | null): string {
  const inheritedColor = speaker ? speaker.color : "var(--ink-dim)";
  const speakerMeta = speaker
    ? roleLabel(speaker.role)
    : "No class selected";
  const speakerName = speaker ? speaker.name : "No speaker selected";
  const disabled = cue.type !== "dialogue";
  const options = [
    { id: "", name: "No speaker", meta: "No class selected", color: "var(--ink-dim)" },
    ...state.cwi.speakers.map((item) => ({
      id: item.id,
      name: item.name,
      meta: roleLabel(item.role),
      color: item.color
    }))
  ];
  const activeOptionId = state.activeSpeakerOptionId || cue.speakerId || "";
  const listboxId = "cueSpeakerOptions";

  return `
    <div class="control-group">
      <div class="control-label">Speaker</div>
      ${disabled ? `
        <div class="speaker-custom-trigger" aria-disabled="true">
          <span class="speaker-chip" style="background: ${escapeAttr(inheritedColor)}"></span>
          <span class="speaker-custom-copy">
            <span class="speaker-name">${escapeHtml(speakerName)}</span>
            <span class="speaker-meta">${escapeHtml(speakerMeta)}</span>
          </span>
        </div>
      ` : `
        <div class="speaker-custom-select${state.speakerSelectorOpen ? " is-open" : ""}">
          <button type="button" class="speaker-custom-trigger" data-speaker-trigger aria-haspopup="listbox" aria-expanded="${state.speakerSelectorOpen}" aria-controls="${listboxId}" aria-activedescendant="${state.speakerSelectorOpen ? speakerOptionDomId(activeOptionId) : ""}">
            <span class="speaker-chip" style="background: ${escapeAttr(inheritedColor)}"></span>
            <span class="speaker-custom-copy">
              <span class="speaker-name">${escapeHtml(speakerName)}</span>
              <span class="speaker-meta">${escapeHtml(speakerMeta)}</span>
            </span>
          </button>
          ${state.speakerSelectorOpen ? `
            <div class="speaker-options" id="${listboxId}" role="listbox" aria-label="Choose speaker">
              ${options.map((option) => `
              <div role="option" tabindex="${option.id === activeOptionId ? "0" : "-1"}" id="${speakerOptionDomId(option.id)}" class="speaker-option" data-cue-speaker-option="${escapeAttr(option.id)}" aria-selected="${cue.speakerId === option.id}">
                <span class="speaker-chip" style="background: ${escapeAttr(option.color)}"></span>
                <span class="speaker-custom-copy">
                  <span class="speaker-name">${escapeHtml(option.name)}</span>
                  <span class="speaker-meta">${escapeHtml(option.meta)}</span>
                </span>
              </div>
              `).join("")}
            </div>
          ` : ""}
        </div>
      `}
    </div>
  `;
}

function toggleSpeakerSelector(): void {
  const cue = getSelectedCue();
  state.speakerSelectorOpen = !state.speakerSelectorOpen;
  state.activeSpeakerOptionId = cue ? cue.speakerId || "" : "";
  renderInspector();
  if (state.speakerSelectorOpen) {
    focusSpeakerOption(state.activeSpeakerOptionId);
  }
}

function selectCueSpeaker(speakerId: string): void {
  const cue = getSelectedCue();
  if (cue && cue.type === "dialogue") {
    cue.speakerId = speakerId;
    cue.offCamera = Boolean(getSpeaker(cue.speakerId)?.defaultOffCamera);
  }
  state.speakerSelectorOpen = false;
  state.activeSpeakerOptionId = "";
  renderAll();
  els.inspector.querySelector<HTMLElement>("[data-speaker-trigger]")?.focus();
}

function handleSpeakerSelectorKeydown(event: KeyboardEvent): void {
  const trigger = closestElement(event, "[data-speaker-trigger]");
  const option = closestElement(event, "[data-cue-speaker-option]");
  if (!trigger && !option) return;

  if (trigger) {
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
      event.preventDefault();
      const cue = getSelectedCue();
      state.speakerSelectorOpen = true;
      state.activeSpeakerOptionId = cue ? cue.speakerId || "" : "";
      renderInspector();
      focusSpeakerOption(state.activeSpeakerOptionId);
    }
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    selectCueSpeaker(option?.dataset.cueSpeakerOption || "");
  } else if (event.key === "Escape") {
    event.preventDefault();
    state.speakerSelectorOpen = false;
    renderInspector();
    els.inspector.querySelector<HTMLElement>("[data-speaker-trigger]")?.focus();
  } else if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
    event.preventDefault();
    moveActiveSpeakerOption(event.key);
  }
}

function moveActiveSpeakerOption(key: string): void {
  const options = speakerOptionIds();
  if (!options.length) return;

  const currentIndex = Math.max(0, options.indexOf(state.activeSpeakerOptionId));
  let nextIndex = currentIndex;
  if (key === "ArrowDown") nextIndex = Math.min(options.length - 1, currentIndex + 1);
  else if (key === "ArrowUp") nextIndex = Math.max(0, currentIndex - 1);
  else if (key === "Home") nextIndex = 0;
  else if (key === "End") nextIndex = options.length - 1;

  state.activeSpeakerOptionId = options[nextIndex];
  renderInspector();
  focusSpeakerOption(state.activeSpeakerOptionId);
}

function focusSpeakerOption(optionId: string): void {
  els.inspector.querySelector<HTMLElement>(`#${speakerOptionDomId(optionId)}`)?.focus();
}

function speakerOptionIds(): string[] {
  return ["", ...state.cwi.speakers.map((speaker) => speaker.id)];
}

function speakerOptionDomId(optionId: string): string {
  return `cueSpeakerOption-${optionId || "none"}`;
}

function renderWordEditor(cue: Cue, word: Word | null): string {
  const words = cue.words || [];
  const selectedIndex = word ? words.findIndex((item) => item.id === word.id) : -1;
  if (!word) {
    return `
      <section class="editor-section" aria-label="Word Editor">
        <div class="editor-section-head">
          <div class="editor-section-title">Word Editor</div>
          <span class="small-pill">empty</span>
        </div>
        <div class="empty-card">Select a word in the Cue Editor to adjust transcript text, timing, volume, and layout.</div>
      </section>
    `;
  }

  const volume = toNumber(word.volumePercent, NEUTRAL_VOLUME);
  const pitchWeight = toNumber(word.pitchWeight, CWI_STYLE.type.defaultWeight);
  const pitchWidth = toNumber(word.pitchWidth, CWI_STYLE.type.defaultWidth);
  const toneSlider = Math.round(sliderFromTone(pitchWeight) * 100);
  const withinToneBand = toneInBand(pitchWeight, pitchWidth);
  const motion = WORD_MOTIONS.includes(word.motion) ? word.motion : "pop";
  const isLastWord = selectedIndex === words.length - 1;
  const breakAfter = (cue.lineBreakAfterWordIds || []).includes(word.id);
  const syllables = Array.isArray(word.units) && word.units.length ? word.units.map((unit) => unit.text).join("-") : "";
  const timingLabel = word.timing === "estimated" ? "Estimated" : word.timing === "manual" ? "Manual" : "Aligned";
  const loud = volume >= 60;
  const whisper = volume <= 40;

  return `
    <section class="editor-section" aria-label="Word Editor">
      <div class="editor-section-head">
        <div class="editor-section-title">Word Editor</div>
        <span class="small-pill">${selectedIndex + 1} of ${words.length}</span>
      </div>

      <div class="word-editor-actions">
        <button type="button" class="word-nav-button" data-word-nav="-1">Previous</button>
        <button type="button" class="word-nav-button" data-word-nav="1">Next</button>
      </div>

      <div class="control-group">
        <label class="control-label" for="wordText">Word text</label>
        <input class="control-input" id="wordText" data-control="word-text" value="${escapeAttr(word.text)}">
      </div>

      <div class="field-row">
        <div class="control-group">
          <label class="control-label" for="wordStart">Word start <span class="timing-pill${word.timing === "estimated" ? " estimated" : ""}">${timingLabel}</span></label>
          <input class="control-input" id="wordStart" type="number" min="0" step="0.01" data-control="word-start" value="${word.start}">
        </div>
        <div class="control-group">
          <label class="control-label" for="wordEnd">Word end</label>
          <input class="control-input" id="wordEnd" type="number" min="0" step="0.01" data-control="word-end" value="${word.end}">
        </div>
      </div>

      <div class="control-group">
        <div class="control-label">Vocal emphasis</div>
        <div class="segmented">
          <button type="button" class="${loud ? "active" : ""}" data-volume-preset="82" aria-pressed="${loud}">Loud</button>
          <button type="button" class="${!loud && !whisper ? "active" : ""}" data-volume-preset="${NEUTRAL_VOLUME}" aria-pressed="${!loud && !whisper}">Normal</button>
          <button type="button" class="${whisper ? "active" : ""}" data-volume-preset="28" aria-pressed="${whisper}">Whisper</button>
        </div>
      </div>

      <div class="control-group">
        <label class="control-label" for="volumeSize">Volume size</label>
        <div class="range-row wide">
          <input type="range" id="volumeSize" min="0" max="100" value="${volume}" data-control="volume">
          <span data-output="volume">${volumeScreenPercent(volume).toFixed(1)}%</span>
        </div>
        <label class="checkbox-row"><input type="checkbox" data-control="word-burst"${word.burst ? " checked" : ""}> Loud burst may break out of the box</label>
      </div>

      <div class="control-group">
        <label class="control-label" for="wordMotion">Motion</label>
        <select class="control-select" id="wordMotion" data-control="word-motion">
          <option value="pop"${motion === "pop" ? " selected" : ""}>Word pop</option>
          <option value="syllable"${motion === "syllable" ? " selected" : ""}>Syllable pop</option>
          <option value="none"${motion === "none" ? " selected" : ""}>No motion</option>
        </select>
        ${motion === "syllable" ? `
          <label class="control-label" for="wordSyllables">Syllables</label>
          <input class="control-input" id="wordSyllables" data-control="word-syllables" data-commit="change" placeholder="in-ex-pli-ca-ble" value="${escapeAttr(syllables)}">
          <p class="control-help">Separate syllables with hyphens; they must spell the word. Syllables pop in even steps across the word.</p>
        ` : ""}
        <label class="checkbox-row"><input type="checkbox" data-control="word-break"${breakAfter ? " checked" : ""}${isLastWord ? " disabled" : ""}> Break line after this word</label>
      </div>

      <div class="control-group">
        <label class="control-label" for="wordTone">Tone</label>
        <div class="range-row tone-row">
          <span class="range-end">High</span>
          <input type="range" id="wordTone" min="-100" max="100" value="${toneSlider}" data-control="tone" aria-describedby="toneHelp">
          <span class="range-end">Deep</span>
        </div>
        <p class="control-help" id="toneHelp"><span data-output="tone">wght ${pitchWeight} · wdth ${pitchWidth}</span>. Deeper, fuller voices get heavier and wider type; higher, sharper voices get lighter and narrower type. Leave ordinary words at the center.</p>
      </div>

      <details class="advanced-control">
        <summary>Advanced tone</summary>
        <div class="field-row">
          <div class="control-group">
            <label class="control-label" for="pitchWeight">Weight</label>
            <input class="control-input" id="pitchWeight" type="number" min="${CWI_STYLE.tone.minWeight}" max="${CWI_STYLE.tone.maxWeight}" step="10" data-control="pitch-weight" value="${pitchWeight}">
          </div>
          <div class="control-group">
            <label class="control-label" for="pitchWidth">Width</label>
            <input class="control-input" id="pitchWidth" type="number" min="${CWI_STYLE.tone.minWidth}" max="${CWI_STYLE.tone.maxWidth}" step="1" data-control="pitch-width" value="${pitchWidth}">
          </div>
        </div>
        <div class="control-group">
          <label class="control-label" for="pitchHz">Set from pitch (Hz)</label>
          <input class="control-input" id="pitchHz" type="number" min="80" max="250" step="1" data-control="pitch-hz" data-commit="change" placeholder="160-200 Hz stays Regular">
        </div>
        ${withinToneBand ? "" : '<p class="control-help tone-warning">This weight and width pairing contradicts the voice (heavy with narrow, or light with wide). Keep weight and width moving together.</p>'}
      </details>

    </section>
  `;
}

function applyInspectorControl(control: Control): void {
  const cue = getSelectedCue();
  const word = getSelectedWord();
  if (!cue) return;

  const value = controlValue(control);
  const exception = normalizeException(cue.exception);

  switch (control.dataset.control) {
    case "cue-start":
      cue.start = roundTime(Math.max(0, Number(value) || 0));
      if (cue.end <= cue.start) cue.end = roundTime(cue.start + 0.01);
      reseedEstimatedWords(cue);
      break;
    case "cue-end":
      cue.end = roundTime(Math.max(cue.start + 0.01, Number(value) || cue.start + 0.01));
      reseedEstimatedWords(cue);
      break;
    case "cue-text":
      cue.text = String(value);
      break;
    case "cue-speaker":
      cue.speakerId = String(value);
      cue.offCamera = Boolean(getSpeaker(cue.speakerId)?.defaultOffCamera);
      break;
    case "word-text":
      if (word) {
        word.text = String(value);
        if (cue.type === "dialogue") syncCueTextFromWords(cue);
      }
      break;
    case "word-start":
      if (word) {
        word.start = roundTime(Math.max(0, Number(value) || 0));
        word.timing = "manual";
        normalizeCueTiming(cue);
      }
      break;
    case "word-end":
      if (word) {
        word.end = roundTime(Math.max(word.start + 0.01, Number(value) || word.start + 0.01));
        word.timing = "manual";
        normalizeCueTiming(cue);
      }
      break;
    case "volume":
      if (word) word.volumePercent = clamp(toNumber(value, NEUTRAL_VOLUME), 0, 100);
      break;
    case "word-burst":
      if (word) word.burst = Boolean(value);
      break;
    case "word-motion":
      if (word) word.motion = isOneOf(WORD_MOTIONS, value) ? value : "pop";
      break;
    case "word-syllables":
      if (word) setWordSyllables(word, String(value));
      break;
    case "word-break":
      if (word) {
        const breaks = new Set(cue.lineBreakAfterWordIds || []);
        if (value) breaks.add(word.id);
        else breaks.delete(word.id);
        cue.lineBreakAfterWordIds = (cue.words || []).map((item) => item.id).filter((id) => breaks.has(id));
      }
      break;
    case "tone":
      if (word) {
        const tone = toneFromSlider(toNumber(value, 0) / 100);
        word.pitchWeight = tone.weight;
        word.pitchWidth = tone.width;
      }
      break;
    case "pitch-weight":
      if (word) word.pitchWeight = clamp(toNumber(value, CWI_STYLE.type.defaultWeight), CWI_STYLE.tone.minWeight, CWI_STYLE.tone.maxWeight);
      break;
    case "pitch-width":
      if (word) word.pitchWidth = clamp(toNumber(value, CWI_STYLE.type.defaultWidth), CWI_STYLE.tone.minWidth, CWI_STYLE.tone.maxWidth);
      break;
    case "pitch-hz":
      if (word && Number.isFinite(toNumber(value, NaN))) {
        const tone = toneForPitchHz(Number(value));
        word.pitchWeight = tone.weight;
        word.pitchWidth = tone.width;
      }
      break;
    case "off-camera":
      cue.offCamera = Boolean(value);
      break;
    case "exception-color":
    case "exception-motion":
    case "exception-intonation": {
      const part = control.dataset.control.replace("exception-", "") as keyof CueException;
      cue.exception = { ...exception, [part]: Boolean(value) };
      break;
    }
    default:
      break;
  }

}

function updateRangeOutputs(): void {
  const volumeInput = els.inspector.querySelector<HTMLInputElement>('[data-control="volume"]');
  const volumeOutput = els.inspector.querySelector('[data-output="volume"]');
  if (volumeInput && volumeOutput) volumeOutput.textContent = `${volumeScreenPercent(Number(volumeInput.value)).toFixed(1)}%`;
  const toneOutput = els.inspector.querySelector('[data-output="tone"]');
  const word = getSelectedWord();
  if (toneOutput && word) toneOutput.textContent = `wght ${word.pitchWeight} · wdth ${word.pitchWidth}`;
}

function syncInspectorTitle(): void {
  const titleValue = els.inspectorHead.querySelector(".inspector-title span");
  const cue = getSelectedCue();
  const word = getSelectedWord();
  if (titleValue && cue) titleValue.textContent = `"${word ? word.text : cueDisplayText(cue)}"`;
}
