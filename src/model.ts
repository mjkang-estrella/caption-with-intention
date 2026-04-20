const DEFAULT_MEDIA_SRC = "reference/AE PROJECT/(Footage)/ASETS/Video/Cena_ref_CI_Template_v02a.mp4";
const CUE_TYPES = ["dialogue", "sound", "music"];
const MOTIONS = ["pop", "none", "syllable"];
const SPEAKER_ROLES = ["main", "supporting", "minor"];
const SPEAKER_PALETTE = [
  { role: "main", label: "CI Main Yellow", color: "#E5E517" },
  { role: "main", label: "CI Main Blue", color: "#17E5E5" },
  { role: "main", label: "CI Main Red", color: "#E51717" },
  { role: "main", label: "CI Main Orange", color: "#E58017" },
  { role: "main", label: "CI Main Green", color: "#17E517" },
  { role: "main", label: "CI Main Pink", color: "#E517E5" },
  { role: "supporting", label: "CI Support Orange", color: "#E85C2E" },
  { role: "supporting", label: "CI Support Yellow", color: "#EBC247" },
  { role: "supporting", label: "CI Support Green I", color: "#C2EB47" },
  { role: "supporting", label: "CI Support Green II", color: "#82ED5E" },
  { role: "supporting", label: "CI Support Green III", color: "#47EB70" },
  { role: "supporting", label: "CI Support Cyan", color: "#5EEDC9" },
  { role: "supporting", label: "CI Support Blue I", color: "#47C2EB" },
  { role: "supporting", label: "CI Support Blue II", color: "#5E82ED" },
  { role: "supporting", label: "CI Support Purple I", color: "#8C6BED" },
  { role: "supporting", label: "CI Support Purple II", color: "#CC6BED" },
  { role: "supporting", label: "CI Support Pink I", color: "#EB47C2" },
  { role: "supporting", label: "CI Support Pink II", color: "#ED5E82" },
  { role: "minor", label: "Minor Pastel Yellow", color: "#E6E68F" },
  { role: "minor", label: "Minor Pastel Green", color: "#A8E68F" },
  { role: "minor", label: "Minor Pastel Cyan", color: "#8FE6D4" },
  { role: "minor", label: "Minor Pastel Blue", color: "#8FA8E6" },
  { role: "minor", label: "Minor Pastel Pink", color: "#E68FC1" }
];
const PX_PER_SECOND = 110;
const INSPECTOR_COLUMN_MIN = 300;
const INSPECTOR_COLUMN_DEFAULT = 360;
const INSPECTOR_STACK_MIN = 220;
const CENTER_STAGE_MIN = 360;
const CWI_CAPTION_FONT_RATIO = 27 / 1080;
const CWI_CAPTION_MIN_FONT_PX = 11;
const CWI_WORD_RISE_RATIO = 0.25;
const CWI_BOX_VERTICAL_PADDING_EM = 0.42;
const CWI_BOX_HORIZONTAL_PADDING_EM = 60 / 27;
const AE_NON_DIALOGUE_COLOR = "#5E82ED";
const AUDIO_WAVEFORM = [
  0.003, 0.003, 0.005, 0.003, 0.003, 0.003, 0.003, 0.003, 0.005, 0.003, 0.011, 0.174, 0.17, 0.22, 0.092, 0.04, 0.171, 0.129, 0.036, 0.013, 0.228, 0.194, 0.116, 0.028,
  0.169, 0.249, 0.173, 0.14, 0.178, 0.116, 0.14, 0.294, 0.364, 0.284, 0.253, 0.101, 0.268, 0.422, 0.46, 0.131, 0.217, 0.197, 0.144, 0.095, 0.039, 0.339, 0.271, 0.047,
  0.016, 0.005, 0.004, 0.003, 0.005, 0.02, 0.003, 0.003, 0.003, 0.006, 0.004, 0.015, 0.007, 0.008, 0.009, 0.009, 0.009, 0.006, 0.005, 0.003, 0.003, 0.004, 0.03, 0.025,
  0.03, 0.054, 0.051, 0.025, 0.087, 0.094, 0.037, 0.017, 0.029, 0.023, 0.028, 0.025, 0.019, 0.018, 0.022, 0.023, 0.033, 0.085, 0.102, 0.059, 0.099, 0.157, 0.073, 0.198,
  0.113, 0.044, 0.012, 0.011, 0.009, 0.011, 0.036, 0.017, 0.013, 0.011, 0.023, 0.02, 0.06, 0.347, 0.181, 0.092, 0.047, 0.111, 0.087, 0.085, 0.055, 0.017, 0.102, 0.162,
  0.05, 0.123, 0.226, 0.263, 0.177, 0.053, 0.17, 0.024, 0.026, 0.015, 0.007, 0.006, 0.004, 0.005, 0.069, 0.113, 0.022, 0.056, 0.205, 0.186, 0.103, 0.143, 0.156, 0.034,
  0.038, 0.027, 0.197, 0.087, 0.013, 0.009, 0.007, 0.007, 0.009, 0.007, 0.008, 0.011, 0.024, 0.224, 0.299, 0.145, 0.038, 0.226, 0.105, 0.089, 0.19, 0.186, 0.267, 0.241,
  0.245, 0.152, 0.059, 0.179, 0.136, 0.116, 0.18, 0.084, 0.017, 0.006, 0.004, 0.004, 0.005, 0.005, 0.004, 0.004, 0.004, 0.027, 0.013, 0.022, 0.024, 0.035, 0.057, 0.139,
  0.044, 0.149, 0.105, 0.119, 0.126, 0.188, 0.249, 0.176, 0.107, 0.131, 0.148, 0.198, 0.084, 0.096, 0.057, 0.046, 0.06, 0.08, 0.126, 0.026, 0.004, 0.003, 0.003, 0.005,
  0.007, 0.005, 0.005, 0.006, 0.013, 0.027, 0.026, 0.107, 0.127, 0.235, 0.199, 0.097, 0.043, 0.027, 0.039, 0.014, 0.006, 0.01, 0.008, 0.006, 0.006, 0.004, 0.014, 0.009,
  0.005, 0.004, 0.089, 0.069, 0.061, 0.039, 0.039, 0.108, 0.034, 0.027, 0.025, 0.217, 0.311, 0.151, 0.065, 0.02, 0.012, 0.009, 0.029, 0.01, 0.01, 0.009, 0.011, 0.01,
  0.01, 0.012, 0.012, 0.013, 0.114, 0.061, 0.113, 0.046, 0.016, 0.007, 0.006, 0.009, 0.007, 0.006, 0.055, 0.01, 0.01, 0.009, 0.006, 0.005, 0.005, 0.005, 0.005, 0.004,
  0.003, 0.003, 0.004, 0.004, 0.004, 0.004, 0.003, 0.004, 0.004, 0.004, 0.004, 0.003, 0.013, 0.012, 0.006, 0.006, 0.025, 0.216, 0.184, 0.065, 0.313, 0.108, 0.096, 0.056,
  0.06, 0.028, 0.038, 0.052, 0.061, 0.053, 0.088, 0.301, 0.152, 0.033, 0.054, 0.392, 0.364, 0.247, 0.127, 0.044, 0.021, 0.01, 0.008, 0.008, 0.009, 0.008, 0.01, 0.009,
  0.01, 0.009, 0.027, 0.02, 0.024, 0.022, 0.021, 0.021, 0.017, 0.012, 0.01, 0.012, 0.011, 0.011, 0.011, 0.011, 0.011, 0.011, 0.011, 0.01, 0.01, 0.017, 0.029, 0.295
];

 function createSampleProject() {
  return {
    project: {
      id: "cwi-bttf-diner-template",
      title: "BTTF_Diner_CWI_Template",
      aspectRatio: "16:9",
      mediaName: "Cena_ref_CI_Template_v02a.mp4",
      duration: 34.54
    },
    speakers: [
      { id: "speaker-marty", name: "Marty", role: "main", color: "#E5E517", defaultOffCamera: false },
      { id: "speaker-biff", name: "Biff", role: "main", color: "#E51717", defaultOffCamera: false },
      { id: "speaker-lou", name: "Lou", role: "supporting", color: "#5E82ED", defaultOffCamera: false }
    ],
    cues: [
      {
        id: "cue-riverside-drive",
        type: "dialogue",
        speakerId: "speaker-marty",
        start: 0.72,
        end: 3.08,
        text: "You know where 1640 Riverside Drive is?",
        lineBreakAfterWordIds: [],
        exception: false,
        offCamera: false,
        words: [
          { id: "word-you-know", text: "You", start: 1.02, end: 1.16, volumePercent: 50, pitchWeight: 500, pitchWidth: 96, motion: "pop" },
          { id: "word-know", text: "know", start: 1.18, end: 1.34, volumePercent: 48, pitchWeight: 490, pitchWidth: 96, motion: "pop" },
          { id: "word-where", text: "where", start: 1.36, end: 1.58, volumePercent: 50, pitchWeight: 500, pitchWidth: 96, motion: "pop" },
          { id: "word-1640", text: "1640", start: 1.62, end: 2.12, volumePercent: 52, pitchWeight: 520, pitchWidth: 98, motion: "pop" },
          { id: "word-riverside", text: "Riverside", start: 2.16, end: 2.56, volumePercent: 52, pitchWeight: 520, pitchWidth: 98, motion: "pop" },
          { id: "word-drive", text: "Drive", start: 2.58, end: 2.78, volumePercent: 50, pitchWeight: 500, pitchWidth: 96, motion: "pop" },
          { id: "word-is", text: "is?", start: 2.8, end: 3.0, volumePercent: 48, pitchWeight: 490, pitchWidth: 94, motion: "pop" }
        ]
      },
      {
        id: "cue-order-something",
        type: "dialogue",
        speakerId: "speaker-lou",
        start: 3.16,
        end: 5.42,
        text: "Are you gonna order something, kid?",
        lineBreakAfterWordIds: [],
        exception: false,
        offCamera: false,
        words: [
          { id: "word-are", text: "Are", start: 3.34, end: 3.48, volumePercent: 56, pitchWeight: 600, pitchWidth: 100, motion: "pop" },
          { id: "word-you-order", text: "you", start: 3.5, end: 3.66, volumePercent: 56, pitchWeight: 600, pitchWidth: 100, motion: "pop" },
          { id: "word-gonna-order", text: "gonna", start: 3.68, end: 3.94, volumePercent: 58, pitchWeight: 620, pitchWidth: 100, motion: "pop" },
          { id: "word-order", text: "order", start: 3.96, end: 4.22, volumePercent: 60, pitchWeight: 640, pitchWidth: 102, motion: "pop" },
          { id: "word-something-order", text: "something,", start: 4.24, end: 4.72, volumePercent: 64, pitchWeight: 680, pitchWidth: 104, motion: "pop" },
          { id: "word-kid", text: "kid?", start: 4.74, end: 5.08, volumePercent: 66, pitchWeight: 700, pitchWidth: 106, motion: "pop" }
        ]
      },
      {
        id: "cue-give-tab",
        type: "dialogue",
        speakerId: "speaker-marty",
        start: 7.1,
        end: 9.18,
        text: "Yeah, give me a Tab.",
        lineBreakAfterWordIds: [],
        exception: false,
        offCamera: false,
        words: [
          { id: "word-yeah", text: "Yeah,", start: 7.14, end: 7.4, volumePercent: 48, pitchWeight: 480, pitchWidth: 94, motion: "pop" },
          { id: "word-give-tab", text: "give", start: 8.38, end: 8.5, volumePercent: 50, pitchWeight: 500, pitchWidth: 94, motion: "pop" },
          { id: "word-me-tab", text: "me", start: 8.5, end: 8.9, volumePercent: 48, pitchWeight: 480, pitchWidth: 94, motion: "pop" },
          { id: "word-a-tab", text: "a", start: 8.9, end: 8.94, volumePercent: 46, pitchWeight: 460, pitchWidth: 92, motion: "pop" },
          { id: "word-tab", text: "Tab.", start: 8.94, end: 9.16, volumePercent: 54, pitchWeight: 540, pitchWidth: 98, motion: "pop" }
        ]
      },
      {
        id: "cue-cant-tab",
        type: "dialogue",
        speakerId: "speaker-lou",
        start: 9.2,
        end: 13.84,
        text: "Tab? I can't give you a tab unless you order something.",
        lineBreakAfterWordIds: [],
        exception: false,
        offCamera: false,
        words: [
          { id: "word-tab-question", text: "Tab?", start: 9.2, end: 9.32, volumePercent: 68, pitchWeight: 720, pitchWidth: 106, motion: "pop" },
          { id: "word-i-cant", text: "I", start: 10.34, end: 10.43, volumePercent: 56, pitchWeight: 600, pitchWidth: 100, motion: "pop" },
          { id: "word-cant", text: "can't", start: 10.43, end: 10.62, volumePercent: 62, pitchWeight: 660, pitchWidth: 104, motion: "pop" },
          { id: "word-give-cant", text: "give", start: 10.62, end: 10.76, volumePercent: 58, pitchWeight: 620, pitchWidth: 100, motion: "pop" },
          { id: "word-you-cant", text: "you", start: 10.82, end: 10.97, volumePercent: 58, pitchWeight: 620, pitchWidth: 100, motion: "pop" },
          { id: "word-a-cant", text: "a", start: 11.03, end: 11.08, volumePercent: 54, pitchWeight: 560, pitchWidth: 98, motion: "pop" },
          { id: "word-tab-cant", text: "tab", start: 11.13, end: 11.22, volumePercent: 62, pitchWeight: 660, pitchWidth: 104, motion: "pop" },
          { id: "word-unless", text: "unless", start: 11.3, end: 11.73, volumePercent: 58, pitchWeight: 620, pitchWidth: 100, motion: "pop" },
          { id: "word-you-order-2", text: "you", start: 11.76, end: 11.9, volumePercent: 56, pitchWeight: 600, pitchWidth: 100, motion: "pop" },
          { id: "word-order-2", text: "order", start: 11.92, end: 12.32, volumePercent: 60, pitchWeight: 640, pitchWidth: 102, motion: "pop" },
          { id: "word-something-cant", text: "something.", start: 12.38, end: 13.5, volumePercent: 62, pitchWeight: 660, pitchWidth: 104, motion: "pop" }
        ]
      },
      {
        id: "cue-pepsi-free",
        type: "dialogue",
        speakerId: "speaker-marty",
        start: 13.84,
        end: 14.82,
        text: "Right, give me a Pepsi Free.",
        lineBreakAfterWordIds: [],
        exception: false,
        offCamera: false,
        words: [
          { id: "word-right", text: "Right,", start: 13.88, end: 14.08, volumePercent: 48, pitchWeight: 480, pitchWidth: 94, motion: "pop" },
          { id: "word-give-free", text: "give", start: 14.1, end: 14.24, volumePercent: 48, pitchWeight: 480, pitchWidth: 94, motion: "pop" },
          { id: "word-me-free", text: "me", start: 14.26, end: 14.38, volumePercent: 46, pitchWeight: 460, pitchWidth: 92, motion: "pop" },
          { id: "word-a-free", text: "a", start: 14.4, end: 14.5, volumePercent: 46, pitchWeight: 460, pitchWidth: 92, motion: "pop" },
          { id: "word-pepsi-free", text: "Pepsi", start: 14.52, end: 14.68, volumePercent: 52, pitchWeight: 520, pitchWidth: 96, motion: "pop" },
          { id: "word-free", text: "Free.", start: 14.7, end: 14.8, volumePercent: 52, pitchWeight: 520, pitchWidth: 96, motion: "pop" }
        ]
      },
      {
        id: "cue-pepsi-pay",
        type: "dialogue",
        speakerId: "speaker-lou",
        start: 14.82,
        end: 17.22,
        text: "You want a Pepsi, pal? You're gonna pay for it.",
        lineBreakAfterWordIds: [],
        exception: false,
        offCamera: false,
        words: [
          { id: "word-you", text: "You", start: 14.88, end: 15.02, volumePercent: 58, pitchWeight: 590, pitchWidth: 98, motion: "pop" },
          { id: "word-want", text: "want", start: 15.04, end: 15.24, volumePercent: 58, pitchWeight: 590, pitchWidth: 98, motion: "pop" },
          { id: "word-a", text: "a", start: 15.26, end: 15.34, volumePercent: 56, pitchWeight: 570, pitchWidth: 98, motion: "pop" },
          { id: "word-pepsi", text: "Pepsi,", start: 15.36, end: 15.66, volumePercent: 62, pitchWeight: 640, pitchWidth: 102, motion: "pop" },
          { id: "word-pal", text: "pal?", start: 15.68, end: 15.9, volumePercent: 60, pitchWeight: 620, pitchWidth: 100, motion: "pop" },
          { id: "word-youre", text: "You're", start: 16.0, end: 16.24, volumePercent: 66, pitchWeight: 700, pitchWidth: 104, motion: "pop" },
          { id: "word-gonna", text: "gonna", start: 16.26, end: 16.5, volumePercent: 66, pitchWeight: 700, pitchWidth: 104, motion: "pop" },
          { id: "word-pay", text: "pay", start: 16.52, end: 16.74, volumePercent: 72, pitchWeight: 820, pitchWidth: 110, motion: "pop" },
          { id: "word-for", text: "for", start: 16.76, end: 16.9, volumePercent: 64, pitchWeight: 680, pitchWidth: 102, motion: "pop" },
          { id: "word-it-2", text: "it.", start: 16.92, end: 17.08, volumePercent: 64, pitchWeight: 680, pitchWidth: 102, motion: "pop" }
        ]
      },
      {
        id: "cue-no-sugar-okay",
        type: "dialogue",
        speakerId: "speaker-marty",
        start: 17.22,
        end: 20.3,
        text: "Look, just give me something without any sugar in it, okay?",
        lineBreakAfterWordIds: [],
        exception: false,
        offCamera: false,
        words: [
          { id: "word-look", text: "Look,", start: 17.22, end: 17.34, volumePercent: 50, pitchWeight: 500, pitchWidth: 94, motion: "pop" },
          { id: "word-just", text: "just", start: 17.34, end: 17.5, volumePercent: 50, pitchWeight: 500, pitchWidth: 94, motion: "pop" },
          { id: "word-give", text: "give", start: 17.52, end: 17.68, volumePercent: 52, pitchWeight: 510, pitchWidth: 96, motion: "pop" },
          { id: "word-me", text: "me", start: 17.7, end: 17.84, volumePercent: 50, pitchWeight: 500, pitchWidth: 94, motion: "pop" },
          { id: "word-something-2", text: "something", start: 17.86, end: 18.38, volumePercent: 54, pitchWeight: 520, pitchWidth: 96, motion: "pop" },
          { id: "word-without-2", text: "without", start: 18.72, end: 18.98, volumePercent: 46, pitchWeight: 470, pitchWidth: 92, motion: "pop" },
          { id: "word-any", text: "any", start: 19.0, end: 19.16, volumePercent: 48, pitchWeight: 480, pitchWidth: 92, motion: "pop" },
          { id: "word-sugar-2", text: "sugar", start: 19.18, end: 19.5, volumePercent: 46, pitchWeight: 460, pitchWidth: 90, motion: "pop" },
          { id: "word-in", text: "in", start: 19.52, end: 19.64, volumePercent: 46, pitchWeight: 450, pitchWidth: 90, motion: "pop" },
          { id: "word-it", text: "it,", start: 19.66, end: 19.82, volumePercent: 48, pitchWeight: 460, pitchWidth: 90, motion: "pop" },
          { id: "word-okay", text: "okay?", start: 19.84, end: 20.22, volumePercent: 62, pitchWeight: 620, pitchWidth: 102, motion: "pop" }
        ]
      },
      {
        id: "cue-something-without",
        type: "dialogue",
        speakerId: "speaker-lou",
        start: 23.88,
        end: 26.08,
        text: "Something without sugar.",
        lineBreakAfterWordIds: [],
        exception: false,
        offCamera: false,
        words: [
          { id: "word-something-lou", text: "Something", start: 24.76, end: 25.16, volumePercent: 56, pitchWeight: 600, pitchWidth: 100, motion: "pop" },
          { id: "word-without-lou", text: "without", start: 25.18, end: 25.52, volumePercent: 54, pitchWeight: 580, pitchWidth: 98, motion: "pop" },
          { id: "word-sugar-lou", text: "sugar.", start: 25.54, end: 25.9, volumePercent: 58, pitchWeight: 620, pitchWidth: 100, motion: "pop" }
        ]
      },
      {
        id: "cue-hey-mcfly",
        type: "dialogue",
        speakerId: "speaker-biff",
        start: 29.88,
        end: 31.44,
        text: "Hey, McFly.",
        lineBreakAfterWordIds: [],
        exception: false,
        offCamera: false,
        words: [
          { id: "word-hey", text: "Hey,", start: 30.0, end: 30.24, volumePercent: 70, pitchWeight: 760, pitchWidth: 108, motion: "pop" },
          { id: "word-mcfly", text: "McFly.", start: 30.26, end: 30.82, volumePercent: 78, pitchWeight: 860, pitchWidth: 114, motion: "pop" }
        ]
      },
      {
        id: "cue-cup-clatters",
        type: "sound",
        speakerId: "",
        start: 31.44,
        end: 32.12,
        text: "cup clatters",
        lineBreakAfterWordIds: [],
        exception: false,
        offCamera: false,
        words: [
          { id: "word-cup-clatters", text: "cup clatters", start: 31.5, end: 31.94, volumePercent: 76, pitchWeight: 560, pitchWidth: 100, motion: "pop" }
        ]
      },
      {
        id: "cue-pepsi-can-cracks",
        type: "sound",
        speakerId: "",
        start: 32.12,
        end: 33.18,
        text: "pepsi can cracks open",
        lineBreakAfterWordIds: [],
        exception: false,
        offCamera: false,
        words: [
          { id: "word-pepsi-can-cracks", text: "pepsi can cracks open", start: 32.18, end: 33.0, volumePercent: 55, pitchWeight: 400, pitchWidth: 100, motion: "none" }
        ]
      },
      {
        id: "cue-door-crack",
        type: "sound",
        speakerId: "",
        start: 33.18,
        end: 34.3,
        text: "door crack",
        lineBreakAfterWordIds: [],
        exception: false,
        offCamera: false,
        words: [
          { id: "word-door-crack", text: "door crack", start: 33.24, end: 33.94, volumePercent: 55, pitchWeight: 400, pitchWidth: 100, motion: "none" }
        ]
      }
    ],
    review: {
      notes: ["Mock transcript preserves the full sample dialogue while using AE-style rendered caption behavior.", "Standard closed captions remain a required companion deliverable."],
      validationStatus: "unchecked"
    }
  };
}
