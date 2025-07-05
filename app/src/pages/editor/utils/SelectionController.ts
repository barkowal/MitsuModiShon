import * as THREE from "three/webgpu";
import { INTERSECTION_LAYER } from "./Global";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import ModellingMesh from "./objects/ModellingMesh";

export class SelectionController {
    private raycaster: THREE.Raycaster;
    private onSelectListeners: Array<CallableFunction>;
    private onClearListeners: Array<CallableFunction>;
    private currentSelection: THREE.Object3D | null;
    private selectedObjects: Array<THREE.Object3D>;

    private editObject: ModellingMesh | null;
    private editIntersections: Array<THREE.Intersection>;
    private onEditListeners: Array<CallableFunction>;
    private editMode: boolean;

    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.currentSelection = null;
        this.selectedObjects = [];
        this.onEditListeners = [];
        this.onSelectListeners = [];
        this.onClearListeners = [];

        this.editIntersections = [];
        this.editObject = null;
        this.editMode = false;
    }

    setEditMode(val: boolean) {
        this.editMode = val;
        if (val === true && this.currentSelection instanceof ModellingMesh) {
            this.editObject = this.currentSelection;
        }
        this.clearAllSelections();
    }

    select(normalizedPosition: THREE.Vector2, scene: THREE.Scene, camera: THREE.Camera, multiSelect: boolean = false) {

        this.raycaster.setFromCamera(normalizedPosition, camera);
        this.raycaster.layers.set(INTERSECTION_LAYER);

        // If in edit mode intersect only the editable object
        if (this.editMode) {
            this.editModeSelect(multiSelect);
            return;
        }

        const intersectedObjects = this.raycaster.intersectObjects(scene.children);

        this.checkIfSelectionExists(scene);

        if (intersectedObjects.length) {


            for (const obj of intersectedObjects) {

                if (this.currentSelection && this.currentSelection.id == obj.object.id) {
                    return;
                }

                if (!multiSelect) {
                    this.clearSelectedObjects();
                }

                this.setCurrentSelection(obj.object);
                break;

            }

        }
    }

    editModeSelect(multiSelect: boolean) {
        if (this.editObject) {
            const intersectedObject = this.raycaster.intersectObject(this.editObject);
            if (intersectedObject.length === 0) return;
            if (!multiSelect) {
                this.editIntersections = [];
            }
            if (!this.isAlreadySelectedIntersection(intersectedObject[0])) {
                this.editIntersections.push(intersectedObject[0]);
            }
            this.notifyEditListeners(this.editIntersections);
        }
    }

    isAlreadySelectedIntersection(selectedIntersection: THREE.Intersection) {
        let isSelected = false;
        this.editIntersections.forEach((intersection) => {
            if (!intersection.face) { isSelected = true; return; }
            if (!selectedIntersection.face) { isSelected = true; return; }
            if (intersection.face.a == selectedIntersection.face.a &&
                intersection.face.b == selectedIntersection.face.b &&
                intersection.face.c == selectedIntersection.face.c) {
                isSelected = true;
                return;
            }
        });
        return isSelected;
    }

    IsAlreadySelected(objectId: number) {

        let isSelected = false;
        this.selectedObjects.forEach((obj) => {
            if (objectId === obj.id) {
                isSelected = true;
                return;
            }
        });

        return isSelected;

    }

    changeSelection(scene: THREE.Scene, id: number) {
        if (this.editMode) {
            return;
        }
        if (this.currentSelection?.id === id) {
            return;
        }
        this.checkIfSelectionExists(scene);
        this.clearAllSelections();
        const obj = scene.getObjectById(id);
        if (obj) {
            this.setCurrentSelection(obj);
        }
    }

    addSelection(scene: THREE.Scene, id: number) {
        const obj = scene.getObjectById(id);
        if (obj) {
            this.setCurrentSelection(obj);
        }
    }

    getCurrentSelection(): THREE.Object3D | null {
        return this.currentSelection;
    }

    getSelectedObjects(): Array<THREE.Object3D> {
        return this.selectedObjects;
    }

    clearSelectedObjects() {
        this.selectedObjects = [];
        this.notifyClearListeners();
    }

    clearAllSelections() {
        this.clearSelectedObjects();
        this.removeCurrentSelection();
        this.emitSelections();
    }

    destroy() {
        this.onSelectListeners = [];
        this.onClearListeners = [];
        this.onEditListeners = [];
    }

    checkIfSelectionExists(scene: THREE.Scene) {
        if (this.currentSelection != null) {
            const found = scene.getObjectById(this.currentSelection.id);
            if (found == undefined) {
                this.currentSelection = null;
                this.notifyClearListeners();
            }
        }
    }

    onEditSelect(fn: CallableFunction) {
        this.onEditListeners.push(fn);
    }

    onSelect(fn: CallableFunction) {
        this.onSelectListeners.push(fn);
    }

    onClear(fn: CallableFunction) {
        this.onClearListeners.push(fn);
    }

    notifySelectionListeners(obj: THREE.Object3D) {
        this.onSelectListeners.forEach((listener) => {
            listener(obj);
        });
    }

    notifyClearListeners() {
        this.onClearListeners.forEach((listener) => {
            listener();
        });
    }

    notifyEditListeners(intersection: Array<THREE.Intersection>) {
        this.onEditListeners.forEach((listener) => {
            listener(intersection);
        });
    }

    private emitSelections() {
        const objIds: Array<number> = [];
        this.selectedObjects.forEach((obj) => {
            objIds.push(obj.id);
        });
        editorEventBus.emit(EDITOR_EVENT.RefreshSelections, objIds);
    }

    private setCurrentSelection(obj: THREE.Object3D) {
        if (!this.IsAlreadySelected(obj.id)) {
            this.selectedObjects.push(obj);
        }
        this.currentSelection = obj;
        editorEventBus.emit(EDITOR_EVENT.SelectObject, obj.id);
        this.emitSelections();
        this.notifySelectionListeners(obj);
    }

    private removeCurrentSelection() {
        if (this.currentSelection) {
            this.notifyClearListeners();
            this.currentSelection = null;
        }
    }

}
