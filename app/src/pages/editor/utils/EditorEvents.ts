import type { TreeItem, Vec3 } from "@/pages/editor/utils/Types";

export const EDITOR_EVENT = {
  AddMesh: "AddMesh",
  RefreshTreeView: "RefreshTreeView",
  RefreshTransformationMenu: "RefreshTransformationMenu",
  SelectObject: "SelectObject",
  ChangePosition: "ChangePosition",
  ChangeScale: "ChangeScale",
  ChangeRotation: "ChangeRotation",
  ChangeSceneColor: "ChangeSceneColor",
  UNDO: "Undo",
  REDO: "Redo",
} as const;

type ObjectValues<T> = T[keyof T]

type EditorEvent = ObjectValues<typeof EDITOR_EVENT>

type eventData =
  | number
  | string
  | boolean
  | Vec3
  | Array<Vec3>
  | Array<TreeItem>;

class EditorEventBus {
  private listeners: { [key: string]: CallableFunction[] };

  constructor() {
    this.listeners = {};
  }

  on(event: EditorEvent, callback: CallableFunction): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: EditorEvent, callback: CallableFunction): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (listener) => listener !== callback
      );
    }
  }

  emit(event: EditorEvent, data?: eventData): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((listener) => listener(data));
    }
  }
}

export const editorEventBus = new EditorEventBus();
