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
