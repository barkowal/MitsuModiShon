import * as THREE from "three/webgpu";

export function CreateModellingBoxGeometry(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  widthSegments = Math.floor(widthSegments);
  heightSegments = Math.floor(heightSegments);
  depthSegments = Math.floor(depthSegments);

  const indices: Array<number> = [];
  const vertices: Array<number> = [];
  const normals: Array<number> = [];
  const uvs: Array<number> = [];
  const centers: Array<number> = [];
  const colors: Array<number> = [];

  let numberOfVertices = 0;
  let centerOffset = 0;
  let groupStart = 0;
  const x = 0, y = 1, z = 2;

  buildPlane(z, y, x, - 1, - 1, depth, height, width, depthSegments, heightSegments, 0); // px
  buildPlane(z, y, x, 1, - 1, depth, height, - width, depthSegments, heightSegments, 1); // nx
  buildPlane(x, z, y, 1, 1, width, depth, height, widthSegments, depthSegments, 2); // py
  buildPlane(x, z, y, 1, - 1, width, depth, - height, widthSegments, depthSegments, 3); // ny
  buildPlane(x, y, z, 1, - 1, width, height, depth, widthSegments, heightSegments, 4); // pz
  buildPlane(x, y, z, - 1, - 1, width, height, - depth, widthSegments, heightSegments, 5); // nz

  geometry.setIndex(indices);
  geometry.setAttribute("barycentric", new THREE.Float32BufferAttribute(centers, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3));
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));


  function buildPlane(u: number, v: number, w: number, udir: number, vdir: number, width: number, height: number, depth: number, gridX: number, gridY: number, materialIndex: number) {

    const segmentWidth = width / gridX;
    const segmentHeight = height / gridY;

    const widthHalf = width / 2;
    const heightHalf = height / 2;
    const depthHalf = depth / 2;

    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;

    let vertexCounter = 0;
    let groupCount = 0;

    const vector = new THREE.Vector3();

    // generate vertices, normals and uvs

    for (let iy = 0; iy < gridY1; iy++) {

      const y = iy * segmentHeight - heightHalf;

      for (let ix = 0; ix < gridX1; ix++) {

        const x = ix * segmentWidth - widthHalf;

        vector.setComponent(u, x * udir);
        vector.setComponent(v, y * vdir);
        vector.setComponent(w, depthHalf);

        vertices.push(vector.x, vector.y, vector.z);

        vector.setComponent(u, 0);
        vector.setComponent(v, 0);
        vector.setComponent(w, depth > 0 ? 1 : -1);

        normals.push(vector.x, vector.y, vector.z);

        uvs.push(ix / gridX);
        uvs.push(1 - (iy / gridY));

        colors.push(1);
        colors.push(1);
        colors.push(1);

        vertexCounter += 1;
      }
    }

    for (let iy = 0; iy < gridY; iy++) {

      for (let ix = 0; ix < gridX; ix++) {

        const a = numberOfVertices + ix + gridX1 * iy;
        const b = numberOfVertices + ix + gridX1 * (iy + 1);
        const c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
        const d = numberOfVertices + (ix + 1) + gridX1 * iy;

        indices.push(a, b, d);
        indices.push(b, c, d);

        groupCount += 6;

      }

    }

    // Calculating barycentric attribute
    const vectors = [
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(1, 0, 0),
    ];

    let offsetCount = 0;
    for (let y = 0; y < gridY1; y++) {
      for (let x = 0; x < gridX1; x++) {
        const nb = ((y * (gridX1) + x) * 3) + centerOffset;
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
        offsetCount += 3;
      }
    }
    centerOffset += offsetCount;

    // add a group to the geometry. this will ensure multi material support
    geometry.addGroup(groupStart, groupCount, materialIndex);

    // calculate new start value for groups
    groupStart += groupCount;

    numberOfVertices += vertexCounter;
  }
  return geometry;
}


