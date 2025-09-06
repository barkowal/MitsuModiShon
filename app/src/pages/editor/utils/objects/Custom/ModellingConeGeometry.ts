import * as THREE from "three/webgpu";
import { CreateModellingCylinderGeometry } from "./ModellingCylinderGeometry";

export function CreateModellingConeGeometry(radius = 1, height = 1, radialSegments = 1, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI * 2): THREE.BufferGeometry {

  return CreateModellingCylinderGeometry(0, radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);

}
