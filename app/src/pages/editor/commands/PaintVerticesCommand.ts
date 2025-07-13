import type ModellingMesh from "../utils/objects/ModellingMesh";
import type { Vec3 } from "../utils/Types";
import type { Command } from "./CommandInterface";

export class PaintVerticesCommand implements Command {
    private modellingMesh: ModellingMesh;
    private vertices: Array<number>;
    private newColor: Vec3;
    private oldColors: Map<number, Vec3>;

    constructor(modellingMesh: ModellingMesh, vertices: Array<number>, newColor: Vec3, oldColors: Map<number, Vec3>) {
        this.modellingMesh = modellingMesh;
        this.vertices = vertices;
        this.newColor = newColor;
        this.oldColors = this.getOldColors(oldColors);
    }

    execute() {
        this.modellingMesh.colorVertices(this.vertices, this.newColor);
    }

    undo() {
        this.oldColors.forEach((color, key) => {
            this.modellingMesh.colorVertices([key], color);
        });
    }

    destroy(): void {
    }

    private getOldColors(colorsMap: Map<number, Vec3>) {
        const oldColors = new Map();

        this.vertices.forEach((vertex) => {
            const vertexColor = colorsMap.get(vertex);
            if (!vertexColor) return;
            oldColors.set(vertex, vertexColor);
        });

        return oldColors;
    }

}
