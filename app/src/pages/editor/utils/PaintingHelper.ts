import type { Intersection, Vector3 } from "three/webgpu";
import type ModellingMesh from "./objects/ModellingMesh";
import { EDITING_MODE, EDITOR_MODE, PAINTING_MODE, type Vec3 } from "./Types";
import { GetCurrentEditorMode } from "../ui/EditorModeMenu/ChangeModeDropdown";
import { GetSelectionIndices } from "./GetSelectionIndices";
import { DEFAULT_LINE_OFFSET } from "./Global";

export class PaintingHelper {
  private currentObject: ModellingMesh | null;

  private paintingMode: number;
  private coloredVertices: Array<number>;
  private linePoints: Array<Vector3>;
  private currentBrushColor: Vec3;
  private lineOffset: number;

  constructor() {
    this.currentObject = null;

    this.paintingMode = PAINTING_MODE.VertexColor;
    this.coloredVertices = [];

    this.linePoints = [];
    this.currentBrushColor = { x: 0, y: 0, z: 0 };
    this.lineOffset = DEFAULT_LINE_OFFSET;
  }

  handleIntersectionChange(intersection: Intersection) {

    const currentMode = GetCurrentEditorMode();

    if (currentMode !== EDITOR_MODE.PaintMode) return;

    if (this.paintingMode === PAINTING_MODE.VertexColor) {
      this.handleVertexColorModeIntersectionChange(intersection);
    }

    if (this.paintingMode === PAINTING_MODE.DrawLine) {
      this.handleDrawLineModeIntersectionChange(intersection);
    }

  }


  private handleVertexColorModeIntersectionChange(intersection: Intersection) {
    if (!this.currentObject) {
      return;
    }
    let indices: Array<number> = [];

    indices = indices.concat(GetSelectionIndices(intersection, EDITING_MODE.Vertices));
    indices = Array.from(new Set(indices));

    if (indices.length === 0) return;

    const latestVertex = this.coloredVertices[this.coloredVertices.length - 1];
    if (latestVertex === indices[0]) return;

    this.coloredVertices = this.coloredVertices.concat(indices);
    this.currentObject.colorVertices(indices, this.currentBrushColor);
  }

  private handleDrawLineModeIntersectionChange(intersection: Intersection) {
    if (!this.currentObject) {
      return;
    }

    const drawPoint = intersection.point;

    if (intersection.normal)
      drawPoint.add(intersection.normal.multiplyScalar(this.lineOffset));

    if (this.linePoints.length === 0) {
      this.linePoints.push(drawPoint);
    } else {
      const lastPoint = this.linePoints[this.linePoints.length - 1];
      if (lastPoint.distanceTo(drawPoint) > 0.05) {
        this.linePoints.push(drawPoint);
      }
    }
  }

  getCurrentObject(): ModellingMesh | null {
    return this.currentObject;
  }

  setCurrentObjectToPaintMode(object: ModellingMesh) {
    this.currentObject = object;
    object.changeToPainting();
  }

  getPaintingMode() {
    return this.paintingMode;
  }

  setPaintingMode(mode: number) {
    this.paintingMode = mode;
  }

  setBrushColor(color: Vec3) {
    this.currentBrushColor = color;
  }

  getBrushColor() {
    return this.currentBrushColor;
  }

  setLineOffset(offset: number) {
    this.lineOffset = offset;
  }

  getColoredVertices() {
    return this.coloredVertices;
  }

  resetColoredVertices() {
    this.coloredVertices = [];
  }

  getLinePoints() {
    return this.linePoints;
  }

  resetLinePoints() {
    this.linePoints = [];
  }

  clearObject() {
    if (!this.currentObject) {
      return;
    }
    this.currentObject.changeToNormalMode();
    this.currentObject = null;
    this.currentBrushColor = { x: 0, y: 0, z: 0 };
    this.paintingMode = PAINTING_MODE.VertexColor;
    this.lineOffset = DEFAULT_LINE_OFFSET;
  }

}
