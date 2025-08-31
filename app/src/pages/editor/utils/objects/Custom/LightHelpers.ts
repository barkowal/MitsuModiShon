import * as THREE from "three/webgpu";

export function getPointLightHelper() {
  const geometry = new THREE.SphereGeometry(0.2, 4, 2);
  const material = new THREE.MeshBasicMaterial({ wireframe: true, fog: false, toneMapped: false });

  const helper = new THREE.Mesh(geometry, material);

  return helper;
}
