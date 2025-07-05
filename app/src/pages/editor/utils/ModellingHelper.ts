import type { Intersection } from "three/webgpu";
import type ModellingMesh from "./objects/ModellingMesh";
import { GetSelectionIndices } from "./GetSelectionIndices";

export class ModellingHelper {
  private currentObject: ModellingMesh | null;

  constructor() {
    this.currentObject = null;
  }

  getCurrentObject(): ModellingMesh | null {
    return this.currentObject;
  }

  setCurrentObject(object: ModellingMesh) {
    this.currentObject = object;
    object.changeToModelling();
  }

  handleIntersectionChange(intersections: Array<Intersection>) {
    let indices: Array<number> = [];
    intersections.forEach((intersection) => {
      indices = indices.concat(GetSelectionIndices(intersection, 0));
    });
    indices = Array.from(new Set(indices));
    this.currentObject?.clearHighlightedVertices();
    this.currentObject?.highlightVertices(indices);
  }

  clearObject() {
    if (!this.currentObject) {
      return;
    }
    this.currentObject.changeToNormalMode();
    this.currentObject = null;
  }

}
