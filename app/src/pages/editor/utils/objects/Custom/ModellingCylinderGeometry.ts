import * as THREE from "three/webgpu";

export function CreateModellingCylinderGeometry(radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 32, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI * 2): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  radialSegments = Math.floor(radialSegments);
  heightSegments = Math.floor(heightSegments);

  const indices: Array<number> = [];
  const vertices: Array<number> = [];
  const normals: Array<number> = [];
  const uvs: Array<number> = [];
  const colors: Array<number> = [];
  const centers: Array<number> = [];

  let index = 0;
  const indexArray: Array<Array<number>> = [];
  const halfHeight = height / 2;
  let groupStart = 0;

  // Barycentric vectors
  const vectors = [
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(1, 0, 0),
  ];

  // generate geometry
  generateTorso();

  if (openEnded === false) {

    if (radiusTop > 0) generateCap(true);
    if (radiusBottom > 0) generateCap(false);

  }

  // build geometry

  geometry.setIndex(indices);
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3));
  geometry.setAttribute("barycentric", new THREE.Float32BufferAttribute(centers, 3));

  function generateTorso() {

    const normal = new THREE.Vector3();
    const vertex = new THREE.Vector3();

    let groupCount = 0;

    // this will be used to calculate the normal
    const slope = (radiusBottom - radiusTop) / height;

    // generate vertices, normals and uvs

    for (let y = 0; y <= heightSegments; y++) {

      const indexRow = [];

      const v = y / heightSegments;

      // calculate the radius of the current row

      const radius = v * (radiusBottom - radiusTop) + radiusTop;

      for (let x = 0; x <= radialSegments; x++) {

        const u = x / radialSegments;

        const theta = u * thetaLength + thetaStart;

        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        // vertex

        vertex.x = radius * sinTheta;
        vertex.y = - v * height + halfHeight;
        vertex.z = radius * cosTheta;
        vertices.push(vertex.x, vertex.y, vertex.z);

        // normal

        normal.set(sinTheta, slope, cosTheta).normalize();
        normals.push(normal.x, normal.y, normal.z);

        // uv

        uvs.push(u, 1 - v);

        // colors
        colors.push(1);
        colors.push(1);
        colors.push(1);

        // save index of vertex in respective row

        indexRow.push(index++);

      }

      // now save vertices of the row in our index array

      indexArray.push(indexRow);

    }


    // generate indices

    for (let x = 0; x < radialSegments; x++) {

      for (let y = 0; y < heightSegments; y++) {

        // we use the index array to access the correct indices

        const a = indexArray[y][x];
        const b = indexArray[y + 1][x];
        const c = indexArray[y + 1][x + 1];
        const d = indexArray[y][x + 1];

        // faces

        if (radiusTop > 0 || y !== 0) {

          indices.push(a, b, d);
          groupCount += 3;


        }

        if (radiusBottom > 0 || y !== heightSegments - 1) {

          indices.push(b, c, d);
          groupCount += 3;


        }

      }

    }

    //Barycentric
    for (let y = 0; y < heightSegments + 1; y++) {
      for (let x = 0; x < (radialSegments + 1); x++) {
        const nb = (y * (radialSegments + 1) + x) * 3;
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

    // add a group to the geometry. this will ensure multi material support

    geometry.addGroup(groupStart, groupCount, 0);

    // calculate new start value for groups

    groupStart += groupCount;

  }

  function generateCap(top: boolean) {

    // save the index of the first center vertex
    const centerIndexStart = index;

    const uv = new THREE.Vector2();
    const vertex = new THREE.Vector3();

    let groupCount = 0;

    const radius = (top === true) ? radiusTop : radiusBottom;
    const sign = (top === true) ? 1 : - 1;

    // first we generate the center vertex data of the cap.
    // because the geometry needs one set of uvs per face,
    // we must generate a center vertex per face/segment

    for (let x = 1; x <= radialSegments; x++) {

      // vertex

      vertices.push(0, halfHeight * sign, 0);

      // normal

      normals.push(0, sign, 0);

      // uv

      uvs.push(0.5, 0.5);

      // increase index

      index++;

    }

    // save the index of the last center vertex
    const centerIndexEnd = index;

    // now we generate the surrounding vertices, normals and uvs

    for (let x = 0; x <= radialSegments; x++) {

      const u = x / radialSegments;
      const theta = u * thetaLength + thetaStart;

      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      // vertex

      vertex.x = radius * sinTheta;
      vertex.y = halfHeight * sign;
      vertex.z = radius * cosTheta;
      vertices.push(vertex.x, vertex.y, vertex.z);

      // normal

      normals.push(0, sign, 0);

      // uv

      uv.x = (cosTheta * 0.5) + 0.5;
      uv.y = (sinTheta * 0.5 * sign) + 0.5;
      uvs.push(uv.x, uv.y);


      // increase index

      index++;

    }

    // generate indices

    const colorVector = new THREE.Vector3(1, 1, 1);
    for (let x = 0; x < radialSegments; x++) {

      // TODO check uvs
      // Changed, for modelling to work, there should be 1 indice for center
      // const c = centerIndexStart + x;
      const c = centerIndexStart;
      const i = centerIndexEnd + x;

      if (top === true) {

        // face top
        indices.push(i, i + 1, c);

      } else {

        // face bottom
        indices.push(i + 1, i, c);

      }


      if (i % 2 === 0) {
        vectors[0].toArray(centers, i * 3);
        vectors[1].toArray(centers, (i + 1) * 3);
        vectors[2].toArray(centers, c * 3);

        colorVector.toArray(colors, i * 3);
        colorVector.toArray(colors, (i + 1) * 3);
        colorVector.toArray(colors, c * 3);
      }
      if (i % 2 === 1) {
        vectors[1].toArray(centers, i * 3);
        vectors[0].toArray(centers, (i + 1) * 3);
        vectors[2].toArray(centers, c * 3);

        colorVector.toArray(colors, i * 3);
        colorVector.toArray(colors, (i + 1) * 3);
        colorVector.toArray(colors, c * 3);
      }

      groupCount += 3;

    }



    // add a group to the geometry. this will ensure multi material support

    geometry.addGroup(groupStart, groupCount, top === true ? 1 : 2);

    // calculate new start value for groups

    groupStart += groupCount;

  }

  return geometry;
}
