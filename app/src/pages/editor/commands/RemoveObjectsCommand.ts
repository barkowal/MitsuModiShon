import type { Command } from "./CommandInterface";
import { Scene, Object3D, Mesh } from "three/webgpu";

export class RemoveObjectsCommand implements Command {
    private scene: Scene;
    private objects: Array<Object3D>;

    constructor(scene: Scene, objects: Array<Object3D>) {
        this.scene = scene;
        this.objects = objects;
    }

    execute() {
        this.objects.forEach((object: Object3D) => {
            this.scene.remove(object);
        });
    }

    undo() {
        this.objects.forEach((object: Object3D) => {
            this.scene.add(object);
        });
    }

    destroy(): void {
        this.objects.forEach((object: Object3D) => {

            if (object && !this.scene.getObjectById(object.id)) {
                if (object instanceof Mesh) {
                    if ("dispose" in object.material) {
                        object.material.dispose();
                    }

                    object.geometry.dispose();
                }
            }
        });
    }


}
