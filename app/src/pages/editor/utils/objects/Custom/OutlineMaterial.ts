import { positionLocal, vec4 } from "three/tsl";
import * as THREE from "three/webgpu";

export function CreateOutlineMaterial() {
	const outlineMaterial = new THREE.MeshStandardNodeMaterial;

	outlineMaterial.positionNode = positionLocal.add((positionLocal.mul(0.1)));
	outlineMaterial.fragmentNode = vec4(1.0, 1.0, 1.0, 1.0);
	outlineMaterial.side = THREE.DoubleSide;

	outlineMaterial.depthWrite = false;
	outlineMaterial.depthTest = false;

	return outlineMaterial;
}

