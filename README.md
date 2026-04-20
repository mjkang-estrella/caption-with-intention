# Caption With Intent

Caption With Intent is a browser-first prototype for editing Caption with Intention (CWI) overlays. CWI extends standard captions with speaker attribution, word-level synchronization, and intonation cues such as color, motion, size, weight, and width.

The current app is a static TypeScript/CSS prototype. It loads a bundled sample video, renders editable CWI captions over the preview, and supports local JSON import/export for the project data model.

## What is included

- Local video preview with a CWI caption overlay.
- Transcript, speaker, and QA panels.
- Inspector controls for cue timing, speaker assignment, word motion, volume size, pitch weight, pitch width, line breaks, off-camera styling, and exception flags.
- Local media import through browser object URLs.
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

## Project layout

- `index.html`: static app shell and initial markup.
- `src/`: editable TypeScript and CSS source.
- `dist/`: compiled browser bundle loaded by `index.html`.
- `reference/`: product spec, CWI guidelines, source PDFs, Roboto Flex font, After Effects assets, and sample media.
- `.omx/`: local orchestration/runtime state, ignored by Git.

## Development notes

Edit TypeScript in `src/`, then run `npm run build` so `dist/app.js` stays in sync with the static HTML page.

The prototype has no backend and no upload path. Imported media stays in the browser as a local object URL, and the bundled sample media is loaded from `reference/`.

For product intent and the longer-term implementation sequence, start with `reference/SPEC.md`.
