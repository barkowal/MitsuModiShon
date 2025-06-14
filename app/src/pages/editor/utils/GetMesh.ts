import * as THREE from "three/webgpu";
import { INTERSECTION_LAYER } from "./Global";

export const MESH_TYPE = {
    BOX: "box",
    CIRCLE: "circle",
    CONE: "cone",
    CYLINDER: "cylinder",
    CAPSULE: "capsule",
    SPHERE: "sphere",
} as const;

type MeshValues<T> = T[keyof T]

export type MeshType = MeshValues<typeof MESH_TYPE>

export function GetMesh(objType: MeshType): THREE.Mesh {
    const material = new THREE.MeshBasicMaterial({ color: 0xa5a5a5 });
    let geom;

    switch (objType) {
        case "box": geom = new THREE.BoxGeometry(1, 1, 1); break;
        case "circle": geom = new THREE.CircleGeometry(1, 32); break;
        case "cone": geom = new THREE.ConeGeometry(1, 1, 32); break;
        case "cylinder": geom = new THREE.CylinderGeometry(1, 1, 1, 32); break;
        case "capsule": geom = new THREE.CapsuleGeometry(1, 1, 4, 8); break;
        case "sphere": geom = new THREE.SphereGeometry(1, 32, 16); break;
        default: geom = new THREE.BoxGeometry(1, 1, 1);
    }

    const mesh = new THREE.Mesh(geom, material);
    mesh.name = "mesh";
    mesh.layers.enable(INTERSECTION_LAYER);

    return mesh;
}
