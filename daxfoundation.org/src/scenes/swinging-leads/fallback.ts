// swinging-leads (board 05): no-animation fallback. Re-uses the shared module
// with motion off: the route is drawn, both climbers placed with the lead
// already swung, the caption shown. The swing button still works (a 300ms
// crossfade). Same contract as index.ts.
import type { SceneModule } from '../contract';
import { META, mountSwingingLeads } from './shared';

export const meta = { name: META.name, states: META.states, needsWebGL: META.needsWebGL };

export const mount: SceneModule['mount'] = (el, params, tokens) =>
  mountSwingingLeads(el, params, tokens, { animated: false });

const mod: SceneModule = { meta, mount };
export default mod;
