import { disposeMesh } from "../utils/utils";
import type { Command } from "./CommandInterface";
import { Scene, Object3D } from "three/webgpu";

export class AddObjectsCommand implements Command {
    private scene: Scene;
    private objects: Array<Object3D>;

    constructor(scene: Scene, objects: Array<Object3D>) {
        this.scene = scene;
        this.objects = objects;
    }

    execute() {
        this.objects.forEach((obj) => {
            this.scene.add(obj);
        });
    }

    undo() {
        this.objects.forEach((obj) => {
            this.scene.remove(obj);
        });
    }

    destroy(): void {
        this.objects.forEach((obj) => {
            disposeMesh(this.scene, obj);
        });
    }

}
