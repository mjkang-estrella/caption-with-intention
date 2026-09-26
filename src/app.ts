    (() => {

      const state = {
        cwi: cwiNormalizeProject(createSampleProject()),
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

      const els: Record<string, any> = {};
      const captionLayouts = new Map();
      const captionMeasureCache = new Map();
      const captionView = { key: "", lines: [] };
      const captionStyleCache = new WeakMap();

      document.addEventListener("DOMContentLoaded", init);

      function init() {
        els.video = document.querySelector(".media");
        els.captionSafe = document.querySelector(".caption-safe");
        els.playButton = document.querySelector(".play-icon");
        els.stepButtons = document.querySelectorAll(".preview-button");
        els.soundButton = document.querySelector(".sound-button");
        els.timeReadout = document.querySelector(".time-readout");
        els.timelineGrid = document.querySelector(".timeline-grid");
        els.sideContent = document.querySelector(".transcript");
        els.inspector = document.querySelector(".inspector");
        els.inspectorResize = document.querySelector(".inspector-resize");
        els.inspectorHead = document.querySelector(".inspector-head");
        els.inspectorBody = document.querySelector(".inspector-body");
        els.projectName = document.querySelector(".project-name");
        els.mediaBoundary = document.querySelector(".project-meta .small-pill");
        els.topActions = document.querySelector(".top-actions");
        els.tabs = Array.from(document.querySelectorAll(".tab"));
        els.statusRegion = document.createElement("div");
        els.statusRegion.className = "visually-hidden";
        els.statusRegion.setAttribute("role", "status");
        els.statusRegion.setAttribute("aria-live", "polite");
        els.statusRegion.setAttribute("aria-atomic", "true");
        document.body.appendChild(els.statusRegion);

        els.video.src = DEFAULT_MEDIA_SRC;
        els.video.muted = false;
        els.video.volume = 0.85;
        setupCaptionStage();
        setupTopActions();
        setupTabs();
        setupPlaybackControls();
        setupSidePanelEvents();
        setupTimelineEvents();
        setupInspectorEvents();
        setupInspectorResize();
        setupVideoEvents();
        renderAll();
      }

      function setupCaptionStage() {
        els.phoneFrame = document.querySelector(".phone-frame");
        els.captionSafe.innerHTML = "";
        els.captionGuide = document.createElement("div");
        els.captionGuide.className = "caption-guide";
        els.captionGuide.setAttribute("aria-hidden", "true");
        els.captionGuide.hidden = !state.showGuides;
        els.captionSafe.appendChild(els.captionGuide);

        els.captionMeasure = document.createElement("span");
        els.captionMeasure.className = "caption-measure";
        els.captionMeasure.setAttribute("aria-hidden", "true");
        document.body.appendChild(els.captionMeasure);

        const motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
        if (motionQuery) {
          state.reducedMotion = motionQuery.matches;
          const onMotionChange = () => {
            state.reducedMotion = motionQuery.matches;
            renderPlayback();
          };
          if (typeof motionQuery.addEventListener === "function") motionQuery.addEventListener("change", onMotionChange);
        }

        // Caption geometry is measured against the rendered frame and the loaded Roboto Flex face.
        if (typeof ResizeObserver === "function") {
          new ResizeObserver(() => {
            invalidateCaptionLayouts();
            renderPlayback();
          }).observe(els.phoneFrame);
        }
        if (document.fonts && document.fonts.ready) {
          document.fonts.load('400 27px "Roboto Flex Local"').catch(() => undefined).then(() => document.fonts.ready).then(() => {
            invalidateCaptionLayouts(true);
            renderPlayback();
          });
        }
      }

      function setupTopActions() {
        els.topActions.innerHTML = [
          `<label class="aspect-select"><span class="visually-hidden">Frame aspect ratio</span><select class="control-select" id="aspectSelect" aria-label="Frame aspect ratio">${CWI_ASPECT_RATIOS.map((aspect) => `<option value="${aspect}">${aspect}</option>`).join("")}</select></label>`,
          '<button type="button" class="text-button" id="mediaButton">Media</button>',
          '<button type="button" class="text-button" id="captionButton">Import Captions</button>',
          '<button type="button" class="text-button" id="importJsonButton">Import CWI JSON</button>',
          '<button type="button" class="primary-button" id="exportJsonButton">Export JSON</button>',
          '<input class="visually-hidden" id="mediaInput" type="file" accept="video/*,audio/*">',
          '<input class="visually-hidden" id="captionInput" type="file" accept=".srt,.vtt,text/vtt,text/plain">',
          '<input class="visually-hidden" id="jsonInput" type="file" accept="application/json,.json">'
        ].join("");

        els.mediaInput = document.getElementById("mediaInput");
        els.captionInput = document.getElementById("captionInput");
        els.jsonInput = document.getElementById("jsonInput");
        els.mediaButton = document.getElementById("mediaButton");
        els.captionButton = document.getElementById("captionButton");
        els.importJsonButton = document.getElementById("importJsonButton");
        els.exportJsonButton = document.getElementById("exportJsonButton");
        els.aspectSelect = document.getElementById("aspectSelect");

        els.aspectSelect.addEventListener("change", () => {
          state.cwi.project.aspectRatio = CWI_ASPECT_RATIOS.includes(els.aspectSelect.value) ? els.aspectSelect.value : "16:9";
          state.autoAspect = false;
          renderAll();
        });
        els.mediaButton.addEventListener("click", () => els.mediaInput.click());
        els.captionButton.addEventListener("click", () => els.captionInput.click());
        els.importJsonButton.addEventListener("click", () => els.jsonInput.click());
        els.mediaInput.addEventListener("change", handleMediaInput);
        els.captionInput.addEventListener("change", handleCaptionInput);
        els.jsonInput.addEventListener("change", handleJsonInput);
        els.exportJsonButton.addEventListener("click", exportProjectJson);
      }

      function setupTabs() {
        const tabs = ["transcript", "speakers", "qa"];
        els.tabs.forEach((tab, index) => {
          tab.dataset.tab = tabs[index];
          tab.id = `${tabs[index]}Tab`;
          tab.setAttribute("aria-controls", "sidePanelContent");
          tab.addEventListener("click", () => {
            state.activeTab = tab.dataset.tab;
            renderSideContent();
            renderTabs();
          });
          tab.addEventListener("keydown", handleTabKeydown);
        });
        els.sideContent.id = "sidePanelContent";
        els.sideContent.setAttribute("role", "tabpanel");
      }

      function setupPlaybackControls() {
        const [backButton, playButton, forwardButton] = Array.from(els.stepButtons) as HTMLElement[];
        backButton.addEventListener("click", () => stepPlayback(-0.25));
        playButton.addEventListener("click", togglePlayback);
        forwardButton.addEventListener("click", () => stepPlayback(0.25));
        els.soundButton.addEventListener("click", toggleSound);
        setSoundButton();
        els.guideButton = document.querySelector(".guide-button");
        els.guideButton.addEventListener("click", () => {
          state.showGuides = !state.showGuides;
          setGuideButton();
        });
        setGuideButton();
      }

      function setupVideoEvents() {
        els.video.addEventListener("loadedmetadata", () => {
          if (Number.isFinite(els.video.duration) && els.video.duration > 0) {
            state.cwi.project.duration = roundTime(els.video.duration);
          }
          if (state.autoAspect && els.video.videoWidth && els.video.videoHeight) {
            state.cwi.project.aspectRatio = cwiNearestAspectRatio(els.video.videoWidth, els.video.videoHeight);
          }
          renderAll();
        });
        els.video.addEventListener("timeupdate", () => {
          if (!els.video.paused) state.previewTimeOverride = null;
          renderPlayback();
        });
        els.video.addEventListener("seeking", () => {
          if (!els.video.paused) state.previewTimeOverride = null;
          renderPlayback();
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

      function setupSidePanelEvents() {
        els.sideContent.addEventListener("click", (event) => {
          const addSpeaker = event.target.closest("[data-add-speaker]");
          if (addSpeaker) {
            addSpeakerToProject();
            renderAll();
            return;
          }

          const editSpeaker = event.target.closest("[data-speaker-edit]");
          if (editSpeaker) {
            state.selectedSpeakerId = state.selectedSpeakerId === editSpeaker.dataset.speakerEdit ? "" : editSpeaker.dataset.speakerEdit;
            renderSideContent();
            return;
          }

          const addCue = event.target.closest("[data-add-cue]");
          if (addCue) {
            addCueToTranscript();
            renderAll();
            return;
          }

          const importCaptions = event.target.closest("[data-import-captions]");
          if (importCaptions) {
            els.captionInput.click();
            return;
          }

          const deleteCue = event.target.closest("[data-delete-cue]");
          if (deleteCue) {
            deleteCueFromTranscript(deleteCue.dataset.deleteCue);
            renderAll();
            return;
          }

          const cueSelect = event.target.closest("[data-cue-select]");
          if (cueSelect) {
            state.selectedCueId = cueSelect.dataset.cueSelect;
            state.selectedWordId = "";
            renderAll();
          }
        });

        els.sideContent.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          const speakerCard = event.target.closest(".speaker-card-head[role='button']");
          if (speakerCard && !event.target.closest("input, select, textarea, button")) {
            event.preventDefault();
            state.selectedSpeakerId = state.selectedSpeakerId === speakerCard.dataset.speakerEdit ? "" : speakerCard.dataset.speakerEdit;
            renderSideContent();
            return;
          }

          const cueSelect = event.target.closest("[data-cue-select]");
          if (cueSelect && !event.target.closest("input, select, textarea, button")) {
            event.preventDefault();
            state.selectedCueId = cueSelect.dataset.cueSelect;
            state.selectedWordId = "";
            renderAll();
          }
        });

        els.sideContent.addEventListener("input", (event) => {
          if (event.target.dataset.speakerControl) {
            updateSpeakerFromControl(event.target);
            renderInspector();
            renderTimeline();
            renderPlayback();
            return;
          }

          if (event.target.dataset.transcriptControl) {
            updateTranscriptCueFromControl(event.target);
            renderInspector();
            renderTimeline();
            renderPlayback();
          }
        });

        els.sideContent.addEventListener("change", (event) => {
          if (event.target.dataset.speakerControl) {
            updateSpeakerFromControl(event.target);
            renderAll();
            return;
          }

          if (event.target.dataset.transcriptControl) {
            updateTranscriptCueFromControl(event.target);
            renderAll();
          }
        });
      }

      function setupTimelineEvents() {
        els.timelineGrid.addEventListener("click", (event) => {
          const segment = event.target.closest("[data-cue-id]");
          if (!segment) {
            const seekTarget = event.target.closest("[data-timeline-seek]");
            if (seekTarget) seekTimelineFromPointer(event);
            return;
          }

          state.selectedCueId = segment.dataset.cueId;
          state.selectedWordId = segment.dataset.wordId || "";
          renderAll();
        });

        els.timelineGrid.addEventListener("keydown", (event) => {
          const scroller = event.target.closest(".timeline-scroll");
          if (!scroller) return;

          const duration = getDuration();
          let nextTime = currentMediaTime();
          if (event.key === "ArrowLeft") nextTime -= event.shiftKey ? 1 : 0.25;
          else if (event.key === "ArrowRight") nextTime += event.shiftKey ? 1 : 0.25;
          else if (event.key === "Home") nextTime = 0;
          else if (event.key === "End") nextTime = duration;
          else return;

          event.preventDefault();
          seekPreviewToTime(nextTime);
          renderPlayback();
          announceStatus(`Preview time ${formatTime(currentMediaTime())}`);
        });
      }

      function setupInspectorEvents() {
        els.inspector.addEventListener("input", (event) => {
          if (!event.target.dataset.control || event.target.dataset.commit === "change") return;
          applyInspectorControl(event.target);
          syncInspectorTitle();
          renderPlayback();
          renderTimeline();
          renderSideContent();
          updateRangeOutputs();
        });

        els.inspector.addEventListener("change", (event) => {
          if (!event.target.dataset.control) return;
          applyInspectorControl(event.target);
          renderAll();
        });

        els.inspector.addEventListener("click", (event) => {
          const speakerTrigger = event.target.closest("[data-speaker-trigger]");
          if (speakerTrigger) {
            toggleSpeakerSelector();
            return;
          }

          const speakerOption = event.target.closest("[data-cue-speaker-option]");
          if (speakerOption) {
            selectCueSpeaker(speakerOption.dataset.cueSpeakerOption);
            return;
          }

          const wordPick = event.target.closest("[data-inspector-word-id]");
          if (wordPick) {
            state.selectedCueId = wordPick.dataset.cueId;
            state.selectedWordId = wordPick.dataset.inspectorWordId;
            renderAll();
            return;
          }

          const wordNav = event.target.closest("[data-word-nav]");
          if (wordNav) {
            selectAdjacentWord(Number(wordNav.dataset.wordNav));
            renderAll();
            return;
          }

          const preset = event.target.closest("[data-volume-preset]");
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

      function setupInspectorResize() {
        if (!els.inspectorResize) return;

        applyInspectorSize(state.inspectorSize);

        let dragStartCoordinate = 0;
        let dragStartSize = state.inspectorSize;

        els.inspectorResize.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          dragStartCoordinate = isStackedInspectorLayout() ? event.clientY : event.clientX;
          dragStartSize = state.inspectorSize;
          document.body.classList.add("is-resizing-inspector");
          els.inspectorResize.setPointerCapture(event.pointerId);
        });

        els.inspectorResize.addEventListener("pointermove", (event) => {
          if (!els.inspectorResize.hasPointerCapture(event.pointerId)) return;
          const currentCoordinate = isStackedInspectorLayout() ? event.clientY : event.clientX;
          const nextSize = dragStartSize + (dragStartCoordinate - currentCoordinate);
          applyInspectorSize(nextSize);
        });

        els.inspectorResize.addEventListener("pointerup", (event) => {
          document.body.classList.remove("is-resizing-inspector");
          if (els.inspectorResize.hasPointerCapture(event.pointerId)) {
            els.inspectorResize.releasePointerCapture(event.pointerId);
          }
        });

        els.inspectorResize.addEventListener("pointercancel", () => {
          document.body.classList.remove("is-resizing-inspector");
        });

        els.inspectorResize.addEventListener("keydown", (event) => {
          const step = event.shiftKey ? 40 : 16;
          let nextSize = state.inspectorSize;

          if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextSize += step;
          else if (event.key === "ArrowDown" || event.key === "ArrowRight") nextSize -= step;
          else if (event.key === "PageUp") nextSize += 72;
          else if (event.key === "PageDown") nextSize -= 72;
          else if (event.key === "Home") nextSize = getInspectorSizeBounds().min;
          else if (event.key === "End") nextSize = getInspectorSizeBounds().max;
          else return;

          event.preventDefault();
          applyInspectorSize(nextSize);
        });

        window.addEventListener("resize", () => applyInspectorSize(state.inspectorSize));
      }

      function applyInspectorSize(size) {
        const bounds = getInspectorSizeBounds();
        state.inspectorSize = Math.round(clamp(size, bounds.min, bounds.max));
        (document.querySelector(".workspace") as HTMLElement).style.setProperty("--inspector-size", `${state.inspectorSize}px`);
        els.inspectorResize.setAttribute("aria-orientation", isStackedInspectorLayout() ? "horizontal" : "vertical");
        els.inspectorResize.setAttribute("aria-valuemin", String(bounds.min));
        els.inspectorResize.setAttribute("aria-valuemax", String(bounds.max));
        els.inspectorResize.setAttribute("aria-valuenow", String(state.inspectorSize));
      }

      function getInspectorSizeBounds() {
        const workspace = document.querySelector(".workspace");
        if (isStackedInspectorLayout()) {
          return {
            min: INSPECTOR_STACK_MIN,
            max: Math.max(INSPECTOR_STACK_MIN, Math.min(520, Math.round(window.innerHeight * 0.56)))
          };
        }

        const workspaceWidth = workspace ? workspace.clientWidth : 0;
        const leftPanelWidth = document.querySelector(".tabs") ? document.querySelector(".tabs").getBoundingClientRect().width : 0;
        const resizeHandleWidth = 10;
        const maxFromWorkspace = workspaceWidth - leftPanelWidth - resizeHandleWidth - CENTER_STAGE_MIN;
        const max = Math.max(INSPECTOR_COLUMN_MIN, Math.min(560, maxFromWorkspace || INSPECTOR_COLUMN_DEFAULT));

        return { min: INSPECTOR_COLUMN_MIN, max };
      }

      function isStackedInspectorLayout() {
        return window.innerWidth <= 900;
      }

      function handleMediaInput(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        if (state.mediaObjectUrl) URL.revokeObjectURL(state.mediaObjectUrl);
        state.mediaObjectUrl = URL.createObjectURL(file);
        state.mediaFile = file;
        state.cwi = createEmptyProjectForMedia(file);
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
        event.target.value = "";
        loadMediaAudio(file).then(() => renderTimeline());
      }

      function handleCaptionInput(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const subtitleText = String(reader.result || "");
            const subtitleCues = parseSubtitleFile(subtitleText, file.name);
            if (!subtitleCues.length) throw new Error("No subtitle cues were found in the selected file.");

            const project = createProjectFromSubtitleCues(subtitleCues, file.name);
            state.cwi = project;
            state.selectedCueId = state.cwi.cues[0] ? state.cwi.cues[0].id : "";
            state.selectedWordId = "";
            state.activeTab = "qa";
            state.importError = "";
            state.importWarnings = [];
            announceStatus(`Imported ${subtitleCues.length} caption cues from ${file.name}.`);
            renderAll();
            await applyLocalVolumeAnalysis();
          } catch (error) {
            state.importError = error.message || "The selected caption file could not be imported.";
            state.importWarnings = [];
            state.activeTab = "qa";
            announceStatus(state.importError);
            renderAll();
          } finally {
            event.target.value = "";
          }
        };
        reader.readAsText(file);
      }

      function handleJsonInput(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(String(reader.result || ""));
            state.importWarnings = findMissingImportedFields(parsed);
            state.cwi = cwiNormalizeProject(parsed, state.cwi.project);
            state.autoAspect = false;
            state.selectedCueId = state.cwi.cues[0] ? state.cwi.cues[0].id : "";
            state.selectedWordId = "";
            state.activeTab = "qa";
            state.importError = "";
            announceStatus(`Imported CWI JSON with ${state.cwi.cues.length} cues.`);
            renderAll();
          } catch (error) {
            state.importError = error.message || "The selected JSON file could not be imported.";
            state.importWarnings = [];
            state.activeTab = "qa";
            announceStatus(state.importError);
            renderAll();
          } finally {
            event.target.value = "";
          }
        };
        reader.readAsText(file);
      }

      function createEmptyProjectForMedia(file) {
        return {
          schemaVersion: CWI_SCHEMA_VERSION,
          project: {
            id: `cwi-${slugify(file.name || "local-media")}`,
            title: fileNameStem(file.name || "Local Media"),
            aspectRatio: state.cwi.project.aspectRatio || "16:9",
            mediaName: file.name || "Local media",
            duration: Number.isFinite(els.video.duration) && els.video.duration > 0 ? roundTime(els.video.duration) : 0,
            frameRate: state.cwi.project.frameRate || CWI_DEFAULT_FRAME_RATE
          },
          speakers: [createUnknownSpeaker()],
          cues: [],
          review: {
            notes: ["Media is loaded locally. Import an SRT or WebVTT caption file to create editable CWI cues."],
            validationStatus: "needs-captions"
          }
        };
      }

      function createUnknownSpeaker() {
        return {
          id: "speaker-unknown",
          name: "Unknown Speaker",
          role: "supporting",
          color: "#5E82ED",
          defaultOffCamera: false
        };
      }

      function parseSubtitleFile(text, fileName) {
        const trimmed = String(text || "").replace(/^\uFEFF/, "").trim();
        if (!trimmed) return [];
        if (/^\s*WEBVTT\b/i.test(trimmed) || /\.vtt$/i.test(fileName || "")) return parseWebVtt(trimmed);
        return parseSrt(trimmed);
      }

      function parseSrt(text) {
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

      function parseWebVtt(text) {
        const body = String(text || "").replace(/^\s*WEBVTT[^\n]*(\n|$)/i, "");
        return body
          .replace(/\r/g, "")
          .split(/\n{2,}/)
          .flatMap((block) => {
            let lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
            if (!lines.length || /^WEBVTT\b/i.test(lines[0]) || /^(NOTE|STYLE|REGION)\b/i.test(lines[0])) return [];
            let timeIndex = lines.findIndex((line) => line.includes("-->"));
            if (timeIndex === -1) return [];
            const times = parseSubtitleTiming(lines[timeIndex]);
            if (!times) return [];
            const cueText = cleanSubtitleText(lines.slice(timeIndex + 1).join(" "));
            if (!cueText) return [];
            return [{ ...times, text: cueText }];
          });
      }

      function parseSubtitleTiming(line) {
        const parts = String(line || "").split("-->");
        if (parts.length < 2) return null;
        const start = parseSubtitleTime(parts[0].trim());
        const end = parseSubtitleTime(parts[1].trim().split(/\s+/)[0]);
        if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
        return { start: roundTime(start), end: roundTime(end) };
      }

      function parseSubtitleTime(value) {
        const normalized = String(value || "").replace(",", ".");
        const parts = normalized.split(":");
        if (parts.length < 2 || parts.length > 3) return NaN;
        const seconds = Number(parts.pop());
        const minutes = Number(parts.pop());
        const hours = parts.length ? Number(parts.pop()) : 0;
        if (![hours, minutes, seconds].every(Number.isFinite)) return NaN;
        return hours * 3600 + minutes * 60 + seconds;
      }

      function cleanSubtitleText(text) {
        return decodeHtmlEntities(String(text || "")
          .replace(/<[^>]+>/g, "")
          .replace(/\{[^}]+\}/g, "")
          .replace(/\s+/g, " ")
          .trim());
      }

      function decodeHtmlEntities(text) {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = text;
        return textarea.value;
      }

      function createProjectFromSubtitleCues(subtitleCues, captionFileName) {
        const unknownSpeaker = createUnknownSpeaker();
        const cues = subtitleCues.map((subtitleCue, index) => {
          const cueType = cueTypeForSubtitleText(subtitleCue.text);
          const text = cwiStripDecorators(subtitleCue.text).trim();
          const cue = {
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
          cue.words = buildWordsForCueText(cue, text);
          return cue;
        });

        return {
          schemaVersion: CWI_SCHEMA_VERSION,
          project: {
            id: `cwi-${slugify(fileNameStem(state.cwi.project.mediaName || captionFileName || "imported-media"))}`,
            title: state.cwi.project.title || fileNameStem(captionFileName || "Imported Captions"),
            aspectRatio: state.cwi.project.aspectRatio || "16:9",
            mediaName: state.cwi.project.mediaName || "Local media",
            duration: state.cwi.project.duration || getDuration(),
            frameRate: state.cwi.project.frameRate || CWI_DEFAULT_FRAME_RATE
          },
          speakers: [unknownSpeaker],
          cues,
          review: {
            notes: [`Imported ${cues.length} cues from ${captionFileName || "caption file"}. Speaker identity is set to Unknown Speaker and word timing is estimated from each cue until manually aligned.`],
            validationStatus: "unchecked"
          }
        };
      }

      function cueTypeForSubtitleText(text) {
        const value = String(text || "").trim();
        if (/^[\u266a\u266b]|[\u266a\u266b]$/.test(value)) return "music";
        if (/^\[.+\]$/.test(value)) return "sound";
        return "dialogue";
      }

      async function applyLocalVolumeAnalysis() {
        if (!state.mediaFile) {
          addReviewNote("Audio analysis skipped because no uploaded media file is available; neutral volume values were kept.");
          announceStatus("Audio analysis skipped. Neutral volume values were kept.");
          renderAll();
          return;
        }

        if (state.mediaFile.size > MAX_ANALYSIS_BYTES) {
          addReviewNote("Audio analysis skipped because the uploaded media is over 120 MB; neutral volume values were kept.");
          announceStatus("Audio analysis skipped for large media. Neutral volume values were kept.");
          renderAll();
          return;
        }

        if (getDuration() > 180) {
          addReviewNote("Audio analysis skipped because the uploaded media is longer than 3 minutes; neutral volume values were kept.");
          announceStatus("Audio analysis skipped for long media. Neutral volume values were kept.");
          renderAll();
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
          const emphasized = analysis.words.filter((item) => item.volumePercent !== CWI_NEUTRAL_VOLUME).length;
          addReviewNote(`Local audio analysis compared ${analysis.words.length} words with the ${Number.isFinite(analysis.referenceDb) ? `${analysis.referenceDb.toFixed(1)} dBFS` : "unmeasured"} median speech level; ${emphasized} words were marked louder or softer than normal.`);
          announceStatus(`Audio analysis marked ${emphasized} words as louder or softer than normal speech.`);
        } catch (error) {
          addReviewNote(`Audio analysis failed; neutral volume values were kept. ${error.message || error}`);
          announceStatus("Audio analysis failed. Neutral volume values were kept.");
        }

        renderAll();
      }

      function loadMediaAudio(file) {
        if (!file || file.size > MAX_ANALYSIS_BYTES) return Promise.resolve(null);
        if (state.audioBuffer && state.audioSource === file) return Promise.resolve(state.audioBuffer);
        if (state.audioPromise && state.audioSource === file) return state.audioPromise;

        state.audioSource = file;
        state.audioPromise = (async () => {
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
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

      // Per-word loudness relative to the median speech level. Words inside the dead zone stay at
      // the normal 5% size so that ordinary speech returns to the baseline (doc QA checklist).
      function analyzeWordVolumes(audioBuffer, cues) {
        const entries = cues.flatMap((cue) => (cue.words || []).map((word) => ({
          cue,
          word,
          db: rmsDb(audioBuffer, word.start, word.end)
        })));
        const speech = entries
          .filter((entry) => entry.cue.type === "dialogue" && Number.isFinite(entry.db) && entry.db > CWI_ANALYSIS.silenceDb)
          .map((entry) => entry.db);
        const referenceDb = speech.length ? percentile(speech, 0.5) : NaN;
        return {
          referenceDb,
          words: entries.map((entry) => ({ word: entry.word, volumePercent: volumePercentForDbOffset(entry.db - referenceDb) }))
        };
      }

      function volumePercentForDbOffset(offsetDb) {
        if (!Number.isFinite(offsetDb)) return CWI_NEUTRAL_VOLUME;
        const beyondDeadZone = Math.abs(offsetDb) - CWI_ANALYSIS.volumeDeadZoneDb;
        if (beyondDeadZone <= 0) return CWI_NEUTRAL_VOLUME;
        const amount = clamp(beyondDeadZone / (CWI_ANALYSIS.volumeFullScaleDb - CWI_ANALYSIS.volumeDeadZoneDb), 0, 1);
        return Math.round(CWI_NEUTRAL_VOLUME + Math.sign(offsetDb) * amount * (100 - CWI_NEUTRAL_VOLUME));
      }

      function rmsDb(audioBuffer, start, end) {
        const rms = windowRms(audioBuffer, start, end);
        return Number.isFinite(rms) && rms > 0 ? 20 * Math.log10(rms) : NaN;
      }

      function windowRms(audioBuffer, start, end) {
        const sampleRate = audioBuffer.sampleRate;
        const startSample = Math.max(0, Math.floor(Number(start) * sampleRate));
        const endSample = Math.min(audioBuffer.length, Math.ceil(Number(end) * sampleRate));
        if (endSample <= startSample) return NaN;

        let sum = 0;
        let count = 0;
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
          const data = audioBuffer.getChannelData(channel);
          for (let index = startSample; index < endSample; index += 1) {
            const sample = data[index] || 0;
            sum += sample * sample;
            count += 1;
          }
        }
        return count ? Math.sqrt(sum / count) : NaN;
      }

      function computeWaveform(audioBuffer) {
        const duration = audioBuffer.length / audioBuffer.sampleRate;
        const bars = clamp(Math.ceil(duration * WAVEFORM_BARS_PER_SECOND), 1, 4000);
        const values = Array.from({ length: bars }, (_, index) => windowRms(audioBuffer, (index * duration) / bars, ((index + 1) * duration) / bars) || 0);
        const peak = Math.max(...values, 0.000001);
        // Match the scale of the bundled sample waveform (loudest bar about 0.5).
        return values.map((value) => Math.round((value / peak) * 500) / 1000);
      }

      function percentile(values, ratio) {
        const sorted = [...values].sort((a, b) => a - b);
        if (!sorted.length) return NaN;
        const index = clamp((sorted.length - 1) * ratio, 0, sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        if (lower === upper) return sorted[lower];
        return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
      }

      function addReviewNote(note) {
        if (!state.cwi.review) state.cwi.review = { notes: [], validationStatus: "unchecked" };
        state.cwi.review.notes = Array.isArray(state.cwi.review.notes) ? state.cwi.review.notes : [];
        state.cwi.review.notes.push(String(note));
      }

      function exportProjectJson() {
        const payload = structuredCloneSafe(state.cwi);
        payload.review = payload.review || {};
        payload.review.validationStatus = validateProject(payload).some((item) => item.status === "fail") ? "needs-review" : "pass";

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

      function togglePlayback() {
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

      function toggleSound() {
        if (els.video.muted || els.video.volume === 0) {
          els.video.muted = false;
          if (els.video.volume === 0) els.video.volume = 0.85;
        } else {
          els.video.muted = true;
        }
        setSoundButton();
      }

      function stepPlayback(delta) {
        const duration = getDuration();
        seekPreviewToTime(currentMediaTime() + delta);
        renderPlayback();
      }

      // Captions render at display rate. When the browser reports presented video frames, anchor
      // caption time to the frame on screen instead of the coarser currentTime.
      function startPlaybackLoop() {
        state.frameAnchor = null;
        if (typeof els.video.requestVideoFrameCallback === "function") {
          const onVideoFrame = (_now, metadata) => {
            state.frameAnchor = { mediaTime: metadata.mediaTime, wallTime: performance.now() };
            if (!els.video.paused && !els.video.ended) els.video.requestVideoFrameCallback(onVideoFrame);
          };
          els.video.requestVideoFrameCallback(onVideoFrame);
        }
        requestAnimationFrame(playbackLoop);
      }

      function playbackLoop() {
        renderPlayback();
        if (!els.video.paused && !els.video.ended) requestAnimationFrame(playbackLoop);
        else state.frameAnchor = null;
      }

      function renderAll() {
        ensureSelection();
        renderStageFrame();
        renderTopbar();
        renderTabs();
        renderSideContent();
        renderInspector();
        renderTimeline();
        renderPlayback();
      }

      function renderStageFrame() {
        const aspect = CWI_ASPECT_RATIOS.includes(state.cwi.project.aspectRatio) ? state.cwi.project.aspectRatio : "16:9";
        const [width, height] = aspect.split(":").map(Number);
        els.phoneFrame.style.setProperty("--frame-aspect-w", String(width));
        els.phoneFrame.style.setProperty("--frame-aspect-h", String(height));
        els.phoneFrame.dataset.aspect = aspect;
        if (els.aspectSelect) els.aspectSelect.value = aspect;
      }

      function renderTopbar() {
        els.projectName.textContent = state.mediaObjectUrl
          ? state.cwi.project.mediaName || "Browser media"
          : `${state.cwi.project.title || "Untitled CWI"}${mediaExtensionLabel()}`;
        els.mediaBoundary.textContent = state.mediaObjectUrl ? "Browser-only Media" : "Local Sample";
        if (els.statusRegion) els.statusRegion.textContent = state.statusMessage || "";
      }

      function announceStatus(message) {
        state.statusMessage = String(message || "");
        if (els.statusRegion) els.statusRegion.textContent = state.statusMessage;
      }

      function renderTabs() {
        els.tabs.forEach((tab) => {
          const active = tab.dataset.tab === state.activeTab;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", String(active));
          tab.tabIndex = active ? 0 : -1;
        });
        const activeTab = els.tabs.find((tab) => tab.dataset.tab === state.activeTab);
        els.sideContent.setAttribute("aria-labelledby", activeTab ? activeTab.id : "");
      }

      function handleTabKeydown(event) {
        const currentIndex = els.tabs.indexOf(event.currentTarget);
        let nextIndex = currentIndex;

        if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % els.tabs.length;
        else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + els.tabs.length) % els.tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = els.tabs.length - 1;
        else return;

        event.preventDefault();
        state.activeTab = els.tabs[nextIndex].dataset.tab;
        renderSideContent();
        renderTabs();
        els.tabs[nextIndex].focus();
      }

      function renderSideContent() {
        if (state.activeTab === "speakers") {
          renderSpeakersPanel();
        } else if (state.activeTab === "qa") {
          renderQaPanel();
        } else {
          renderTranscriptPanel();
        }
      }

      function renderTranscriptPanel() {
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

      function renderTranscriptCueEditor(cue, editId) {
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

      function renderCueWordsForTranscript(cue, liveWordId) {
        if (!cue.words || cue.words.length === 0) {
          return `<span class="word">${escapeHtml(cwiCueDisplayText(cue))}</span>`;
        }

        return cue.words.map((word) => {
          const live = word.id === liveWordId;
          const warn = cwiHasException(cue) || hasTimingWarning(cue, word);
          const estimated = word.timing === "estimated";
          return `<span class="word${live ? " live" : ""}${warn ? " warn" : ""}${estimated ? " estimated" : ""}"${estimated ? ' title="Estimated timing"' : ""}>${escapeHtml(word.text)}</span>`;
        }).join(" ");
      }

      function renderSpeakersPanel() {
        const counts = new Map();
        state.cwi.cues.forEach((cue) => {
          if (!cue.speakerId) return;
          counts.set(cue.speakerId, (counts.get(cue.speakerId) || 0) + 1);
        });

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

      function renderSpeakerColorOptions(selectedColor) {
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

      function updateSpeakerFromControl(control) {
        const speaker = getSpeaker(control.dataset.speakerId);
        if (!speaker) return;

        const value = control.type === "checkbox" ? control.checked : control.value;
        if (control.dataset.speakerControl === "name") {
          speaker.name = String(value).trim() || "Unnamed speaker";
        } else if (control.dataset.speakerControl === "role") {
          speaker.role = SPEAKER_ROLES.includes(value) ? value : "supporting";
          if (!colorFitsRole(speaker.color, speaker.role)) speaker.color = nextSpeakerColor(speaker.role);
        } else if (control.dataset.speakerControl === "color") {
          speaker.color = String(value);
        } else if (control.dataset.speakerControl === "defaultOffCamera") {
          speaker.defaultOffCamera = Boolean(value);
        }
      }

      function addSpeakerToProject() {
        const role = "supporting";
        const speakerNumber = state.cwi.speakers.length + 1;
        const speaker = {
          id: uniqueId("speaker"),
          name: `Character ${speakerNumber}`,
          role,
          color: nextSpeakerColor(role),
          defaultOffCamera: false
        };

        state.cwi.speakers.push(speaker);
        state.selectedSpeakerId = speaker.id;
        state.activeTab = "speakers";
      }

      // Doc 3.1-3.2: keep speaker colors as far apart on the hue wheel as the palette allows.
      function nextSpeakerColor(role) {
        const usedColors = state.cwi.speakers.map((speaker) => String(speaker.color));
        const roleColors = SPEAKER_PALETTE.filter((entry) => entry.role === role);
        const available = roleColors.filter((entry) => !usedColors.some((color) => color.toLowerCase() === entry.color.toLowerCase()));
        if (!available.length) return (roleColors[0] || SPEAKER_PALETTE[0]).color;
        if (!usedColors.length) return available[0].color;

        let best = available[0];
        let bestDistance = -1;
        available.forEach((entry) => {
          const distance = Math.min(...usedColors.map((color) => cwiHueDistance(color, entry.color)));
          if (distance > bestDistance) {
            best = entry;
            bestDistance = distance;
          }
        });
        return best.color;
      }

      function colorFitsRole(color, role) {
        return SPEAKER_PALETTE.some((entry) => entry.role === role && entry.color.toLowerCase() === String(color).toLowerCase());
      }

      function updateTranscriptCueFromControl(control) {
        const cue = getCue(control.dataset.cueId);
        if (!cue) return;

        const value = control.value;
        if (control.dataset.transcriptControl === "type") {
          cue.type = CUE_TYPES.includes(value) ? value : "dialogue";
          if (cue.type !== "dialogue") {
            cue.speakerId = "";
            cue.offCamera = false;
          } else if (!cue.speakerId && state.cwi.speakers[0]) {
            cue.speakerId = state.cwi.speakers[0].id;
          }
        } else if (control.dataset.transcriptControl === "text") {
          updateCueTextAndWords(cue, String(value));
          refreshTranscriptCueRow(cue);
        }

        if (state.selectedWordId && (!cue.words || !cue.words.some((word) => word.id === state.selectedWordId))) state.selectedWordId = "";
      }

      function addCueToTranscript() {
        const currentIndex = state.cwi.cues.findIndex((cue) => cue.id === state.selectedCueId);
        const anchor = currentIndex >= 0 ? state.cwi.cues[currentIndex] : state.cwi.cues[state.cwi.cues.length - 1];
        const start = anchor ? roundTime(anchor.end + 0.2) : 0;
        const end = roundTime(start + 1.8);
        const speaker = state.cwi.speakers[0] || null;
        const cue = {
          id: uniqueId("cue"),
          type: "dialogue",
          speakerId: speaker ? speaker.id : "",
          start,
          end,
          text: "New caption",
          lineBreakAfterWordIds: [],
          exception: { color: false, motion: false, intonation: false },
          offCamera: speaker ? Boolean(speaker.defaultOffCamera) : false,
          words: []
        };
        cue.words = buildWordsForCueText(cue, cue.text);

        if (currentIndex >= 0) state.cwi.cues.splice(currentIndex + 1, 0, cue);
        else state.cwi.cues.push(cue);

        state.selectedCueId = cue.id;
        state.selectedWordId = "";
        state.activeTab = "transcript";
      }

      function deleteCueFromTranscript(cueId) {
        const index = state.cwi.cues.findIndex((cue) => cue.id === cueId);
        if (index === -1) return;

        state.cwi.cues.splice(index, 1);
        const nextCue = state.cwi.cues[Math.min(index, state.cwi.cues.length - 1)] || state.cwi.cues[index - 1] || null;
        state.selectedCueId = nextCue ? nextCue.id : "";
        state.selectedWordId = "";
      }

      function updateCueTextAndWords(cue, text) {
        cue.text = text;
        cue.words = buildWordsForCueText(cue, text);
        const wordIds = new Set((cue.words || []).map((word) => word.id));
        cue.lineBreakAfterWordIds = (cue.lineBreakAfterWordIds || []).filter((wordId) => wordIds.has(wordId));
      }

      function refreshTranscriptCueRow(cue) {
        const row = (Array.from(els.sideContent.querySelectorAll(".cue[data-cue-id]")) as HTMLElement[]).find((item) => item.dataset.cueId === cue.id);
        if (!row) return;

        const copy = row.querySelector(".cue-copy");
        if (copy) copy.innerHTML = renderCueWordsForTranscript(cue, getCurrentCueAndWord().wordId);
      }

      function buildWordsForCueText(cue, text) {
        const tokens = tokenizeTranscriptText(text);
        const oldWords = Array.isArray(cue.words) ? cue.words : [];
        if (!tokens.length) return [];

        if (tokens.length === oldWords.length) {
          return oldWords.map((word, index) => ({
            ...word,
            text: tokens[index]
          }));
        }

        // Adding or removing words invalidates the stored onsets, so seed the AE template's own
        // distribution and mark it estimated until the onsets are aligned.
        const reservedIds = new Set();
        const times = cwiEstimatedWordTimes(cue, tokens.length);
        return tokens.map((token, index) => {
          const fallback = oldWords[Math.min(index, oldWords.length - 1)] || {};
          const id = uniqueId(`${cue.id}-word`, reservedIds);
          reservedIds.add(id);
          return {
            id,
            text: token,
            start: times[index].start,
            end: times[index].end,
            volumePercent: cwiNumber(fallback.volumePercent, CWI_NEUTRAL_VOLUME),
            pitchWeight: cwiNumber(fallback.pitchWeight, CWI_STYLE.type.defaultWeight),
            pitchWidth: cwiNumber(fallback.pitchWidth, CWI_STYLE.type.defaultWidth),
            motion: CWI_WORD_MOTIONS.includes(fallback.motion) ? fallback.motion : "pop",
            timing: "estimated",
            burst: false
          };
        });
      }

      function tokenizeTranscriptText(text) {
        return String(text || "").trim().split(/\s+/).filter(Boolean);
      }

      function renderQaPanel() {
        const checks = validateProject(state.cwi);
        const failedCount = checks.filter((check) => check.status === "fail").length;
        els.sideContent.innerHTML = `
          <div class="panel-list" aria-live="polite" aria-label="QA results">
            <div class="visually-hidden">${failedCount ? `${failedCount} QA checks need review.` : "All QA checks passed."}</div>
            ${checks.map((check) => `
              <div class="qa-card ${check.status}">
                <div class="qa-kicker">${check.status === "pass" ? "Pass" : "Needs review"}</div>
                <div class="qa-title">${escapeHtml(check.title)}</div>
                <div class="qa-body">${escapeHtml(check.body)}</div>
              </div>
            `).join("")}
            ${renderReviewNotes()}
          </div>
        `;
      }

      function renderReviewNotes() {
        const notes = state.cwi.review && Array.isArray(state.cwi.review.notes) ? state.cwi.review.notes : [];
        if (!notes.length) return "";
        return notes.map((note) => `
          <div class="qa-card">
            <div class="qa-kicker">Review note</div>
            <div class="qa-body">${escapeHtml(note)}</div>
          </div>
        `).join("");
      }

      function renderInspector() {
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

      function renderCueEditor(cue) {
        const speaker = getSpeaker(cue.speakerId);
        const words = cue.words || [];
        const selectedIndex = words.findIndex((item) => item.id === state.selectedWordId);
        const exception = cwiNormalizeException(cue.exception);
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

      function renderCueWordPicker(cue) {
        const words = cue.words || [];
        if (!words.length) return '<div class="empty-card">This cue has no word timing records yet.</div>';

        return `
          <div class="word-picker">
            ${words.map((word) => `<button type="button" class="word-picker-button${word.id === state.selectedWordId ? " active" : ""}${word.timing === "estimated" ? " estimated" : ""}" data-cue-id="${escapeAttr(cue.id)}" data-inspector-word-id="${escapeAttr(word.id)}">${escapeHtml(word.text)}</button>`).join("")}
          </div>
        `;
      }

      function renderSpeakerSelector(cue, speaker) {
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

      function toggleSpeakerSelector() {
        const cue = getSelectedCue();
        state.speakerSelectorOpen = !state.speakerSelectorOpen;
        state.activeSpeakerOptionId = cue ? cue.speakerId || "" : "";
        renderInspector();
        if (state.speakerSelectorOpen) {
          focusSpeakerOption(state.activeSpeakerOptionId);
        }
      }

      function selectCueSpeaker(speakerId) {
        const cue = getSelectedCue();
        if (cue && cue.type === "dialogue") {
          cue.speakerId = speakerId;
          cue.offCamera = Boolean(getSpeaker(cue.speakerId) && getSpeaker(cue.speakerId).defaultOffCamera);
        }
        state.speakerSelectorOpen = false;
        state.activeSpeakerOptionId = "";
        renderAll();
        const trigger = els.inspector.querySelector("[data-speaker-trigger]");
        if (trigger) trigger.focus();
      }

      function handleSpeakerSelectorKeydown(event) {
        const trigger = event.target.closest("[data-speaker-trigger]");
        const option = event.target.closest("[data-cue-speaker-option]");
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
          selectCueSpeaker(option.dataset.cueSpeakerOption);
        } else if (event.key === "Escape") {
          event.preventDefault();
          state.speakerSelectorOpen = false;
          renderInspector();
          const nextTrigger = els.inspector.querySelector("[data-speaker-trigger]");
          if (nextTrigger) nextTrigger.focus();
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
          event.preventDefault();
          moveActiveSpeakerOption(event.key);
        }
      }

      function moveActiveSpeakerOption(key) {
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

      function focusSpeakerOption(optionId) {
        const option = els.inspector.querySelector(`#${speakerOptionDomId(optionId)}`);
        if (option) option.focus();
      }

      function speakerOptionIds() {
        return ["", ...state.cwi.speakers.map((speaker) => speaker.id)];
      }

      function speakerOptionDomId(optionId) {
        return `cueSpeakerOption-${optionId || "none"}`;
      }

      function cueEditDomId(cueId) {
        return `cueEdit-${cueId}`;
      }

      function renderWordEditor(cue, word) {
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

        const volume = cwiNumber(word.volumePercent, CWI_NEUTRAL_VOLUME);
        const pitchWeight = cwiNumber(word.pitchWeight, CWI_STYLE.type.defaultWeight);
        const pitchWidth = cwiNumber(word.pitchWidth, CWI_STYLE.type.defaultWidth);
        const toneSlider = Math.round(cwiSliderFromTone(pitchWeight) * 100);
        const toneInBand = cwiToneInBand(pitchWeight, pitchWidth);
        const motion = CWI_WORD_MOTIONS.includes(word.motion) ? word.motion : "pop";
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
                <button type="button" class="${!loud && !whisper ? "active" : ""}" data-volume-preset="${CWI_NEUTRAL_VOLUME}" aria-pressed="${!loud && !whisper}">Normal</button>
                <button type="button" class="${whisper ? "active" : ""}" data-volume-preset="28" aria-pressed="${whisper}">Whisper</button>
              </div>
            </div>

            <div class="control-group">
              <label class="control-label" for="volumeSize">Volume size</label>
              <div class="range-row wide">
                <input type="range" id="volumeSize" min="0" max="100" value="${volume}" data-control="volume">
                <span data-output="volume">${cwiVolumeScreenPercent(volume).toFixed(1)}%</span>
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
              ${toneInBand ? "" : '<p class="control-help tone-warning">This weight and width pairing contradicts the voice (heavy with narrow, or light with wide). Keep weight and width moving together.</p>'}
            </details>

          </section>
        `;
      }

      function renderTimeline() {
        const scroller = els.timelineGrid.querySelector(".timeline-scroll");
        const previousScrollLeft = scroller ? scroller.scrollLeft : 0;
        const duration = getDuration();
        const contentWidth = Math.max(760, Math.ceil(duration * PX_PER_SECOND) + 40);
        const ticks = [];
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
        const nextScroller = els.timelineGrid.querySelector(".timeline-scroll");
        if (nextScroller) nextScroller.scrollLeft = previousScrollLeft;
      }

      function renderWaveform() {
        // The bundled sample ships a precomputed waveform; imported media uses its decoded audio.
        const values = state.mediaObjectUrl ? state.waveform || [] : AUDIO_WAVEFORM;
        return values.map((value) => {
          const height = Math.max(3, Math.round(6 + value * 38));
          return `<i style="height: ${height}px"></i>`;
        }).join("");
      }

      function renderWordSegments() {
        const current = getCurrentCueAndWord();
        return state.cwi.cues.flatMap((cue) => (cue.words || []).map((word) => {
          const active = word.id === state.selectedWordId || word.id === current.wordId;
          const estimated = word.timing === "estimated";
          return `<button type="button" class="segment${active ? " active" : ""}${estimated ? " estimated" : ""}" style="left: ${word.start * PX_PER_SECOND}px; width: ${Math.max(34, (word.end - word.start) * PX_PER_SECOND)}px" data-cue-id="${escapeAttr(cue.id)}" data-word-id="${escapeAttr(word.id)}"${estimated ? ' title="Estimated timing"' : ""}>${escapeHtml(word.text)}</button>`;
        })).join("");
      }

      function renderCueSegments() {
        return state.cwi.cues.map((cue) => {
          const active = cue.id === state.selectedCueId || isCueLive(cue, currentMediaTime());
          const label = cue.type === "dialogue" ? `dialogue · ${speakerName(cue.speakerId)}` : `${cue.type} cue`;
          return `<button type="button" class="segment${active ? " active" : ""}" style="left: ${cue.start * PX_PER_SECOND}px; width: ${Math.max(58, (cue.end - cue.start) * PX_PER_SECOND)}px" data-cue-id="${escapeAttr(cue.id)}">${escapeHtml(label)}</button>`;
        }).join("");
      }

      function seekTimelineFromPointer(event) {
        const scroller = els.timelineGrid.querySelector(".timeline-scroll");
        if (!scroller) return;

        const rect = scroller.getBoundingClientRect();
        const x = event.clientX - rect.left + scroller.scrollLeft;
        const time = clamp(x / PX_PER_SECOND, 0, getDuration());
        seekPreviewToTime(time);
        renderPlayback();
      }

      function renderPlayback() {
        renderCaptionOverlay();
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

      function updateTimelineActiveStates(current = getCurrentCueAndWord()) {
        els.timelineGrid.querySelectorAll(".segment").forEach((segment) => {
          const active = (segment.dataset.wordId && segment.dataset.wordId === current.wordId) ||
            (!segment.dataset.wordId && segment.dataset.cueId && segment.dataset.cueId === current.cueId) ||
            (segment.dataset.cueId && segment.dataset.cueId === state.selectedCueId) ||
            (segment.dataset.wordId && segment.dataset.wordId === state.selectedWordId);
          segment.classList.toggle("active", Boolean(active));
        });
      }

      // The caption overlay is a projection of cwiComputeFrame: nodes are rebuilt only when the set
      // of lines or their layout changes. Each frame updates box geometry, word position and type
      // (emphasized words grow and push their neighbors), color, and vertical offset.
      function renderCaptionOverlay() {
        const viewport = captionViewport();
        const frame = cwiComputeFrame(state.cwi, currentMediaTime(), viewport, (cue) => captionLayoutFor(cue, viewport), {
          reducedMotion: state.reducedMotion
        });
        const key = [viewport.width, viewport.height, ...frame.lines.map((line) => `${line.key}|${line.signature}`)].join("||");
        if (key !== captionView.key) buildCaptionNodes(frame, key);

        frame.lines.forEach((line, lineIndex) => {
          const view = captionView.lines[lineIndex];
          setStyle(view.box, "left", `${line.box.x.toFixed(2)}px`);
          setStyle(view.box, "top", `${line.box.y.toFixed(2)}px`);
          setStyle(view.box, "width", `${line.box.width.toFixed(2)}px`);
          setStyle(view.box, "height", `${line.box.height.toFixed(2)}px`);
          line.words.forEach((word, wordIndex) => {
            const node = view.words[wordIndex];
            setStyle(node, "left", `${word.x.toFixed(2)}px`);
            setStyle(node, "top", `${(word.baseline - word.fontPx * CWI_STYLE.type.ascentEm).toFixed(2)}px`);
            applyCaptionFont(node, word.fontPx, word.weight, word.width, word.slant);
            setStyle(node, "color", word.color);
            setStyle(node, "transform", captionTransform(word.offsetY, word.scale));
            if (word.units) {
              word.units.forEach((unit, unitIndex) => {
                setStyle(node.children[unitIndex], "transform", captionTransform(unit.offsetY, 1));
              });
            }
          });
        });
      }

      function buildCaptionNodes(frame, key) {
        captionView.lines.forEach((view) => view.box.remove());
        captionView.lines = frame.lines.map((line) => {
          const box = document.createElement("div");
          box.className = `caption-line caption-${line.cueType}`;
          box.style.background = frame.boxFill;

          const words = line.words.map((word) => {
            const node = document.createElement("span");
            node.className = "caption-word";
            // A line height equal to the font's ascent + descent puts the baseline exactly `ascentEm` below the top.
            node.style.lineHeight = String(CWI_STYLE.type.ascentEm + CWI_STYLE.type.descentEm);
            if (word.units) {
              word.units.forEach((unit) => {
                const unitNode = document.createElement("span");
                unitNode.className = "caption-unit";
                unitNode.textContent = unit.text;
                node.appendChild(unitNode);
              });
            } else {
              node.textContent = word.text;
            }
            box.appendChild(node);
            return node;
          });

          els.captionSafe.appendChild(box);
          return { box, words };
        });

        const guide = frame.guide;
        els.captionGuide.style.left = `${guide.left}px`;
        els.captionGuide.style.width = `${guide.width}px`;
        els.captionGuide.style.top = `${guide.top}px`;
        els.captionGuide.style.height = `${guide.bottom - guide.top}px`;
        els.captionSafe.dataset.lines = String(frame.lines.length);
        captionView.key = key;
      }

      // Skip style writes that would not change anything; most words are idle on most frames. The
      // browser normalizes values it reads back, so compare against what was last written instead.
      function setStyle(node, property, value) {
        let written = captionStyleCache.get(node);
        if (!written) {
          written = {};
          captionStyleCache.set(node, written);
        }
        if (written[property] === value) return;
        written[property] = value;
        node.style[property] = value;
      }

      function captionTransform(offsetY, scale) {
        if (!offsetY && scale === 1) return "";
        return `translate3d(0, ${offsetY.toFixed(2)}px, 0)${scale !== 1 ? ` scale(${scale.toFixed(3)})` : ""}`;
      }

      function captionViewport() {
        const frame = els.phoneFrame;
        return {
          width: frame && frame.clientWidth ? frame.clientWidth : 960,
          height: frame && frame.clientHeight ? frame.clientHeight : 540
        };
      }

      function invalidateCaptionLayouts(clearMeasurements = false) {
        captionLayouts.clear();
        if (clearMeasurements) captionMeasureCache.clear();
        captionView.key = "";
      }

      function captionLayoutFor(cue, viewport = captionViewport()) {
        const signature = cwiLayoutSignature(state.cwi, cue, viewport);
        const cached = captionLayouts.get(cue.id);
        if (cached && cached.signature === signature) return cached;
        const layout = cwiLayoutCue(state.cwi, cue, viewport, measureCaptionText);
        captionLayouts.set(cue.id, layout);
        return layout;
      }

      // Canvas text metrics cannot express Roboto Flex width or slant, so measure with a hidden
      // span that uses exactly the same font settings as the rendered words.
      function measureCaptionText(text, fontPx, weight, width, slant) {
        const key = `${text}|${fontPx.toFixed(3)}|${weight}|${width}|${slant}`;
        if (captionMeasureCache.has(key)) return captionMeasureCache.get(key);
        const node = els.captionMeasure;
        applyCaptionFont(node, fontPx, weight, width, slant);
        node.textContent = text;
        const measured = node.getBoundingClientRect().width;
        captionMeasureCache.set(key, measured);
        return measured;
      }

      function applyCaptionFont(node, fontPx, weight, width, slant) {
        setStyle(node, "fontSize", `${Math.round(fontPx * 100) / 100}px`);
        setStyle(node, "fontWeight", String(Math.round(weight)));
        setStyle(node, "fontVariationSettings", `"wght" ${Math.round(weight)}, "wdth" ${Math.round(width * 10) / 10}, "slnt" ${slant}`);
      }

      function renderTimeReadout() {
        els.timeReadout.textContent = `${formatTime(currentMediaTime())} / ${formatTime(getDuration())}`;
      }

      function updatePlayhead() {
        const playhead = els.timelineGrid.querySelector(".playhead");
        if (playhead) playhead.style.left = `${currentMediaTime() * PX_PER_SECOND}px`;
        const scroller = els.timelineGrid.querySelector(".timeline-scroll");
        if (scroller) {
          scroller.setAttribute("aria-valuenow", currentMediaTime().toFixed(2));
          scroller.setAttribute("aria-valuetext", formatTime(currentMediaTime()));
        }
      }

      function setPlayButton() {
        const path = els.video.paused
          ? '<path d="M8 5v14l11-7-11-7Z" fill="currentColor" stroke="none"></path>'
          : '<path d="M8 5v14"></path><path d="M16 5v14"></path>';
        els.playButton.setAttribute("aria-label", els.video.paused ? "Play preview" : "Pause preview");
        els.playButton.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
      }

      function setGuideButton() {
        els.guideButton.setAttribute("aria-pressed", String(state.showGuides));
        els.guideButton.setAttribute("aria-label", state.showGuides ? "Hide caption work area" : "Show caption work area");
        els.captionGuide.hidden = !state.showGuides;
      }

      function setSoundButton() {
        if (!els.soundButton) return;
        const muted = els.video.muted || els.video.volume === 0;
        const path = muted
          ? '<path d="M4 9v6h4l5 4V5L8 9H4Z"></path><path d="m17 9 4 6"></path><path d="m21 9-4 6"></path>'
          : '<path d="M4 9v6h4l5 4V5L8 9H4Z"></path><path d="M17 9.5a4 4 0 0 1 0 5"></path><path d="M19.5 7a7 7 0 0 1 0 10"></path>';
        els.soundButton.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
        els.soundButton.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
      }

      function applyInspectorControl(control) {
        const cue = getSelectedCue();
        const word = getSelectedWord();
        if (!cue) return;

        const value = control.type === "checkbox" ? control.checked : control.value;
        const exception = cwiNormalizeException(cue.exception);

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
            cue.offCamera = Boolean(getSpeaker(cue.speakerId) && getSpeaker(cue.speakerId).defaultOffCamera);
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
            if (word) word.volumePercent = clamp(cwiNumber(value, CWI_NEUTRAL_VOLUME), 0, 100);
            break;
          case "word-burst":
            if (word) word.burst = Boolean(value);
            break;
          case "word-motion":
            if (word) word.motion = CWI_WORD_MOTIONS.includes(value) ? value : "pop";
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
              const tone = cwiToneFromSlider(cwiNumber(value, 0) / 100);
              word.pitchWeight = tone.weight;
              word.pitchWidth = tone.width;
            }
            break;
          case "pitch-weight":
            if (word) word.pitchWeight = clamp(cwiNumber(value, CWI_STYLE.type.defaultWeight), CWI_STYLE.tone.minWeight, CWI_STYLE.tone.maxWeight);
            break;
          case "pitch-width":
            if (word) word.pitchWidth = clamp(cwiNumber(value, CWI_STYLE.type.defaultWidth), CWI_STYLE.tone.minWidth, CWI_STYLE.tone.maxWidth);
            break;
          case "pitch-hz":
            if (word && Number.isFinite(cwiNumber(value, NaN))) {
              const tone = cwiToneForPitchHz(Number(value));
              word.pitchWeight = tone.weight;
              word.pitchWidth = tone.width;
            }
            break;
          case "off-camera":
            cue.offCamera = Boolean(value);
            break;
          case "exception-color":
          case "exception-motion":
          case "exception-intonation":
            cue.exception = { ...exception, [control.dataset.control.replace("exception-", "")]: Boolean(value) };
            break;
          default:
            break;
        }

      }

      // Estimated words follow the cue's START/END window, so keep them in step with cue edits.
      function reseedEstimatedWords(cue) {
        const words = cue.words || [];
        if (!words.length || !words.every((word) => word.timing === "estimated")) return;
        const times = cwiEstimatedWordTimes(cue, words.length);
        words.forEach((word, index) => {
          word.start = times[index].start;
          word.end = times[index].end;
        });
      }

      function setWordSyllables(word, value) {
        const parts = value.split("-").map((part) => part.trim()).filter(Boolean);
        if (parts.length < 2 || parts.join("") !== word.text) {
          delete word.units;
          return;
        }
        const start = Number(word.start);
        const duration = Math.max(0.01, Number(word.end) - start);
        word.units = parts.map((text, index) => ({ text, start: roundTime(start + (duration * index) / parts.length) }));
      }

      function updateRangeOutputs() {
        const volumeInput = els.inspector.querySelector('[data-control="volume"]');
        const volumeOutput = els.inspector.querySelector('[data-output="volume"]');
        if (volumeInput && volumeOutput) volumeOutput.textContent = `${cwiVolumeScreenPercent(Number(volumeInput.value)).toFixed(1)}%`;
        const toneOutput = els.inspector.querySelector('[data-output="tone"]');
        const word = getSelectedWord();
        if (toneOutput && word) toneOutput.textContent = `wght ${word.pitchWeight} · wdth ${word.pitchWidth}`;
      }

      function syncInspectorTitle() {
        const titleValue = els.inspectorHead.querySelector(".inspector-title span");
        const cue = getSelectedCue();
        const word = getSelectedWord();
        if (titleValue && cue) titleValue.textContent = `"${word ? word.text : cwiCueDisplayText(cue)}"`;
      }

      function normalizeCueTiming(cue) {
        const wordTimes = (cue.words || []).flatMap((word) => [Number(word.start), Number(word.end)]).filter(Number.isFinite);
        if (wordTimes.length) {
          cue.start = roundTime(Math.min(cue.start, ...wordTimes));
          cue.end = roundTime(Math.max(cue.end, ...wordTimes));
        }
      }

      function validateProject(project) {
        const checks = [];
        const fail = (title, body) => checks.push({ status: "fail", title, body });
        const pass = (title, body) => checks.push({ status: "pass", title, body });

        if (state.importError) fail("JSON import", state.importError);
        if (state.importWarnings.length) fail("JSON required fields", state.importWarnings.slice(0, 5).join("; "));

        if (!project.project || !project.project.id || !project.project.title) {
          fail("Project metadata", "Project id and title are required.");
        } else if (!CWI_ASPECT_RATIOS.includes(project.project.aspectRatio)) {
          fail("Project metadata", `Aspect ratio ${project.project.aspectRatio || "(missing)"} must be one of ${CWI_ASPECT_RATIOS.join(", ")}.`);
        } else {
          pass("Project metadata", `${project.project.title} is ${project.project.aspectRatio} at ${project.project.frameRate || CWI_DEFAULT_FRAME_RATE} fps (schema v${project.schemaVersion || 1}).`);
        }

        if (!Array.isArray(project.speakers) || project.speakers.length === 0) {
          fail("Speaker metadata", "At least one speaker with id, name, role, color, and off-camera default is required.");
        } else {
          const missingSpeaker = project.speakers.find((speaker) => !speaker.id || !speaker.name || !speaker.color);
          missingSpeaker ? fail("Speaker metadata", "One or more speakers are missing id, name, or color.") : pass("Speaker metadata", `${project.speakers.length} speaker records are editable.`);
          const colorIssues = speakerColorIssues(project.speakers);
          colorIssues.length
            ? fail("Speaker colors", colorIssues.slice(0, 3).join("; "))
            : pass("Speaker colors", `Main and supporting characters are at least ${MIN_SPEAKER_HUE_DISTANCE}\u00B0 apart on the hue wheel.`);
        }

        if (!Array.isArray(project.cues) || project.cues.length === 0) {
          fail("CWI cues", "At least one caption cue is required.");
          return checks;
        }

        const cueErrors = [];
        project.cues.forEach((cue) => {
          if (!cue.id || !CUE_TYPES.includes(cue.type) || !Number.isFinite(Number(cue.start)) || !Number.isFinite(Number(cue.end)) || !cue.text) {
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

        const mediaSource = String(els.video.currentSrc || els.video.src || "");
        remoteMediaSource(mediaSource)
          ? fail("Media boundary", "Preview media is loaded from another origin. Source media must stay local unless the creator uploads it on purpose.")
          : pass("Media boundary", mediaSource.startsWith("blob:") ? "Selected media is a browser object URL and stays on this device." : "The bundled sample media is served with the app; nothing is uploaded.");

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

        const viewport = captionViewport();
        const layoutFor = (cue) => captionLayoutFor(cue, viewport);
        const overflowingCues = project.cues.filter((cue) => layoutFor(cue).overflow);
        const busiest = cwiMaxSimultaneousLines(project, layoutFor);
        if (overflowingCues.length) {
          fail("Caption work area", `These cues are wider than the ${project.project.aspectRatio} line width even on two lines, or have more than one manual break: ${overflowingCues.slice(0, 3).map((cue) => cue.id).join(", ")}.`);
        } else if (busiest.count > CWI_STYLE.stack.maxLines) {
          fail("Caption work area", `${busiest.count} caption lines are on screen at ${formatTime(busiest.time)}; the system allows ${CWI_STYLE.stack.maxLines}. Shorten or split the overlapping cues.`);
        } else {
          pass("Caption work area", `Every cue fits the ${project.project.aspectRatio} line width, and no more than ${CWI_STYLE.stack.maxLines} lines are on screen at once.`);
        }

        return checks;
      }

      function remoteMediaSource(source) {
        if (!/^https?:/i.test(source)) return false;
        try {
          return new URL(source).origin !== window.location.origin;
        } catch {
          return true;
        }
      }

      function speakerColorIssues(speakers) {
        const prominent = (speakers || []).filter((speaker) => speaker.role !== "minor");
        const issues = [];
        prominent.forEach((speaker, index) => {
          prominent.slice(index + 1).forEach((other) => {
            const distance = cwiHueDistance(speaker.color, other.color);
            if (distance < MIN_SPEAKER_HUE_DISTANCE) {
              issues.push(`${speaker.name} and ${other.name} are only ${Math.round(distance)}\u00B0 apart`);
            }
          });
        });
        return issues;
      }

      function nonDialogueCueIssues(cues) {
        return (cues || [])
          .filter((cue) => cue.type !== "dialogue")
          .flatMap((cue) => {
            const issues = [];
            const text = String(cue.text || "").trim();
            if (/^[[\u266a\u266b]|[\]\u266a\u266b]$/.test(text)) {
              issues.push(`${cue.id} stores brackets or music notes in its text; store plain text and let rendering add them`);
            }
            if (cue.speakerId) issues.push(`${cue.id} is a ${cue.type} cue and should not have a speaker color`);
            return issues;
          });
      }

      // Doc QA: normal speaking volume returns to the 5% baseline.
      function volumeBaselineIssues(cues) {
        const words = (cues || []).flatMap((cue) => cue.type === "dialogue" ? (cue.words || []) : []);
        if (!words.length) return [];
        const sized = words.filter((word) => Math.abs(cwiNumber(word.volumePercent, CWI_NEUTRAL_VOLUME) - CWI_NEUTRAL_VOLUME) > NEUTRAL_VOLUME_TOLERANCE);
        if (sized.length / words.length > MAX_SIZED_WORD_SHARE) {
          return [`${sized.length} of ${words.length} dialogue words are sized louder or softer than normal; most speech should stay at the 5% baseline`];
        }
        return [];
      }

      function wordTimingIssues(cues) {
        return (cues || [])
          .filter((cue) => cue.type === "dialogue")
          .flatMap((cue) => {
            const words = cue.words || [];
            const issues = [];
            const normalizedCueText = normalizeTranscriptReferenceText(cue.text);
            const normalizedWordText = normalizeTranscriptReferenceText(words.map((word) => word.text).join(" "));
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

      function toneOverridePolicyIssues(cues) {
        const words = (cues || []).flatMap((cue) => cue.type === "dialogue" ? (cue.words || []) : []);
        if (!words.length) return [];

        const issues = [];
        const contradicting = words.filter((word) => !cwiToneInBand(word.pitchWeight, word.pitchWidth));
        if (contradicting.length) {
          issues.push(`${contradicting.slice(0, 3).map((word) => `"${word.text}"`).join(", ")} pair weight and width against the voice (heavy with narrow, or light with wide)`);
        }

        const overrideWords = words.filter((word) => {
          const weight = cwiNumber(word.pitchWeight, CWI_STYLE.type.defaultWeight);
          const width = cwiNumber(word.pitchWidth, CWI_STYLE.type.defaultWidth);
          return Math.abs(weight - CWI_STYLE.type.defaultWeight) >= 120 || Math.abs(width - CWI_STYLE.type.defaultWidth) >= 10;
        });
        if (overrideWords.length / words.length > 0.2) {
          issues.push(`${overrideWords.length} of ${words.length} dialogue words have tone overrides; keep pitch styling sparse and editorial`);
        }

        return issues;
      }

      function findMissingImportedFields(raw) {
        const warnings = [];
        if (!raw || typeof raw !== "object") return ["JSON root must be an object."];
        if (!raw.project) warnings.push("project object is missing");
        if (raw.project) {
          ["id", "title", "aspectRatio", "mediaName", "duration"].forEach((field) => {
            if (raw.project[field] === undefined || raw.project[field] === "") warnings.push(`project.${field} is missing`);
          });
        }

        if (!Array.isArray(raw.speakers)) {
          warnings.push("speakers array is missing");
        } else {
          raw.speakers.forEach((speaker, index) => {
            ["id", "name", "role", "color", "defaultOffCamera"].forEach((field) => {
              if (speaker[field] === undefined || speaker[field] === "") warnings.push(`speakers[${index}].${field} is missing`);
            });
          });
        }

        if (!Array.isArray(raw.cues)) {
          warnings.push("cues array is missing");
        } else {
          raw.cues.forEach((cue, cueIndex) => {
            ["id", "type", "start", "end", "text", "words"].forEach((field) => {
              if (cue[field] === undefined || cue[field] === "") warnings.push(`cues[${cueIndex}].${field} is missing`);
            });
            if (cue.type === "dialogue" && !cue.speakerId) warnings.push(`cues[${cueIndex}].speakerId is missing`);
            if (Array.isArray(cue.words)) {
              cue.words.forEach((word, wordIndex) => {
                ["id", "text", "start", "end", "volumePercent"].forEach((field) => {
                  if (word[field] === undefined || word[field] === "") warnings.push(`cues[${cueIndex}].words[${wordIndex}].${field} is missing`);
                });
              });
            }
          });
        }

        return warnings;
      }

      function getSelectedCue() {
        return getCue(state.selectedCueId);
      }

      function getCue(cueId) {
        return state.cwi.cues.find((cue) => cue.id === cueId) || null;
      }

      function getSelectedWord() {
        const cue = getSelectedCue();
        if (!cue || !cue.words) return null;
        return cue.words.find((word) => word.id === state.selectedWordId) || null;
      }

      function getSpeaker(speakerId) {
        return state.cwi.speakers.find((speaker) => speaker.id === speakerId) || null;
      }

      function ensureSelection() {
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

      function firstWordId(cue) {
        return cue && cue.words && cue.words[0] ? cue.words[0].id : "";
      }

      function getCurrentCueAndWord() {
        const mediaTime = currentMediaTime();
        const live = cwiLiveCues(state.cwi, mediaTime);
        const cue = live[live.length - 1];
        if (!cue) return { cueId: "", wordId: "" };
        if (cue.type !== "dialogue") {
          return { cueId: cue.id, wordId: cue.words && cue.words[0] ? cue.words[0].id : "" };
        }
        const word = currentWordForCue(cue, mediaTime);
        return { cueId: cue.id, wordId: word ? word.id : "" };
      }

      function isCueLive(cue, time) {
        return time >= Number(cue.start) && time <= Number(cue.end);
      }

      function currentWordForCue(cue, time) {
        const words = cue.words || [];
        return words.find((word) => isWordLive(word, time)) || null;
      }

      function isWordLive(word, time) {
        return time >= Number(word.start) && time <= Number(word.end);
      }

      function hasTimingWarning(cue, word) {
        return Number(word.start) < Number(cue.start) || Number(word.end) > Number(cue.end) || Number(word.end) <= Number(word.start);
      }

      function syncCueTextFromWords(cue) {
        cue.text = (cue.words || []).map((word) => word.text).join(" ");
      }

      function selectAdjacentWord(direction) {
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

      function getDuration() {
        if (Number.isFinite(els.video.duration) && els.video.duration > 0) return els.video.duration;
        return Number(state.cwi.project.duration) || 0;
      }

      function currentMediaTime() {
        if (state.previewTimeOverride !== null && els.video.paused) return state.previewTimeOverride;
        const anchor = state.frameAnchor;
        if (anchor && !els.video.paused) {
          const elapsed = (performance.now() - anchor.wallTime) / 1000;
          if (elapsed >= 0 && elapsed < 0.25) return anchor.mediaTime + elapsed * (els.video.playbackRate || 1);
        }
        return els.video.currentTime || 0;
      }

      function seekPreviewToTime(time) {
        const nextTime = clamp(time, 0, getDuration());
        state.previewTimeOverride = nextTime;
        seekVideoElement(nextTime);
      }

      function seekVideoElement(time) {
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

      function speakerName(speakerId) {
        const speaker = getSpeaker(speakerId);
        return speaker ? speaker.name : "no speaker";
      }

      function mediaExtensionLabel() {
        const media = state.cwi.project.mediaName || "";
        const extension = media.includes(".") ? media.slice(media.lastIndexOf(".")) : "";
        return extension && !state.cwi.project.title.endsWith(extension) ? extension : "";
      }

      function roundTime(value) {
        return Math.round(Number(value) * 100) / 100;
      }

      function formatTime(value) {
        const seconds = Math.max(0, Number(value) || 0);
        const minutes = Math.floor(seconds / 60);
        const remainder = seconds - minutes * 60;
        return `${String(minutes).padStart(2, "0")}:${remainder.toFixed(2).padStart(5, "0")}`;
      }

      function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
      }

      function capitalize(value) {
        return String(value).charAt(0).toUpperCase() + String(value).slice(1);
      }

      function roleLabel(value) {
        if (value === "main") return "Main character";
        if (value === "minor") return "Minor character";
        return "Supporting character";
      }

      function uniqueId(prefix, reservedIds = new Set()) {
        const existingIds = new Set([
          ...state.cwi.speakers.map((speaker) => speaker.id),
          ...state.cwi.cues.map((cue) => cue.id),
          ...state.cwi.cues.flatMap((cue) => (cue.words || []).map((word) => word.id)),
          ...reservedIds
        ]);
        let index = existingIds.size + 1;
        let id = `${prefix}-${index}`;
        while (existingIds.has(id)) {
          index += 1;
          id = `${prefix}-${index}`;
        }
        return id;
      }

      function slugify(value) {
        return String(value || "cwi-project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cwi-project";
      }

      function fileNameStem(value) {
        const name = String(value || "Local Media").split(/[\\/]/).pop() || "Local Media";
        return name.replace(/\.[^.]+$/, "") || name;
      }

      function structuredCloneSafe(value) {
        return JSON.parse(JSON.stringify(value));
      }

      function escapeHtml(value) {
        return String(value == null ? "" : value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      function escapeAttr(value) {
        return escapeHtml(value).replace(/`/g, "&#096;");
      }
    })();
