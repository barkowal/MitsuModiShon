import * as THREE from "three/webgpu";

export function CreateModellingSphereGeometry(radius = 1, widthSegments = 32, heightSegments = 16, thetaStart = 0, thetaLength = Math.PI * 2) {
  const geometry = new THREE.BufferGeometry();

  const indices = [];
  const vertices = [];
  const normals = [];
  const uvs = [];
  const colors: Array<number> = [];
  const centers: Array<number> = [];

  let index = 0;
  const grid = [];

  const phiStart = 0;
  const phiLength = Math.PI * 2;
  const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);

  const normal = new THREE.Vector3();

  const vertex = new THREE.Vector3();

  const vectors = [
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(1, 0, 0),
  ];

  for (let iy = 0; iy <= heightSegments; iy++) {

    const verticesRow = [];

    const v = iy / heightSegments;

    // special case for the poles

    let uOffset = 0;

    if (iy === 0 && thetaStart === 0) {

      uOffset = 0.5 / widthSegments;

    } else if (iy === heightSegments && thetaEnd === Math.PI) {

      uOffset = - 0.5 / widthSegments;

    }

    for (let ix = 0; ix <= widthSegments; ix++) {

      const u = ix / widthSegments;

      // vertex

      vertex.x = - radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
      vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
      vertex.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);

      vertices.push(vertex.x, vertex.y, vertex.z);

      // normal

      normal.copy(vertex).normalize();
      normals.push(normal.x, normal.y, normal.z);

      // uv

      uvs.push(u + uOffset, 1 - v);

      verticesRow.push(index++);

      // color attribute
      colors.push(1);
      colors.push(1);
      colors.push(1);

    }

    grid.push(verticesRow);

  }

  for (let iy = 0; iy < heightSegments; iy++) {

    for (let ix = 0; ix < widthSegments; ix++) {

      const a = grid[iy][ix + 1];
      const b = grid[iy][ix];
      const c = grid[iy + 1][ix];
      const d = grid[iy + 1][ix + 1];

      if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
      if (iy !== heightSegments - 1 || thetaEnd < Math.PI) indices.push(b, c, d);

    }

  }

  // BARYCENTRIC FOR TOP FACES
  for (let i = 0; i < widthSegments; i++) {
    vectors[i % 3].toArray(centers, i * 3);
  }

  // BARYCENTRIC FOR MIDDLE FACES
  for (let y = 1; y < heightSegments+1; y++) {

    for (let x = 0; x < (widthSegments + 1); x++) {

      const index = (y * (widthSegments + 1)) + x;
      const nb = index * 3;

      if (y % 3 == 0) {
        vectors[(x) % 3].toArray(centers, nb);
      }

      if (y % 3 == 1) {
        vectors[(x + 1) % 3].toArray(centers, nb);
      }

      if (y % 3 == 2) {
        vectors[(x + 2) % 3].toArray(centers, nb);
      }

    }
  }

  geometry.setIndex(indices);
  geometry.setAttribute("barycentric", new THREE.Float32BufferAttribute(centers, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3));
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

  return geometry;
}

