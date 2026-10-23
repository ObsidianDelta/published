// orbit scene (board 04) — Three.js full scene. STUB: real scene lands next commit.
import type { SceneHandle, SceneModule, SceneParams, SceneTokens } from "../contract";

export const meta = {
  name: "orbit",
  states: ["classroom", "invert", "context", "reverse"] as const,
  needsWebGL: true,
};

export async function mount(
  el: HTMLElement,
  _params: SceneParams,
  _tokens: SceneTokens,
): Promise<SceneHandle> {
  void el;
  return {
    setProgress() {},
    setState() {},
    resize() {},
    destroy() {},
  };
}

const sceneModule: SceneModule = { meta, mount };
export default sceneModule;
