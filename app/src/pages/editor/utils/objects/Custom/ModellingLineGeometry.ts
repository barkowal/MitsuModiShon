import { Vector2, Vector3, type BufferGeometryJSON } from "three";
import { LineGeometry } from "three/examples/jsm/Addons.js";

// Temporary class
// At the momemnt LineGeometry doesn't have toJSON() implemented
// TODO remove this class in the future
export class ModellingLineGeometry extends LineGeometry {
  private linePoints: Array<Vector3> | Array<Vector2>;

  constructor() {
    super();
    this.type = "ModellingLineGeometry";
    this.linePoints = [];
  }

  setFromPoints(points: Vector3[] | Vector2[]): this {
    super.setFromPoints(points);
    this.linePoints = points;
    return this;
  }

  // This is only the data I need to load modelling objects
  toJSON(): BufferGeometryJSON {
    const data: BufferGeometryJSON = {
      metadata: {
        version: 4.7,
        type: "ModellingLineGeometry",
        generator: "ModellingLineGeometry.toJSON"
      },
      uuid: this.uuid,
      type: this.type,
      name: this.name,
      userData: {
        "linePoints": this.linePoints,
      }
    };

    return data;
  }

}
