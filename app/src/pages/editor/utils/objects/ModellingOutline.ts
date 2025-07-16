import { Line2, LineGeometry, LineSegments2, LineSegmentsGeometry } from "three/examples/jsm/Addons.js";
import { type BufferGeometry, Line2NodeMaterial, Vector3, Object3D, Line3 } from "three/webgpu";
import { DEFAULT_LINE_WIDTH } from "../Global";

export class ModellingOutline extends Object3D {
  private objectsGeometry: BufferGeometry;
  private lineMaterial: Line2NodeMaterial | null;
  private lineWidth: number;
  private outline: LineSegments2 | null;
  private edges: Set<string>;
  private linePositions: Array<Line3>;
  private highlightedLines: Array<Line2>;

  constructor(objectsGeometry: BufferGeometry) {
    super();
    this.objectsGeometry = objectsGeometry;
    this.lineMaterial = null;
    this.lineWidth = DEFAULT_LINE_WIDTH;
    this.outline = null;
    this.edges = new Set();
    this.linePositions = [];
    this.highlightedLines = [];
    this.name = "ModellingOutline";
  }

  createOutline() {
    if (this.highlightedLines.length === 0) return;

    if (this.outline) {
      this.disposeOutline();
    }

    this.outline = this.createLineSegments();
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
    this.edges.clear();
  }

  dispose() {
    this.clearAllHightlightedEdges();
    this.disposeOutline();
    this.lineMaterial?.dispose();
  }

  makeOutlineEditable() {
    this.disposeOutline();

    this.linePositions.forEach((line) => {
      this.createLine(line);
    });

  }

  highlightEdge(vertices: Array<number>) {
    if (!this.lineMaterial) {
      this.lineMaterial = new Line2NodeMaterial({ color: 0x000000, linewidth: this.lineWidth, dashed: false });
    }

    const line = this.getLineFromVertices(vertices);

    if (!this.isUniqueEdge(line.start, line.end)) {
      return;
    }

    this.linePositions.push(line);

    this.createLine(line);
  }


  clearHighligtedEdge(vertices: Array<number>) {
    const line = this.getLineFromVertices(vertices);
    let lineIndex: number = -1;


    this.linePositions.forEach(
      (linePos, i) => {
        if (linePos.start.equals(line.start) && linePos.end.equals(line.end)) {
          lineIndex = i;
        }
      }
    );

    if (lineIndex === -1) return;

    this.removeLineFromSet(line);

    this.linePositions.splice(lineIndex, 1);

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
    if (!this.lineMaterial) {
      this.lineMaterial = new Line2NodeMaterial({ color: 0x000000, linewidth: this.lineWidth, dashed: false });
    }
    this.lineMaterial.color.setHex(hexColor);
  }

  getLineColor() {
    if (this.lineMaterial) {
      return this.lineMaterial.color.getHex();
    }
    return 0x000000;
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

  private createLine(line: Line3) {
    const geometry = new LineGeometry();
    geometry.setFromPoints([line.start, line.end]);

    // @ts-expect-error type error
    const highlightedLine = new Line2(geometry, this.lineMaterial);

    this.addLineToSet(line);
    this.highlightedLines.push(highlightedLine);
    this.add(highlightedLine);
  }

  private createLineSegments() {
    if (!this.lineMaterial) {
      this.lineMaterial = new Line2NodeMaterial({ color: 0x000000, linewidth: this.lineWidth, dashed: false });
    }

    const positions: Array<number> = [];

    this.linePositions.forEach(
      (line) => {
        positions.push(line.start.x, line.start.y, line.start.z);
        positions.push(line.end.x, line.end.y, line.end.z);
      }
    );

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

  private addLineToSet(line: Line3) {
    const hash1 = `${line.start.x},${line.start.y},${line.start.z}-${line.end.x},${line.end.y},${line.end.z}`;
    const hash2 = `${line.end.x},${line.end.y},${line.end.z}-${line.start.x},${line.start.y},${line.start.z}`;

    this.edges.add(hash1);
    this.edges.add(hash2);
  }

  private removeLineFromSet(line: Line3) {
    const hash1 = `${line.start.x},${line.start.y},${line.start.z}-${line.end.x},${line.end.y},${line.end.z}`;
    const hash2 = `${line.end.x},${line.end.y},${line.end.z}-${line.start.x},${line.start.y},${line.start.z}`;
    this.edges.delete(hash1);
    this.edges.delete(hash2);
  }


  private isUniqueEdge(start: Vector3, end: Vector3) {

    const hash1 = `${start.x},${start.y},${start.z}-${end.x},${end.y},${end.z}`;
    const hash2 = `${end.x},${end.y},${end.z}-${start.x},${start.y},${start.z}`;

    if (this.edges.has(hash1) === true || this.edges.has(hash2) === true) {
      return false;
    } else {
      return true;
    }
  }


}
