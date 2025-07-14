import { Line2NodeMaterial, type Vector3 } from "three/webgpu";
import ModellingMesh from "../utils/objects/ModellingMesh";
import type { Command } from "./CommandInterface";
import { Line2, LineGeometry } from "three/examples/jsm/Addons.js";

export class DrawLineCommand implements Command {
    private modellingMesh: ModellingMesh;
    private hexColor: number;
    private lineWidth: number;
    private linePoints: Array<Vector3>;
    private lineMesh: Line2;

    constructor(modellingMesh: ModellingMesh, linePoints: Array<Vector3>, hexColor: number, lineWidth: number) {
        this.modellingMesh = modellingMesh;
        this.linePoints = linePoints;
        this.hexColor = hexColor;
        this.lineWidth = lineWidth;
        this.lineMesh = this.createLine();
    }

    execute() {
        this.modellingMesh.attach(this.lineMesh);
    }

    undo() {
        this.modellingMesh.remove(this.lineMesh);
    }

    destroy(): void {
        const lineFound = this.modellingMesh.getObjectById(this.lineMesh.id);
        if (!lineFound) {
            if ("dispose" in this.lineMesh.material) {
                this.lineMesh.material.dispose();
            }
            this.lineMesh.geometry.dispose();
        }
    }

    private createLine() {
        const material = new Line2NodeMaterial({ color: this.hexColor, linewidth: this.lineWidth });
        const geometry = new LineGeometry();
        geometry.setFromPoints(this.linePoints);

        // @ts-expect-error type error
        const line = new Line2(geometry, material);
        line.name = `stroke_${line.id}`;

        return line;
    }

}
