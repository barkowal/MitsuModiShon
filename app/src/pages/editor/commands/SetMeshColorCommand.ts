import type { Command } from "./CommandInterface";
import { Mesh, Color } from "three/webgpu";

export class SetMeshColorCommand implements Command {
    private mesh;
    private oldColor: Color;
    private newColor: Color;

    constructor(mesh: Mesh, newColor: Color) {
        this.newColor = newColor;

        if (!("color" in mesh.material) ||
            !(mesh.material.color instanceof Color)) {
            this.mesh = null;
            this.oldColor = newColor;
            return;
        }

        this.oldColor = mesh.material.color;
        this.mesh = mesh;
    }

    execute() {
        //@ts-expect-error Checked for color in constructor
        this.mesh?.material.color.set(this.newColor);
    }

    undo() {
        //@ts-expect-error Checked for color in constructor
        this.mesh?.material.color.set(this.oldColor);
    }

    destroy(): void {
    }

}
