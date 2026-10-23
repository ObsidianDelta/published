// `job-left` scene (board 01), 2D fallback: same SVG, animation disabled.
import type { SceneModule } from "../contract";
import { createJobLeftScene } from "./scene";

export const meta = { name: "job-left", states: ["done", "left", "caption"], needsWebGL: false } as const;

export const mount: SceneModule["mount"] = (el, params, tokens) =>
  createJobLeftScene(el, params, tokens, { animated: false });

export default { meta, mount } satisfies SceneModule;
