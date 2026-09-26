import sample from "./sample.cwi.json" with { type: "json" };
import type { Project } from "./types.ts";
import { normalizeProject } from "./schema.ts";

// The bundled Back to the Future diner scene. Cue timing follows the After Effects template's
// LINE layers (comp time + 14.4 s movie offset); normalizing returns a fresh, editable copy.
export function createSampleProject(): Project {
  return normalizeProject(sample);
}
