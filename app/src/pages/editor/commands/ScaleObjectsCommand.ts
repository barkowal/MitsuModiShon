import type { Vec3 } from "../utils/Types";
import type { Command } from "./CommandInterface";
import { Object3D } from "three/webgpu";

export class ScaleObjectsCommand implements Command {
    private objects: Array<Object3D>;
    private scaleValue: Vec3;

    constructor(objects: Array<Object3D>, scaleValue: Vec3) {
        this.objects = objects;
        this.scaleValue = scaleValue;
    }

    execute() {
        this.objects.forEach((object: Object3D) => {
            object.scale.setX(object.scale.x + this.scaleValue.x);
            object.scale.setY(object.scale.y + this.scaleValue.y);
            object.scale.setZ(object.scale.z + this.scaleValue.z);
        });
    }

    undo() {
        this.objects.forEach((object: Object3D) => {
            object.scale.setX(object.scale.x - this.scaleValue.x);
            object.scale.setY(object.scale.y - this.scaleValue.y);
            object.scale.setZ(object.scale.z - this.scaleValue.z);
        });
    }

    destroy(): void {
    }


}
