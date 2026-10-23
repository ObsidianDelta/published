// `job-left` scene (board 01), full build: SVG with animation enabled.
import type { SceneModule } from "../contract";
import { createJobLeftScene } from "./scene";

export const meta = { name: "job-left", states: ["done", "left", "caption"], needsWebGL: false } as const;

export const mount: SceneModule["mount"] = (el, params, tokens) =>
  createJobLeftScene(el, params, tokens, { animated: true });

export default { meta, mount } satisfies SceneModule;
