import * as THREE from "three/webgpu";
import { INTERSECTION_LAYER, ROOT_ID } from "./Global";
import type { RendererMemoryInfo, TreeItem } from "./Types";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";

export class UiController {
    private scene: THREE.Scene;
    private selectedMeshId: number;
    private rendererInfo: RendererMemoryInfo | null;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.selectedMeshId = -1;
        this.rendererInfo = null;
    }

    setRendererInfo(memoryInfo: RendererMemoryInfo) {
        this.rendererInfo = memoryInfo;
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
        const root = [{ id: ROOT_ID, name: "scene", children: items }];
        editorEventBus.emit(EDITOR_EVENT.RefreshTreeView, root);
        this.RefreshSceneInfo();
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

    RefreshSceneInfo() {

        let objects = 0, vertices = 0, triangles = 0;

        this.scene.children.forEach((obj) => {

            if (!obj.layers.isEnabled(INTERSECTION_LAYER))
                return;

            objects++;

            if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {

                const geometry = obj.geometry;
                vertices += geometry.attributes.position.count;

                if (obj instanceof THREE.Mesh) {
                    if (geometry.index !== null) {
                        triangles += geometry.index.count / 3;
                    } else {
                        triangles += geometry.attributes.position.count / 3;
                    }
                }
            }

        });


        const info = [objects, vertices, triangles];
        if (this.rendererInfo) {
            info.push(this.rendererInfo.geometries);
            info.push(this.rendererInfo.textures);
        }
        editorEventBus.emit(EDITOR_EVENT.SendSceneInfo, info);
    }



}

