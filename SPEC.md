---
project_type: greenfield
draft_origin: freeform
clarification_rounds_completed: 5
title: AI-Based Caption with Intention Creator
goal: Define a creator tool that takes short-form video or audio input, generates Caption with Intention caption overlays, and gives creators an editor to correct timing, speaker attribution, intonation, and visual styling before publishing to social platforms.
target_user: Short-form video creators and editors publishing to YouTube, TikTok, Instagram Reels, and similar social platforms.
owner: product
status: ready
constraints:
  - Preserve standard closed captions as a required companion deliverable; CWI augments them instead of replacing them.
  - Support word-level timing, speaker attribution, read-ahead text, motion emphasis, volume-based size, pitch-based weight and width, off-camera styling, sound effects, and music cues.
  - Keep the canonical CWI data model round-trippable through a human editor.
  - Do not choose a delivery format that loses CWI intent without making the loss explicit.
  - Support social-video aspect ratios such as 9:16, 1:1, and 16:9 in preview and export.
  - Include three output modes in the product spec: web player or embed, editable project with preview, and burned-in rendered video.
  - Sequence implementation as web player or embed first, editable project with preview second, and burned-in rendered video third.
  - Include full manual CWI editing in the first release, not only review or transcript cleanup.
  - Use Convex as the backend for app state, project metadata, CWI document data, versioning, collaboration, review notes, and share or embed records.
  - Keep source video, source audio, waveform extraction, local preview playback, video rendering, and other high-volume media processing local by default.
  - Uploading source media or media-derived artifacts to cloud services requires an explicit user action and a visible privacy boundary.
  - Use internal creator QA as the first validation gate; collect Deaf and hard-of-hearing community feedback after a working prototype exists.
non_goals:
  - Do not build the implementation before the spec reaches over 80 percent clarity.
  - Do not claim current closed-caption standards can replace required regulated captions.
  - Do not add runtime dependencies or commit to a specific AI provider in this spec phase.
  - Do not optimize for live broadcast captioning in the first draft unless the target workflow changes.
  - Do not optimize the MVP for professional After Effects or broadcast handoff workflows unless the target user changes.
  - Do not require every output mode to ship in the first implementation slice.
  - Do not store source video files in Convex as the default media-storage strategy.
primary_workflow:
  - Creator imports a short-form video or audio file, optionally with an existing transcript or caption file.
  - The local media pipeline generates or prepares transcript text, word timings, speaker diarization, acoustic features, and provisional CWI styling.
  - Creator reviews the media in an editor with waveform, transcript, timeline, social-safe-area guides, and live CWI overlay preview.
  - Creator corrects false AI output, including transcript text, speaker identity, word timing, line breaks, speaker color, per-word motion, volume size, pitch style, exceptions, sound effects, and music cues.
  - Creator syncs lightweight CWI project state through Convex while local media remains on-device unless explicitly uploaded.
  - Creator shares or embeds an interactive web playback, saves an editable CWI project file, and exports a social-platform-ready rendered video when that phase is implemented.
success_metrics:
  - Given a 15 second to 3 minute sample clip, a creator can import media and save an editable CWI project without manually building After Effects layers.
  - A storage audit for a sample import shows zero source video or source audio files stored in Convex by default.
  - Given a sample CWI project, the web player or embed renders CWI read-ahead text, word-level sync, speaker color, and motion over video playback.
  - A validation report for a saved CWI project returns zero missing required fields across transcript text, word timings, speaker metadata, style decisions, exceptions, and reviewer edits.
  - For a sample cue, a reviewer can edit text, speaker, word timing, line breaks, speaker color, per-word motion, volume size, pitch style, exception status, sound effects, and music cues, then see the preview update.
  - A delivery matrix contains separate rows with entry and exit criteria for web player or embed, editable project with preview, and burned-in rendered video.
  - An internal creator QA checklist records pass or fail results for import, web playback, edit override, Convex storage boundary, and project save flows before community review begins.
acceptance_criteria:
  - The spec identifies the first target user and production workflow.
  - The spec chooses a canonical CWI caption data strategy and explains compatibility exports.
  - The spec defines the minimum editor capabilities needed to correct AI mistakes.
  - The spec defines the MVP platform direction and why it fits the first workflow.
  - The spec lists measurable quality checks for CWI output before implementation starts.
open_questions: []
---

## Context

Caption with Intention, or CWI, extends traditional captions across three dimensions:
speaker attribution, word-level synchronization, and intonation. The local guidelines define a system where
complete read-ahead text appears first, each word becomes speaker-colored as it is spoken, the active word
receives a motion pop, and volume plus pitch are expressed through Roboto Flex size, weight, and width.

The product idea is an AI-based creator for short-form social video. It accepts video or audio input and produces
CWI output that can be published on platforms that do not natively understand CWI. The likely system shape is:

1. Media analysis pipeline: transcription, forced alignment, diarization, character labeling, volume analysis,
   pitch and harmonic analysis, sound-effect detection, and music cue detection. Source media and heavyweight
   media processing stay local by default because video files are high-volume.
2. Canonical CWI project file: a structured, lossless sidecar format that stores raw transcript data, word timing,
   speaker metadata, acoustic features, style decisions, exceptions, and reviewer edits.
3. Renderer: a playback layer that reads the CWI project file and draws CWI captions inside the editor preview
   and export pipeline.
4. Editor: a human correction tool for fixing AI errors and making editorial choices.
5. Output modes: interactive web player or embed, editable project with preview, rendered social video for
   publishing, standard caption exports for compatibility, and project interchange for continued editing.
6. Backend: Convex stores lightweight app state, project records, CWI document data, version history,
   collaboration state, review notes, and share/embed metadata; it does not store source video by default.

## Current Caption Format Assessment

Current caption formats cover parts of CWI but do not appear to cover the full system in a portable, reliable,
round-trippable way.

- WebVTT is useful for web compatibility. It supports cue text tags, voice tags, classes, CSS cue styling,
  inline timestamp objects, and `:past` or `:future` styling for karaoke-like word progress. This can express
  some word-level sync, but it is not a complete fit for reliable motion pop, variable font axes, rich acoustic
  metadata, complex editor round-tripping, or consistent player behavior across platforms.
- TTML and IMSC are stronger professional timed-text candidates. TTML supports timed spans, styles, regions,
  and animation structures; IMSC profiles are widely relevant for internet media subtitles and captions. They
  may carry more styling than WebVTT, but typical players and delivery workflows still may not preserve the
  full CWI visual behavior, especially animation and variable-font expressiveness.
- ASS or SSA can express karaoke-style timing and rich visual effects in renderer ecosystems such as libass,
  but it is not the right canonical accessibility caption format for regulated or mainstream streaming delivery.
- Broadcast and compliance formats such as CEA-608, CEA-708, SCC, STL, and platform timed-text templates are
  important compatibility outputs but are too limited for CWI's full visual and acoustic intent.

Provisional recommendation: create a canonical `cwi.json` project format and a CWI renderer, then use that source
of truth for interactive web playback, editable project review, rendered social video, and compatibility formats.
Standard WebVTT or TTML/IMSC can be used as import/export targets, but not as the only internal format unless
the MVP deliberately accepts fidelity loss.

## Provisional Platform Direction

Browser-first is the current best candidate for a social-video creator product because it gives the fastest path
to a cross-platform editor, web video preview, custom canvas or DOM renderer, shareable review links, and easier
distribution to creators. Convex is the preferred backend for lightweight synced state, while the media pipeline
remains local-first for source video, source audio, preview, analysis, and export rendering.

A native Mac app becomes more attractive if the target shifts toward professional post-production users who need
local-only media handling, After Effects or Final Cut Pro integration, Apple media APIs, offline performance, or
large-file reliability from day one.

## Draft Product Shape

Required output modes:

1. Web player or embed where CWI stays interactive through a custom renderer.
2. Editable project plus preview for creator correction and continued editing.
3. Burned-in rendered video for TikTok, Instagram Reels, YouTube Shorts, and other platforms that will not run
   a custom CWI renderer.

Implementation sequence:

1. Build the custom web player or embed and prove that `cwi.json` can render CWI over video playback.
2. Build the editable project and preview workflow so creators can correct AI output.
3. Build burned-in rendered video export so the exact CWI look survives social-platform upload.

First-release editor scope:

- Full CWI editing is required from the first release.
- Users must be able to manually control transcript text, speaker labels, word timing, line breaks, speaker colors,
  per-word motion, volume-driven type size, pitch-driven weight and width, scene exceptions, sound effects, and
  music cues.
- AI generation is the starting point, but the editor must expose the generated decisions so users can override
  them directly.

Backend and media boundary:

- Convex is the backend solution for project metadata, CWI document data, collaboration, review annotations,
  version history, and share/embed records.
- Source video, source audio, high-volume media assets, waveform extraction, local preview playback, and rendered
  video export stay local by default.
- Cloud AI or cloud media processing can only be used after an explicit user upload step. The default architecture
  must make it possible to work on local media without silently sending video to a backend service.

Validation path:

- Internal creator QA is the first validation gate for the prototype.
- Internal QA must check import, web playback, CWI edit overrides, project save and reload, Convex storage
  boundaries, and the three-mode delivery sequence.
- Deaf and hard-of-hearing community feedback comes after a working prototype exists, and should inform later
  accessibility claims, format stabilization, and product iteration.

## Assumptions

- [resolved][user] The first target user is a creator tool user making social videos for YouTube, TikTok, Instagram Reels, and similar platforms.
- [resolved][workflow] All three output modes are required in the product spec, implemented in the sequence web player or embed, editable project with preview, then burned-in rendered video.
- [resolved][scope] The first release requires full CWI editing controls rather than review-only, essential-only, or fully unattended generation.
- [resolved][constraint] Convex is the backend for lightweight app and CWI project state, while source media and video-related processing stay local by default; cloud AI or media upload requires explicit user action.
- [resolved][feedback] Internal creator QA is the first validation gate, and Deaf and hard-of-hearing community feedback comes after a working prototype exists.
- [resolved][context] Existing CWI guidance says the system should augment legally required closed captions rather than replace them.
- [resolved][context] Existing CWI guidance allows burned-in open captions until playback and caption technologies support the full system.

## Decisions

- Decided: prioritize a creator workflow for social videos, YouTube, reels, and short-form media.
- Decided: include web player or embed, editable project with preview, and burned-in rendered video in the product spec.
- Decided: implement output modes in the sequence custom web player or embed, editable project with preview, then burned-in rendered video.
- Decided: first-release editing scope is full CWI editing, including manual control over per-word motion, color, size, pitch style, exceptions, sound effects, and music cues.
- Decided: use Convex for backend state and keep source media plus video-related processing local by default.
- Decided: validate with internal creator QA first, then collect Deaf and hard-of-hearing community feedback after the prototype is usable.
- Provisional: keep CWI as a separate high-fidelity layer from legally required standard captions.
- Provisional: use a canonical CWI project file as the source of truth, then export rendered social video and compatibility formats.
- Provisional: include a human editor in the MVP because AI will produce false captions, speaker labels, timing, and acoustic interpretations.
- Provisional: treat browser-first as the leading platform option until the first target workflow is confirmed.

## Risks

- Existing standards may support partial CWI features but fail in real player implementations.
- AI can mis-transcribe speech, misidentify speakers, miss off-camera context, and overfit acoustic styling.
- CWI styling could reduce readability if motion, color, or type scaling is too aggressive.
- File format design could become too complex before the target workflow is proven.
- The Convex/local-media boundary must be designed carefully so source video is not uploaded by accident.
- Local media analysis and rendering can create performance constraints on low-power creator devices.
- Accessibility validation remains limited until Deaf and hard-of-hearing community feedback is collected after the prototype.

## Notes

Current clarity estimate: 95 percent.

Clarity breakdown:

- Problem and design system: 80 percent. The CWI source documents define attribution, synchronization,
  intonation, layout, sound effects, music, and exceptions.
- Target user and workflow: 82 percent. The first market is social-video creators and the output sequence is
  web player or embed, editable project with preview, then burned-in rendered video.
- Format strategy: 78 percent. The source-of-truth format and renderer direction are clear, but the initial
  `cwi.json` schema still needs detailed design.
- Platform: 70 percent. Browser-first now fits the chosen social-video workflow, with desktop wrapping reserved
  for local export or privacy needs.
- AI/editor scope: 85 percent. Full first-release CWI editing is now required; detailed UI layout and control grouping
  remain for implementation planning.
- Backend and media boundary: 90 percent. Convex owns lightweight synced state, while video-related assets and
  processing stay local by default.
- Validation and community feedback: 75 percent. Internal creator QA is the first gate, with Deaf and hard-of-hearing
  community feedback scheduled after a working prototype.

Industry and standards sources consulted on 2026-04-18:

- W3C WebVTT: https://www.w3.org/TR/webvtt1/
- W3C TTML2: https://www.w3.org/TR/2021/CR-ttml2-20210309/
- W3C IMSC 1.2: https://www.w3.org/TR/ttml-imsc1.2/
- FCC closed caption quality order: https://docs.fcc.gov/public/attachments/fcc-14-12a1.pdf
- Netflix timed-text style guide: https://partnerhelp.netflixstudios.com/hc/en-us/articles/219375728-Timed-Text-Style-Guide-Subtitle-Templates

Readiness state:

- All current clarification assumptions are resolved.
- The next step is implementation planning from this spec, starting with the custom web player or embed and
  canonical `cwi.json` rendering model.
