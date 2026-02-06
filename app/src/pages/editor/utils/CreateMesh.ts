import * as THREE from "three/webgpu";
import { CreateModellingPlaneGeometry } from "./objects/Custom/ModellingPlaneGeometry";
import ModellingMesh from "./objects/ModellingMesh";
import { EDITOR_LAYER, INTERSECTION_LAYER, RENDER_LAYER } from "./Global";
import { CreateModellingBoxGeometry } from "./objects/Custom/ModellingBoxGeometry";
import { CreateModellingCircleGeometry } from "./objects/Custom/ModellingCircleGeometry";
import { CreateModellingCylinderGeometry } from "./objects/Custom/ModellingCylinderGeometry";
import { CreateModellingConeGeometry } from "./objects/Custom/ModellingConeGeometry";
import { CreateModellingSphereGeometry } from "./objects/Custom/ModellingSphereGeometry.ts";

export const CREATE_OBJECT_TYPES = {
  ModelingPlane: 0,
  ModellingBox: 1,
  ModellingCircle: 2,
  ModellingCylinder: 3,
  ModellingCone: 4,
  Sphere: 5,
  Ring: 6,
} as const;

export function CreateMesh(meshData: Array<number>): THREE.Mesh {
  const meshType = meshData[0];
  const material = new THREE.MeshBasicMaterial({ color: 0xa5a5a5, side: THREE.DoubleSide, vertexColors: true });
  let geometry;
  let mesh;

  switch (meshType) {

    case CREATE_OBJECT_TYPES.ModelingPlane: {
      geometry = CreateModellingPlaneGeometry(meshData[1], meshData[2], meshData[3], meshData[4]);
      mesh = new ModellingMesh(geometry, material);
      break;
    }

    case CREATE_OBJECT_TYPES.ModellingBox: {
      geometry = CreateModellingBoxGeometry(meshData[1], meshData[2], meshData[3], meshData[4], meshData[5], meshData[6]);
      mesh = new ModellingMesh(geometry, material);
      break;
    }

    case CREATE_OBJECT_TYPES.ModellingCircle: {
      const thetaStart = meshData[4] / (100 / (Math.PI * 2));;
      const thetaLength = meshData[4] / (100 / (Math.PI * 2));
      geometry = CreateModellingCircleGeometry(meshData[1], meshData[2], thetaStart, thetaLength);
      mesh = new ModellingMesh(geometry, material);
      break;
    }

    case CREATE_OBJECT_TYPES.ModellingCylinder: {
      const thetaStart = meshData[6] / (100 / (Math.PI * 2));;
      const thetaLength = meshData[7] / (100 / (Math.PI * 2));
      geometry = CreateModellingCylinderGeometry(meshData[1], meshData[2], meshData[3], meshData[4], meshData[5], false, thetaStart, thetaLength);
      mesh = new ModellingMesh(geometry, material);
      break;
    }

    case CREATE_OBJECT_TYPES.ModellingCone: {
      const thetaStart = meshData[5] / (100 / (Math.PI * 2));;
      const thetaLength = meshData[6] / (100 / (Math.PI * 2));
      geometry = CreateModellingConeGeometry(meshData[1], meshData[2], meshData[3], meshData[4], false, thetaStart, thetaLength);
      mesh = new ModellingMesh(geometry, material);
      break;
    }

    case CREATE_OBJECT_TYPES.Sphere: {
      const thetaStart = meshData[4] / (100 / (Math.PI * 2));;
      const thetaLength = meshData[5] / (100 / (Math.PI));
      geometry = CreateModellingSphereGeometry(meshData[1], meshData[2], meshData[3], thetaStart, thetaLength);
      mesh = new ModellingMesh(geometry, material);
      break;
    }

    default: {
      geometry = new THREE.BoxGeometry();
      mesh = new THREE.Mesh(geometry, material);
      break;

    }

  };

  mesh.name = "Mesh";
  mesh.layers.enable(EDITOR_LAYER);
  mesh.layers.enable(RENDER_LAYER);
  mesh.layers.enable(INTERSECTION_LAYER);

  return mesh;
}
