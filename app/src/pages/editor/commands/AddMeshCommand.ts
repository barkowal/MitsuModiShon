import type { Command } from "./CommandInterface";
import { Scene, Mesh } from "three/webgpu";

export class AddMeshCommand implements Command {
    private scene;
    private mesh;

    constructor(scene: Scene, mesh: Mesh) {
        this.scene = scene;
        this.mesh = mesh;
    }

    execute() {
        this.scene.add(this.mesh);
    }

    undo() {
        this.scene.remove(this.mesh);
    }

    destroy(): void {
        if (this.mesh) {

            if ("dispose" in this.mesh.material) {
                this.mesh.material.dispose();
            }

            this.mesh.geometry.dispose();
        }
    }

}
