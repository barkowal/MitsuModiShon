import { ROOT_ID } from "../utils/Global";
import type { Command } from "./CommandInterface";
import { Scene, Object3D, Vector3, Quaternion } from "three/webgpu";

export class AttachObjectCommand implements Command {
    private scene: Scene;
    private parent: Object3D | undefined;
    private oldParent: Object3D | null;
    private child: Object3D | undefined;

    constructor(scene: Scene, parentID: number, childID: number) {
        this.scene = scene;
        this.oldParent = null;
        this.setObjects(parentID, childID);
    }

    execute() {
        if (!this.child)
            return;

        if (this.parent) {
            if (this.parent.parent) {
                const contains = this.childContainsParent(this.parent.parent.id, this.child);
                if (!contains)
                    this.parent.attach(this.child);
            } else {
                this.parent.attach(this.child);
            }
        }
    }

    undo() {
        if (!this.child)
            return;

        const worldPos = new Vector3();
        const worldScale = new Vector3();
        const worldRotation = new Quaternion();
        this.child.getWorldPosition(worldPos);
        this.child.getWorldScale(worldScale);
        this.child.getWorldQuaternion(worldRotation);
        this.child.removeFromParent();

        if (this.oldParent) {
            this.child.position.set(worldPos.x, worldPos.y, worldPos.z);
            this.child.scale.set(worldScale.x, worldScale.y, worldScale.z);
            this.child.setRotationFromQuaternion(worldRotation);
            this.oldParent.attach(this.child);
        }
    }

    destroy(): void {

    }

    setObjects(parentID: number, childID: number) {
        this.parent = parentID === ROOT_ID ? this.scene : this.scene.getObjectById(parentID);
        this.child = this.scene.getObjectById(childID);
        if (this.child) {
            this.oldParent = this.child.parent;
        }
    }

    childContainsParent(parentID: number, child: Object3D): boolean {
        if (child.children.length === 0) {
            return child.id === parentID;
        }

        let contains = (child.id === parentID);
        if (contains == true) {
            return contains;
        }

        child.children.forEach((obj) => {
            contains = this.childContainsParent(parentID, obj);
            if (contains) {
                return;
            }
        });

        return contains;
    }
}
