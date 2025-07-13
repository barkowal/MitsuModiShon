import type { Intersection } from "three/webgpu";
import type ModellingMesh from "./objects/ModellingMesh";
import { GetSelectionIndices } from "./GetSelectionIndices";
import { EDITING_MODE, EDITOR_MODE, type Vec3 } from "./Types";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { GetCurrentEditorMode } from "../ui/EditorModeMenu//ChangeModeDropdown";

export class ModellingHelper {
  private currentObject: ModellingMesh | null;
  private editingMode: number;
  private currentBrushColor: Vec3;
  private coloredVertices: Array<number>;

  constructor() {
    this.currentObject = null;
    this.editingMode = EDITING_MODE.Faces;
    this.currentBrushColor = { x: 0, y: 0, z: 0 };
    this.coloredVertices = [];
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

  setCurrentObjectToPaintMode(object: ModellingMesh) {
    this.currentObject = object;
    object.changeToPainting();
  }

  setBrushColor(color: Vec3) {
    this.currentBrushColor = color;
  }

  getBrushColor() {
    return this.currentBrushColor;
  }

  getColoredVertices() {
    return this.coloredVertices;
  }

  resetColoredVertices() {
    this.coloredVertices = [];
  }

  handleIntersectionChange(intersections: Array<Intersection>) {

    const currentMode = GetCurrentEditorMode();

    if (currentMode === EDITOR_MODE.EditMode) {
      this.handleEditModeIntersectionChange(intersections);
    }

    if (currentMode === EDITOR_MODE.PaintMode) {
      this.handlePaintModeIntersectionChange(intersections);
    }

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

  private handlePaintModeIntersectionChange(intersections: Array<Intersection>) {
    if (!this.currentObject) {
      return;
    }
    let indices: Array<number> = [];

    intersections.forEach((intersection) => {
      indices = indices.concat(GetSelectionIndices(intersection, EDITING_MODE.Vertices));
    });
    indices = Array.from(new Set(indices));

    if (indices.length === 0) return;

    const latestVertex = this.coloredVertices[this.coloredVertices.length - 1];
    if (latestVertex === indices[0]) return;

    this.coloredVertices = this.coloredVertices.concat(indices);
    this.currentObject.colorVertices(indices, this.currentBrushColor);
  }

  clearObject() {
    if (!this.currentObject) {
      return;
    }
    this.currentObject.changeToNormalMode();
    this.currentObject = null;
    this.clearAllSettings();
  }


  private clearAllSettings() {
    this.currentBrushColor = { x: 0, y: 0, z: 0 };
    this.editingMode = EDITING_MODE.Faces;
  }

}
