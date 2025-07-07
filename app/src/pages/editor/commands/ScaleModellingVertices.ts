import type ModellingMesh from "../utils/objects/ModellingMesh";
import type { Vec3 } from "../utils/Types";
import type { Command } from "./CommandInterface";

export class ScaleModellingVertices implements Command {
    private object: ModellingMesh;
    private indices: Array<number>;
    private scale: Vec3;

    constructor(object: ModellingMesh, scale: Vec3, indices: Array<number>) {
        this.object = object;
        this.scale = scale;
        this.indices = indices;
    }

    execute() {
        this.object.clearHighlightedVertices();
        this.object.highlightVertices(this.indices);
        this.object.scaleVertices(this.scale);
    }

    undo() {
        const oppositeScale = {
            x: this.scale.x * -1,
            y: this.scale.y * -1,
            z: this.scale.z * -1
        };

        this.object.clearHighlightedVertices();
        this.object.highlightVertices(this.indices);
        this.object.scaleVertices(oppositeScale);
    }

    destroy(): void {
    }


}
