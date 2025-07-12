import * as THREE from "three/webgpu";

export function CreateModellingPlaneGeometry(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
  const geometry = new THREE.BufferGeometry();

  const width_half = width / 2;
  const height_half = height / 2;

  const gridX = Math.floor(widthSegments);
  const gridY = Math.floor(heightSegments);

  const gridX1 = gridX + 1;
  const gridY1 = gridY + 1;

  const segment_width = width / gridX;
  const segment_height = height / gridY;

  const indices = [];
  const vertices = [];
  const normals = [];
  const uvs = [];
  const colors = [];

  for (let iy = 0; iy < gridY1; iy++) {

    const y = iy * segment_height - height_half;

    for (let ix = 0; ix < gridX1; ix++) {

      const x = ix * segment_width - width_half;

      vertices.push(x, - y, 0);

      normals.push(0, 0, 1);

      uvs.push(ix / gridX);
      uvs.push(1 - (iy / gridY));

      colors.push(1);
      colors.push(1);
      colors.push(1);

    }

  }

  for (let iy = 0; iy < gridY; iy++) {

    for (let ix = 0; ix < gridX; ix++) {

      const a = ix + gridX1 * iy;
      const b = ix + gridX1 * (iy + 1);
      const c = (ix + 1) + gridX1 * (iy + 1);
      const d = (ix + 1) + gridX1 * iy;

      indices.push(a, b, d);
      indices.push(b, c, d);

    }

  }

  const centers = new Float32Array(vertices.length * 3);

  const vectors = [
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(1, 0, 0),
  ];

  for (let y = 0; y < heightSegments + 1; y++) {
    for (let x = 0; x < (widthSegments + 1); x++) {
      const nb = (y * (widthSegments + 1) + x) * 3;
      if (y % 3 == 0) {
        // vectors 1,0,2,1,0,2...
        vectors[(x * 2 + 1) % 3].toArray(centers, nb);
      }

      if (y % 3 == 1) {
        // vectors 2,1,0,2,1,0...
        vectors[((x + 1) * 2) % 3].toArray(centers, nb);
      }

      if (y % 3 == 2) {
        // vectors 0,2,1,0,2,1,...
        vectors[(x * 2) % 3].toArray(centers, nb);
      }
    }
  }

  geometry.setAttribute("barycentric", new THREE.BufferAttribute(centers, 3));

  geometry.setIndex(indices);
  geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3));
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));


  return geometry;
}
