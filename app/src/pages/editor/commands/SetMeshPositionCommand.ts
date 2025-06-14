import type { Vec3 } from "../utils/Types";
import { convertTVector3ToVec3 } from "../utils/utils";
import type { Command } from "./CommandInterface";
import { Mesh } from "three/webgpu";

export class SetMeshPositionCommand implements Command {
    private mesh;
    private newPosition: Vec3;
    private oldPosition: Vec3;

    constructor(mesh: Mesh, newPosition: Vec3) {
        this.mesh = mesh;
        this.oldPosition = convertTVector3ToVec3(mesh.position);
        this.newPosition = newPosition;
    }

    execute() {
        this.mesh.position.set(
            this.newPosition.x,
            this.newPosition.y,
            this.newPosition.z,
        );
    }

    undo() {
        this.mesh.position.set(
            this.oldPosition.x,
            this.oldPosition.y,
            this.oldPosition.z,
        );
    }

    destroy(): void {
    }

}
