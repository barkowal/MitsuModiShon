import * as THREE from "three/webgpu";
import { removeObjectFromScene } from "./utils";

export class EditorUtils {
  private scene: THREE.Scene;
  private copiedObjects: Array<THREE.Object3D>;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.copiedObjects = [];
  }

  // Right now custom objects like modelling mesh are different with clone. 
  // They produce new material and geometry, but others like THREE.Mesh create clones
  setCopiedObjects(objects: Array<THREE.Object3D>) {
    this.disposeCopies();
    objects.forEach((obj) => {

      this.copiedObjects.push(obj.clone(true));

    });
  }

  getCopiedObjects(): Array<THREE.Object3D> {
    return this.copiedObjects;
  }

  private disposeCopies() {
    this.copiedObjects.forEach((copy) => {

      removeObjectFromScene(this.scene, copy);

    });
    this.copiedObjects = [];
  }

}
