import type { ListenerHandler } from "./Types";

const eventHandlers: Array<ListenerHandler> = [];

export function AddListener(node: Node | Window, event: string, handler: EventListenerOrEventListenerObject, capture = false): number {
  const listenerID = eventHandlers.length;
  eventHandlers.push({ node: node, event: event, handler: handler, capture: capture });
  node.addEventListener(event, handler, capture);
  return listenerID;
}

export function RemoveListener(listenerID: number) {
  const listener = eventHandlers.at(listenerID);
  listener?.node.removeEventListener(listener.event, listener.handler, listener.capture);
  eventHandlers.splice(listenerID, 1);
}

export function RemoveAllListeners() {
  eventHandlers.forEach((listener) => {
    listener.node.removeEventListener(listener.event, listener.handler, listener.capture);
  });
}
