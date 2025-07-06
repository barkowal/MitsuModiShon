import type ModellingMesh from "../utils/objects/ModellingMesh";
import type { Vec3 } from "../utils/Types";
import type { Command } from "./CommandInterface";

export class TranslateModellingVertices implements Command {
    private object: ModellingMesh;
    private indices: Array<number>;
    private distance: Vec3;

    constructor(object: ModellingMesh, distance: Vec3, indices: Array<number>) {
        this.object = object;
        this.distance = distance;
        this.indices = indices;
    }

    execute() {
        this.object.clearHighlightedVertices();
        this.object.highlightVertices(this.indices);
        this.object.translateVertices(this.distance);
        this.object.repositionTransformHelper();
    }

    undo() {
        const oppositeDistance = {
            x: this.distance.x * -1,
            y: this.distance.y * -1,
            z: this.distance.z * -1
        };
        this.object.clearHighlightedVertices();
        this.object.highlightVertices(this.indices);
        this.object.translateVertices(oppositeDistance);
        this.object.repositionTransformHelper();
    }

    destroy(): void {
    }


}
