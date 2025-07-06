import { BufferGeometry, type Intersection } from "three/webgpu";
import { distanceBetweenPoints, distanceFromLine } from "./utils";
import { EDITING_MODE } from "./Types";

export function GetSelectionIndices(intersection: Intersection, selectionType: number) {

  if (!("geometry" in intersection.object)) {
    return [];
  }
  const geometry: BufferGeometry | unknown = intersection.object.geometry;
  if (!(geometry instanceof BufferGeometry)) {
    return [];
  }

  const uvAttr = geometry.getAttribute("uv");

  const tri = intersection.face;
  if (!tri) {
    return [];
  }

  const uv = intersection.uv;
  if (!uv) {
    return [];
  }

  const indices = [];
  if (selectionType === EDITING_MODE.Faces) {
    indices.push(tri.a, tri.b, tri.c);
    return indices;
  }

  const aPoint = { x: uvAttr.array[tri.a * 2], y: uvAttr.array[(tri.a * 2 + 1)] };
  const bPoint = { x: uvAttr.array[tri.b * 2], y: uvAttr.array[(tri.b * 2 + 1)] };
  const cPoint = { x: uvAttr.array[tri.c * 2], y: uvAttr.array[(tri.c * 2 + 1)] };
  const iPoint = { x: uv.x, y: uv.y };

  if (selectionType === EDITING_MODE.Edges) {
    if (distanceFromLine(aPoint, bPoint, iPoint) < 0.04999) {
      indices.push(tri.a, tri.b);
    }
    else if (distanceFromLine(aPoint, cPoint, iPoint) < 0.04999) {
      indices.push(tri.a, tri.c);
    }
    else if (distanceFromLine(bPoint, cPoint, iPoint) < 0.04999) {
      indices.push(tri.b, tri.c);
    }
  }

  if (selectionType === EDITING_MODE.Vertices) {
    if (distanceBetweenPoints(aPoint, iPoint) < 0.04999) {
      indices.push(tri.a);
      return indices;
    }

    if (distanceBetweenPoints(bPoint, iPoint) < 0.04999) {
      indices.push(tri.b);
      return indices;
    }

    if (distanceBetweenPoints(cPoint, iPoint) < 0.04999) {
      indices.push(tri.c);
      return indices;
    }

    return indices;
  }

  return indices;

}
