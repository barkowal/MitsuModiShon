import * as THREE from "three/webgpu";
import type { Vec3 } from "../Types";
import { CreateModellingMaterial } from "./Custom/ModellingMaterial";

export default class ModellingMesh extends THREE.Mesh {
  private verticesHelper: THREE.InstancedMesh | null;
  private transformHelper: THREE.Mesh | null;
  private indices: Array<number>;
  private normalMaterial: THREE.Material;

  constructor(geometry: THREE.BufferGeometry, material: THREE.Material) {
    super(geometry, material);
    this.normalMaterial = material;

    this.verticesHelper = null;
    this.transformHelper = null;
    this.indices = [];
  }

  getTransformHelper() {
    return this.transformHelper;
  }

  changeToNormalMode() {
    if ("dispose" in this.material)
      this.material.dispose();

    this.clearHighlightedVertices();
    this.material = this.normalMaterial;
    this.disposeHelpers();
  }

  changeToModelling() {
    this.material = CreateModellingMaterial();
    this.verticesHelper = this.createVerticesHelper();
    this.transformHelper = this.createTransformHelper();
    this.add(this.transformHelper);
    this.add(this.verticesHelper);
  }

  highlightVertices(indices: Array<number>) {
    this.indices = indices;
    const indexAttr = this.geometry.index;
    const colorAttr = this.geometry.getAttribute("color");

    if (indices.length === 0) {
      return;
    }

    if (
      !indexAttr ||
      !colorAttr ||
      !this.transformHelper ||
      !this.verticesHelper) {
      return;
    }

    const threeColor = new THREE.Color(0xffaaa0);
    const vertiPos = new THREE.Vector3();
    const vertiMatrix = new THREE.Matrix4();
    const positions = [];
    for (let i = 0; i <= indices.length; i++) {
      const i2 = indices[i];
      colorAttr.setX(i2, 1);
      colorAttr.setY(i2, 1);
      colorAttr.setZ(i2, 1);
      this.verticesHelper.setColorAt(i2, threeColor);

      this.verticesHelper.getMatrixAt(i2, vertiMatrix);
      vertiPos.setFromMatrixPosition(vertiMatrix);

      if (vertiPos.x != undefined) {
        positions.push({ x: vertiPos.x, y: vertiPos.y, z: vertiPos.z });
      }

    }


    const avgPos = this.calculateAvgPos(positions);
    this.transformHelper.position.set(avgPos.x, avgPos.y, avgPos.z);

    colorAttr.needsUpdate = true;
    if (this.verticesHelper.instanceColor) {
      this.verticesHelper.instanceColor.needsUpdate = true;
    }
  }

  translateIntersection(distance: Vec3) {
    if (!this.verticesHelper) {
      return;
    }
    const positionAttribute = this.geometry.getAttribute("position");
    const vertiMatrix = new THREE.Matrix4();

    const vertex = new THREE.Vector3();

    for (let i = 0; i <= this.indices.length; i++) {
      const i2 = this.indices[i];
      vertex.fromBufferAttribute(positionAttribute, i2);
      vertex.setX(vertex.x + distance.x);
      vertex.setY(vertex.y + distance.y);
      vertex.setZ(vertex.z + distance.z);

      this.verticesHelper.getMatrixAt(i2, vertiMatrix);
      vertiMatrix.setPosition(vertex);
      this.verticesHelper.setMatrixAt(i2, vertiMatrix);

      positionAttribute.setXYZ(i2, vertex.x, vertex.y, vertex.z);
      positionAttribute.needsUpdate = true;
    }
    this.geometry.computeBoundingSphere();
  }

  getIndicesPosition() {
    const positionAttribute = this.geometry.getAttribute("position");
    const vertex = new THREE.Vector3();
    const pos = [];

    for (let i = 0; i <= this.indices.length; i++) {
      const i2 = this.indices[i];
      vertex.fromBufferAttribute(positionAttribute, i2);
      pos.push({ x: vertex.x, y: vertex.y, z: vertex.z });

    }
    return pos;
  }

  clearHighlightedVertices() {
    const indexAttr = this.geometry.index;
    const colorAttr = this.geometry.getAttribute("color");

    if (
      !indexAttr ||
      !colorAttr ||
      !this.verticesHelper) {
      return;
    }

    for (let j = 0; j <= indexAttr.count; j++) {
      colorAttr.setX(j, 0);
      colorAttr.setY(j, 0);
      colorAttr.setZ(j, 0);
    }

    const threeColor = new THREE.Color(0x000000);
    for (let j = 0; j < this.verticesHelper.count; j++) {
      this.verticesHelper.setColorAt(j, new THREE.Color(threeColor));
    }
    if (this.verticesHelper.instanceColor) {
      this.verticesHelper.instanceColor.needsUpdate = true;
    }
  }

  private createVerticesHelper() {
    const posAttr = this.geometry.getAttribute("position");
    const sphereGeometry = new THREE.SphereGeometry(0.01, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const instanceMesh = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, posAttr.array.length / 3);

    const matrix = new THREE.Matrix4();
    for (let i = 0; i < posAttr.array.length; i += 3) {
      matrix.setPosition(posAttr.array[i], posAttr.array[i + 1], posAttr.array[i + 2]);
      instanceMesh.setMatrixAt(i / 3, matrix);
    };

    for (let i = 0; i < posAttr.array.length / 3; i++) {
      instanceMesh.setColorAt(i, new THREE.Color(0x000000)); // Required for later changing
    }
    return instanceMesh;
  }

  private createTransformHelper() {
    const mat = new THREE.MeshBasicMaterial({ transparent: true });
    const boxgeom = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const transformHelper = new THREE.Mesh(boxgeom, mat);
    transformHelper.layers.disableAll();

    return transformHelper;
  }

  // TODO
  private calculateAvgPos(positions) {
    let posX = 0;
    let posY = 0;
    let posZ = 0;
    positions.forEach((pos) => {
      posX += pos.x;
      posY += pos.y;
      posZ += pos.z;
    });
    return { x: posX / positions.length, y: posY / positions.length, z: posZ / positions.length };
  }

  // TODO dispose properly modelling material, transformHelper and verticesHelper
  private disposeHelpers() {
    if (this.transformHelper)
      this.remove(this.transformHelper);

    if (this.verticesHelper)
      this.remove(this.verticesHelper);
  }

}
