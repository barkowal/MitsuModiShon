import { Vector3, type Intersection } from "three/webgpu";
import type ModellingMesh from "./objects/ModellingMesh";
import { EDITING_MODE, EDITOR_MODE, PAINTING_MODE, type Vec3 } from "./Types";
import { GetCurrentEditorMode } from "../ui/EditorModeMenu/ChangeModeDropdown";
import { GetSelectionIndices } from "./GetSelectionIndices";
import { DEFAULT_LINE_OFFSET, DEFAULT_LINE_WIDTH } from "./Global";
import { convertHexColorToVec3, convertVec3ToHexColor } from "./utils";

export class PaintingHelper {
  private currentObject: ModellingMesh | null;

  private paintingMode: number;
  private coloredVertices: Array<number>;
  private linePoints: Array<Vector3>;
  private currentBrushColor: Vec3;
  private lineOffset: number;
  private outlineWidth: number;
  private shouldClearLines: boolean;

  constructor() {
    this.currentObject = null;

    this.paintingMode = PAINTING_MODE.VertexColor;
    this.coloredVertices = [];

    this.linePoints = [];
    this.currentBrushColor = { x: 0, y: 0, z: 0 };
    this.lineOffset = DEFAULT_LINE_OFFSET;
    this.outlineWidth = DEFAULT_LINE_WIDTH;
    this.shouldClearLines = false;
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

    if (this.paintingMode === PAINTING_MODE.DrawOutline) {
      this.handleOutlineModeIntersectionChange(intersection);
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

  private handleOutlineModeIntersectionChange(intersection: Intersection) {
    if (!this.currentObject) {
      return;
    }

    let indices: Array<number> = [];

    indices = indices.concat(GetSelectionIndices(intersection, EDITING_MODE.Edges));
    indices = Array.from(new Set(indices));

    if (indices.length === 0) return;

    const modellingOutline = this.currentObject.getModellingOutline();
    if (!modellingOutline) return;

    if (this.shouldClearLines) {
      modellingOutline.clearHighligtedEdge(indices);
    } else {
      modellingOutline.highlightEdge(indices);
    }
  }

  getCurrentObject(): ModellingMesh | null {
    return this.currentObject;
  }

  setCurrentObjectToPaintMode(object: ModellingMesh) {
    this.currentObject = object;

    const modellingOutline = object.getModellingOutline();
    if (modellingOutline) {
      const hexColor = convertHexColorToVec3(modellingOutline.getLineColor());
      this.setBrushColor(hexColor);
      this.outlineWidth = modellingOutline.getLineWidth();
      this.lineOffset = DEFAULT_LINE_OFFSET;
    }
  }

  getPaintingMode() {
    return this.paintingMode;
  }

  setPaintingMode(mode: number) {
    this.paintingMode = mode;

    if (!this.currentObject) return;

    this.currentObject.changeToNormalMode();

    if (mode === PAINTING_MODE.DrawOutline) {
      this.currentObject.changeToOutlinePainting();
    }
  }

  setBrushColor(color: Vec3) {
    this.currentBrushColor = color;
    if (this.paintingMode === PAINTING_MODE.DrawOutline) {
      if (!this.currentObject) return;
      const modellingOutline = this.currentObject.getModellingOutline();
      modellingOutline?.setLineColor(convertVec3ToHexColor(color));
    }
  }

  getBrushColor() {
    return this.currentBrushColor;
  }

  getLineOffset() {
    return this.lineOffset;
  }

  setLineOffset(offset: number) {
    this.lineOffset = offset;
  }

  setOutlineWidth(width: number) {
    this.outlineWidth = width;
    if (this.paintingMode === PAINTING_MODE.DrawOutline) {
      if (!this.currentObject) return;
      const modellingOutline = this.currentObject.getModellingOutline();
      modellingOutline?.setLineWidth(width);
    }
  }

  getOutlineWidth() {
    return this.outlineWidth;
  }

  setShouldClearLines(val: boolean) {
    this.shouldClearLines = val;
  }

  getShouldClearLines() {
    return this.shouldClearLines;
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
