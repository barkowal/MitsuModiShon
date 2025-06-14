import * as THREE from "three/webgpu";
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { INTERSECTION_LAYER } from "./Global";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";

export class SelectionController {
    private raycaster: THREE.Raycaster;
    private selectedObject: THREE.Mesh | null;
    private selectedObjectSavedColor: THREE.Color;
    private transformController: TransformControls | null;

    constructor(control: TransformControls) {
        this.raycaster = new THREE.Raycaster();
        this.selectedObject = null;
        this.selectedObjectSavedColor = new THREE.Color(0xffffff);
        this.transformController = null;
    }

    setTransformController(control: TransformControls) {
        this.transformController = control;
    }

    select(normalizedPosition: THREE.Vector2, scene: THREE.Scene, camera: THREE.Camera) {

        this.raycaster.setFromCamera(normalizedPosition, camera);
        this.raycaster.layers.set(INTERSECTION_LAYER)
        const intersectedObjects = this.raycaster.intersectObjects(scene.children);

        this.checkCurrentSelectedObject(scene);

        if (intersectedObjects.length) {

            this.removeCurrentSelection();

            for (const obj of intersectedObjects) {

                if (obj.object instanceof THREE.Mesh) {
                    this.setCurrentSelection(obj.object);
                    editorEventBus.emit(EDITOR_EVENT.SelectObject, obj.object.id);
                    break;
                }

            }

        }
    }

    changeSelection(scene: THREE.Scene, id: number) {
        this.checkCurrentSelectedObject(scene);
        this.removeCurrentSelection();
        const obj = scene.getObjectById(id)
        if (obj instanceof THREE.Mesh) {
            this.setCurrentSelection(obj);
        }
    }

    getCurrentMesh(): THREE.Mesh | null {
        return this.selectedObject;
    }

    getCurrentMeshId(): number {
        if (this.selectedObject) {
            return this.selectedObject.id;
        }
        return -1;
    }

    private setCurrentSelection(mesh: THREE.Mesh) {
        this.selectedObject = mesh;
        this.selectedObjectSavedColor.set(mesh.material.color);
        mesh.material.color.setHex(0xa9e2f2);
        this.transformController?.attach(mesh);
    }

    private removeCurrentSelection() {
        if (this.selectedObject) {
            if ("color" in this.selectedObject.material
                && this.selectedObject.material.color instanceof THREE.Color) {
                this.selectedObject.material.color.set(this.selectedObjectSavedColor);
                this.transformController?.detach();
            }
            this.selectedObject = null;
        }
    }

    private checkCurrentSelectedObject(scene: THREE.Scene) {
        if (this.selectedObject != null) {
            const found = scene.getObjectById(this.selectedObject.id)
            if (found == undefined) {
                this.selectedObject.material.color.set(this.selectedObjectSavedColor);
                this.transformController?.detach();
                this.selectedObject = null;
            }
        }
    }
}
