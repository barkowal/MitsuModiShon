import type { Vec3 } from "../utils/Types";
import type { Command } from "./CommandInterface";
import { Euler, Mesh } from "three/webgpu";

export class SetMeshRotationCommand implements Command {
    private mesh;
    private newRotation: Vec3;
    private oldRotation: Vec3;

    constructor(mesh: Mesh, newRotation: Vec3) {
        this.mesh = mesh;
        this.oldRotation = this.convertEulerToVec3(mesh.rotation);
        this.newRotation = newRotation;
    }

    execute() {
        this.mesh.rotation.set(
            this.newRotation.x * (Math.PI / 180),
            this.newRotation.y * (Math.PI / 180),
            this.newRotation.z * (Math.PI / 180),
        );
    }

    undo() {
        this.mesh.rotation.set(
            this.oldRotation.x * (Math.PI / 180),
            this.oldRotation.y * (Math.PI / 180),
            this.oldRotation.z * (Math.PI / 180),
        );
    }

    destroy(): void {
    }

    private convertEulerToVec3(euler: Euler): Vec3 {
        return ({
            x: euler.x,
            y: euler.y,
            z: euler.z
        });

    }

}
