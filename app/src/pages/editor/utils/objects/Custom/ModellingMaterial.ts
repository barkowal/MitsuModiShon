import * as THREE from "three/webgpu";
import { smoothstep, attribute, fwidth, min, positionGeometry, vec3, mul, sub, cameraProjectionMatrix, modelViewMatrix, vec4, step, length, max, add } from "three/tsl";
import { Fn } from "three/src/nodes/TSL.js";

// TODO Make a wireframe shader for indexed geometries
export function CreateModellingMaterial(): THREE.MeshBasicNodeMaterial {
  const material = new THREE.MeshBasicNodeMaterial();
  const thickness = 1.499;
  const disabledFace = false;

  //@ts-expect-error tsl error
  const Wireframe = Fn(([center, thickness]) => {
    const afwidth = fwidth(center.xyz);
    const edge3 = vec3(smoothstep(mul(sub(thickness, 1.0), afwidth), mul(thickness, afwidth), center.xyz)).toVar();
    const edges = vec3(min(min(edge3.x, edge3.y), edge3.z));
    return edges;
  });

  //@ts-expect-error tsl error
  const CenterCross = Fn(([center]) => {
    const xLine = length(center.x.sub(0.325));
    const centerLine = xLine;
    const circleCon = step(0.0, length(mul(center, 0.333)).sub(0.1925)); // circle for displaying only on center
    const centerCross = smoothstep(0.96, 0.97, mul(max(circleCon, centerLine), 20));
    return add(centerCross, 0.12); // brighter colors
  });

  const fragmentFunction = Fn(() => {
    const vCenter = attribute("barycentric");
    const colors = attribute("color");
    const color = vec4(0.49999, 0.49999, 0.49999, 1).toVar();

    const selection = mul(smoothstep(0.98, 1, colors), vec3(0.05, 0.2, 0.9));
    //@ts-expect-error tsl error
    const edges = Wireframe(vCenter, thickness);

    const finalColor = max(min(color, edges), selection);

    //@ts-expect-error tsl error
    const middle = add(max(CenterCross(vCenter), selection), disabledFace);

    return min(finalColor, middle);
  });
  material.vertexNode = mul(cameraProjectionMatrix, modelViewMatrix, vec4(positionGeometry, 1.0));
  material.fragmentNode = fragmentFunction();
  material.side = THREE.DoubleSide;
  material.vertexColors = true;

  return material;
}
