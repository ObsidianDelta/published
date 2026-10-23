// still: no-animation fallback — the settled card, drawn once, regardless of t.
// Same contract as index.ts.
import type { SceneModule } from '../contract';
import { META, mountStill } from './shared';

export const meta = { name: META.name, states: META.states, needsWebGL: META.needsWebGL };

export const mount: SceneModule['mount'] = (el, params, tokens) =>
  mountStill(el, params, tokens, { animated: false });

const mod: SceneModule = { meta, mount };
export default mod;
