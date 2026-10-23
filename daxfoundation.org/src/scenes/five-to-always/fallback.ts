// five-to-always (board 07): no-animation fallback. Re-uses the shared module
// with motion off: the arc is shown full, the always-on state resolved, every
// label legible. Same contract as index.ts.
import type { SceneModule } from '../contract';
import { META, mountFiveToAlways } from './shared';

export const meta = { name: META.name, states: META.states, needsWebGL: META.needsWebGL };

export const mount: SceneModule['mount'] = (el, params, tokens) =>
  mountFiveToAlways(el, params, tokens, { animated: false });

const mod: SceneModule = { meta, mount };
export default mod;
