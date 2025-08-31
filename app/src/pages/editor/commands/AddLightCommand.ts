import type { Command } from "./CommandInterface";
import { Scene, Light, Mesh, Object3D } from "three/webgpu";

export class AddLightCommand implements Command {
    private scene: Scene;
    private light: Object3D;

    constructor(scene: Scene, light: Object3D) {
        this.scene = scene;
        this.light = light;
    }

    execute() {
        this.scene.add(this.light);
    }

    undo() {
        this.scene.remove(this.light);
    }

    // TODO test disposing
    destroy(): void {
        if (this.light && !this.scene.getObjectById(this.light.id)) {

            if (this.light instanceof Light)
                this.light.dispose();

            if (this.light instanceof Mesh) {

                if ("dispose" in this.light.material) {
                    this.light.material.dispose();
                }

                this.light.geometry.dispose();

                if (this.light.children[0] instanceof Light)
                    this.light.children[0].dispose();
            }
        }
    }

}
