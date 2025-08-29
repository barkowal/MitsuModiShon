import { Line2, LineGeometry, LineSegments2, LineSegmentsGeometry } from "three/examples/jsm/Addons.js";
import { type BufferGeometry, Line2NodeMaterial, Vector3, Object3D, Line3, type JSONMeta, type Object3DJSON } from "three/webgpu";
import { DEFAULT_LINE_WIDTH, EDITOR_LAYER, RENDER_LAYER } from "../Global";

export class ModellingOutline extends Object3D {
  private objectsGeometry: BufferGeometry;
  private lineMaterial: Line2NodeMaterial | null;
  private lineWidth: number;
  private lineColor: number;
  private outline: LineSegments2 | null;

  private currentLines: Array<Array<number>>;
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
    this.currentLines = [];
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

      this.lineMaterial = new Line2NodeMaterial({ color: this.lineColor, linewidth: this.lineWidth, dashed: false });

      this.outline = null;
      this.lineSet = new Set();
      this.currentLines = [];
      this.highlightedLines = [];
      this.name = "ModellingOutline";

      this.createOutlineFromVerticesGroups(source.currentLines);
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

    this.currentLines.forEach((verticesGroup) => {
      this.createLine(verticesGroup);
    });

  }

  createOutlineFromVerticesGroups(verticesGroups: Array<Array<number>>) {
    verticesGroups.forEach(
      (vertices) => {
        this.highlightEdge(vertices);
      }
    );

    this.createOutline();
    this.addOutline();
  }

  highlightEdge(vertices: Array<number>) {
    if (!this.lineMaterial) {
      this.lineMaterial = new Line2NodeMaterial({ color: this.lineColor, linewidth: this.lineWidth, dashed: false });
    }

    this.createLine(vertices);
  }

  clearHighligtedEdge(vertices: Array<number>) {
    let lineIndex: number = -1;

    this.currentLines.forEach((verticesGroup, i) => {
      if (verticesGroup[0] === vertices[0] && verticesGroup[1] === vertices[1]) {
        lineIndex = i;
      }
    });

    if (lineIndex === -1) return;

    this.removeLineFromSet(vertices);
    this.currentLines.splice(lineIndex, 1);

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
      this.lineMaterial = new Line2NodeMaterial({ color: hexColor, linewidth: this.lineWidth, dashed: false });
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
    this.lineMaterial.linewidth = width;
  }

  getLineWidth() {
    return this.lineWidth;
  }

  isOutlineInScene(): boolean {
    if (!this.outline) return false;
    if (this.getObjectById(this.outline.id)) return true;
    return false;
  }

  private createLine(vertices: Array<number>) {
    if (!this.isLineUnique(vertices)) return;

    const line = this.getLineFromVertices(vertices);
    const geometry = new LineGeometry();
    geometry.setFromPoints([line.start, line.end]);

    // @ts-expect-error type error
    const highlightedLine = new Line2(geometry, this.lineMaterial);

    this.highlightedLines.push(highlightedLine);
    this.add(highlightedLine);
    this.addLineToSet(vertices);
    this.currentLines.push(vertices);
  }

  private createLineSegments() {
    if (!this.lineMaterial) {
      this.lineMaterial = new Line2NodeMaterial({ color: this.lineColor, linewidth: this.lineWidth, dashed: false });
    }

    const positions: Array<number> = [];

    this.currentLines.forEach((verticesGroup) => {
      const line = this.getLineFromVertices(verticesGroup);
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

  private getLineFromVertices(vertices: Array<number>): Line3 {
    const start = new Vector3();
    const end = new Vector3();

    const positionAttribute = this.objectsGeometry.getAttribute("position");

    start.fromBufferAttribute(positionAttribute, vertices[0]);
    end.fromBufferAttribute(positionAttribute, vertices[1]);

    return new Line3(start, end);
  }

  private addLineToSet(vertices: Array<number>) {
    const hash1 = `${vertices[0]}-${vertices[1]}`;
    const hash2 = `${vertices[1]}-${vertices[0]}`;

    this.lineSet.add(hash1);
    this.lineSet.add(hash2);
  }

  private removeLineFromSet(vertices: Array<number>) {
    const hash1 = `${vertices[0]}-${vertices[1]}`;
    const hash2 = `${vertices[1]}-${vertices[0]}`;

    this.lineSet.delete(hash1);
    this.lineSet.delete(hash2);
  }

  private isLineUnique(vertices: Array<number>) {
    const hash1 = `${vertices[0]}-${vertices[1]}`;
    const hash2 = `${vertices[1]}-${vertices[0]}`;

    if (this.lineSet.has(hash1) === true || this.lineSet.has(hash2) === true) {
      return false;
    } else {
      return true;
    }

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
        currentLines: this.currentLines,
        lineColor: this.lineColor,
      }
    };

    return data;
  }


}
