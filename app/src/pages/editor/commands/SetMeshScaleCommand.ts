import type { Vec3 } from "../utils/Types";
import { convertTVector3ToVec3 } from "../utils/utils";
import type { Command } from "./CommandInterface";
import { Mesh } from "three/webgpu";

export class SetMeshScaleCommand implements Command {
    private mesh;
    private newScale: Vec3;
    private oldScale: Vec3;

    constructor(mesh: Mesh, newScale: Vec3) {
        this.mesh = mesh;
        this.oldScale = convertTVector3ToVec3(mesh.scale);
        this.newScale = newScale;
    }

    execute() {
        this.mesh.scale.set(
            this.newScale.x,
            this.newScale.y,
            this.newScale.z,
        );
    }

    undo() {
        this.mesh.scale.set(
            this.oldScale.x,
            this.oldScale.y,
            this.oldScale.z,
        );
    }

    destroy(): void {
    }

}
