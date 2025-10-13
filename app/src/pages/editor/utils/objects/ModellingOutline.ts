import { Line2, LineGeometry, LineSegments2, LineSegmentsGeometry } from "three/examples/jsm/Addons.js";
import { type BufferGeometry, Line2NodeMaterial, Vector3, Object3D, Line3, type JSONMeta, type Object3DJSON } from "three/webgpu";
import { DEFAULT_LINE_WIDTH, EDITOR_LAYER, RENDER_LAYER } from "../Global";
import { arraysAreEqual } from "@/lib/utils";

const LINEWIDTH_DIVISOR = 256;

export class ModellingOutline extends Object3D {
  private objectsGeometry: BufferGeometry;
  private lineMaterial: Line2NodeMaterial | null;
  private lineWidth: number;
  private lineColor: number;
  private outline: LineSegments2 | null;
  private currentStartLines: Array<Array<number>>;
  private currentEndLines: Array<Array<number>>;
  private lineSet: Set<string>;

  private highlightedLines: Array<Line2>;

  constructor(objectsGeometry: BufferGeometry) {
    super();

    //@ts-expect-error override
    this.type = "ModellingOutline";

    this.objectsGeometry = objectsGeometry;
    this.lineMaterial = null;
    this.lineWidth = DEFAULT_LINE_WIDTH;
    this.lineColor = 0x000000;
    this.outline = null;
    this.lineSet = new Set();
    this.currentStartLines = [];
    this.currentEndLines = [];
    this.highlightedLines = [];
    this.name = "ModellingOutline";
  }

  // TODO, it should be invoked only after copying/creation
  setObjectsGeometry(objectsGeometry: BufferGeometry) {
    this.objectsGeometry = objectsGeometry;
  }

  copy(source: Object3D): this {
    // It shouldn't create copies of children, instead it creates them here
    super.copy(source, false);

    if (source instanceof ModellingOutline) {
      //@ts-expect-error override
      this.type = "ModellingOutline";
      this.lineWidth = source.lineWidth.valueOf();
      this.lineColor = source.lineColor.valueOf();

      this.objectsGeometry = source.objectsGeometry;

      this.createDefaultLineMaterial();

      this.outline = null;
      this.lineSet = new Set();
      this.currentStartLines = [];
      this.currentEndLines = [];
      this.highlightedLines = [];
      this.name = "ModellingOutline";

      this.createOutlineFromVerticesGroups(source.currentStartLines, source.currentEndLines);
    }

    return this;
  }

  createOutline() {
    if (this.highlightedLines.length === 0) return;

    if (this.outline) {
      this.disposeOutline();
    }

    this.outline = this.createLineSegments();

    if (this.layers.isEnabled(EDITOR_LAYER))
      this.outline.layers.enable(EDITOR_LAYER);

    if (this.layers.isEnabled(RENDER_LAYER))
      this.outline.layers.enable(RENDER_LAYER);

    this.clearAllHightlightedEdges();
  }

  addOutline() {
    if (!this.outline) return;

    if (this.isOutlineInScene()) return;

    this.add(this.outline);
  }

  removeOutline() {
    if (!this.outline) return;
    if (!(this.isOutlineInScene())) return;

    this.remove(this.outline);
  }

  disposeOutline() {
    if (!this.outline) return;

    this.remove(this.outline);
    this.outline.geometry.dispose();
    this.outline = null;
    this.lineSet.clear();
  }

  dispose() {
    this.clearAllHightlightedEdges();
    this.disposeOutline();
    this.lineMaterial?.dispose();
  }

  makeOutlineEditable() {
    this.disposeOutline();

    this.currentStartLines.forEach((_, i) => {
      this.createLine(this.currentStartLines[i], this.currentEndLines[i]);
    });

  }

  createOutlineFromVerticesGroups(verticesGroupsStart: Array<Array<number>>, verticesGroupsEnd: Array<Array<number>>) {

    verticesGroupsStart.forEach(
      (_, i) => {
        this.highlightEdge(verticesGroupsStart[i], verticesGroupsEnd[i]);
      }
    );

    this.createOutline();
    this.addOutline();
  }

  highlightEdge(verticesStart: Array<number>, verticesEnd: Array<number>) {
    if (!this.lineMaterial) {
      this.createDefaultLineMaterial();
    }

    this.createLine(verticesStart, verticesEnd);

  }

  clearHighligtedEdge(verticesStart: Array<number>, verticesEnd: Array<number>) {
    let lineIndex: number = -1;

    for (let i = 0; i < this.currentStartLines.length; i++) {

      if (arraysAreEqual(verticesStart, this.currentStartLines[i]) && arraysAreEqual(verticesEnd, this.currentEndLines[i])) {
        lineIndex = i;
        break;
      }

    }

    if (lineIndex === -1) return;

    this.removeLineFromSet(verticesStart, verticesEnd);
    this.currentStartLines.splice(lineIndex, 1);
    this.currentEndLines.splice(lineIndex, 1);

    const highlightedLine = this.highlightedLines.at(lineIndex);
    this.highlightedLines.splice(lineIndex, 1);

    if (!highlightedLine) return;

    this.remove(highlightedLine);
    highlightedLine.geometry.dispose();
  }

  clearAllHightlightedEdges() {
    this.highlightedLines.forEach(
      (line) => {
        line.geometry.dispose();
        this.remove(line);
      }
    );
    this.highlightedLines = [];
  }

  shouldOutlineBeCreated(): boolean {
    if (this.highlightedLines.length > 0) return true;
    return false;
  }

  setLineColor(hexColor: number) {
    this.lineColor = hexColor;
    if (!this.lineMaterial) {
      this.createDefaultLineMaterial();
    } else {
      this.lineMaterial.color.setHex(hexColor);
    }
  }

  getLineColor() {
    return this.lineColor;
  }

  setLineWidth(width: number) {
    this.lineWidth = width;
    if (!this.lineMaterial) {
      return;
    }
    this.lineMaterial.linewidth = width / LINEWIDTH_DIVISOR;
  }

  getLineWidth() {
    return this.lineWidth;
  }

  isOutlineInScene(): boolean {
    if (!this.outline) return false;
    if (this.getObjectById(this.outline.id)) return true;
    return false;
  }

  private createLine(verticesStart: Array<number>, verticesEnd: Array<number>) {
    if (!this.isLineUnique(verticesStart, verticesEnd)) return;

    const line = this.getLineFromVertices(verticesStart, verticesEnd);
    const geometry = new LineGeometry();
    geometry.setFromPoints([line.start, line.end]);

    // @ts-expect-error type error
    const highlightedLine = new Line2(geometry, this.lineMaterial);

    this.highlightedLines.push(highlightedLine);
    this.add(highlightedLine);
    this.addLineToSet(verticesStart, verticesEnd);
    this.currentStartLines.push(verticesStart);
    this.currentEndLines.push(verticesEnd);

  }

  private createLineSegments() {
    if (!this.lineMaterial) {
      this.createDefaultLineMaterial();
    }

    const positions: Array<number> = [];

    this.currentStartLines.forEach((_, i) => {
      const line = this.getLineFromVertices(this.currentStartLines[i], this.currentEndLines[i]);
      positions.push(line.start.x, line.start.y, line.start.z);
      positions.push(line.end.x, line.end.y, line.end.z);
    });

    const segmentsGeometry = new LineSegmentsGeometry();
    segmentsGeometry.setPositions(positions);

    // @ts-expect-error type error
    const segments = new LineSegments2(segmentsGeometry, this.lineMaterial);
    segments.computeLineDistances();
    segments.scale.set(1, 1, 1);
    segments.name = "Outline";

    return segments;
  }

  private getLineFromVertices(verticesStart: Array<number>, verticesEnd: Array<number>): Line3 {
    const start = new Vector3();
    const end = new Vector3();

    const positionAttribute = this.objectsGeometry.getAttribute("position");

    // Vertices should have the same position, so there is no need for getting different position attributes for each vert
    start.fromBufferAttribute(positionAttribute, verticesStart[0]);
    end.fromBufferAttribute(positionAttribute, verticesEnd[0]);

    return new Line3(start, end);
  }

  private addLineToSet(verticesStart: Array<number>, verticesEnd: Array<number>) {

    const hash1 = `${verticesStart.sort()}-${verticesEnd.sort()}`;
    const hash2 = `${verticesEnd.sort()}-${verticesStart.sort()}`;

    this.lineSet.add(hash1);
    this.lineSet.add(hash2);
  }

  private removeLineFromSet(verticesStart: Array<number>, verticesEnd: Array<number>) {
    const hash1 = `${verticesStart.sort()}-${verticesEnd.sort()}`;
    const hash2 = `${verticesEnd.sort()}-${verticesStart.sort()}`;

    this.lineSet.delete(hash1);
    this.lineSet.delete(hash2);
  }

  private isLineUnique(verticesStart: Array<number>, verticesEnd: Array<number>) {
    const hash1 = `${verticesStart.sort()}-${verticesEnd.sort()}`;
    const hash2 = `${verticesEnd.sort()}-${verticesStart.sort()}`;

    if (this.lineSet.has(hash1) === true || this.lineSet.has(hash2) === true) {
      return false;
    } else {
      return true;
    }

  }

  // TODO: polygonoffset could be changable by the user, the look depends on linewidth
  private createDefaultLineMaterial() {
    this.lineMaterial = new Line2NodeMaterial({
      color: this.lineColor,
      polygonOffset: true,
      polygonOffsetFactor: -6.0, // Polygon settings for z-index fighting, might still need tweaking
      polygonOffsetUnits: 0.8,
      linewidth: this.lineWidth / LINEWIDTH_DIVISOR,
      dashed: false,
      worldUnits: true
    });
  }

  // Custom to json for only mandatory things for modelling outline
  // Modelling Outline should always be a child to modelling mesh, so meta is mandatory
  // Modelling Outline shouldn't have any children except line segment, so data doesn't contain any children
  toJSON(meta: JSONMeta): Object3DJSON {
    const objectGeometryJSON = meta.geometries[this.objectsGeometry.uuid] ? this.objectsGeometry.uuid : this.objectsGeometry.toJSON();

    const data = {
      metadata: {
        version: 4.7,
        type: "ModellingOutline",
        generator: "ModellingOutline.toJSON"
      },
      object: {
        uuid: this.uuid,
        type: this.type,
        up: this.up.toArray(),
        layers: this.layers.mask,
        matrix: this.matrix.toArray(),
        objectsGeometry: objectGeometryJSON,
        name: this.name,
        lineWidth: this.lineWidth,
        currentStartLines: this.currentStartLines,
        currentEndLines: this.currentEndLines,
        lineColor: this.lineColor,
      }
    };

    return data;
  }

}
