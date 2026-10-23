// record (board 06): no-animation fallback. Re-uses the shared module with
// motion off, so every row and the footer are shown at once, readable without
// any choreography. Same contract as index.ts.
import type { SceneModule } from '../contract';
import { META, mountRecord } from './shared';

export const meta = { name: META.name, states: META.states, needsWebGL: META.needsWebGL };

export const mount: SceneModule['mount'] = (el, params, tokens) =>
  mountRecord(el, params, tokens, { animated: false });

const mod: SceneModule = { meta, mount };
export default mod;
