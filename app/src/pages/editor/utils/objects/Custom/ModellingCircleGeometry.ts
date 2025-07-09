import * as THREE from "three/webgpu";

export function CreateModellingCircleGeometry(radius = 1, segments = 32, thetaStart = 0, thetaLength = Math.PI * 2) {
  const geometry = new THREE.BufferGeometry();

  segments = Math.max(3, segments);

  const indices = [];
  const vertices = [];
  const normals = [];
  const uvs = [];
  const colors: Array<number> = [];
  const centers: Array<number> = [];

  const vertex = new THREE.Vector3();
  const uv = new THREE.Vector2();

  const vectors = [
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(1, 0, 0),
  ];

  vertices.push(0, 0, 0);
  normals.push(0, 0, 1);
  uvs.push(0.5, 0.5);

  for (let s = 0, i = 3; s <= segments; s++, i += 3) {

    const segment = thetaStart + s / segments * thetaLength;

    // vertex

    vertex.x = radius * Math.cos(segment);
    vertex.y = radius * Math.sin(segment);

    vertices.push(vertex.x, vertex.y, vertex.z);

    // normal

    normals.push(0, 0, 1);

    // uvs

    uv.x = (vertices[i] / radius + 1) / 2;
    uv.y = (vertices[i + 1] / radius + 1) / 2;

    uvs.push(uv.x, uv.y);

    colors.push(171 / 255);
    colors.push(171 / 255);
    colors.push(171 / 255);
  }

  // Colors for last vertex
  colors.push(171 / 255);
  colors.push(171 / 255);
  colors.push(171 / 255);

  // Center vertice is always 001
  vectors[0].toArray(centers, 0);

  for (let i = 1; i <= segments; i++) {

    indices.push(i, i + 1, 0);

    vectors[i % 2 + 1].toArray(centers, i * 3);
  }

  // Last barycentric coord
  vectors[(segments + 1) % 2 + 1].toArray(centers, (segments + 1) * 3);


  geometry.setIndex(indices);
  geometry.setAttribute("barycentric", new THREE.Float32BufferAttribute(centers, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3));
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

  return geometry;
}

