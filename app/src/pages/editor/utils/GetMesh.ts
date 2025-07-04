import * as THREE from "three/webgpu";
import { INTERSECTION_LAYER } from "./Global";
import { CreateModellingPlaneGeometry } from "./objects/Custom/ModellingPlaneGeometry";
import ModellingMesh from "./objects/ModellingMesh";

export const MESH_TYPE = {
    BOX: "box",
    PLANE: "plane",
    CIRCLE: "circle",
    CONE: "cone",
    CYLINDER: "cylinder",
    CAPSULE: "capsule",
    SPHERE: "sphere",
    TEST_PLANE: "TestPlane",
} as const;

type MeshValues<T> = T[keyof T]

export type MeshType = MeshValues<typeof MESH_TYPE>

export function GetMesh(objType: MeshType): THREE.Mesh {
    const material = new THREE.MeshBasicMaterial({ color: 0xa5a5a5, side: THREE.DoubleSide });
    let geom;

    switch (objType) {
        case "box": geom = new THREE.BoxGeometry(1, 1, 1); break;
        case "plane": geom = new THREE.PlaneGeometry(1, 1); break;
        case "circle": geom = new THREE.CircleGeometry(1, 32); break;
        case "cone": geom = new THREE.ConeGeometry(1, 1, 32); break;
        case "cylinder": geom = new THREE.CylinderGeometry(1, 1, 1, 32); break;
        case "capsule": geom = new THREE.CapsuleGeometry(1, 1, 4, 8); break;
        case "sphere": geom = new THREE.SphereGeometry(1, 32, 16); break;
        case "TestPlane": {
            const mGeom = CreateModellingPlaneGeometry(4, 4, 4, 4);
            const plane = new ModellingMesh(mGeom, material);
            plane.layers.enable(INTERSECTION_LAYER);
            plane.name = "Modelling Mesh";
            return plane;
        }
        default: geom = new THREE.BoxGeometry(1, 1, 1);
    }

    const mesh = new THREE.Mesh(geom, material);
    mesh.name = "mesh";
    mesh.layers.enable(INTERSECTION_LAYER);

    return mesh;
}
