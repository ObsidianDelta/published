// still: full scene (a soft settle on t). See README.md.
import type { SceneModule } from '../contract';
import { META, mountStill } from './shared';

export const meta = { name: META.name, states: META.states, needsWebGL: META.needsWebGL };

export const mount: SceneModule['mount'] = (el, params, tokens) =>
  mountStill(el, params, tokens, { animated: true });

const mod: SceneModule = { meta, mount };
export default mod;
