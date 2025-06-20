import * as THREE from "three/webgpu";
import { INTERSECTION_LAYER } from "./Global";
import type { TreeItem } from "./Types";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";

export class UiController {
    private scene: THREE.Scene;
    private selectedMeshId: number;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.selectedMeshId = -1;
    }

    refreshPanel() {
        this.refreshTree();
        this.refreshTransformation();
        this.refreshColorMenu();
    }

    refreshTree() {
        const items = [];
        for (const child of this.scene.children) {
            if (child.layers.isEnabled(INTERSECTION_LAYER)) {
                items.push(this.convertSceneObjToTreeItem(child));
            }
        }
        editorEventBus.emit(EDITOR_EVENT.RefreshTreeView, items);
    }

    refreshTransformation() {
        const mesh = this.scene.getObjectById(this.selectedMeshId);
        if (mesh == undefined) {
            return;
        };
        const pos = {
            x: mesh.position.x,
            y: mesh.position.y,
            z: mesh.position.z,
        };
        const scale = {
            x: mesh.scale.x,
            y: mesh.scale.y,
            z: mesh.scale.z,
        };
        const rotation = {
            x: mesh.rotation.x * (180 / Math.PI),
            y: mesh.rotation.y * (180 / Math.PI),
            z: mesh.rotation.z * (180 / Math.PI),
        };
        const transform = [pos, scale, rotation];
        editorEventBus.emit(EDITOR_EVENT.RefreshTransformationMenu, transform);
    }

    refreshColorMenu() {
        const mesh = this.scene.getObjectById(this.selectedMeshId);
        if (mesh == undefined || !(mesh instanceof THREE.Mesh)) {
            return;
        };

        if (!("color" in mesh.material) ||
            !(mesh.material.color instanceof THREE.Color)) {
            return;
        }
        const color = "#" + mesh.material.color.getHexString();
        editorEventBus.emit(EDITOR_EVENT.RefreshColorMenu, color);
    }

    refreshNameMenu() {
        const obj = this.scene.getObjectById(this.selectedMeshId);
        if (obj == undefined) {
            return;
        };
        editorEventBus.emit(EDITOR_EVENT.RefreshNameMenu, obj.name);
    }

    setSelectedMeshId(id: number) {
        if (this.selectedMeshId === id) {
            return;
        }
        this.selectedMeshId = id;
        this.refreshTransformation();
        this.refreshColorMenu();
        this.refreshNameMenu();
    }

    // Could be util function, if used more
    private convertSceneObjToTreeItem(obj: THREE.Object3D): TreeItem {
        const item: TreeItem = {
            id: obj.id,
            name: obj.name,
            children: obj.children
        };
        return item;
    }

}
