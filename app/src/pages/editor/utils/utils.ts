import * as THREE from "three/webgpu";
import type { KeyframeSequence, KeyframeSequenceJSON, Point2d, Vec3 } from "./Types";

export function convertTVector3ToVec3(vec: THREE.Vector3): Vec3 {
  return {
    x: vec.x,
    y: vec.y,
    z: vec.z,
  };
}

export function compareVec3(a: Vec3, b: Vec3): boolean {
  return (a.x === b.x &&
    a.y === b.y &&
    a.z === b.z);
}

export function calculateVec3Difference(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };
}

export function convertEulerToVec3Degrees(euler: THREE.Euler): Vec3 {
  return ({
    x: euler.x * (180 / Math.PI),
    y: euler.y * (180 / Math.PI),
    z: euler.z * (180 / Math.PI),
  });
}

export function convertVec3ToHexColor(vecColor: Vec3): number {
  const hexColor = (vecColor.x * 255 << 16) + (vecColor.y * 255 << 8) + (vecColor.z * 255);
  return hexColor;
}

export function convertHexColorToVec3(hexColor: number): Vec3 {
  const r = ((hexColor >> 16) & 255) / 255;
  const g = ((hexColor >> 8) & 255) / 255;
  const b = (hexColor & 255) / 255;

  return { x: r, y: g, z: b };
}

export function convertHexColorStringToNumber(hexString: string): number {
  return Number("0x" + hexString.slice(1));
}

export function convertHexColorNumberToString(hexColor: number): string {
  let hex = hexColor.toString(16);
  hex = hex.padStart(6, "0");
  return "#" + hex;
}

export function isArrayOfMeshes(array: Array<THREE.Object3D>): boolean {
  let onlyMeshes = true;
  array.forEach((obj) => {
    if (!(obj instanceof THREE.Mesh)) {
      onlyMeshes = false;
    }
  });
  return onlyMeshes;
}

// TODO check
export function disposeMesh(scene: THREE.Scene, object3d: THREE.Object3D) {
  object3d.traverse((obj) => disposeObject(scene, obj));
}

function disposeObject(scene: THREE.Scene, object: THREE.Object3D) {
  if (object && !scene.getObjectById(object.id)) {
    if (object instanceof THREE.Mesh) {
      if ("dispose" in object.material) {
        object.material.dispose();
      }
      object.geometry.dispose();
    }
  }
}

export function distanceFromLine(pointA: Point2d, pointB: Point2d, pointC: Point2d): number {
  const numerator = Math.abs((pointB.y - pointA.y) * pointC.x - (pointB.x - pointA.x) * pointC.y + pointB.x * pointA.y - pointB.y * pointA.x);
  const denominator = Math.sqrt(Math.pow(pointB.y - pointA.y, 2) + Math.pow(pointB.x - pointA.x, 2));

  return numerator / denominator;
}

export function distanceBetweenPoints(pointA: Point2d, pointB: Point2d): number {
  return Math.sqrt(Math.pow(pointA.y - pointB.y, 2) + Math.pow(pointA.x - pointB.x, 2));
}

export function KeyframeSequenctToJSON(sequence: KeyframeSequence): KeyframeSequenceJSON {
  const values: Array<Array<number>> = [];

  sequence.values.forEach((valueArray) => {
    const arr = valueArray.toArray();
    values.push(arr);
  });

  return {
    keyframes: sequence.keyframes,
    values: values,
    interpolations: sequence.interpolations,
  };
}

export function Vector3ArrayFromNumberArray(data: Array<Array<number>>): Array<THREE.Vector3> {
  const vec3Arr: Array<THREE.Vector3> = [];

  data.forEach((arr) => {
    if (arr.length < 2) return;
    vec3Arr.push(new THREE.Vector3(arr[0], arr[1], arr[2]));
  });

  return vec3Arr;
}

export function QuaternionArrayFromNumberArray(data: Array<Array<number>>): Array<THREE.Quaternion> {
  const quatArr: Array<THREE.Quaternion> = [];

  data.forEach((arr) => {
    if (arr.length < 3) return;
    quatArr.push(new THREE.Quaternion(arr[0], arr[1], arr[2], arr[3]));
  });

  return quatArr;
}
