import type { KeyboardEvent } from "react";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";

export function HandleKeyboardPress(e: KeyboardEvent) {
  if (e.ctrlKey) {
    handleCtrlShortcuts(e);
    return;
  }

  if (e.key === "Delete") { editorEventBus.emit(EDITOR_EVENT.RemoveMesh); };
}

function handleCtrlShortcuts(e: KeyboardEvent) {
  if (e.key === "z") { editorEventBus.emit(EDITOR_EVENT.UNDO); };
  if (e.key === "y") { editorEventBus.emit(EDITOR_EVENT.REDO); };
}

