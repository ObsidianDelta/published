// `map` scene (board 00), full build: SVG with animation enabled.
import type { SceneModule } from "../contract";
import { createMapScene } from "./scene";

export const meta = { name: "map", states: ["draw", "fill", "ahead"], needsWebGL: false } as const;

export const mount: SceneModule["mount"] = (el, params, tokens) =>
  createMapScene(el, params, tokens, { animated: true });

export default { meta, mount } satisfies SceneModule;
