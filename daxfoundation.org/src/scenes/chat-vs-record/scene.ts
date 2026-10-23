// Shared implementation for the `chat-vs-record` scene (board 02). D3 7.9 data joins
// over SVG. index.ts animates, fallback.ts does not. Colours from `tokens`, text from
// `params.labels`. Only d3-selection is imported, to keep the bundle small.
import { select, type Selection } from "d3-selection";
import type { SceneHandle, SceneParams, SceneTokens } from "../contract";
import { clamp01, segment } from "../contract";

const NS = "http://www.w3.org/2000/svg";
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const THREAD_X = 300;
const Y0 = 90;
const Y1 = 360;

interface NodeDatum {
  i: number;
  text: string;
  y: number;
  kind: "record" | "guide" | "learner";
  full: number; // full radius
}

export function createChatVsRecordScene(
  el: HTMLElement,
  params: SceneParams,
  tokens: SceneTokens,
  opts: { animated: boolean },
): SceneHandle {
  const L = params.labels;
  const reduced = params.reducedMotion || !opts.animated;
  const texts = Array.isArray(L.nodes) ? L.nodes : L.nodes == null ? [] : [String(L.nodes)];
  const s = (v: string | string[] | undefined, d = ""): string =>
    Array.isArray(v) ? v.join(", ") : (v ?? d);

  const root = document.createElementNS(NS, "svg");
  root.setAttribute("viewBox", "0 0 390 440");
  root.setAttribute("width", "100%");
  root.setAttribute("height", "100%");
  root.setAttribute("preserveAspectRatio", "xMidYMid meet");
  root.setAttribute("role", "img");
  root.setAttribute("aria-label", `${s(L.chat, "A chat")} versus the record`);
  (root as unknown as HTMLElement).style.display = "block";
  el.appendChild(root);

  const d3root = select(root) as Selection<SVGSVGElement, unknown, null, undefined>;

  // Left: the chat bubble (rounded rect, inkFaint stroke, three line rects).
  const chat = d3root.append("g").attr("class", "chat");
  chat.append("rect")
    .attr("x", 28).attr("y", 90).attr("width", 150).attr("height", 104).attr("rx", 12)
    .attr("fill", tokens.surface).attr("stroke", tokens.inkFaint).attr("stroke-width", 1.5);
  chat.append("path")
    .attr("d", "M 44 194 L 44 214 L 64 194 Z")
    .attr("fill", tokens.surface).attr("stroke", tokens.inkFaint).attr("stroke-width", 1.5);
  [0, 1, 2].forEach((r) =>
    chat.append("rect")
      .attr("x", 44).attr("y", 112 + r * 22).attr("width", r === 2 ? 70 : 118).attr("height", 8).attr("rx", 4)
      .attr("fill", tokens.inkFaint).attr("opacity", 0.5));
  const mk = (x: number, y: number, t: string, fill: string, size: number, w = 400) =>
    chat.append("text").attr("x", x).attr("y", y).attr("text-anchor", "middle")
      .attr("font-size", size).attr("font-weight", w).attr("font-family", FONT)
      .attr("fill", fill).text(t);
  mk(103, 236, s(L.chat, "A chat"), tokens.ink, 14, 500);
  mk(103, 254, s(L.chatNote), tokens.inkMuted, 11);
  mk(103, 272, s(L.chatRole), tokens.inkFaint, 10);

  // Right: the vertical record thread (role="list") and its nodes.
  const threadG = d3root.append("g").attr("role", "list");
  threadG.append("line")
    .attr("x1", THREAD_X).attr("y1", Y0).attr("x2", THREAD_X).attr("y2", Y1)
    .attr("stroke", tokens.record).attr("stroke-width", 2);

  const step = texts.length > 1 ? (Y1 - Y0) / (texts.length - 1) : 0;
  const data: NodeDatum[] = texts.map((text, i) => {
    const last = i === texts.length - 1;
    const guided = /guid/i.test(text);
    const kind: NodeDatum["kind"] = last ? "learner" : guided ? "guide" : "record";
    return { i, text, y: Y0 + i * step, kind, full: last ? 13 : guided ? 9 : 7 };
  });

  // D3 data join: one <g role="listitem"> per record node, with a <title>.
  const nodes = threadG.selectAll<SVGGElement, NodeDatum>("g.node")
    .data(data)
    .join((enter) => {
      const g = enter.append("g").attr("class", "node").attr("role", "listitem")
        .attr("transform", (d) => `translate(${THREAD_X},${d.y})`);
      g.append("title").text((d) => d.text);
      // Learner halo (only the last node).
      g.filter((d) => d.kind === "learner").append("circle")
        .attr("class", "halo").attr("r", 22).attr("fill", tokens.learnerSoft).attr("opacity", 0);
      g.append("circle").attr("class", "dot").attr("r", 0)
        .attr("fill", (d) => d.kind === "learner" ? tokens.learner : d.kind === "guide" ? tokens.guide : tokens.record);
      g.append("text").attr("class", "lbl")
        .attr("x", -18).attr("y", 4).attr("text-anchor", "end")
        .attr("font-size", 11).attr("font-family", FONT)
        .attr("fill", (d) => d.kind === "learner" ? tokens.learner : d.kind === "guide" ? tokens.guide : tokens.inkMuted)
        .attr("opacity", 0).text((d) => d.text);
      return g;
    });

  // recordRole under the last node.
  const roleLabel = d3root.append("text")
    .attr("x", THREAD_X).attr("y", Y1 + 28).attr("text-anchor", "middle")
    .attr("font-size", 11).attr("font-weight", 500).attr("font-family", FONT)
    .attr("fill", tokens.learner).attr("opacity", 0).text(s(L.recordRole, "the body"));

  function render(t: number) {
    // Chat fades 0.9 -> 0.3.
    chat.attr("opacity", 0.9 - 0.6 * clamp01(t));
    let lastK = 0;
    nodes.each(function (d) {
      const k = segment(t, d.i * 0.15, d.i * 0.15 + 0.15);
      const g = select(this);
      g.select<SVGCircleElement>("circle.dot").attr("r", d.full * k);
      g.select("text.lbl").attr("opacity", k);
      if (d.kind === "learner") { g.select("circle.halo").attr("opacity", k); lastK = k; }
    });
    roleLabel.attr("opacity", lastK);
  }

  let raf = 0, paused = false, current = 0;
  const cancel = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
  function tweenTo(target: number) {
    cancel();
    if (reduced) {
      (root as unknown as HTMLElement).style.transition = "opacity 300ms ease";
      (root as unknown as HTMLElement).style.opacity = "0.001";
      render(target); current = target;
      requestAnimationFrame(() => { (root as unknown as HTMLElement).style.opacity = "1"; });
      return;
    }
    const from = current, start = performance.now(), dur = 600;
    const tick = (now: number) => {
      if (paused) { raf = 0; return; }
      const k = Math.min(1, (now - start) / dur);
      current = from + (target - from) * k;
      render(current);
      raf = k < 1 ? requestAnimationFrame(tick) : 0;
    };
    raf = requestAnimationFrame(tick);
  }

  render(0);

  return {
    setProgress(t: number) { cancel(); current = clamp01(t); render(current); },
    setState(name: string) {
      if (name === "hidden") { paused = true; cancel(); return; }
      if (name === "visible") { paused = false; return; }
      const map: Record<string, number> = { chat: 0, record: 1 };
      if (name in map) tweenTo(map[name]);
    },
    resize() { /* viewBox scales. */ },
    destroy() { cancel(); root.remove(); },
  };
}
