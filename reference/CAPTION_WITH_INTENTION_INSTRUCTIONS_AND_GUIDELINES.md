# Caption with Intention Instructions and Guidelines

This document synthesizes the two source PDFs in this workspace:

- Design System and Caption Guidelines, V1.0, 2025.1.
- Caption with Intention Quickstart Guide.

It is intended as a practical implementation guide for creating Caption with Intention subtitles in motion-picture, television, streaming, cinema, broadcast, and Adobe After Effects workflows.

## 1. Purpose

Caption with Intention extends traditional closed captions so Deaf and hard-of-hearing audiences can better understand three aspects of spoken storytelling:

1. Attribution: who is speaking.
2. Synchronization: when each word is spoken.
3. Intonation: how the line is spoken, including volume, pitch, tone, and urgency.

The system should augment, not replace, legally required closed captions. When a rule is not covered here, default to established closed-captioning guidance.

## 2. Core Principles

- Preserve readability first. Every expressive choice must remain easy to read.
- Use color to identify speakers.
- Use word-level timing to show pacing.
- Use motion to guide the viewer's eye to the spoken word.
- Use type size, weight, and width to communicate vocal intensity and tone.
- Keep the system familiar enough that it feels like captions, not a separate graphic layer.
- Make exceptions when the full expressive system would distract from the film.

## 3. Speaker Attribution

### 3.1 Main Characters

Assign each main character a distinct color. If the film has only three main characters, choose colors as far apart on the spectrum as possible. If the story has a clear hero and villain, place their colors opposite each other on the color spectrum.

| Name | RGB | HEX |
| --- | --- | --- |
| CI Main Yellow | 229, 229, 23 | `#E5E517` |
| CI Main Blue | 23, 229, 229 | `#17E5E5` |
| CI Main Red | 229, 23, 23 | `#E51717` |
| CI Main Orange | 229, 128, 23 | `#E58017` |
| CI Main Green | 23, 229, 23 | `#17E517` |
| CI Main Pink | 229, 23, 229 | `#E517E5` |

### 3.2 Supporting Characters

After main-character colors are set, choose supporting-character colors from areas of the spectrum that remain visually distant from the main characters. Avoid adjacent hues that could blur attribution, such as assigning a red main character and an orange or magenta supporting character.

| Name | RGB | HEX |
| --- | --- | --- |
| CI Support Orange | 232, 92, 46 | `#E85C2E` |
| CI Support Yellow | 235, 194, 71 | `#EBC247` |
| CI Support Green I | 194, 235, 71 | `#C2EB47` |
| CI Support Green II | 130, 237, 94 | `#82ED5E` |
| CI Support Green III | 71, 235, 112 | `#47EB70` |
| CI Support Cyan | 94, 237, 201 | `#5EEDC9` |
| CI Support Blue I | 71, 194, 235 | `#47C2EB` |
| CI Support Blue II | 94, 130, 237 | `#5E82ED` |
| CI Support Purple I | 140, 107, 237 | `#8C6BED` |
| CI Support Purple II | 204, 107, 237 | `#CC6BED` |
| CI Support Pink I | 235, 71, 194 | `#EB47C2` |
| CI Support Pink II | 237, 94, 130 | `#ED5E82` |

### 3.3 Minor Characters

Minor characters should use softer pastel colors from the center of the color wheel. Use:

- Hue: any needed hue value.
- Saturation: 30%.
- Brightness: 90%.

This preserves attribution while making main and supporting characters feel more visually important.

### 3.4 Off-Camera Characters

Use the same character color for off-camera voices as for on-camera dialogue. Also set off-camera dialogue in italic type. Color identifies the speaker; italics identify that the voice is off-screen.

## 4. Synchronization

### 4.1 Read-Ahead Text

Each caption line should appear first as a complete sentence in white at 90% opacity. This preserves the familiar read-ahead behavior of traditional captions and lets viewers read at their own pace.

### 4.2 Word-Level Color Sync

Overlay the speaker color word by word as the line is spoken.

- The word should change color when the sound of that word begins.
- Do not wait until the word is complete.
- For a long word, trigger the color at the first audible syllable.

Example: for "inexplicable," the word should change color at "in," not near the final syllable.

### 4.3 Motion Pop

As each spoken word changes color, add a motion cue so the viewer's eye lands on the current word.

- Increase the word size by 15%.
- Return it to its original size after the emphasis.
- Use a subtle upward pop where appropriate; the design-system example shows a 25% elevation.
- Keep the motion brief and readable.

### 4.4 Syllable-Level Variation

Most words should animate as full words. If a word is intentionally delivered syllable by syllable, the animation can also emphasize it syllable by syllable. Use this only when the spoken performance makes the separation meaningful.

## 5. Intonation

### 5.1 Typeface

Use Roboto Flex. The design system depends on its variable axes, screen readability, and ability to adjust weight and width without changing type families.

### 5.2 Type Size

Measure type size as a percentage of total screen height. This keeps caption scale consistent across 1080p, 4K, 8K, and future resolutions.

| Voice level | Type-size rule |
| --- | --- |
| Quiet or whispered | As low as 3% of screen height |
| Normal speaking volume | 5% of screen height |
| Loud or shouted | Up to 12% of screen height |

The baseline type size is 5% of the screen height. Use 3% as the minimum readability limit and 12% as the maximum expressive limit.

### 5.3 Volume Mapping

Represent volume through type size:

- Softer voices use smaller type.
- Normal voices use the 5% baseline.
- Louder voices use larger type.
- Very loud or sudden bursts may break outside the caption box if that better communicates intensity.

Volume can be judged by ear or supported by waveform analysis.

### 5.4 Pitch and Harmonic Mapping

Represent vocal tone through Roboto Flex weight and width:

- Lower-pitched, bass-heavy, fuller voices use heavier and wider type.
- Higher-pitched, sharper, lighter voices use lighter and more condensed type.
- The default baseline for typical voice frequencies around 160-200 Hz is Roboto Flex Regular 400.

Do not visually contradict the sound. A deep, resonant voice should not use a thin condensed style; a high, sharp voice should not use a heavy expanded style unless the performance intentionally calls for that contradiction.

## 6. Caption Box and Work Area

### 6.1 Caption Box

Place captions inside a 90% black caption box. The box keeps colored, animated, and variable-weight captions readable while allowing the underlying picture to remain visible.

The box should resize dynamically to the amount of text. Dialogue and box size should scale together.

### 6.2 Line Count

Use no more than two caption lines on a single frame. If two caption lines appear at the same time, split the caption box into separate line boxes with adequate spacing between them.

### 6.3 Work Area

Keep captions inside the lower 20% of the frame, with safe margins on the bottom, left, and right edges. Do not let caption elements extend beyond this work area unless a deliberate loud-burst exception is being used.

For implementation, reserve enough vertical space for:

- The caption box or boxes.
- Interline spacing.
- Bottom safety margin.
- Side safety margins.

## 7. Sound Effects and Music

### 7.1 Sound Effects

Sound effects should stay close to traditional captioning conventions:

- Use white text.
- Put the description inside square brackets, such as `[thunder]`.
- Keep the text inside the caption box.
- Apply Caption with Intention timing, size, and pop behavior when the sound changes intensity.

For example, loud thunder can increase in size and pop in sync with the thunder.

### 7.2 Music

Use the music note symbol from the template on both sides of the musical description. Keep the music description in white.

Music descriptors do not need word-by-word animation and do not change color.

## 8. Exceptions

Some films may benefit from using only part of the system. For example, older films, black-and-white films, or visually restrained scenes may become distracting if every speaker uses a different color.

In those cases, editors may use the animation and synchronization features without applying the full color-attribution system. Exceptions are editorial decisions and should be made scene by scene.

## 9. Distribution and Compliance

Caption with Intention may need to be delivered as open captions burned into the video until playback and closed-captioning technologies support this level of styling, timing, and animation.

Because closed captions are regulated and widely standardized, Caption with Intention should currently be provided in addition to required closed captions, not as their sole replacement.

## 10. Adobe After Effects Template Instructions

### 10.1 Project Structure

Each caption block has two layers:

- A text layer named `LINE X`.
- A box layer named `BOX LINE X`.

The box layer is a dynamic background that resizes based on the text. The box layer must stay directly below its corresponding text layer. If this order changes, the animation will not work correctly.

### 10.2 Creating Additional Captions

To duplicate a caption:

1. Select both the text layer and its box layer.
2. Press `Cmd + D` on Mac or `Ctrl + D` on Windows, or use `Edit > Duplicate`.
3. After duplication, move the duplicated text layer one step up so the box remains directly underneath the text.

The easiest way to move the pair is to select only the text layer. The box follows because it is rigged to the text.

### 10.3 Color Control

To change a word or sentence color:

1. Select the relevant text layer, such as `LINE 1`.
2. Open the Effects Control panel.
3. Locate the `COLOR_01` effect.
4. Use the eyedropper to pick a color from the on-screen design guide.

The quickstart states that the template includes the 8 most common color options. The design-system PDF lists the main and supporting palettes above; if there is a mismatch, treat the latest design-system palette or project-specific palette as authoritative.

### 10.4 Editing Text

Each caption line is editable in its own text layer.

- Do not use manual line breaks inside a caption line.
- Use one text layer per line.
- Each text layer contains `[START]` and `[END]` markers.
- The markers trigger animation only.
- The markers do not control when the caption appears or disappears.
- Use the layer's IN and OUT points to control when the caption is visible.
- Set IN and OUT points independently for each line of text.

### 10.5 Guide Layers

The template includes a `[GUIDE LAYER]` at the top of the timeline. It contains visible helper elements such as labels, color keys, captions, and layout guides.

Guide layers are not rendered in After Effects. They can remain visible while working and do not need to be deleted or hidden before export.

## 11. Recommended Production Workflow

### 11.1 Before Captioning

1. Identify all speaking characters.
2. Classify characters as main, supporting, or minor.
3. Assign a speaker color map.
4. Mark off-camera lines.
5. Identify sound effects and music cues.
6. Decide whether any scenes need partial-system exceptions.

### 11.2 During Captioning

1. Place complete read-ahead text in white at 90% opacity.
2. Sync each spoken word to the first audible sound of the word.
3. Apply the speaker's color to each spoken word as it begins.
4. Add the 15% pop motion to the active spoken word.
5. Adjust size for volume between 3% and 12% of screen height.
6. Adjust weight and width for pitch and harmonics.
7. Keep captions in the lower 20% work area.
8. Keep captions inside the 90% black box except for intentional loud-burst exceptions.

### 11.3 Quality Control Checklist

- Every speaker has a clear and consistent color.
- Main, supporting, and minor colors are visually distinct.
- Off-camera voices use both the correct speaker color and italics.
- Read-ahead text appears before word-level sync begins.
- Word color changes begin at the first audible sound of each word.
- Motion pop is visible but not distracting.
- Volume-based type size remains between 3% and 12% of screen height.
- Normal speaking volume returns to the 5% baseline.
- Pitch and harmonic styling feels consistent with the voice.
- Sound effects are white and bracketed.
- Music descriptors use the music-note treatment and remain white.
- No more than two caption lines appear at once.
- Captions stay inside the lower 20% work area unless an exception is intentional.
- Captions remain readable over the picture.
- Required standard closed captions are still supplied where legally or platform required.

## 12. Source Notes and Open Items

- The quickstart references 8 template colors and says the official system includes 17 options. The design-system PDF lists 6 main colors and 12 supporting colors, plus a pastel minor-character method. Confirm the current authoritative palette before final delivery.
- The PDFs reference downloadable resources for the After Effects project and Roboto Flex typeface, but the extracted PDF text did not expose URLs. Use the original PDF links or project resource folder if available.
- AI automation is described as the long-term goal, but the current documented workflow is operator-driven and can be implemented manually in Adobe After Effects.
