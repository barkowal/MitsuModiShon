import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import type { Command } from "./CommandInterface";
import { Scene, Object3D, Mesh, Light } from "three/webgpu";

export class RemoveObjectsCommand implements Command {
    private scene: Scene;
    private objects: Array<Object3D>;
    private parentsId: Array<number>;

    constructor(scene: Scene, objects: Array<Object3D>) {
        this.scene = scene;
        this.objects = objects;
        this.parentsId = [];
    }

    execute() {
        this.objects.forEach((object: Object3D, i: number) => {

            if (object.userData.removable === false) {
                editorEventBus.emit(EDITOR_EVENT.SendWarningLog, "You cannot remove this object.");
                return;
            }

            const parent = object.parent;
            object.removeFromParent();
            if (parent && parent.id != this.scene.id) {
                this.parentsId[i] = parent.id;
            } else {
                this.parentsId[i] = -1;
            }
        });
    }

    undo() {
        this.objects.forEach((object: Object3D, i: number) => {
            if (this.parentsId[i] == -1) {
                this.scene.add(object);
                return;
            } else {
                const parent = this.scene.getObjectById(this.parentsId[i]);
                if (parent) {
                    parent.add(object);
                }
            }
        });
    }

    destroy(): void {
        this.objects.forEach((object: Object3D) => {
            this.disposeObject(object);
        });
    }

    disposeObject(obj: Object3D) {
        obj.children.forEach((child) => {
            this.disposeObject(child);
        });
        this.disposeGeomAndMat(obj);

        if (obj instanceof Light) {
            if (obj && !this.scene.getObjectById(obj.id)) {
                obj.dispose();
            }
        }

    }

    disposeGeomAndMat(object: Object3D) {
        if (object && !this.scene.getObjectById(object.id)) {
            if (object instanceof Mesh) {
                if ("dispose" in object.material) {
                    object.material.dispose();
                }

                object.geometry.dispose();
            }
        }
    }


}
