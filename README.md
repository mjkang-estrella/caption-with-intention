# Caption With Intent

Caption With Intent is a browser-first prototype for editing Caption with Intention (CWI) overlays. CWI extends standard captions with speaker attribution, word-level synchronization, and intonation cues such as color, motion, size, weight, and width.

The current app is a static TypeScript/CSS prototype. It loads a bundled sample video, renders editable CWI captions over the preview, and supports local JSON import/export for the project data model.

## What is included

- Local video preview with a CWI caption overlay.
- Transcript, speaker, and QA panels.
- Inspector controls for cue timing, speaker assignment, word motion, volume size, optional tone overrides, line breaks, off-camera styling, and exception flags.
- Local media import through browser object URLs.
- SRT and WebVTT caption import for creating editable CWI cues from user media.
- CWI JSON import/export for round-tripping editable project state.
- Reference source material in `reference/`.

## Run locally

Install dependencies:

```sh
npm install
```

Build the TypeScript bundle:

```sh
npm run build
```

Open `index.html` in a browser. The prototype is intentionally static and can run from `file://`; a local static server is optional.

## Scripts

- `npm run build`: compile `src/model.ts` and `src/app.ts` into `dist/app.js`.
- `npm run typecheck`: run TypeScript without writing output.

## Deploy to Vercel

This repo is deployable as a static Vercel project. The included `vercel.json` runs `npm run build` and serves the repository root so `index.html`, `dist/app.js`, `src/styles.css`, and the bundled `reference/` media assets remain available at the same paths used locally.

Recommended Vercel settings:

- Framework preset: Other
- Build command: `npm run build`
- Output directory: `.`
- Install command: `npm install`

## Project layout

- `index.html`: static app shell and initial markup.
- `src/`: editable TypeScript and CSS source.
- `dist/`: compiled browser bundle loaded by `index.html`.
- `reference/`: product spec, CWI guidelines, source PDFs, Roboto Flex font, After Effects assets, and sample media.
- `.omx/`: local orchestration/runtime state, ignored by Git.

## Development notes

Edit TypeScript in `src/`, then run `npm run build` so `dist/app.js` stays in sync with the static HTML page.

The prototype has no backend and no upload path. Imported media stays in the browser as a local object URL, and the bundled sample media is loaded from `reference/`.

When a user imports media, the demo transcript is cleared and the editor prompts for an SRT or WebVTT caption file. Caption import creates editable CWI cues, starts dialogue with an `Unknown Speaker`, keeps sound effects bracketed and speakerless, and runs a best-effort browser-only volume analysis to seed vocal emphasis.

Tone weight and width fields are stored as optional editorial overrides. They should be used sparingly for unusually deep, sharp, tense, or stylized delivery rather than applied continuously to every spoken word.

Use the QA panel after timing or styling edits. It checks project structure, local media boundaries, AE sample coverage, work-area overflow, sound cue treatment, volume sizing range, read-ahead timing, and overuse of optional tone overrides.

For product intent and the longer-term implementation sequence, start with `reference/SPEC.md`.
