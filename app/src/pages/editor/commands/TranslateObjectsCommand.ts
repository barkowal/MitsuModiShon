import type { Vec3 } from "../utils/Types";
import type { Command } from "./CommandInterface";
import { Object3D } from "three/webgpu";

export class TranslateObjectsCommand implements Command {
    private objects: Array<Object3D>;
    private distance: Vec3;

    constructor(objects: Array<Object3D>, distance: Vec3) {
        this.objects = objects;
        this.distance = distance;
    }

    execute() {
        this.objects.forEach((object: Object3D) => {
            const currentRotation = object.rotation.clone();
            object.rotation.set(0, 0, 0);
            object.translateX(this.distance.x);
            object.translateY(this.distance.y);
            object.translateZ(this.distance.z);
            object.setRotationFromEuler(currentRotation);
        });
    }

    undo() {
        this.objects.forEach((object: Object3D) => {
            const currentRotation = object.rotation.clone();
            object.rotation.set(0, 0, 0);

            object.translateX(this.distance.x * -1);
            object.translateY(this.distance.y * -1);
            object.translateZ(this.distance.z * -1);

            object.setRotationFromEuler(currentRotation);
        });
    }

    destroy(): void {
    }


}
