import type { Vec3 } from "../utils/Types";
import type { Command } from "./CommandInterface";
import { Object3D } from "three/webgpu";

export class RotateObjectsCommand implements Command {
    private objects: Array<Object3D>;
    private rotateValue: Vec3;

    constructor(objects: Array<Object3D>, rotateValue: Vec3) {
        this.objects = objects;
        this.rotateValue = rotateValue;
    }

    execute() {
        this.objects.forEach((object: Object3D) => {
            object.rotation.set(
                object.rotation.x + this.rotateValue.x * (Math.PI / 180),
                object.rotation.y + this.rotateValue.y * (Math.PI / 180),
                object.rotation.z + this.rotateValue.z * (Math.PI / 180),
            );
        });
    }

    undo() {
        this.objects.forEach((object: Object3D) => {
            object.rotation.set(
                object.rotation.x - this.rotateValue.x * (Math.PI / 180),
                object.rotation.y - this.rotateValue.y * (Math.PI / 180),
                object.rotation.z - this.rotateValue.z * (Math.PI / 180),
            );
        });
    }

    destroy(): void {
    }


}
