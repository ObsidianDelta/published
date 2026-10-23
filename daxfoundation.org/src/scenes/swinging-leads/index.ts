// swinging-leads (board 05): full scene. See README.md.
import type { SceneModule } from '../contract';
import { META, mountSwingingLeads } from './shared';

export const meta = { name: META.name, states: META.states, needsWebGL: META.needsWebGL };

export const mount: SceneModule['mount'] = (el, params, tokens) =>
  mountSwingingLeads(el, params, tokens, { animated: true });

const mod: SceneModule = { meta, mount };
export default mod;
