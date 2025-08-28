import * as THREE from "three/webgpu";
import { disposeMesh } from "./utils";

export class EditorUtils {
  private scene: THREE.Scene;
  private copiedObjects: Array<THREE.Object3D>;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.copiedObjects = [];
  }

  // For now it creates a clone with same material and geometry
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
      disposeMesh(this.scene, copy);
    });
    this.copiedObjects = [];
  }

}
