import type { ListenerHandler } from "./Types";

const eventHandlers: Array<ListenerHandler> = [];

export function AddListener(node: Node | Window, event: string, handler: EventListenerOrEventListenerObject, capture = false) {
  eventHandlers.push({ node: node, event, handler: handler, capture: capture });
  node.addEventListener(event, handler, capture);
}

export function RemoveAllListeners() {
  eventHandlers.forEach((listener) => {
    listener.node.removeEventListener(listener.event, listener.handler, listener.capture);
  });
}
