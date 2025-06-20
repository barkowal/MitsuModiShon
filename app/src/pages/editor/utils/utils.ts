import * as THREE from "three/webgpu";
import type { Vec3 } from "./Types";

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

export function isArrayOfMeshes(array: Array<THREE.Object3D>) {
  let onlyMeshes = true;
  array.forEach((obj) => {
    if (!(obj instanceof THREE.Mesh)) {
      onlyMeshes = false;
    }
  });
  return onlyMeshes;
}

