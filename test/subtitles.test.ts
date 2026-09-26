import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createProjectFromSubtitleCues, cueTypeForSubtitleText, decodeHtmlEntities, parseSrt, parseSubtitleFile, parseWebVtt
} from "../src/core/subtitles.ts";

test("SRT: numbered blocks, CRLF, multi-line text, markup, and entities", () => {
  const srt = "1\r\n00:00:01,000 --> 00:00:02,500\r\n<i>Hello</i> &amp; welcome,\r\nfriend\r\n\r\n2\r\n00:00:03,000 --> 00:00:04,000\r\nIt&#39;s {\\an8}fine\r\n";
  assert.deepEqual(parseSrt(srt), [
    { start: 1, end: 2.5, text: "Hello & welcome, friend" },
    { start: 3, end: 4, text: "It's fine" }
  ]);
});

test("SRT: cues without valid timing or text are skipped", () => {
  const srt = "1\n00:00:05,000 --> 00:00:04,000\nBackwards\n\n2\nno timing here\n\n3\n00:00:06,000 --> 00:00:07,000\n<b></b>\n\n4\n00:00:08,000 --> 00:00:09,000\nKept";
  assert.deepEqual(parseSrt(srt).map((cue) => cue.text), ["Kept"]);
});

test("WebVTT: header, NOTE and STYLE blocks, cue ids, settings, and short timestamps", () => {
  const vtt = [
    "WEBVTT - demo",
    "",
    "NOTE this is a comment",
    "",
    "STYLE",
    "::cue { color: white }",
    "",
    "intro",
    "00:01.000 --> 00:02.000 line:90% align:center",
    "First &lt;line&gt;",
    "",
    "01:00:00.500 --> 01:00:01.000",
    "Second"
  ].join("\n");
  assert.deepEqual(parseWebVtt(vtt), [
    { start: 1, end: 2, text: "First <line>" },
    { start: 3600.5, end: 3601, text: "Second" }
  ]);
});

test("the file type comes from the WEBVTT header or the .vtt extension", () => {
  const body = "00:00:01.000 --> 00:00:02.000\nHi";
  assert.equal(parseSubtitleFile(`WEBVTT\n\n${body}`, "captions.txt").length, 1);
  assert.equal(parseSubtitleFile(body, "captions.vtt").length, 1);
  assert.equal(parseSubtitleFile("﻿1\n00:00:01,000 --> 00:00:02,000\nHi", "captions.srt")[0].text, "Hi");
  assert.deepEqual(parseSubtitleFile("   ", "empty.srt"), []);
});

test("decodeHtmlEntities handles WebVTT names and numeric references and leaves unknown ones", () => {
  assert.equal(decodeHtmlEntities("&amp;&lt;&gt;&quot;&apos;&#65;&#x42;&nbsp;&bogus;"), "&<>\"'AB &bogus;");
});

test("cue types: bracketed sound effects and music notes", () => {
  assert.equal(cueTypeForSubtitleText("[door crack]"), "sound");
  assert.equal(cueTypeForSubtitleText("♪ jazz playing ♪"), "music");
  assert.equal(cueTypeForSubtitleText("♫ [jazz music playing] ♫"), "music");
  assert.equal(cueTypeForSubtitleText("Hey, [whispers] you"), "dialogue");
});

test("imported cues become an editable project with estimated word timing", () => {
  const project = createProjectFromSubtitleCues([
    { start: 1, end: 3, text: "You want a Pepsi, pal?" },
    { start: 4, end: 5, text: "[door crack]" },
    { start: 6, end: 7, text: "♪ jazz ♪" }
  ], "clip.srt", { mediaName: "clip.mp4", aspectRatio: "9:16", duration: 12, title: "Clip" });

  assert.equal(project.project.aspectRatio, "9:16");
  assert.equal(project.project.mediaName, "clip.mp4");
  assert.deepEqual(project.cues.map((cue) => cue.type), ["dialogue", "sound", "music"]);
  assert.deepEqual(project.cues.map((cue) => cue.text), ["You want a Pepsi, pal?", "door crack", "jazz"]);
  assert.deepEqual(project.cues.map((cue) => cue.speakerId), ["speaker-unknown", "", ""]);

  const [dialogue] = project.cues;
  assert.equal(dialogue.words.length, 5);
  assert.ok(dialogue.words.every((word) => word.timing === "estimated"));
  assert.equal(dialogue.words[0].start, 1);
  assert.ok(dialogue.words.every((word, index) => word.start >= dialogue.start && word.end <= dialogue.end && (index === 0 || word.start >= dialogue.words[index - 1].start)));
  assert.equal(new Set(project.cues.flatMap((cue) => cue.words.map((word) => word.id))).size, 8, "word ids are unique");
  assert.match(project.review.notes[0], /Imported 3 cues from clip\.srt/);
});
