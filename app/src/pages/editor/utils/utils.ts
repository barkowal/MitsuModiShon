import * as THREE from "three/webgpu";
import type { Point2d, Vec3 } from "./Types";

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

export function isArrayOfMeshes(array: Array<THREE.Object3D>): boolean {
  let onlyMeshes = true;
  array.forEach((obj) => {
    if (!(obj instanceof THREE.Mesh)) {
      onlyMeshes = false;
    }
  });
  return onlyMeshes;
}

export function disposeMesh(scene: THREE.Scene, object: THREE.Object3D) {
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
