import type { KeyboardEvent } from "react";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";

export function HandleKeyboardPress(e: KeyboardEvent) {
  if (e.ctrlKey) {
    handleCtrlShortcuts(e);
    return;
  }

  if (e.key === "Delete") { editorEventBus.emit(EDITOR_EVENT.RemoveMesh); };
  if (e.key === "Escape") { editorEventBus.emit(EDITOR_EVENT.ClearSelections); };
}

function handleCtrlShortcuts(e: KeyboardEvent) {
  if (e.key === "z") { editorEventBus.emit(EDITOR_EVENT.UNDO); };
  if (e.key === "y") { editorEventBus.emit(EDITOR_EVENT.REDO); };
  if (e.key === "c") { editorEventBus.emit(EDITOR_EVENT.COPY); };
  if (e.key === "v") { editorEventBus.emit(EDITOR_EVENT.PASTE); };
}

