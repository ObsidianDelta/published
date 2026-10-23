// `chat-vs-record` scene (board 02), 2D fallback: D3 over SVG, animation disabled.
import type { SceneModule } from "../contract";
import { createChatVsRecordScene } from "./scene";

export const meta = { name: "chat-vs-record", states: ["chat", "record"], needsWebGL: false } as const;

export const mount: SceneModule["mount"] = (el, params, tokens) =>
  createChatVsRecordScene(el, params, tokens, { animated: false });

export default { meta, mount } satisfies SceneModule;
