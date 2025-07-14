import { type Intersection } from "three/webgpu";
import type ModellingMesh from "./objects/ModellingMesh";
import { GetSelectionIndices } from "./GetSelectionIndices";
import { EDITING_MODE, EDITOR_MODE } from "./Types";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { GetCurrentEditorMode } from "../ui/EditorModeMenu//ChangeModeDropdown";

export class ModellingHelper {
  private currentObject: ModellingMesh | null;
  private editingMode: number;

  constructor() {
    this.currentObject = null;
    this.editingMode = EDITING_MODE.Faces;
  }

  setEditingMode(mode: number) {
    this.editingMode = mode;
  }

  getCurrentObject(): ModellingMesh | null {
    return this.currentObject;
  }

  setCurrentObjectToEditMode(object: ModellingMesh) {
    this.currentObject = object;
    object.changeToModelling();
  }

  handleIntersectionChange(intersections: Array<Intersection>) {

    const currentMode = GetCurrentEditorMode();

    if (currentMode !== EDITOR_MODE.EditMode) return;

    this.handleEditModeIntersectionChange(intersections);

  }

  private handleEditModeIntersectionChange(intersections: Array<Intersection>) {
    if (!this.currentObject) {
      return;
    }
    let indices: Array<number> = [];
    // more intersections means multi select
    if (intersections.length > 1) {
      indices = this.currentObject.getHighlightedIndices();
    }
    intersections.forEach((intersection) => {
      indices = indices.concat(GetSelectionIndices(intersection, this.editingMode));
    });
    indices = Array.from(new Set(indices));
    this.currentObject.clearHighlightedVertices();
    this.currentObject.highlightVertices(indices);
    const helper = this.currentObject.getTransformHelper();
    if (helper) {
      // First I 'reset' the selection and then reselect the helper
      editorEventBus.emit(EDITOR_EVENT.SelectObject, -1);
      editorEventBus.emit(EDITOR_EVENT.SelectObject, helper.id);
    }
  }

  clearObject() {
    if (!this.currentObject) {
      return;
    }
    this.currentObject.changeToNormalMode();
    this.currentObject = null;
    this.editingMode = EDITING_MODE.Faces;
  }

}
