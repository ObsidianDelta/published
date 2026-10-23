// record (board 06): full scene. See README.md.
import type { SceneModule } from '../contract';
import { META, mountRecord } from './shared';

export const meta = { name: META.name, states: META.states, needsWebGL: META.needsWebGL };

export const mount: SceneModule['mount'] = (el, params, tokens) =>
  mountRecord(el, params, tokens, { animated: true });

const mod: SceneModule = { meta, mount };
export default mod;
