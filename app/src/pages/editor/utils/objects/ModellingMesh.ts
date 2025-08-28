import * as THREE from "three/webgpu";
import type { Vec3 } from "../Types";
import { CreateModellingMaterial } from "./Custom/ModellingMaterial";
import { calculateVec3Difference, convertTVector3ToVec3 } from "../utils";
import { CreateLineSelectMaterial } from "./Custom/LineSelectMaterial";
import { ModellingOutline } from "./ModellingOutline";
import { EDITOR_LAYER, RENDER_LAYER } from "../Global";

export default class ModellingMesh extends THREE.Mesh {
  private verticesHelper: THREE.InstancedMesh | null;
  private transformHelper: THREE.Mesh | null;
  private selectedVertices: Array<number>;
  private groupedVertices: Map<number, Array<number>>;
  private normalMaterial: THREE.Material;
  private currentVerticesColors: Map<number, Vec3>;
  private modellingOutline: ModellingOutline | null;

  constructor(geometry: THREE.BufferGeometry, material: THREE.Material) {
    super(geometry, material);

    //@ts-expect-error override
    this.type = "ModellingMesh";

    this.normalMaterial = material;

    this.verticesHelper = null;
    this.transformHelper = null;
    this.selectedVertices = [];
    this.groupedVertices = this.groupVertices();

    this.currentVerticesColors = this.initCurrentColors();
    this.modellingOutline = null;
  }

  getHighlightedIndices() {
    return this.selectedVertices;
  }

  getTransformHelper() {
    return this.transformHelper;
  }

  getCurrentVerticesColors() {
    return this.currentVerticesColors;
  }

  setModellingOutline(modellingOutline: ModellingOutline) {
    if (this.getModellingOutline() !== null) {
      this.modellingOutline?.dispose();
    }
    this.modellingOutline = modellingOutline;

    if (this.layers.isEnabled(EDITOR_LAYER))
      this.modellingOutline.layers.enable(EDITOR_LAYER);

    if (this.layers.isEnabled(RENDER_LAYER))
      this.modellingOutline.layers.enable(RENDER_LAYER);

    this.add(modellingOutline);
  }

  getModellingOutline() {
    if (this.modellingOutline) return this.modellingOutline;

    const mod = this.getObjectByProperty("type", "ModellingOutline");
    if (mod instanceof ModellingOutline) {
      this.modellingOutline = mod;
    } else {
      return null;
    }
  }

  changeToNormalMode() {
    this.clearHighlightedVertices();

    this.disposeHelpers();

    if (this.material instanceof THREE.Material) {
      if (this.material.id === this.normalMaterial.id) {
        return;
      }
    }

    if ("dispose" in this.material)
      this.material.dispose();

    this.material = this.normalMaterial;
    this.setNormalColors();
  }

  changeToModelling() {
    if (this.material instanceof THREE.Material) {
      if (this.material.id !== this.normalMaterial.id)
        this.normalMaterial = this.material;
    }
    this.material = CreateModellingMaterial();
    this.verticesHelper = this.createVerticesHelper();
    this.transformHelper = this.createTransformHelper();
    this.add(this.transformHelper);
    this.add(this.verticesHelper);
    this.setEditingColors();
  }

  private setEditingColors() {
    const colorAttr = this.geometry.getAttribute("color");
    if (!colorAttr)
      return;

    for (let i = 0; i < colorAttr.array.length / 3; i++) {

      const x = colorAttr.getX(i);
      const y = colorAttr.getY(i);
      const z = colorAttr.getZ(i);

      this.currentVerticesColors.set(i, { x: x, y: y, z: z });
      colorAttr.setXYZ(i, 0.7, 0.7, 0.7);
    }

    colorAttr.needsUpdate = true;
  }

  private setNormalColors() {
    const colorAttr = this.geometry.getAttribute("color");
    if (!colorAttr)
      return;

    this.currentVerticesColors.forEach((val, key) => {
      colorAttr.setXYZ(key, val.x, val.y, val.z);
    });

    colorAttr.needsUpdate = true;
  }

  private initCurrentColors(): Map<number, Vec3> {
    const colorMap = new Map();
    const colorAttr = this.geometry.getAttribute("color");
    if (!colorAttr)
      return colorMap;

    for (let i = 0; i < colorAttr.array.length / 3; i++) {

      const x = colorAttr.getX(i);
      const y = colorAttr.getY(i);
      const z = colorAttr.getZ(i);

      colorMap.set(i, { x: x, y: y, z: z });
    }
    return colorMap;
  }

  changeToOutlinePainting() {
    if (this.material instanceof THREE.Material) {
      if (this.material.id !== this.normalMaterial.id)
        this.normalMaterial = this.material;
    }
    this.material = CreateLineSelectMaterial();

    if (!this.modellingOutline) {
      const modellingOutline = new ModellingOutline(this.geometry);
      this.setModellingOutline(modellingOutline);
    }
    this.modellingOutline?.makeOutlineEditable();
  }

  colorVertices(indices: Array<number>, color: Vec3) {
    const colorAttr = this.geometry.getAttribute("color");
    if (indices.length === 0) {
      return;
    }

    this.selectedVertices = this.getGroupedVertices(indices);

    if (!colorAttr)
      return;

    for (let i = 0; i < this.selectedVertices.length; i++) {
      const i2 = this.selectedVertices[i];

      colorAttr.setXYZ(i2, color.x, color.y, color.z);

      this.currentVerticesColors.set(i2, color);
    }

    colorAttr.needsUpdate = true;
  }

  highlightVertices(indices: Array<number>) {
    const colorAttr = this.geometry.getAttribute("color");
    if (indices.length === 0) {
      return;
    }

    this.selectedVertices = this.getGroupedVertices(indices);

    if (
      !colorAttr ||
      !this.transformHelper ||
      !this.verticesHelper) {
      return;
    }

    const threeColor = new THREE.Color(0xffaaa0);
    const vertiPos = new THREE.Vector3();
    const vertiMatrix = new THREE.Matrix4();
    const positions = [];
    for (let i = 0; i < this.selectedVertices.length; i++) {
      const i2 = this.selectedVertices[i];

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
    this.transformHelper.scale.set(1, 1, 1);

    colorAttr.needsUpdate = true;
    if (this.verticesHelper.instanceColor) {
      this.verticesHelper.instanceColor.needsUpdate = true;
    }
  }

  translateVertices(distance: Vec3) {
    const positionAttribute = this.geometry.getAttribute("position");

    const vertex = new THREE.Vector3();

    for (let i = 0; i < this.selectedVertices.length; i++) {
      const i2 = this.selectedVertices[i];
      vertex.fromBufferAttribute(positionAttribute, i2);

      this.translateVertex(vertex, i2, distance);

      positionAttribute.setXYZ(i2, vertex.x, vertex.y, vertex.z);
      positionAttribute.needsUpdate = true;
    }
    this.geometry.computeBoundingSphere();
    this.geometry.computeVertexNormals();
  }

  calculateCenter(): Vec3 | null {
    const positions = [];
    const vertiPos = new THREE.Vector3();
    const posAttr = this.geometry.getAttribute("position");

    for (let i = 0; i < this.selectedVertices.length; i++) {
      const i2 = this.selectedVertices[i];

      vertiPos.x = posAttr.getX(i2);
      vertiPos.y = posAttr.getY(i2);
      vertiPos.z = posAttr.getZ(i2);

      if (vertiPos.x !== undefined &&
        vertiPos.y !== undefined &&
        vertiPos.z !== undefined
      ) {
        positions.push({ x: vertiPos.x, y: vertiPos.y, z: vertiPos.z });
      }

    }

    const avgPos = this.calculateAvgPos(positions);
    return avgPos;
  }

  scaleVertices(scaleDistance: Vec3) {
    const center = this.calculateCenter();
    if (!center) {
      return;
    }

    const positionAttribute = this.geometry.getAttribute("position");
    const vertex = new THREE.Vector3();

    for (let i = 0; i < this.selectedVertices.length; i++) {
      const i2 = this.selectedVertices[i];
      vertex.fromBufferAttribute(positionAttribute, i2);

      const pos = convertTVector3ToVec3(vertex);
      const diff = calculateVec3Difference(center, pos);

      const distance = {
        x: scaleDistance.x * -1 * Math.sign(diff.x),
        y: scaleDistance.y * -1 * Math.sign(diff.y),
        z: scaleDistance.z * -1 * Math.sign(diff.z)
      };

      this.translateVertex(vertex, i2, distance);

      positionAttribute.setXYZ(i2, vertex.x, vertex.y, vertex.z);
      positionAttribute.needsUpdate = true;
    }

    this.geometry.computeBoundingSphere();
  }

  repositionTransformHelper() {
    if (!this.transformHelper) {
      return;
    }
    const center = this.calculateCenter();
    if (!center)
      return;
    this.transformHelper.position.set(center.x, center.y, center.z);
  }

  getIndicesPosition() {
    const positionAttribute = this.geometry.getAttribute("position");
    const vertex = new THREE.Vector3();
    const pos = [];

    for (let i = 0; i < this.selectedVertices.length; i++) {
      const i2 = this.selectedVertices[i];
      vertex.fromBufferAttribute(positionAttribute, i2);
      pos.push({ x: vertex.x, y: vertex.y, z: vertex.z });

    }
    return pos;
  }

  clearHighlightedVertices() {
    const colorAttr = this.geometry.getAttribute("color");

    if (
      !colorAttr ||
      !this.verticesHelper) {
      return;
    }

    for (let i = 0; i < this.selectedVertices.length; i++) {
      const i2 = this.selectedVertices[i];

      colorAttr.setX(i2, 0.7);
      colorAttr.setY(i2, 0.7);
      colorAttr.setZ(i2, 0.7);

    }
    colorAttr.needsUpdate = true;

    const threeColor = new THREE.Color(0x000000);
    for (let j = 0; j < this.verticesHelper.count; j++) {
      this.verticesHelper.setColorAt(j, new THREE.Color(threeColor));
    }
    if (this.verticesHelper.instanceColor) {
      this.verticesHelper.instanceColor.needsUpdate = true;
    }
  }

  dispose() {
    if ("id" in this.material && this.material.id !== this.normalMaterial.id)
      if ("dispose" in this.material)
        this.material.dispose();
    this.disposeHelpers();
  }

  copy(source: THREE.Object3D, recursive?: boolean): this {
    super.copy(source, recursive);

    //@ts-expect-error override
    this.type = "ModellingMesh";
    this.normalMaterial = this.material as THREE.Material;

    this.verticesHelper = null;
    this.transformHelper = null;
    this.selectedVertices = [];
    this.groupedVertices = this.groupVertices();

    this.currentVerticesColors = this.initCurrentColors();
    this.modellingOutline = null;

    return this;
  }

  private translateVertex(vertex: THREE.Vector3, index: number, distance: Vec3) {
    vertex.setX(vertex.x + distance.x);
    vertex.setY(vertex.y + distance.y);
    vertex.setZ(vertex.z + distance.z);

    if (!this.verticesHelper) {
      return;
    }
    const vertiMatrix = new THREE.Matrix4();
    this.verticesHelper.getMatrixAt(index, vertiMatrix);
    vertiMatrix.setPosition(vertex);
    this.verticesHelper.setMatrixAt(index, vertiMatrix);
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

  private groupVertices() {
    const positionAttribute = this.geometry.getAttribute("position");

    const map = new Map();
    if (!positionAttribute) return map;

    const vertex = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.array.length / 3; i++) {

      vertex.fromBufferAttribute(positionAttribute, i);
      if (vertex.x === undefined)
        break;

      // Unique key for the same positions
      const key = Number(vertex.x.toFixed(4)) * 100 + Number(vertex.y.toFixed(4)) * 10 + Number(vertex.z.toFixed(4));

      let group: Array<number> = map.get(key);
      if (group) {
        group.push(i);
      } else {
        group = [i];
      }

      map.set(key, group);
    }

    // Reverse map for fast lookups
    const lookupVertices = new Map();
    map.forEach((values) => {
      lookupVertices.set(values[0], values);
      lookupVertices.set(values[1], values);
      lookupVertices.set(values[2], values);
    });
    return lookupVertices;
  }

  private getGroupedVertices(indices: Array<number>) {
    let group: Array<number> = [];
    indices.forEach((indice) => {
      const same = this.groupedVertices.get(indice);
      if (!same) return;
      group = group.concat(same);
    });
    group = Array.from(new Set(group));
    return group;
  }

  private calculateAvgPos(positions: Array<Vec3>): Vec3 {
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

  private disposeHelpers() {

    if (this.transformHelper) {
      this.remove(this.transformHelper);

      if ("dispose" in this.transformHelper.material)
        this.transformHelper.material.dispose();

      this.transformHelper.geometry.dispose();
      this.transformHelper = null;
    }

    if (this.verticesHelper) {
      this.remove(this.verticesHelper);
      this.verticesHelper.geometry.dispose();

      if ("dispose" in this.verticesHelper.material)
        this.verticesHelper.material.dispose();

      this.verticesHelper.dispose();
      this.verticesHelper = null;
    }
  }
}
