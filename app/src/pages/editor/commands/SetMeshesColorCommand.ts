import type { Command } from "./CommandInterface";
import { Mesh, Color } from "three/webgpu";

// TODO instead of meshes maybe change color of materials and assing material to meshes
export class SetMeshesColorCommand implements Command {
    private meshes: Array<Mesh>;
    private oldColors: Array<Color>;
    private newColor: Color;

    constructor(meshes: Array<Mesh>, newColor: Color) {
        this.newColor = newColor;
        this.meshes = [];
        this.oldColors = [];

        meshes.forEach((mesh) => {
            if (!("color" in mesh.material) ||
                !(mesh.material.color instanceof Color)) {
                return;
            }
            this.meshes.push(mesh);
            this.oldColors.push(new Color(mesh.material.color));
        });
    }

    execute() {
        this.meshes.forEach((mesh) => {
            //@ts-expect-error Checked for color in constructor
            mesh.material.color.set(this.newColor);
        });
    }

    undo() {
        this.meshes.forEach((mesh, i) => {
            //@ts-expect-error Checked for color in constructor
            mesh.material.color.set(this.oldColors[i]);
        });
    }

    destroy(): void {
    }

}
