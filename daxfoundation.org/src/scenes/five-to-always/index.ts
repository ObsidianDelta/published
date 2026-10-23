// five-to-always (board 07): full scene. See README.md.
import type { SceneModule } from '../contract';
import { META, mountFiveToAlways } from './shared';

export const meta = { name: META.name, states: META.states, needsWebGL: META.needsWebGL };

export const mount: SceneModule['mount'] = (el, params, tokens) =>
  mountFiveToAlways(el, params, tokens, { animated: true });

const mod: SceneModule = { meta, mount };
export default mod;
