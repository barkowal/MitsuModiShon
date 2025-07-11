import { MATERIAL_TYPES, type MaterialItem } from "../utils/Types";
import type { Command } from "./CommandInterface";
import { Mesh, Color, MeshToonMaterial, MeshStandardMaterial, MeshBasicMaterial, DoubleSide, Material } from "three/webgpu";

export class ChangeMeshesMaterialCommand implements Command {
    private meshes: Array<Mesh>;
    private newMaterials: Array<Material>;
    private oldMaterials: Array<Material>;
    private shouldDisposeOldMaterial: boolean;

    constructor(meshes: Array<Mesh>, materialItem: MaterialItem) {
        this.meshes = [];
        this.newMaterials = [];
        this.oldMaterials = [];
        this.shouldDisposeOldMaterial = false;

        meshes.forEach((mesh) => {
            if (!("color" in mesh.material) ||
                !("id" in mesh.material) ||
                !(mesh.material.color instanceof Color)) {
                return;
            }
            this.meshes.push(mesh);
            this.newMaterials.push(this.createNewMaterial(materialItem.type, mesh.material.color));
            this.oldMaterials.push(mesh.material);
        });
    }

    execute() {
        this.meshes.forEach((mesh, i) => {
            mesh.material = this.newMaterials[i];
        });
        this.shouldDisposeOldMaterial = true;
    }

    undo() {
        this.meshes.forEach((mesh, i) => {
            mesh.material = this.oldMaterials[i];
        });
        this.shouldDisposeOldMaterial = false;
    }

    destroy(): void {
        if (this.shouldDisposeOldMaterial) {
            this.oldMaterials.forEach((material) => {
                material.dispose();
            });
        } else {
            this.newMaterials.forEach((material) => {
                material.dispose();
            });
        }
    }

    private createNewMaterial(type: string, meshColor: Color): Material {
        if (type === MATERIAL_TYPES.Basic)
            return new MeshBasicMaterial({ color: meshColor, side: DoubleSide });
        if (type === MATERIAL_TYPES.Standard)
            return new MeshStandardMaterial({ color: meshColor, side: DoubleSide });
        if (type === MATERIAL_TYPES.Toon)
            return new MeshToonMaterial({ color: meshColor, side: DoubleSide });
        else
            return new MeshBasicMaterial({ color: meshColor, side: DoubleSide });
    }

}
