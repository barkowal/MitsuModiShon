import * as THREE from "three/webgpu";
import { smoothstep, attribute, fwidth, min, positionGeometry, vec3, mul, sub, cameraProjectionMatrix, modelViewMatrix, vec4, max, oneMinus } from "three/tsl";
import { Fn } from "three/src/nodes/TSL.js";

export function CreateLineSelectMaterial(): THREE.MeshBasicNodeMaterial {
  const material = new THREE.MeshBasicNodeMaterial();
  const thickness = 2.99;

  //@ts-expect-error tsl error
  const Wireframe = Fn(([center, thickness]) => {
    const afwidth = fwidth(center.xyz);
    const edge3 = vec3(smoothstep(mul(sub(thickness, 1.0), afwidth), mul(thickness, afwidth), center.xyz)).toVar();
    const edges = vec3(min(min(edge3.x, edge3.y), edge3.z));
    return edges;
  });

  const fragmentFunction = Fn(() => {
    const vCenter = attribute("barycentric");
    const color = vec4(0.29999, 0.24999, 0.56999, 1).toVar();

    //@ts-expect-error tsl error
    const edges = Wireframe(vCenter, thickness);
    const finalColor = min(color, edges);

    return max(finalColor, oneMinus(edges));
  });
  material.vertexNode = mul(cameraProjectionMatrix, modelViewMatrix, vec4(positionGeometry, 1.0));
  material.fragmentNode = fragmentFunction();
  material.side = THREE.DoubleSide;
  material.vertexColors = true;
  material.name = "DrawingMaterial";

  return material;
}
