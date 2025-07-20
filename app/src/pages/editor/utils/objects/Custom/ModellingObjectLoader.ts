import * as THREE from "three/webgpu";
import ModellingMesh from "../ModellingMesh";
import { ModellingOutline } from "../ModellingOutline";
import { Line2 } from "three/examples/jsm/Addons.js";
import { ModellingLineGeometry } from "./ModellingLineGeometry";

type ObjectJSONDataType = {
  animations?: THREE.AnimationClipJSON,
  geometries?: Array<THREE.BufferGeometryJSON>,
  images?: JSON,
  textures?: JSON,
  materials?: Array<THREE.MaterialJSON>,
  object?: THREE.Object3DJSONObject,
}

// TODO make better types for specific objects
type ModellingObjectJSON = {
  uuid: string,
  type: string,
  geometry?: string,
  material?: string,
  name?: string,
  layers?: number,
  objectsGeometry?: string,
  lineWidth?: number,
  lineColor?: number,
  currentLines?: Array<Array<number>>,

  children?: Array<ModellingObjectJSON> | Array<THREE.Object3DJSONObject>,
};

// TODO check types
export class ModellingObjectLoader {
  private objectLoader: THREE.ObjectLoader;

  constructor(objectLoader: THREE.ObjectLoader) {
    this.objectLoader = objectLoader;
  }

  parse(jsonData: ObjectJSONDataType): THREE.Object3D | null {

    if (jsonData.object === undefined) return null;

    let geometries, materials;
    let object;

    const animations = this.objectLoader.parseAnimations(jsonData.animations);

    if (jsonData.geometries !== undefined)
      geometries = this.parseGeometries(jsonData.geometries);

    const images = this.objectLoader.parseImages(jsonData.images);

    const textures = this.objectLoader.parseTextures(jsonData.textures, images);

    if (jsonData.materials !== undefined)
      materials = this.parseMaterials(jsonData.materials, textures);

    if (geometries === undefined) return null;
    if (materials === undefined) return null;

    if (this.isModellingType(jsonData.object.type)) {
      object = this.parseModellingObject(jsonData.object as ModellingObjectJSON, geometries, materials, animations);
    }
    else {
      object = this.objectLoader.parseObject(jsonData.object, geometries, materials, animations);
    }

    return object;
  }

  // TODO remember about animations
  private parseModellingObject(
    jsonData: ModellingObjectJSON,
    geometries: { [key: string]: THREE.BufferGeometry },
    materials: { [key: string]: THREE.Material },
    animations: { [key: string]: THREE.AnimationClip },) {

    let object;
    let geometry, material;

    function getGeometry(name: string) {
      if (geometries[name] === undefined) {
        console.warn("THREE.ObjectLoader: Undefined geometry", name);
      }
      return geometries[name];
    }

    function getMaterial(name: string) {
      if (name === undefined) return undefined;
      if (Array.isArray(name)) {
        const array = [];
        for (let i = 0, l = name.length; i < l; i++) {
          const uuid = name[i];
          if (materials[uuid] === undefined) {
            console.warn("THREE.ObjectLoader: Undefined material", uuid);
          }
          array.push(materials[uuid]);
        }
        return array;
      }

      if (materials[name] === undefined) {
        console.warn("THREE.ObjectLoader: Undefined material", name);
      }

      return materials[name];

    }

    switch (jsonData.type) {
      case "ModellingMesh": {
        if (!(jsonData.geometry)) break;
        if (!(jsonData.material)) break;

        geometry = getGeometry(jsonData.geometry);
        material = getMaterial(jsonData.material);

        object = new ModellingMesh(geometry, material as THREE.Material);

        object.name = jsonData.name ? jsonData.name : "ModellingMesh";
        break;
      }
      case "ModellingOutline": {
        if (!(jsonData.objectsGeometry)) break;
        if (!(jsonData.currentLines)) break;

        const objectGeometry = getGeometry(jsonData.objectsGeometry);
        object = new ModellingOutline(objectGeometry);
        object.createOutlineFromVerticesGroups(jsonData.currentLines);

        if (jsonData.lineWidth)
          object.setLineWidth(jsonData.lineWidth);

        if (jsonData.lineColor)
          object.setLineColor(jsonData.lineColor);

        break;
      }
      case "Line2": {
        if (!(jsonData.geometry)) break;
        if (!(jsonData.material)) break;

        geometry = getGeometry(jsonData.geometry);
        material = getMaterial(jsonData.material);

        if (!(geometry instanceof ModellingLineGeometry)) break;
        if (!(material instanceof THREE.Line2NodeMaterial)) break;

        //@ts-expect-error Checked for correct type
        object = new Line2(geometry, material);
        object.name = jsonData.name ? jsonData.name : "Stroke";

        break;
      }

    }

    if (object === undefined) return null;

    if (jsonData.layers) object.layers.mask = jsonData.layers;

    if (jsonData.children === undefined) return object;

    const children = jsonData.children;
    for (let i = 0; i < children.length; i++) {

      if (this.isModellingType(children[i].type)) {

        const child = this.parseModellingObject(children[i] as ModellingObjectJSON, geometries, materials, animations);
        if (child) object.add(child);

      } else {

        object.add(this.objectLoader.parseObject(children[i], geometries, materials, animations));

      }
    }

    return object;

  }

  private parseModellingLineGeometry(json: THREE.BufferGeometryJSON) {
    const geometry = new ModellingLineGeometry();
    if (json.userData === undefined) return geometry;

    const linePoints = json.userData.linePoints as THREE.Vector3[];
    geometry.setFromPoints(linePoints);

    return geometry;
  }

  private parseLineNodeMaterial(json: THREE.MaterialJSON) {
    const material = new THREE.Line2NodeMaterial();

    if (json.uuid !== undefined) material.uuid = json.uuid;
    if (json.name !== undefined) material.name = json.name;
    if (json.color !== undefined && material.color !== undefined) material.color.setHex(json.color);
    if (json.side !== undefined) material.side = json.side;
    if (json.linewidth !== undefined) material.linewidth = json.linewidth;
    if (json.scale !== undefined) material.scale = json.scale;
    if (json.userData !== undefined) material.userData = json.userData;
    if (json.blending !== undefined) material.blending = json.blending;
    if (json.blendColor !== undefined && material.blendColor !== undefined) material.blendColor.setHex(json.blendColor);
    if (json.dashSize !== undefined) material.dashSize = json.dashSize;
    if (json.gapSize !== undefined) material.gapSize = json.gapSize;
    if (json.alphaToCoverage !== undefined) material.alphaToCoverage = json.alphaToCoverage;

    return material;
  }

  private isModellingType(objectType: string): boolean {
    switch (objectType) {
      case "ModellingMesh": return true;
      case "ModellingLineSegmentsGeometry": return true;
      case "Line2": return true;
      case "ModellingOutline": return true;
      default: return false;
    };
  }

  private getGeometry(geometryType: string, data: THREE.BufferGeometryJSON) {

    switch (geometryType) {
      case ("BoxGeometry"): return THREE.BoxGeometry.fromJSON(data);
      case ("CapsuleGeometry"): return THREE.CapsuleGeometry.fromJSON(data);
      case ("CircleGeometry"): return THREE.CircleGeometry.fromJSON(data);
      case ("ConeGeometry"): return THREE.ConeGeometry.fromJSON(data);
      case ("CylinderGeometry"): return THREE.CylinderGeometry.fromJSON(data);
      case ("DodecahedronGeometry"): return THREE.DodecahedronGeometry.fromJSON(data);
      case ("IcosahedronGeometry"): return THREE.IcosahedronGeometry.fromJSON(data);
      case ("LatheGeometry"): return THREE.LatheGeometry.fromJSON(data);
      case ("OctahedronGeometry"): return THREE.OctahedronGeometry.fromJSON(data);
      case ("PlaneGeometry"): return THREE.PlaneGeometry.fromJSON(data);
      case ("PolyhedronGeometry"): return THREE.PolyhedronGeometry.fromJSON(data);
      case ("RingGeometry"): return THREE.RingGeometry.fromJSON(data);
      case ("ShapeGeometry"): return THREE.ShapeGeometry.fromJSON(data);
      case ("SphereGeometry"): return THREE.SphereGeometry.fromJSON(data);
      case ("TetrahedronGeometry"): return THREE.TetrahedronGeometry.fromJSON(data);
      case ("TorusGeometry"): return THREE.TorusGeometry.fromJSON(data);
      case ("TorusKnotGeometry"): return THREE.TorusKnotGeometry.fromJSON(data);
      case ("TubeGeometry"): return THREE.TubeGeometry.fromJSON(data);
      // case ("WireframeGeometry"): return THREE.WireframeGeometry.fromJSON(data);
      // case ("EdgesGeometry"): return THREE.EdgesGeometry.fromJSON(data);
      // case ("ExtrudeGeometry"): return THREE.ExtrudeGeometry.fromJSON(data);
    }
    return null;
  }

  // Override, added ModellingLineGeometry
  private parseGeometries(json: Array<THREE.BufferGeometryJSON>) {

    const geometries: Record<string, THREE.BufferGeometry> = {};

    if (json !== undefined) {

      const bufferGeometryLoader = new THREE.BufferGeometryLoader();

      for (let i = 0, l = json.length; i < l; i++) {

        let geometry;
        const data = json[i];

        switch (data.type) {

          case "ModellingLineGeometry": {
            geometry = this.parseModellingLineGeometry(data);
            break;
          }

          case "BufferGeometry":
          case "InstancedBufferGeometry":

            geometry = bufferGeometryLoader.parse(data);
            break;

          default:
            geometry = this.getGeometry(data.type, data);

            if (geometry === null) {
              console.warn(`THREE.ObjectLoader: Unsupported geometry type "${data.type}"`);
            }
        }

        if (geometry === null)
          break;

        geometry.uuid = data.uuid;

        if (data.name !== undefined) geometry.name = data.name;
        if (data.userData !== undefined) geometry.userData = data.userData;

        geometries[data.uuid] = geometry;

      }

    }

    return geometries;
  }

  // Override, added Line2NodeMaterial
  private parseMaterials(json: Array<THREE.MaterialJSON>, textures: Record<string, THREE.Texture>) {

    const cache: Record<string, THREE.Material> = {}; // MultiMaterial
    const materials: Record<string, THREE.Material> = {};

    if (json !== undefined) {

      const loader = new THREE.MaterialLoader();
      loader.setTextures(textures);

      for (let i = 0, l = json.length; i < l; i++) {

        const data = json[i];

        if (cache[data.uuid] === undefined) {

          if (data.type === "Line2NodeMaterial") {
            cache[data.uuid] = this.parseLineNodeMaterial(data);

          } else {
            cache[data.uuid] = loader.parse(data);
          }
        }

        materials[data.uuid] = cache[data.uuid];

      }

    }

    return materials;

  }

}
