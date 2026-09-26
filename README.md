# Caption With Intent

Caption With Intent is a browser-first prototype for editing Caption with Intention (CWI) overlays. CWI extends standard captions with speaker attribution, word-level synchronization, and intonation cues such as color, motion, size, weight, and width.

The current app is a static TypeScript/CSS prototype. It loads a bundled sample video, renders editable CWI captions over the preview, and supports local JSON import/export for the project data model.

## What is included

- Local video preview with a CWI caption overlay that follows the After Effects template rig, in 16:9, 9:16, or 1:1 frames.
- Transcript, speaker, and QA panels.
- Inspector controls for cue timing, speaker assignment, per-word motion (word pop, syllable pop, none), volume size, loud bursts, tone (weight and width), line breaks, off-camera styling, and per-cue exceptions.
- Local media import through browser object URLs.
- SRT and WebVTT caption import for creating editable CWI cues from user media.
- CWI JSON import/export for round-tripping editable project state.
- Reference source material in `reference/`.

## Run locally

Install dependencies:

```sh
npm install
```

Build the browser bundle (`dist/` is generated and not committed, so build before opening the page):

```sh
npm run build
```

Open `index.html` in a browser. The prototype is intentionally static and can run from `file://`; a local static server is optional. Tests and type stripping need Node 22.18 or newer.

## Scripts

- `npm run build`: bundle the ES modules in `src/` into a single classic script, `dist/app.js`, with esbuild.
- `npm run dev`: rebuild `dist/app.js` on every change.
- `npm run typecheck`: type-check `src/` with TypeScript (no output).
- `npm test`: run the tests in `test/` with `node --test`; Node runs the TypeScript sources directly.

## Deploy to Vercel

This repo is deployable as a static Vercel project. The included `vercel.json` runs `npm run build` and serves the repository root so `index.html`, `dist/app.js`, `src/styles.css`, and the bundled `reference/` media assets remain available at the same paths used locally.

Recommended Vercel settings:

- Framework preset: Other
- Build command: `npm run build`
- Output directory: `.`
- Install command: `npm install`

## Project layout

- `index.html`: static app shell and initial markup.
- `src/core/`: DOM-free logic, tested directly with Node.
  - `types.ts`: the `cwi.json` schema and renderer data types.
  - `style.ts`: CWI style tokens (sizes, motion, box, layout per aspect ratio), speaker palette, volume and tone mappings.
  - `schema.ts`: schema constants and the normalizer that migrates v1 files and fills defaults.
  - `renderer.ts`: pure caption renderer, `(project, time, viewport) -> frame state`.
  - `edit.ts`, `subtitles.ts`, `audio-analysis.ts`, `qa.ts`: editing rules, SRT/WebVTT import, local volume analysis, and QA checks.
  - `sample.cwi.json`: the bundled sample project.
- `src/app/`: the editor UI. `main.ts` wires everything; `store.ts` holds editor state; `render.ts` is the registry each region redraws through; `caption-view.ts` projects frame state onto persistent caption nodes; `playback.ts`, `timeline.ts`, `inspector.ts`, `side-panel.ts`, `panels/`, `media.ts`, and `topbar.ts` own their regions.
- `dist/`: generated browser bundle loaded by `index.html` (not committed).
- `reference/`: product spec, CWI guidelines, source PDFs, Roboto Flex font, After Effects assets, and sample media.
- `.omx/`: local orchestration/runtime state, ignored by Git.

## Development notes

Edit TypeScript in `src/`, then run `npm run build` so `dist/app.js` stays in sync with the static HTML page.

Caption styling and motion values live in `CWI_STYLE` (`src/core/style.ts`). The defaults follow the After Effects template in `reference/AE PROJECT/`: 27 px type on a 1080 px frame (2.5% of height), #DDDDDD read-ahead text, an 80% black box padded 30 px per side and 20 px top and bottom, a 5 px lift on the word being spoken, and a 2 px dip on the next word. The guideline doc fills in what the template does not define: volume sizing from 3% to 12%, pitch-driven weight and width, off-camera slant, music notes, and two-line stacking. Change a token rather than adding numbers to the renderer.

Words rest in plain caption type (base size, Regular) before and after they are spoken, like familiar read-ahead captions. A word's intonation (volume size, pitch weight and width) is applied only while it is spoken: the word grows into it, pushes its neighbors and the box outward, then settles back. Line breaks are chosen at that widest moment, so a line never re-wraps mid-animation. Reduced-motion users get color sync without the lift or push. The dashed caption work-area guide is off by default; toggle it from the preview controls.

The renderer drives motion from a continuous word cursor, like the template's range selectors. With aligned word timing, a word starts to color and lift at its audible onset and peaks as the next word begins. Words imported from SRT or WebVTT, or re-created after a transcript edit, are marked `estimated` and follow the template's own eased distribution between the cue's start and end until someone aligns them.

The prototype has no backend and no upload path. Imported media stays in the browser as a local object URL, and the bundled sample media is loaded from `reference/`.

When a user imports media, the demo transcript is cleared and the editor prompts for an SRT or WebVTT caption file. Caption import creates editable CWI cues with estimated word timing, starts dialogue with an `Unknown Speaker`, keeps sound effects and music speakerless, and runs a best-effort browser-only volume analysis. The analysis compares each word with the median speech level: words within 3 dB stay at the normal size, and larger differences grow toward the shout size or shrink toward the whisper size.

Tone weight and width fields are stored as optional editorial overrides. They should be used sparingly for unusually deep, sharp, tense, or stylized delivery rather than applied continuously to every spoken word.

Use the QA panel after timing or styling edits. It checks project structure, speaker color separation, the local media boundary, read-ahead text and word order, estimated timing that still needs alignment, sound and music formatting, whether ordinary speech stays at the baseline size, tone pairings that contradict the voice, line width, and the two-line limit.

For product intent and the longer-term implementation sequence, start with `reference/SPEC.md`.
