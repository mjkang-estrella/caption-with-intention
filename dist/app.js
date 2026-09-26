const DEFAULT_MEDIA_SRC = "reference/AE PROJECT/(Footage)/ASETS/Video/Cena_ref_CI_Template_v02a.mp4";
const CUE_TYPES = ["dialogue", "sound", "music"];
const SPEAKER_ROLES = ["main", "supporting", "minor"];
const PX_PER_SECOND = 110;
const INSPECTOR_COLUMN_MIN = 300;
const INSPECTOR_COLUMN_DEFAULT = 360;
const INSPECTOR_STACK_MIN = 220;
const CENTER_STAGE_MIN = 360;
const MAX_ANALYSIS_BYTES = 120 * 1024 * 1024;
const WAVEFORM_BARS_PER_SECOND = 10;
const MIN_SPEAKER_HUE_DISTANCE = 30;
const NEUTRAL_VOLUME_TOLERANCE = 5;
const MAX_SIZED_WORD_SHARE = 0.5;
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
function normalizeTranscriptReferenceText(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");
}
function createSampleProject() {
    return {
        schemaVersion: CWI_SCHEMA_VERSION,
        project: {
            id: "cwi-bttf-diner-template",
            title: "BTTF_Diner_CWI_Template",
            aspectRatio: "16:9",
            mediaName: "Cena_ref_CI_Template_v02a.mp4",
            duration: 34.54,
            frameRate: 30
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
                exception: { color: false, motion: false, intonation: false },
                offCamera: false,
                words: [
                    { id: "word-you-know", text: "You", start: 1.02, end: 1.16, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-know", text: "know", start: 1.18, end: 1.34, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-where", text: "where", start: 1.36, end: 1.58, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-1640", text: "1640", start: 1.62, end: 2.12, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-riverside", text: "Riverside", start: 2.16, end: 2.56, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-drive", text: "Drive", start: 2.58, end: 2.78, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-is", text: "is?", start: 2.8, end: 3.0, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" }
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
                exception: { color: false, motion: false, intonation: false },
                offCamera: false,
                words: [
                    { id: "word-are", text: "Are", start: 3.34, end: 3.48, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-you-order", text: "you", start: 3.5, end: 3.66, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-gonna-order", text: "gonna", start: 3.68, end: 3.94, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-order", text: "order", start: 3.96, end: 4.22, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-something-order", text: "something,", start: 4.24, end: 4.72, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-kid", text: "kid?", start: 4.74, end: 5.08, volumePercent: 56, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" }
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
                exception: { color: false, motion: false, intonation: false },
                offCamera: false,
                words: [
                    { id: "word-yeah", text: "Yeah,", start: 7.14, end: 7.4, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-give-tab", text: "give", start: 8.38, end: 8.5, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-me-tab", text: "me", start: 8.5, end: 8.9, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-a-tab", text: "a", start: 8.9, end: 8.94, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-tab", text: "Tab.", start: 8.94, end: 9.16, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" }
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
                exception: { color: false, motion: false, intonation: false },
                offCamera: false,
                words: [
                    { id: "word-tab-question", text: "Tab?", start: 9.2, end: 9.32, volumePercent: 68, pitchWeight: 720, pitchWidth: 106, motion: "pop", timing: "aligned" },
                    { id: "word-i-cant", text: "I", start: 10.34, end: 10.43, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-cant", text: "can't", start: 10.43, end: 10.62, volumePercent: 56, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-give-cant", text: "give", start: 10.62, end: 10.76, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-you-cant", text: "you", start: 10.82, end: 10.97, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-a-cant", text: "a", start: 11.03, end: 11.08, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-tab-cant", text: "tab", start: 11.13, end: 11.22, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-unless", text: "unless", start: 11.3, end: 11.73, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-you-order-2", text: "you", start: 11.76, end: 11.9, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-order-2", text: "order", start: 11.92, end: 12.32, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-something-cant", text: "something.", start: 12.38, end: 13.5, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" }
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
                exception: { color: false, motion: false, intonation: false },
                offCamera: false,
                words: [
                    { id: "word-right", text: "Right,", start: 13.88, end: 14.08, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-give-free", text: "give", start: 14.1, end: 14.24, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-me-free", text: "me", start: 14.26, end: 14.38, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-a-free", text: "a", start: 14.4, end: 14.5, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-pepsi-free", text: "Pepsi", start: 14.52, end: 14.68, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-free", text: "Free.", start: 14.7, end: 14.8, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" }
                ]
            },
            {
                id: "cue-pepsi-pay",
                type: "dialogue",
                speakerId: "speaker-lou",
                start: 14.87,
                end: 17.1,
                text: "You want a Pepsi, pal? You're gonna pay for it.",
                lineBreakAfterWordIds: [],
                exception: { color: false, motion: false, intonation: false },
                offCamera: false,
                words: [
                    { id: "word-you", text: "You", start: 14.99, end: 15.19, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-want", text: "want", start: 15.19, end: 15.39, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-a", text: "a", start: 15.39, end: 15.59, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-pepsi", text: "Pepsi,", start: 15.59, end: 15.8, volumePercent: 56, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-pal", text: "pal?", start: 15.8, end: 16, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-youre", text: "You're", start: 16, end: 16.2, volumePercent: 58, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-gonna", text: "gonna", start: 16.2, end: 16.4, volumePercent: 58, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-pay", text: "pay", start: 16.4, end: 16.6, volumePercent: 72, pitchWeight: 820, pitchWidth: 110, motion: "pop", timing: "aligned" },
                    { id: "word-for", text: "for", start: 16.6, end: 16.8, volumePercent: 58, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-it-2", text: "it.", start: 16.8, end: 17, volumePercent: 58, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" }
                ]
            },
            {
                id: "cue-no-sugar-okay",
                type: "dialogue",
                speakerId: "speaker-marty",
                start: 17.73,
                end: 20.3,
                text: "Look, just give me something without any sugar in it, okay?",
                lineBreakAfterWordIds: [],
                exception: { color: false, motion: false, intonation: false },
                offCamera: false,
                words: [
                    { id: "word-look", text: "Look,", start: 17.76, end: 17.96, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-just", text: "just", start: 17.96, end: 18.16, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-give", text: "give", start: 18.16, end: 18.36, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-me", text: "me", start: 18.36, end: 18.56, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-something-2", text: "something", start: 18.56, end: 18.76, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-without-2", text: "without", start: 18.76, end: 18.96, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-any", text: "any", start: 18.96, end: 19.16, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-sugar-2", text: "sugar", start: 19.16, end: 19.36, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-in", text: "in", start: 19.36, end: 19.57, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-it", text: "it,", start: 19.57, end: 19.77, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-okay", text: "okay?", start: 19.77, end: 19.97, volumePercent: 56, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" }
                ]
            },
            {
                id: "cue-something-without",
                type: "dialogue",
                speakerId: "speaker-lou",
                start: 20.9,
                end: 22.1,
                text: "Something without sugar.",
                lineBreakAfterWordIds: [],
                exception: { color: false, motion: false, intonation: false },
                offCamera: false,
                words: [
                    { id: "word-something-lou", text: "Something", start: 20.93, end: 21.23, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-without-lou", text: "without", start: 21.23, end: 21.53, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" },
                    { id: "word-sugar-lou", text: "sugar.", start: 21.53, end: 21.83, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" }
                ]
            },
            {
                id: "cue-pepsi-can-cracks",
                type: "sound",
                speakerId: "",
                start: 22.93,
                end: 24.4,
                text: "pepsi can cracks open",
                lineBreakAfterWordIds: [],
                exception: { color: false, motion: false, intonation: false },
                offCamera: false,
                words: [
                    { id: "word-pepsi-can-cracks", text: "pepsi can cracks open", start: 22.96, end: 23.87, volumePercent: 50, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" }
                ]
            },
            {
                id: "cue-cup-clatters",
                type: "sound",
                speakerId: "",
                start: 25.73,
                end: 26.93,
                text: "cup clatters",
                lineBreakAfterWordIds: [],
                exception: { color: false, motion: false, intonation: false },
                offCamera: false,
                words: [
                    { id: "word-cup-clatters", text: "cup clatters", start: 25.76, end: 26.67, volumePercent: 70, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" }
                ]
            },
            {
                id: "cue-door-crack",
                type: "sound",
                speakerId: "",
                start: 29.13,
                end: 30.33,
                text: "door crack",
                lineBreakAfterWordIds: [],
                exception: { color: false, motion: false, intonation: false },
                offCamera: false,
                words: [
                    { id: "word-door-crack", text: "door crack", start: 29.16, end: 30.07, volumePercent: 56, pitchWeight: 400, pitchWidth: 100, motion: "pop", timing: "aligned" }
                ]
            },
            {
                id: "cue-hey-mcfly",
                type: "dialogue",
                speakerId: "speaker-biff",
                start: 30.3,
                end: 31.73,
                text: "Hey, McFly.",
                lineBreakAfterWordIds: [],
                exception: { color: false, motion: false, intonation: false },
                offCamera: false,
                words: [
                    { id: "word-hey", text: "Hey,", start: 30.36, end: 30.81, volumePercent: 70, pitchWeight: 760, pitchWidth: 108, motion: "pop", timing: "aligned" },
                    { id: "word-mcfly", text: "McFly.", start: 30.81, end: 31.27, volumePercent: 78, pitchWeight: 860, pitchWidth: 114, motion: "pop", timing: "aligned" }
                ]
            }
        ],
        review: {
            notes: ["Sample cue timing follows the After Effects template LINE layers (comp time + 14.4 s movie offset).", "Standard closed captions remain a required companion deliverable."],
            validationStatus: "unchecked"
        }
    };
}
// Caption with Intention style tokens, palette, and project schema helpers.
//
// Defaults follow the After Effects template (reference/AE PROJECT/Academy_CI_Template.aep):
// a 1920x1080 @ 30 fps comp, Roboto 27 px with a #DDDDDD fill, a box that is the text bounds
// plus 30 px per side and 20 px top/bottom in 80% black, an "Up" range selector that lifts the
// current word 5 px, and an "Antecipate" selector that dips the next word 2 px. The guideline doc
// and design-system PDF fill in what the template does not define: volume sizing, pitch axes,
// off-camera slant, music treatment, two-line stacking, and the minor-character palette.
// Renderer code should read every caption value from here instead of inlining numbers.
const CWI_SCHEMA_VERSION = 2;
const CWI_ASPECT_RATIOS = ["16:9", "9:16", "1:1"];
const CWI_WORD_MOTIONS = ["pop", "none", "syllable"];
const CWI_WORD_TIMINGS = ["aligned", "estimated", "manual"];
const CWI_NEUTRAL_VOLUME = 50;
const CWI_DEFAULT_FRAME_RATE = 30;
const CWI_STYLE = {
    type: {
        // AE: 27 px on a 1080 px comp. The doc's "5% of screen height" measures the box band
        // (PDF p35-37), which a 2.5% font plus the AE padding reproduces.
        baseSizeRatio: 27 / 1080,
        // Doc volume range 3% / 5% / 12%, expressed relative to normal speech.
        minVolumeScale: 3 / 5,
        maxVolumeScale: 12 / 5,
        minFontPx: 6,
        // Roboto Flex vertical metrics (hhea and OS/2 typo, 2048 units per em).
        ascentEm: 1900 / 2048,
        descentEm: 500 / 2048,
        readAheadColor: "#DDDDDD",
        exceptionSpokenColor: "#FFFFFF",
        defaultWeight: 400,
        defaultWidth: 100,
        // PDF p23: off-camera italics are Roboto Flex's full slant.
        offCameraSlant: -10
    },
    tone: {
        minWeight: 100,
        maxWeight: 1000,
        minWidth: 25,
        maxWidth: 151,
        // PDF p41 only allows the heavy+wide to light+condensed diagonal of the weight x width grid.
        bandTolerance: 0.3
    },
    motion: {
        liftEm: 5 / 27,
        anticipationDipEm: 2 / 27,
        anticipationSeconds: 4 / 30,
        // One AE word slot on the sample footage: 10 words over 60 frames.
        maxRiseSeconds: 0.2,
        settleSeconds: 0.2,
        // AE has no scale animator; the doc's 15% pop is available by setting 1.15.
        popScale: 1,
        // AE ease() between the START and END markers, used when words have no aligned timing.
        estimatedEase: [0.33, 0, 0.667, 1],
        estimatedEndInsetSeconds: 0.25
    },
    box: {
        fill: "rgba(0, 0, 0, 0.8)",
        padXEm: 30 / 27,
        padYEm: 20 / 27
    },
    stack: {
        maxLines: 2,
        // PDF p45: separate line boxes 2.5% of screen height apart inside the lower 20%.
        lineGapRatio: 0.025,
        workAreaRatio: 0.2
    },
    layout: {
        // AE guide layer: max line width x 423-1497 on 1920; box bottom about 65 px above the frame edge.
        "16:9": { maxLineWidthRatio: 1074 / 1920, bottomMarginRatio: 65 / 1080 },
        // Provisional: the template and PDF only define widescreen formats.
        "9:16": { maxLineWidthRatio: 0.8, bottomMarginRatio: 65 / 1080 },
        "1:1": { maxLineWidthRatio: 0.76, bottomMarginRatio: 65 / 1080 }
    },
    // Doc 7.1: sound effects stay white but grow and pop in sync with the sound, as one unit.
    // (The AE sound-effect lines are static; set syncToSound to false for that look.)
    sound: { syncToSound: true },
    music: { glyph: "♫", animate: false }
};
// Local audio analysis that seeds word volume. Speech within the dead zone of the median level
// stays at the normal size; the full-scale offset reaches the whisper or shout limit.
const CWI_ANALYSIS = {
    silenceDb: -60,
    volumeDeadZoneDb: 3,
    volumeFullScaleDb: 12
};
// Main colors in the design-system slot order (PDF p16). Template colors are the eight
// swatches in the AE guide layer.
const CWI_MAIN_COLORS = [
    { label: "CI Main Yellow", color: "#E5E517", template: true },
    { label: "CI Main Green", color: "#17E517", template: true },
    { label: "CI Main Blue", color: "#17E5E5", template: true },
    { label: "CI Main Pink", color: "#E517E5", template: false },
    { label: "CI Main Red", color: "#E51717", template: true },
    { label: "CI Main Orange", color: "#E58017", template: false }
];
const CWI_SUPPORTING_COLORS = [
    { label: "CI Support Orange", color: "#E85C2E", template: true },
    { label: "CI Support Yellow", color: "#EBC247", template: true },
    { label: "CI Support Green I", color: "#C2EB47", template: false },
    { label: "CI Support Green II", color: "#82ED5E", template: false },
    { label: "CI Support Green III", color: "#47EB70", template: false },
    { label: "CI Support Cyan", color: "#5EEDC9", template: false },
    { label: "CI Support Blue I", color: "#47C2EB", template: true },
    { label: "CI Support Blue II", color: "#5E82ED", template: true },
    { label: "CI Support Purple I", color: "#8C6BED", template: false },
    { label: "CI Support Purple II", color: "#CC6BED", template: false },
    { label: "CI Support Pink I", color: "#EB47C2", template: false },
    { label: "CI Support Pink II", color: "#ED5E82", template: false }
];
// Minor characters: pastel hues at 30% saturation and 90% brightness (PDF p22).
const CWI_MINOR_HUES = [0, 342, 327, 313, 298, 282, 267, 251, 240, 222, 207, 193, 178, 162, 149, 133, 120, 102, 87, 73, 58, 40, 24, 7];
const SPEAKER_PALETTE = [
    ...CWI_MAIN_COLORS.map((entry) => ({ role: "main", ...entry })),
    ...CWI_SUPPORTING_COLORS.map((entry) => ({ role: "supporting", ...entry })),
    ...CWI_MINOR_HUES.map((hue) => ({ role: "minor", label: `Minor Pastel ${hue}°`, color: cwiHsbToHex(hue, 0.3, 0.9), template: false }))
];
function cwiHsbToHex(hue, saturation, brightness) {
    const h = ((Number(hue) % 360) + 360) % 360 / 60;
    const chroma = brightness * saturation;
    const x = chroma * (1 - Math.abs((h % 2) - 1));
    const [r, g, b] = h < 1 ? [chroma, x, 0]
        : h < 2 ? [x, chroma, 0]
            : h < 3 ? [0, chroma, x]
                : h < 4 ? [0, x, chroma]
                    : h < 5 ? [x, 0, chroma]
                        : [chroma, 0, x];
    const m = brightness - chroma;
    return `#${[r, g, b].map((channel) => Math.round((channel + m) * 255).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}
function cwiHexToRgb(hex) {
    const value = String(hex || "").trim().replace(/^#/, "");
    const full = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
    if (!/^[0-9a-f]{6}$/i.test(full))
        return null;
    return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16));
}
function cwiMixColor(from, to, amount) {
    const a = cwiHexToRgb(from);
    const b = cwiHexToRgb(to);
    if (!a || !b)
        return amount >= 0.5 ? to : from;
    const t = cwiClamp(amount, 0, 1);
    const mixed = a.map((channel, index) => Math.round(channel + (b[index] - channel) * t));
    return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
}
function cwiHueOf(hex) {
    const rgb = cwiHexToRgb(hex);
    if (!rgb)
        return NaN;
    const [r, g, b] = rgb.map((channel) => channel / 255);
    const max = Math.max(r, g, b);
    const delta = max - Math.min(r, g, b);
    if (delta === 0)
        return NaN;
    const hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    return (hue * 60 + 360) % 360;
}
function cwiHueDistance(a, b) {
    const hueA = cwiHueOf(a);
    const hueB = cwiHueOf(b);
    if (!Number.isFinite(hueA) || !Number.isFinite(hueB))
        return 180;
    const distance = Math.abs(hueA - hueB) % 360;
    return Math.min(distance, 360 - distance);
}
function cwiClamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function cwiNumber(value, fallback) {
    if (value === null || value === undefined || value === "")
        return fallback;
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}
// Volume 0-100 maps to a type-size multiplier: 0 = whisper (3%), 50 = normal (5%), 100 = shout (12%).
function cwiVolumeScale(volumePercent) {
    const volume = cwiClamp(cwiNumber(volumePercent, CWI_NEUTRAL_VOLUME), 0, 100);
    const { minVolumeScale, maxVolumeScale } = CWI_STYLE.type;
    if (volume <= CWI_NEUTRAL_VOLUME)
        return minVolumeScale + (volume / CWI_NEUTRAL_VOLUME) * (1 - minVolumeScale);
    return 1 + ((volume - CWI_NEUTRAL_VOLUME) / (100 - CWI_NEUTRAL_VOLUME)) * (maxVolumeScale - 1);
}
// Equivalent share of screen height for the doc's 3% / 5% / 12% vocabulary.
function cwiVolumeScreenPercent(volumePercent) {
    return cwiVolumeScale(volumePercent) * 5;
}
// Tone slider -1..1 walks the valid diagonal: -1 light+condensed (high, sharp voice),
// 0 Regular 400/100, 1 heavy+wide (deep, full voice).
function cwiToneFromSlider(tone) {
    const value = cwiClamp(cwiNumber(tone, 0), -1, 1);
    const { defaultWeight, defaultWidth } = CWI_STYLE.type;
    const { minWeight, maxWeight, minWidth } = CWI_STYLE.tone;
    if (value >= 0) {
        return { weight: Math.round(defaultWeight + value * (maxWeight - defaultWeight)), width: Math.round(defaultWidth + value * 50) };
    }
    return { weight: Math.round(defaultWeight + value * (defaultWeight - minWeight)), width: Math.round(defaultWidth + value * (defaultWidth - minWidth)) };
}
function cwiSliderFromTone(weight) {
    const value = cwiNumber(weight, CWI_STYLE.type.defaultWeight);
    const { defaultWeight } = CWI_STYLE.type;
    const { minWeight, maxWeight } = CWI_STYLE.tone;
    if (value >= defaultWeight)
        return cwiClamp((value - defaultWeight) / (maxWeight - defaultWeight), 0, 1);
    return cwiClamp((value - defaultWeight) / (defaultWeight - minWeight), -1, 0);
}
// PDF p40 maps 80 Hz to wght 1000 / wdth 150 and 250 Hz to wght 100 / wdth 25; p39 keeps the
// typical 160-200 Hz voice at Regular 400 / 100. Interpolate between those anchors.
function cwiToneForPitchHz(hz) {
    const value = cwiClamp(cwiNumber(hz, 180), 80, 250);
    const lerp = (a, b, t) => Math.round(a + (b - a) * t);
    if (value < 160) {
        const t = (value - 80) / 80;
        return { weight: lerp(1000, 400, t), width: lerp(150, 100, t) };
    }
    if (value <= 200)
        return { weight: 400, width: 100 };
    const t = (value - 200) / 50;
    return { weight: lerp(400, 100, t), width: lerp(100, 25, t) };
}
function cwiToneBandOffset(weight, width) {
    const { minWeight, maxWeight, minWidth, maxWidth } = CWI_STYLE.tone;
    const w = (cwiNumber(weight, CWI_STYLE.type.defaultWeight) - minWeight) / (maxWeight - minWeight);
    const d = (cwiNumber(width, CWI_STYLE.type.defaultWidth) - minWidth) / (maxWidth - minWidth);
    return w - d;
}
function cwiToneInBand(weight, width) {
    return Math.abs(cwiToneBandOffset(weight, width)) <= CWI_STYLE.tone.bandTolerance;
}
function cwiNearestAspectRatio(width, height) {
    const ratio = Number(width) / Number(height);
    if (!Number.isFinite(ratio) || ratio <= 0)
        return "16:9";
    const candidates = CWI_ASPECT_RATIOS.map((aspect) => {
        const [w, h] = aspect.split(":").map(Number);
        return { aspect, distance: Math.abs(Math.log(ratio / (w / h))) };
    });
    return candidates.sort((a, b) => a.distance - b.distance)[0].aspect;
}
function cwiNormalizeException(value) {
    if (value && typeof value === "object") {
        return { color: Boolean(value.color), motion: Boolean(value.motion), intonation: Boolean(value.intonation) };
    }
    // Schema v1 stored a boolean; the doc's exception keeps sync and motion and drops speaker color.
    return { color: Boolean(value), motion: false, intonation: false };
}
function cwiHasException(cue) {
    const exception = cwiNormalizeException(cue && cue.exception);
    return exception.color || exception.motion || exception.intonation;
}
function cwiNormalizeWord(word, cue, cueId, wordIndex) {
    const start = cwiNumber(word.start, cwiNumber(cue.start, 0));
    const end = cwiNumber(word.end, cwiNumber(cue.end, start + 0.5));
    const units = Array.isArray(word.units)
        ? word.units
            .map((unit) => ({ text: String(unit && unit.text || ""), start: cwiNumber(unit && unit.start, NaN) }))
            .filter((unit) => unit.text)
        : [];
    return {
        id: String(word.id || `${cueId}-word-${wordIndex + 1}`),
        text: String(word.text || ""),
        start: cwiRoundTime(start),
        end: cwiRoundTime(end),
        volumePercent: cwiClamp(cwiNumber(word.volumePercent, CWI_NEUTRAL_VOLUME), 0, 100),
        pitchWeight: cwiClamp(cwiNumber(word.pitchWeight, CWI_STYLE.type.defaultWeight), CWI_STYLE.tone.minWeight, CWI_STYLE.tone.maxWeight),
        pitchWidth: cwiClamp(cwiNumber(word.pitchWidth, CWI_STYLE.type.defaultWidth), CWI_STYLE.tone.minWidth, CWI_STYLE.tone.maxWidth),
        motion: CWI_WORD_MOTIONS.includes(word.motion) ? word.motion : "pop",
        timing: CWI_WORD_TIMINGS.includes(word.timing) ? word.timing : "aligned",
        burst: Boolean(word.burst),
        ...(units.length ? { units } : {})
    };
}
function cwiNormalizeCue(cue, index) {
    const id = String(cue.id || `cue-${index + 1}`);
    const words = Array.isArray(cue.words) ? cue.words.map((word, wordIndex) => cwiNormalizeWord(word || {}, cue, id, wordIndex)) : [];
    const start = cwiNumber(cue.start, words.length ? Math.min(...words.map((word) => word.start)) : 0);
    const end = cwiNumber(cue.end, Math.max(start + 0.5, ...words.map((word) => word.end)));
    return {
        id,
        type: CUE_TYPES.includes(cue.type) ? cue.type : "dialogue",
        speakerId: String(cue.speakerId || ""),
        start: cwiRoundTime(start),
        end: cwiRoundTime(end),
        text: String(cue.text || words.map((word) => word.text).join(" ")),
        lineBreakAfterWordIds: Array.isArray(cue.lineBreakAfterWordIds) ? cue.lineBreakAfterWordIds.map(String) : [],
        exception: cwiNormalizeException(cue.exception),
        offCamera: Boolean(cue.offCamera),
        words
    };
}
// Normalizes any v1 or v2 CWI document into the current schema. `fallback` supplies project
// fields that belong to the local session (media name, duration) when the file omits them.
function cwiNormalizeProject(raw, fallback = {}) {
    if (!raw || typeof raw !== "object")
        throw new Error("JSON must be an object with project, speakers, and cues.");
    if (!raw.project || !Array.isArray(raw.speakers) || !Array.isArray(raw.cues)) {
        throw new Error("JSON must include project, speakers, and cues arrays.");
    }
    return {
        schemaVersion: CWI_SCHEMA_VERSION,
        project: {
            id: String(raw.project.id || "imported-cwi-project"),
            title: String(raw.project.title || "Imported CWI Project"),
            aspectRatio: CWI_ASPECT_RATIOS.includes(raw.project.aspectRatio) ? raw.project.aspectRatio : "16:9",
            mediaName: String(raw.project.mediaName || fallback.mediaName || "Local media"),
            duration: cwiNumber(raw.project.duration, 0) || cwiNumber(fallback.duration, 0),
            frameRate: cwiNumber(raw.project.frameRate, 0) > 0 ? Number(raw.project.frameRate) : CWI_DEFAULT_FRAME_RATE
        },
        speakers: raw.speakers.map((speaker, index) => ({
            id: String(speaker.id || `speaker-${index + 1}`),
            name: String(speaker.name || `Speaker ${index + 1}`),
            role: SPEAKER_ROLES.includes(speaker.role) ? String(speaker.role) : "supporting",
            color: String(speaker.color || SPEAKER_PALETTE[index % SPEAKER_PALETTE.length].color),
            defaultOffCamera: Boolean(speaker.defaultOffCamera)
        })),
        cues: raw.cues.map((cue, index) => cwiNormalizeCue(cue || {}, index)),
        review: {
            notes: raw.review && Array.isArray(raw.review.notes) ? raw.review.notes.map(String) : [],
            validationStatus: raw.review && raw.review.validationStatus ? String(raw.review.validationStatus) : "unchecked"
        }
    };
}
function cwiRoundTime(value) {
    return Math.round(Number(value) * 100) / 100;
}
// Pure Caption with Intention renderer: (project, time, viewport) -> caption frame state.
//
// Nothing here touches the DOM. The editor preview projects the frame state onto persistent
// nodes, the tests assert against it directly, and a burned-in export can draw the same state.
//
// Motion model (AE template): every live cue has a continuous word cursor. Word i starts to
// color and lift when the cursor passes i, is fully colored and at peak lift at i + 1, and
// settles back as the next word rises (the "Up" selector is one word wide). Aligned word
// timing drives the cursor through each word's audible onset; cues without aligned timing use
// the template's own formula, cursor = N * ease(p) + p between the START and END markers.
function cwiLayoutTokens(aspectRatio) {
    return CWI_STYLE.layout[aspectRatio] || CWI_STYLE.layout["16:9"];
}
function cwiBaseFontPx(viewport) {
    return Math.max(CWI_STYLE.type.minFontPx, Number(viewport.height) * CWI_STYLE.type.baseSizeRatio);
}
function cwiSmooth(value) {
    const t = cwiClamp(value, 0, 1);
    return t * t * (3 - 2 * t);
}
function cwiEaseOut(value) {
    const t = cwiClamp(value, 0, 1);
    return 1 - (1 - t) * (1 - t);
}
// CSS-style cubic-bezier timing function solved for x by bisection.
function cwiCubicBezier(progress, curve) {
    const [x1, y1, x2, y2] = curve;
    const t = cwiClamp(progress, 0, 1);
    if (t === 0 || t === 1)
        return t;
    const sample = (a, b, u) => 3 * a * u * (1 - u) * (1 - u) + 3 * b * u * u * (1 - u) + u * u * u;
    let low = 0;
    let high = 1;
    let u = t;
    for (let iteration = 0; iteration < 32; iteration += 1) {
        u = (low + high) / 2;
        if (sample(x1, x2, u) < t)
            low = u;
        else
            high = u;
    }
    return sample(y1, y2, u);
}
function cwiStripDecorators(text) {
    return String(text || "")
        .replace(/^\s*[♪♫]\s*/, "")
        .replace(/\s*[♪♫]\s*$/, "")
        .replace(/^\s*\[/, "")
        .replace(/\]\s*$/, "");
}
function cwiCueDisplayText(cue) {
    if (!cue)
        return "";
    const text = cwiStripDecorators(cue.text);
    if (cue.type === "sound")
        return `[${text}]`;
    if (cue.type === "music")
        return `${CWI_STYLE.music.glyph} [${text}] ${CWI_STYLE.music.glyph}`;
    return String(cue.text || "");
}
// Words as they are drawn: sound and music cues get their brackets and notes attached to the
// first and last word, so the decorators never need to live in the stored transcript.
function cwiCueDisplayWords(cue) {
    const stored = Array.isArray(cue.words) && cue.words.length ? cue.words : cwiFallbackWords(cue);
    if (cue.type === "dialogue")
        return stored.map((word) => ({ word, text: String(word.text || "") }));
    const words = stored
        .map((word) => ({ word, text: cwiStripDecorators(word.text).trim() }))
        .filter((item) => item.text);
    if (!words.length)
        return [];
    const prefix = cue.type === "music" ? `${CWI_STYLE.music.glyph} [` : "[";
    const suffix = cue.type === "music" ? `] ${CWI_STYLE.music.glyph}` : "]";
    words[0] = { ...words[0], text: `${prefix}${words[0].text}` };
    words[words.length - 1] = { ...words[words.length - 1], text: `${words[words.length - 1].text}${suffix}` };
    return words;
}
function cwiFallbackWords(cue) {
    return String(cwiStripDecorators(cue.text) || "").split(/\s+/).filter(Boolean).map((text, index) => ({
        id: `${cue.id}-generated-${index}`,
        text,
        start: cue.start,
        end: cue.end,
        volumePercent: CWI_NEUTRAL_VOLUME,
        pitchWeight: CWI_STYLE.type.defaultWeight,
        pitchWidth: CWI_STYLE.type.defaultWidth,
        motion: "pop",
        timing: "estimated"
    }));
}
// A word rests in plain caption type (base size, Regular 400/100) before and after it is spoken.
// Its intonation (volume size, pitch weight and width) is the peak style it grows into while it
// is spoken, then settles back from, as the doc's pop returns to the original size (4.3).
function cwiWordStyles(cue, word, baseFontPx) {
    const slant = cue.offCamera ? CWI_STYLE.type.offCameraSlant : 0;
    const rest = { fontPx: baseFontPx, weight: CWI_STYLE.type.defaultWeight, width: CWI_STYLE.type.defaultWidth, slant };
    if (cwiNormalizeException(cue.exception).intonation)
        return { rest, peak: rest };
    return {
        rest,
        peak: {
            fontPx: baseFontPx * cwiVolumeScale(word.volumePercent),
            weight: cwiClamp(cwiNumber(word.pitchWeight, CWI_STYLE.type.defaultWeight), CWI_STYLE.tone.minWeight, CWI_STYLE.tone.maxWeight),
            width: cwiClamp(cwiNumber(word.pitchWidth, CWI_STYLE.type.defaultWidth), CWI_STYLE.tone.minWidth, CWI_STYLE.tone.maxWidth),
            slant
        }
    };
}
function cwiLerpStyle(rest, peak, amount) {
    if (amount <= 0)
        return rest;
    if (amount >= 1)
        return peak;
    const lerp = (a, b) => a + (b - a) * amount;
    return { fontPx: lerp(rest.fontPx, peak.fontPx), weight: lerp(rest.weight, peak.weight), width: lerp(rest.width, peak.width), slant: rest.slant };
}
function cwiLayoutSignature(project, cue, viewport) {
    return JSON.stringify([
        viewport.width,
        viewport.height,
        project.project && project.project.aspectRatio,
        cue.type,
        cue.text,
        cue.offCamera,
        cue.exception,
        cue.lineBreakAfterWordIds,
        (cue.words || []).map((word) => [word.id, word.text, word.volumePercent, word.pitchWeight, word.pitchWidth, word.burst, word.motion, word.units])
    ]);
}
// Static geometry for one cue: which words go on which line and the resting box around each line.
// Emphasized words grow and push their neighbors while spoken (cwiComputeFrame), so line breaks
// are chosen at the widest moment: the resting line plus the largest single-word growth. Adjacent
// words hand the emphasis over (their amounts sum to 1), so a line never grows past that.
// `measure(text, fontPx, weight, width, slant)` returns an advance width.
function cwiLayoutCue(project, cue, viewport, measure) {
    const tokens = cwiLayoutTokens(project.project && project.project.aspectRatio);
    const baseFontPx = cwiBaseFontPx(viewport);
    const padX = baseFontPx * CWI_STYLE.box.padXEm;
    const padY = baseFontPx * CWI_STYLE.box.padYEm;
    const maxBoxWidth = viewport.width * tokens.maxLineWidthRatio;
    const measureStyle = (text, style) => measure(text, style.fontPx, style.weight, style.width, style.slant);
    const items = cwiCueDisplayWords(cue).map(({ word, text }, index) => {
        const { rest, peak } = cwiWordStyles(cue, word, baseFontPx);
        const restWidth = measureStyle(text, rest);
        const peakWidth = peak === rest ? restWidth : measureStyle(text, peak);
        const syllables = Array.isArray(word.units) && word.units.length > 1 && word.units.map((unit) => unit.text).join("") === text;
        const units = word.motion === "syllable" && syllables && cue.type === "dialogue"
            ? word.units.map((unit) => ({ text: String(unit.text) }))
            : null;
        return { index, word, text, rest, peak, restWidth, peakWidth, spaceWidth: measureStyle(" ", rest), units };
    });
    const restLineWidth = (lineItems) => lineItems.reduce((sum, item, index) => sum + item.restWidth + (index < lineItems.length - 1 ? item.spaceWidth : 0), 0) + padX * 2;
    const peakLineWidth = (lineItems) => restLineWidth(lineItems) + Math.max(0, ...lineItems.map((item) => item.peakWidth - item.restWidth));
    const breakIds = new Set(cue.lineBreakAfterWordIds || []);
    const manualBreaks = items.filter((item, index) => index < items.length - 1 && breakIds.has(item.word.id)).map((item) => item.index);
    let groups = [items];
    if (manualBreaks.length) {
        const split = manualBreaks[0] + 1;
        groups = [items.slice(0, split), items.slice(split)];
    }
    else if (items.length > 1 && peakLineWidth(items) > maxBoxWidth) {
        let best = null;
        for (let split = 1; split < items.length; split += 1) {
            const candidate = [items.slice(0, split), items.slice(split)];
            const widest = Math.max(peakLineWidth(candidate[0]), peakLineWidth(candidate[1]));
            if (!best || widest < best.widest)
                best = { groups: candidate, widest };
        }
        groups = best.groups;
    }
    const restAscent = baseFontPx * CWI_STYLE.type.ascentEm;
    const restDescent = baseFontPx * CWI_STYLE.type.descentEm;
    const lines = groups.filter((group) => group.length).map((group) => {
        let x = padX;
        const words = group.map((item, index) => {
            const placed = { ...item, x };
            x += item.restWidth + (index < group.length - 1 ? item.spaceWidth : 0);
            return placed;
        });
        return {
            words,
            width: x + padX,
            peakWidth: peakLineWidth(group),
            height: restAscent + restDescent + padY * 2,
            baseline: padY + restAscent
        };
    });
    return {
        cueId: cue.id,
        signature: cwiLayoutSignature(project, cue, viewport),
        baseFontPx,
        padX,
        padY,
        maxBoxWidth,
        lines,
        manualBreakCount: manualBreaks.length,
        overflow: lines.some((line) => line.peakWidth > maxBoxWidth + 0.5) || manualBreaks.length > 1
    };
}
function cwiIsTimedCue(cue) {
    return cue.type === "dialogue" || (cue.type === "sound" && CWI_STYLE.sound.syncToSound) || (cue.type === "music" && CWI_STYLE.music.animate);
}
function cwiUsesEstimatedTiming(words) {
    return !words.length || words.every((word) => word.timing === "estimated") ||
        words.some((word) => !Number.isFinite(Number(word.start)));
}
// AE's START/END markers for a cue without aligned word timing.
function cwiEstimatedWindow(cue) {
    const start = Number(cue.start);
    const end = Number(cue.end);
    const insetEnd = end - CWI_STYLE.motion.estimatedEndInsetSeconds;
    return { start, end: insetEnd > start + 0.05 ? insetEnd : Math.max(start + 0.01, end) };
}
function cwiEstimatedCursor(count, time, window) {
    const p = cwiClamp((time - window.start) / (window.end - window.start), 0, 1);
    return count * cwiCubicBezier(p, CWI_STYLE.motion.estimatedEase) + p;
}
// Time at which the estimated cursor reaches `index` (the cursor is monotonic).
function cwiEstimatedTimeForCursor(count, index, window) {
    let low = window.start;
    let high = window.end;
    for (let iteration = 0; iteration < 40; iteration += 1) {
        const mid = (low + high) / 2;
        if (cwiEstimatedCursor(count, mid, window) < index)
            low = mid;
        else
            high = mid;
    }
    return (low + high) / 2;
}
// Word start/end times that reproduce the AE distribution, used to seed imported cues so the
// timeline shows where each word will animate.
function cwiEstimatedWordTimes(cue, count) {
    const window = cwiEstimatedWindow(cue);
    return Array.from({ length: count }, (_, index) => ({
        start: cwiRoundTime(cwiEstimatedTimeForCursor(count, index, window)),
        end: cwiRoundTime(index === count - 1 ? window.end : cwiEstimatedTimeForCursor(count, index + 1, window))
    }));
}
function cwiAlignedKnots(onsets, ends) {
    const count = onsets.length;
    const { maxRiseSeconds, settleSeconds } = CWI_STYLE.motion;
    const knots = [];
    const push = (time, value) => {
        const previous = knots.length ? knots[knots.length - 1][0] : -Infinity;
        knots.push([Math.max(time, previous), value]);
    };
    for (let index = 0; index < count; index += 1) {
        const onset = onsets[index];
        push(onset, index);
        if (index < count - 1) {
            push(Math.min(onsets[index + 1], onset + maxRiseSeconds), index + 1);
        }
        else {
            const end = Math.max(Number.isFinite(ends[index]) ? ends[index] : onset, onset);
            const peak = Math.min(end > onset ? end : onset + maxRiseSeconds, onset + maxRiseSeconds);
            push(peak, count);
            push(Math.max(end, peak), count);
            push(Math.max(end, peak) + settleSeconds, count + 1);
        }
    }
    return knots;
}
function cwiKnotValue(knots, time) {
    if (!knots.length || time < knots[0][0])
        return 0;
    // Walk back to the latest knot at or before `time`; equal-time knots resolve to the later one.
    for (let index = knots.length - 1; index >= 0; index -= 1) {
        const [knotTime, value] = knots[index];
        if (time >= knotTime) {
            const next = knots[index + 1];
            if (!next)
                return value;
            return value + (next[1] - value) * ((time - knotTime) / (next[0] - knotTime));
        }
    }
    return 0;
}
// Per-word cursor state for a cue at `time`: the continuous cursor and each word's onset.
// Sound effects are one event: every word shares a single unit that rises at the sound's onset,
// holds while the sound lasts, and settles when it ends.
function cwiCueTiming(cue, displayWords, time) {
    const words = displayWords.map((item) => item.word);
    if (cue.type !== "dialogue") {
        const estimated = cwiUsesEstimatedTiming(words);
        const onset = estimated ? Number(cue.start) : Math.min(...words.map((word) => Number(word.start)));
        const end = estimated ? cwiEstimatedWindow(cue).end : Math.max(...words.map((word) => Number(word.end)));
        return { estimated, phrase: true, cursor: cwiKnotValue(cwiAlignedKnots([onset], [end]), time), onsets: [onset] };
    }
    const count = words.length;
    if (cwiUsesEstimatedTiming(words)) {
        const window = cwiEstimatedWindow(cue);
        return {
            estimated: true,
            cursor: cwiEstimatedCursor(count, time, window),
            onsets: words.map((_, index) => cwiEstimatedTimeForCursor(count, index, window))
        };
    }
    const onsets = words.map((word) => Number(word.start));
    const ends = words.map((word) => Number(word.end));
    return { estimated: false, cursor: cwiKnotValue(cwiAlignedKnots(onsets, ends), time), onsets };
}
function cwiSyllableLifts(word, time) {
    const units = word.units || [];
    const start = Number(word.start);
    const end = Math.max(Number(word.end), start + 0.01);
    const onsets = units.map((unit, index) => Number.isFinite(Number(unit.start)) ? Number(unit.start) : start + ((end - start) * index) / units.length);
    const ends = units.map((_, index) => index < units.length - 1 ? onsets[index + 1] : end);
    const cursor = cwiKnotValue(cwiAlignedKnots(onsets, ends), time);
    return units.map((_, index) => cwiSmooth(1 - Math.abs(cursor - (index + 1))));
}
function cwiSpokenColor(project, cue) {
    if (cue.type !== "dialogue")
        return CWI_STYLE.type.exceptionSpokenColor;
    if (cwiNormalizeException(cue.exception).color)
        return CWI_STYLE.type.exceptionSpokenColor;
    const speaker = (project.speakers || []).find((item) => item.id === cue.speakerId);
    return speaker ? speaker.color : CWI_STYLE.type.exceptionSpokenColor;
}
function cwiLiveCues(project, time) {
    return (project.cues || [])
        .filter((cue) => time >= Number(cue.start) && time <= Number(cue.end))
        .sort((a, b) => Number(a.start) - Number(b.start));
}
// Full frame state. `getLayout(cue)` returns cwiLayoutCue output (the app caches it; tests call
// cwiLayoutCue directly). Lines stack bottom-up with the earliest line on top (PDF p44-45).
function cwiComputeFrame(project, time, viewport, getLayout, options = {}) {
    const tokens = cwiLayoutTokens(project.project && project.project.aspectRatio);
    const reducedMotion = Boolean(options.reducedMotion);
    const readAhead = CWI_STYLE.type.readAheadColor;
    const { liftEm, anticipationDipEm, anticipationSeconds, popScale } = CWI_STYLE.motion;
    const entries = cwiLiveCues(project, time).flatMap((cue) => {
        const layout = getLayout(cue);
        return layout.lines.map((line, lineIndex) => ({ cue, layout, line, lineIndex }));
    });
    const droppedLines = Math.max(0, entries.length - CWI_STYLE.stack.maxLines);
    const visible = entries.slice(droppedLines);
    const cueMotion = new Map();
    const motionFor = (cue) => {
        if (!cueMotion.has(cue.id)) {
            const displayWords = cwiCueDisplayWords(cue);
            cueMotion.set(cue.id, cwiIsTimedCue(cue) ? cwiCueTiming(cue, displayWords, time) : null);
        }
        return cueMotion.get(cue.id);
    };
    // Per-frame line geometry: each word's current style and advance, the neighbors it pushes,
    // and the box that follows the text (the AE box tracks sourceRectAtTime every frame).
    const measured = visible.map(({ cue, layout, line }) => {
        const timing = motionFor(cue);
        const exception = cwiNormalizeException(cue.exception);
        const motionAllowed = !reducedMotion && !exception.motion;
        const states = line.words.map((item) => {
            const wordIndex = item.index;
            let colorAmount = 0;
            let lift = 0;
            let dip = 0;
            let unitLifts = null;
            // Untimed cues (static sound effects and music) are one event, shown at their size throughout.
            let emphasis = timing ? 0 : 1;
            if (timing) {
                const unitIndex = timing.phrase ? 0 : wordIndex;
                const progress = timing.cursor - unitIndex;
                const window = cwiSmooth(1 - Math.abs(timing.cursor - (unitIndex + 1)));
                // Only dialogue takes the speaker color; sound effects stay white (doc 7.1).
                colorAmount = cue.type === "dialogue" ? cwiSmooth(progress) : 0;
                emphasis = reducedMotion ? 0 : window;
                const wordMotion = item.word.motion || "pop";
                if (motionAllowed && wordMotion !== "none") {
                    if (item.units && wordMotion === "syllable")
                        unitLifts = cwiSyllableLifts(item.word, time);
                    else
                        lift = window;
                    const onset = timing.onsets[unitIndex];
                    if (time < onset) {
                        dip = time >= onset - anticipationSeconds ? cwiEaseOut((time - (onset - anticipationSeconds)) / anticipationSeconds) : 0;
                    }
                    else {
                        const lead = Math.min(anticipationSeconds, Math.max(0, onset - Number(cue.start)));
                        dip = cwiEaseOut(lead / anticipationSeconds) * (1 - cwiSmooth(progress));
                    }
                }
            }
            const style = cwiLerpStyle(item.rest, item.peak, emphasis);
            const advance = item.restWidth + (item.peakWidth - item.restWidth) * emphasis;
            return { item, style, advance, emphasis, colorAmount, lift, dip, unitLifts };
        });
        let x = layout.padX;
        const positions = states.map((state, index) => {
            const position = x;
            x += state.advance + (index < states.length - 1 ? state.item.spaceWidth : 0);
            return position;
        });
        // Loud "burst" words may break out of the box vertically (doc 5.3).
        const boxed = states.filter((state) => !state.item.word.burst);
        const ascent = Math.max(layout.baseFontPx * CWI_STYLE.type.ascentEm, ...boxed.map((state) => state.style.fontPx * CWI_STYLE.type.ascentEm));
        const descent = Math.max(layout.baseFontPx * CWI_STYLE.type.descentEm, ...boxed.map((state) => state.style.fontPx * CWI_STYLE.type.descentEm));
        return { timing, states, positions, width: x + layout.padX, height: ascent + descent + layout.padY * 2, baseline: layout.padY + ascent };
    });
    let bottom = viewport.height * (1 - tokens.bottomMarginRatio);
    const gap = viewport.height * CWI_STYLE.stack.lineGapRatio;
    const placed = [];
    for (let index = visible.length - 1; index >= 0; index -= 1) {
        const geometry = measured[index];
        const y = bottom - geometry.height;
        placed[index] = { x: (viewport.width - geometry.width) / 2, y };
        bottom = y - gap;
    }
    const lines = visible.map(({ cue, layout, lineIndex }, index) => {
        const geometry = measured[index];
        const spokenColor = cwiSpokenColor(project, cue);
        const words = geometry.states.map((state, wordIndex) => {
            const { item, style, lift, dip, unitLifts } = state;
            return {
                id: item.word.id,
                text: item.text,
                x: geometry.positions[wordIndex],
                baseline: geometry.baseline,
                fontPx: style.fontPx,
                weight: style.weight,
                width: style.width,
                slant: style.slant,
                advance: state.advance,
                emphasis: state.emphasis,
                color: geometry.timing && cue.type === "dialogue" ? cwiMixColor(readAhead, spokenColor, state.colorAmount) : readAhead,
                colorAmount: state.colorAmount,
                lift,
                dip,
                offsetY: style.fontPx * (anticipationDipEm * dip - liftEm * lift),
                scale: 1 + (popScale - 1) * lift,
                units: item.units ? item.units.map((unit, unitIndex) => ({
                    text: unit.text,
                    lift: unitLifts ? unitLifts[unitIndex] : 0,
                    offsetY: unitLifts ? -style.fontPx * liftEm * unitLifts[unitIndex] : 0
                })) : null
            };
        });
        return {
            key: `${cue.id}:${lineIndex}`,
            cueId: cue.id,
            cueType: cue.type,
            lineIndex,
            signature: layout.signature,
            box: { x: placed[index].x, y: placed[index].y, width: geometry.width, height: geometry.height },
            words
        };
    });
    const maxLineWidth = viewport.width * tokens.maxLineWidthRatio;
    return {
        time,
        width: viewport.width,
        height: viewport.height,
        boxFill: CWI_STYLE.box.fill,
        lines,
        droppedLines,
        guide: {
            left: (viewport.width - maxLineWidth) / 2,
            width: maxLineWidth,
            top: viewport.height * (1 - CWI_STYLE.stack.workAreaRatio),
            bottom: viewport.height * (1 - tokens.bottomMarginRatio)
        }
    };
}
// Largest number of caption lines that are on screen together, sampled at every cue start.
function cwiMaxSimultaneousLines(project, getLayout) {
    let worst = { count: 0, time: 0 };
    (project.cues || []).forEach((cue) => {
        const time = Number(cue.start);
        const count = cwiLiveCues(project, time).reduce((sum, live) => sum + getLayout(live).lines.length, 0);
        if (count > worst.count)
            worst = { count, time };
    });
    return worst;
}
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
    const els = {};
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
            if (typeof motionQuery.addEventListener === "function")
                motionQuery.addEventListener("change", onMotionChange);
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
        const [backButton, playButton, forwardButton] = Array.from(els.stepButtons);
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
            if (!els.video.paused)
                state.previewTimeOverride = null;
            renderPlayback();
        });
        els.video.addEventListener("seeking", () => {
            if (!els.video.paused)
                state.previewTimeOverride = null;
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
            if (event.key !== "Enter" && event.key !== " ")
                return;
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
                if (seekTarget)
                    seekTimelineFromPointer(event);
                return;
            }
            state.selectedCueId = segment.dataset.cueId;
            state.selectedWordId = segment.dataset.wordId || "";
            renderAll();
        });
        els.timelineGrid.addEventListener("keydown", (event) => {
            const scroller = event.target.closest(".timeline-scroll");
            if (!scroller)
                return;
            const duration = getDuration();
            let nextTime = currentMediaTime();
            if (event.key === "ArrowLeft")
                nextTime -= event.shiftKey ? 1 : 0.25;
            else if (event.key === "ArrowRight")
                nextTime += event.shiftKey ? 1 : 0.25;
            else if (event.key === "Home")
                nextTime = 0;
            else if (event.key === "End")
                nextTime = duration;
            else
                return;
            event.preventDefault();
            seekPreviewToTime(nextTime);
            renderPlayback();
            announceStatus(`Preview time ${formatTime(currentMediaTime())}`);
        });
    }
    function setupInspectorEvents() {
        els.inspector.addEventListener("input", (event) => {
            if (!event.target.dataset.control || event.target.dataset.commit === "change")
                return;
            applyInspectorControl(event.target);
            syncInspectorTitle();
            renderPlayback();
            renderTimeline();
            renderSideContent();
            updateRangeOutputs();
        });
        els.inspector.addEventListener("change", (event) => {
            if (!event.target.dataset.control)
                return;
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
        if (!els.inspectorResize)
            return;
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
            if (!els.inspectorResize.hasPointerCapture(event.pointerId))
                return;
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
            if (event.key === "ArrowUp" || event.key === "ArrowLeft")
                nextSize += step;
            else if (event.key === "ArrowDown" || event.key === "ArrowRight")
                nextSize -= step;
            else if (event.key === "PageUp")
                nextSize += 72;
            else if (event.key === "PageDown")
                nextSize -= 72;
            else if (event.key === "Home")
                nextSize = getInspectorSizeBounds().min;
            else if (event.key === "End")
                nextSize = getInspectorSizeBounds().max;
            else
                return;
            event.preventDefault();
            applyInspectorSize(nextSize);
        });
        window.addEventListener("resize", () => applyInspectorSize(state.inspectorSize));
    }
    function applyInspectorSize(size) {
        const bounds = getInspectorSizeBounds();
        state.inspectorSize = Math.round(clamp(size, bounds.min, bounds.max));
        document.querySelector(".workspace").style.setProperty("--inspector-size", `${state.inspectorSize}px`);
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
        if (!file)
            return;
        if (state.mediaObjectUrl)
            URL.revokeObjectURL(state.mediaObjectUrl);
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
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const subtitleText = String(reader.result || "");
                const subtitleCues = parseSubtitleFile(subtitleText, file.name);
                if (!subtitleCues.length)
                    throw new Error("No subtitle cues were found in the selected file.");
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
            }
            catch (error) {
                state.importError = error.message || "The selected caption file could not be imported.";
                state.importWarnings = [];
                state.activeTab = "qa";
                announceStatus(state.importError);
                renderAll();
            }
            finally {
                event.target.value = "";
            }
        };
        reader.readAsText(file);
    }
    function handleJsonInput(event) {
        const file = event.target.files && event.target.files[0];
        if (!file)
            return;
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
            }
            catch (error) {
                state.importError = error.message || "The selected JSON file could not be imported.";
                state.importWarnings = [];
                state.activeTab = "qa";
                announceStatus(state.importError);
                renderAll();
            }
            finally {
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
        if (!trimmed)
            return [];
        if (/^\s*WEBVTT\b/i.test(trimmed) || /\.vtt$/i.test(fileName || ""))
            return parseWebVtt(trimmed);
        return parseSrt(trimmed);
    }
    function parseSrt(text) {
        return String(text || "")
            .replace(/\r/g, "")
            .split(/\n{2,}/)
            .flatMap((block) => {
            const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
            if (!lines.length)
                return [];
            if (/^\d+$/.test(lines[0]))
                lines.shift();
            const timeIndex = lines.findIndex((line) => line.includes("-->"));
            if (timeIndex === -1)
                return [];
            const times = parseSubtitleTiming(lines[timeIndex]);
            if (!times)
                return [];
            const cueText = cleanSubtitleText(lines.slice(timeIndex + 1).join(" "));
            if (!cueText)
                return [];
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
            if (!lines.length || /^WEBVTT\b/i.test(lines[0]) || /^(NOTE|STYLE|REGION)\b/i.test(lines[0]))
                return [];
            let timeIndex = lines.findIndex((line) => line.includes("-->"));
            if (timeIndex === -1)
                return [];
            const times = parseSubtitleTiming(lines[timeIndex]);
            if (!times)
                return [];
            const cueText = cleanSubtitleText(lines.slice(timeIndex + 1).join(" "));
            if (!cueText)
                return [];
            return [{ ...times, text: cueText }];
        });
    }
    function parseSubtitleTiming(line) {
        const parts = String(line || "").split("-->");
        if (parts.length < 2)
            return null;
        const start = parseSubtitleTime(parts[0].trim());
        const end = parseSubtitleTime(parts[1].trim().split(/\s+/)[0]);
        if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)
            return null;
        return { start: roundTime(start), end: roundTime(end) };
    }
    function parseSubtitleTime(value) {
        const normalized = String(value || "").replace(",", ".");
        const parts = normalized.split(":");
        if (parts.length < 2 || parts.length > 3)
            return NaN;
        const seconds = Number(parts.pop());
        const minutes = Number(parts.pop());
        const hours = parts.length ? Number(parts.pop()) : 0;
        if (![hours, minutes, seconds].every(Number.isFinite))
            return NaN;
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
        if (/^[\u266a\u266b]|[\u266a\u266b]$/.test(value))
            return "music";
        if (/^\[.+\]$/.test(value))
            return "sound";
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
            if (!audioBuffer)
                throw new Error("The browser could not decode this media's audio.");
            const analysis = analyzeWordVolumes(audioBuffer, state.cwi.cues);
            analysis.words.forEach((item) => {
                item.word.volumePercent = item.volumePercent;
            });
            const emphasized = analysis.words.filter((item) => item.volumePercent !== CWI_NEUTRAL_VOLUME).length;
            addReviewNote(`Local audio analysis compared ${analysis.words.length} words with the ${Number.isFinite(analysis.referenceDb) ? `${analysis.referenceDb.toFixed(1)} dBFS` : "unmeasured"} median speech level; ${emphasized} words were marked louder or softer than normal.`);
            announceStatus(`Audio analysis marked ${emphasized} words as louder or softer than normal speech.`);
        }
        catch (error) {
            addReviewNote(`Audio analysis failed; neutral volume values were kept. ${error.message || error}`);
            announceStatus("Audio analysis failed. Neutral volume values were kept.");
        }
        renderAll();
    }
    function loadMediaAudio(file) {
        if (!file || file.size > MAX_ANALYSIS_BYTES)
            return Promise.resolve(null);
        if (state.audioBuffer && state.audioSource === file)
            return Promise.resolve(state.audioBuffer);
        if (state.audioPromise && state.audioSource === file)
            return state.audioPromise;
        state.audioSource = file;
        state.audioPromise = (async () => {
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioContextClass)
                    return null;
                const audioContext = new AudioContextClass();
                const audioBuffer = await audioContext.decodeAudioData((await file.arrayBuffer()).slice(0));
                if (typeof audioContext.close === "function")
                    audioContext.close();
                if (state.mediaFile !== file)
                    return null;
                state.audioBuffer = audioBuffer;
                state.waveform = computeWaveform(audioBuffer);
                return audioBuffer;
            }
            catch {
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
        if (!Number.isFinite(offsetDb))
            return CWI_NEUTRAL_VOLUME;
        const beyondDeadZone = Math.abs(offsetDb) - CWI_ANALYSIS.volumeDeadZoneDb;
        if (beyondDeadZone <= 0)
            return CWI_NEUTRAL_VOLUME;
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
        if (endSample <= startSample)
            return NaN;
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
        if (!sorted.length)
            return NaN;
        const index = clamp((sorted.length - 1) * ratio, 0, sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        if (lower === upper)
            return sorted[lower];
        return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
    }
    function addReviewNote(note) {
        if (!state.cwi.review)
            state.cwi.review = { notes: [], validationStatus: "unchecked" };
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
            if (els.video.volume === 0)
                els.video.volume = 0.85;
            els.video.play().catch(() => {
                state.importError = "Preview playback was blocked by the browser.";
                state.activeTab = "qa";
                renderAll();
            });
        }
        else {
            els.video.pause();
        }
    }
    function toggleSound() {
        if (els.video.muted || els.video.volume === 0) {
            els.video.muted = false;
            if (els.video.volume === 0)
                els.video.volume = 0.85;
        }
        else {
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
                if (!els.video.paused && !els.video.ended)
                    els.video.requestVideoFrameCallback(onVideoFrame);
            };
            els.video.requestVideoFrameCallback(onVideoFrame);
        }
        requestAnimationFrame(playbackLoop);
    }
    function playbackLoop() {
        renderPlayback();
        if (!els.video.paused && !els.video.ended)
            requestAnimationFrame(playbackLoop);
        else
            state.frameAnchor = null;
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
        if (els.aspectSelect)
            els.aspectSelect.value = aspect;
    }
    function renderTopbar() {
        els.projectName.textContent = state.mediaObjectUrl
            ? state.cwi.project.mediaName || "Browser media"
            : `${state.cwi.project.title || "Untitled CWI"}${mediaExtensionLabel()}`;
        els.mediaBoundary.textContent = state.mediaObjectUrl ? "Browser-only Media" : "Local Sample";
        if (els.statusRegion)
            els.statusRegion.textContent = state.statusMessage || "";
    }
    function announceStatus(message) {
        state.statusMessage = String(message || "");
        if (els.statusRegion)
            els.statusRegion.textContent = state.statusMessage;
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
        if (event.key === "ArrowRight")
            nextIndex = (currentIndex + 1) % els.tabs.length;
        else if (event.key === "ArrowLeft")
            nextIndex = (currentIndex - 1 + els.tabs.length) % els.tabs.length;
        else if (event.key === "Home")
            nextIndex = 0;
        else if (event.key === "End")
            nextIndex = els.tabs.length - 1;
        else
            return;
        event.preventDefault();
        state.activeTab = els.tabs[nextIndex].dataset.tab;
        renderSideContent();
        renderTabs();
        els.tabs[nextIndex].focus();
    }
    function renderSideContent() {
        if (state.activeTab === "speakers") {
            renderSpeakersPanel();
        }
        else if (state.activeTab === "qa") {
            renderQaPanel();
        }
        else {
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
            if (!cue.speakerId)
                return;
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
        if (!speaker)
            return;
        const value = control.type === "checkbox" ? control.checked : control.value;
        if (control.dataset.speakerControl === "name") {
            speaker.name = String(value).trim() || "Unnamed speaker";
        }
        else if (control.dataset.speakerControl === "role") {
            speaker.role = SPEAKER_ROLES.includes(value) ? value : "supporting";
            if (!colorFitsRole(speaker.color, speaker.role))
                speaker.color = nextSpeakerColor(speaker.role);
        }
        else if (control.dataset.speakerControl === "color") {
            speaker.color = String(value);
        }
        else if (control.dataset.speakerControl === "defaultOffCamera") {
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
        if (!available.length)
            return (roleColors[0] || SPEAKER_PALETTE[0]).color;
        if (!usedColors.length)
            return available[0].color;
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
        if (!cue)
            return;
        const value = control.value;
        if (control.dataset.transcriptControl === "type") {
            cue.type = CUE_TYPES.includes(value) ? value : "dialogue";
            if (cue.type !== "dialogue") {
                cue.speakerId = "";
                cue.offCamera = false;
            }
            else if (!cue.speakerId && state.cwi.speakers[0]) {
                cue.speakerId = state.cwi.speakers[0].id;
            }
        }
        else if (control.dataset.transcriptControl === "text") {
            updateCueTextAndWords(cue, String(value));
            refreshTranscriptCueRow(cue);
        }
        if (state.selectedWordId && (!cue.words || !cue.words.some((word) => word.id === state.selectedWordId)))
            state.selectedWordId = "";
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
        if (currentIndex >= 0)
            state.cwi.cues.splice(currentIndex + 1, 0, cue);
        else
            state.cwi.cues.push(cue);
        state.selectedCueId = cue.id;
        state.selectedWordId = "";
        state.activeTab = "transcript";
    }
    function deleteCueFromTranscript(cueId) {
        const index = state.cwi.cues.findIndex((cue) => cue.id === cueId);
        if (index === -1)
            return;
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
        const row = Array.from(els.sideContent.querySelectorAll(".cue[data-cue-id]")).find((item) => item.dataset.cueId === cue.id);
        if (!row)
            return;
        const copy = row.querySelector(".cue-copy");
        if (copy)
            copy.innerHTML = renderCueWordsForTranscript(cue, getCurrentCueAndWord().wordId);
    }
    function buildWordsForCueText(cue, text) {
        const tokens = tokenizeTranscriptText(text);
        const oldWords = Array.isArray(cue.words) ? cue.words : [];
        if (!tokens.length)
            return [];
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
        if (!notes.length)
            return "";
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
        if (!words.length)
            return '<div class="empty-card">This cue has no word timing records yet.</div>';
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
        if (trigger)
            trigger.focus();
    }
    function handleSpeakerSelectorKeydown(event) {
        const trigger = event.target.closest("[data-speaker-trigger]");
        const option = event.target.closest("[data-cue-speaker-option]");
        if (!trigger && !option)
            return;
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
        }
        else if (event.key === "Escape") {
            event.preventDefault();
            state.speakerSelectorOpen = false;
            renderInspector();
            const nextTrigger = els.inspector.querySelector("[data-speaker-trigger]");
            if (nextTrigger)
                nextTrigger.focus();
        }
        else if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
            event.preventDefault();
            moveActiveSpeakerOption(event.key);
        }
    }
    function moveActiveSpeakerOption(key) {
        const options = speakerOptionIds();
        if (!options.length)
            return;
        const currentIndex = Math.max(0, options.indexOf(state.activeSpeakerOptionId));
        let nextIndex = currentIndex;
        if (key === "ArrowDown")
            nextIndex = Math.min(options.length - 1, currentIndex + 1);
        else if (key === "ArrowUp")
            nextIndex = Math.max(0, currentIndex - 1);
        else if (key === "Home")
            nextIndex = 0;
        else if (key === "End")
            nextIndex = options.length - 1;
        state.activeSpeakerOptionId = options[nextIndex];
        renderInspector();
        focusSpeakerOption(state.activeSpeakerOptionId);
    }
    function focusSpeakerOption(optionId) {
        const option = els.inspector.querySelector(`#${speakerOptionDomId(optionId)}`);
        if (option)
            option.focus();
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
        for (let tick = 0; tick <= duration; tick += tickStep)
            ticks.push(tick);
        if (!ticks.includes(Math.floor(duration)))
            ticks.push(Math.floor(duration));
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
        if (nextScroller)
            nextScroller.scrollLeft = previousScrollLeft;
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
        if (!scroller)
            return;
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
                if (previousCue)
                    refreshTranscriptCueRow(previousCue);
                if (cue && cue !== previousCue)
                    refreshTranscriptCueRow(cue);
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
        if (key !== captionView.key)
            buildCaptionNodes(frame, key);
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
                }
                else {
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
        if (written[property] === value)
            return;
        written[property] = value;
        node.style[property] = value;
    }
    function captionTransform(offsetY, scale) {
        if (!offsetY && scale === 1)
            return "";
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
        if (clearMeasurements)
            captionMeasureCache.clear();
        captionView.key = "";
    }
    function captionLayoutFor(cue, viewport = captionViewport()) {
        const signature = cwiLayoutSignature(state.cwi, cue, viewport);
        const cached = captionLayouts.get(cue.id);
        if (cached && cached.signature === signature)
            return cached;
        const layout = cwiLayoutCue(state.cwi, cue, viewport, measureCaptionText);
        captionLayouts.set(cue.id, layout);
        return layout;
    }
    // Canvas text metrics cannot express Roboto Flex width or slant, so measure with a hidden
    // span that uses exactly the same font settings as the rendered words.
    function measureCaptionText(text, fontPx, weight, width, slant) {
        const key = `${text}|${fontPx.toFixed(3)}|${weight}|${width}|${slant}`;
        if (captionMeasureCache.has(key))
            return captionMeasureCache.get(key);
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
        if (playhead)
            playhead.style.left = `${currentMediaTime() * PX_PER_SECOND}px`;
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
        if (!els.soundButton)
            return;
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
        if (!cue)
            return;
        const value = control.type === "checkbox" ? control.checked : control.value;
        const exception = cwiNormalizeException(cue.exception);
        switch (control.dataset.control) {
            case "cue-start":
                cue.start = roundTime(Math.max(0, Number(value) || 0));
                if (cue.end <= cue.start)
                    cue.end = roundTime(cue.start + 0.01);
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
                    if (cue.type === "dialogue")
                        syncCueTextFromWords(cue);
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
                if (word)
                    word.volumePercent = clamp(cwiNumber(value, CWI_NEUTRAL_VOLUME), 0, 100);
                break;
            case "word-burst":
                if (word)
                    word.burst = Boolean(value);
                break;
            case "word-motion":
                if (word)
                    word.motion = CWI_WORD_MOTIONS.includes(value) ? value : "pop";
                break;
            case "word-syllables":
                if (word)
                    setWordSyllables(word, String(value));
                break;
            case "word-break":
                if (word) {
                    const breaks = new Set(cue.lineBreakAfterWordIds || []);
                    if (value)
                        breaks.add(word.id);
                    else
                        breaks.delete(word.id);
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
                if (word)
                    word.pitchWeight = clamp(cwiNumber(value, CWI_STYLE.type.defaultWeight), CWI_STYLE.tone.minWeight, CWI_STYLE.tone.maxWeight);
                break;
            case "pitch-width":
                if (word)
                    word.pitchWidth = clamp(cwiNumber(value, CWI_STYLE.type.defaultWidth), CWI_STYLE.tone.minWidth, CWI_STYLE.tone.maxWidth);
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
        if (!words.length || !words.every((word) => word.timing === "estimated"))
            return;
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
        if (volumeInput && volumeOutput)
            volumeOutput.textContent = `${cwiVolumeScreenPercent(Number(volumeInput.value)).toFixed(1)}%`;
        const toneOutput = els.inspector.querySelector('[data-output="tone"]');
        const word = getSelectedWord();
        if (toneOutput && word)
            toneOutput.textContent = `wght ${word.pitchWeight} · wdth ${word.pitchWidth}`;
    }
    function syncInspectorTitle() {
        const titleValue = els.inspectorHead.querySelector(".inspector-title span");
        const cue = getSelectedCue();
        const word = getSelectedWord();
        if (titleValue && cue)
            titleValue.textContent = `"${word ? word.text : cwiCueDisplayText(cue)}"`;
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
        if (state.importError)
            fail("JSON import", state.importError);
        if (state.importWarnings.length)
            fail("JSON required fields", state.importWarnings.slice(0, 5).join("; "));
        if (!project.project || !project.project.id || !project.project.title) {
            fail("Project metadata", "Project id and title are required.");
        }
        else if (!CWI_ASPECT_RATIOS.includes(project.project.aspectRatio)) {
            fail("Project metadata", `Aspect ratio ${project.project.aspectRatio || "(missing)"} must be one of ${CWI_ASPECT_RATIOS.join(", ")}.`);
        }
        else {
            pass("Project metadata", `${project.project.title} is ${project.project.aspectRatio} at ${project.project.frameRate || CWI_DEFAULT_FRAME_RATE} fps (schema v${project.schemaVersion || 1}).`);
        }
        if (!Array.isArray(project.speakers) || project.speakers.length === 0) {
            fail("Speaker metadata", "At least one speaker with id, name, role, color, and off-camera default is required.");
        }
        else {
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
            }
            else {
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
        }
        else if (busiest.count > CWI_STYLE.stack.maxLines) {
            fail("Caption work area", `${busiest.count} caption lines are on screen at ${formatTime(busiest.time)}; the system allows ${CWI_STYLE.stack.maxLines}. Shorten or split the overlapping cues.`);
        }
        else {
            pass("Caption work area", `Every cue fits the ${project.project.aspectRatio} line width, and no more than ${CWI_STYLE.stack.maxLines} lines are on screen at once.`);
        }
        return checks;
    }
    function remoteMediaSource(source) {
        if (!/^https?:/i.test(source))
            return false;
        try {
            return new URL(source).origin !== window.location.origin;
        }
        catch {
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
            if (cue.speakerId)
                issues.push(`${cue.id} is a ${cue.type} cue and should not have a speaker color`);
            return issues;
        });
    }
    // Doc QA: normal speaking volume returns to the 5% baseline.
    function volumeBaselineIssues(cues) {
        const words = (cues || []).flatMap((cue) => cue.type === "dialogue" ? (cue.words || []) : []);
        if (!words.length)
            return [];
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
        if (!words.length)
            return [];
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
        if (!raw || typeof raw !== "object")
            return ["JSON root must be an object."];
        if (!raw.project)
            warnings.push("project object is missing");
        if (raw.project) {
            ["id", "title", "aspectRatio", "mediaName", "duration"].forEach((field) => {
                if (raw.project[field] === undefined || raw.project[field] === "")
                    warnings.push(`project.${field} is missing`);
            });
        }
        if (!Array.isArray(raw.speakers)) {
            warnings.push("speakers array is missing");
        }
        else {
            raw.speakers.forEach((speaker, index) => {
                ["id", "name", "role", "color", "defaultOffCamera"].forEach((field) => {
                    if (speaker[field] === undefined || speaker[field] === "")
                        warnings.push(`speakers[${index}].${field} is missing`);
                });
            });
        }
        if (!Array.isArray(raw.cues)) {
            warnings.push("cues array is missing");
        }
        else {
            raw.cues.forEach((cue, cueIndex) => {
                ["id", "type", "start", "end", "text", "words"].forEach((field) => {
                    if (cue[field] === undefined || cue[field] === "")
                        warnings.push(`cues[${cueIndex}].${field} is missing`);
                });
                if (cue.type === "dialogue" && !cue.speakerId)
                    warnings.push(`cues[${cueIndex}].speakerId is missing`);
                if (Array.isArray(cue.words)) {
                    cue.words.forEach((word, wordIndex) => {
                        ["id", "text", "start", "end", "volumePercent"].forEach((field) => {
                            if (word[field] === undefined || word[field] === "")
                                warnings.push(`cues[${cueIndex}].words[${wordIndex}].${field} is missing`);
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
        if (!cue || !cue.words)
            return null;
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
        if (state.selectedWordId && (!cue.words || !cue.words.some((word) => word.id === state.selectedWordId)))
            state.selectedWordId = "";
    }
    function firstWordId(cue) {
        return cue && cue.words && cue.words[0] ? cue.words[0].id : "";
    }
    function getCurrentCueAndWord() {
        const mediaTime = currentMediaTime();
        const live = cwiLiveCues(state.cwi, mediaTime);
        const cue = live[live.length - 1];
        if (!cue)
            return { cueId: "", wordId: "" };
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
        if (Number.isFinite(els.video.duration) && els.video.duration > 0)
            return els.video.duration;
        return Number(state.cwi.project.duration) || 0;
    }
    function currentMediaTime() {
        if (state.previewTimeOverride !== null && els.video.paused)
            return state.previewTimeOverride;
        const anchor = state.frameAnchor;
        if (anchor && !els.video.paused) {
            const elapsed = (performance.now() - anchor.wallTime) / 1000;
            if (elapsed >= 0 && elapsed < 0.25)
                return anchor.mediaTime + elapsed * (els.video.playbackRate || 1);
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
            }
            catch {
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
        if (value === "main")
            return "Main character";
        if (value === "minor")
            return "Minor character";
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
