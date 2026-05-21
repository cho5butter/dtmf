import { Window } from "happy-dom";

const window = new Window({ url: "http://localhost/dtmf/" });
const g = globalThis as typeof globalThis & Record<string, unknown>;

g.window = window;
g.document = window.document;
g.localStorage = window.localStorage;
g.navigator = window.navigator;
g.requestAnimationFrame = (cb: FrameRequestCallback) => window.requestAnimationFrame(cb);
g.cancelAnimationFrame = (id: number) => window.cancelAnimationFrame(id);

const domNames = [
  "Element",
  "SVGElement",
  "HTMLElement",
  "Node",
  "Text",
  "Document",
  "DocumentFragment",
  "Event",
  "CustomEvent",
  "MouseEvent",
  "PointerEvent",
  "KeyboardEvent",
] as const;

for (const name of domNames) {
  const value = (window as unknown as Record<string, unknown>)[name];
  if (value) g[name] = value;
}
