import * as THREE from "three/webgpu";
import type { AnimationLoop } from "./AnimationLoop";
import { BACKGROUND_LAYER, DEFAULT_SCENE_COLOR } from "./Global";
import type { AnimationObjectJSON, AnimationSceneJSON } from "./Types";
import type ModellingMesh from "./objects/ModellingMesh";

export function GetAnimationSceneJSON(scene: THREE.Scene, loop: AnimationLoop): AnimationSceneJSON {

  const hex_col = Number("0x" + DEFAULT_SCENE_COLOR.slice(1));

  const cameraBox = loop.getCameraBox();
  const cameraAnimation = loop.getAnimationObjects().find((obj) => obj.getRootObjectID() === cameraBox.id);

  const color = scene.background ? scene.background.toJSON() : hex_col;

  const sceneObjects = scene.children.filter((obj) => !obj.layers.isEnabled(BACKGROUND_LAYER) && obj.id !== cameraBox.id);
  const objectsJson = sceneObjects.map((obj) => getObjectsJSON(obj, loop));

  return {
    sceneColor: (typeof color === "number") ? color : hex_col,
    cameraObject: {
      matrix: cameraBox.matrix,
      animation: cameraAnimation?.getJSON(),
    },
    animationLoopSettings: loop.getSettings(),
    sceneObjects: objectsJson
  };

}

export function getObjectsJSON(rootObj: THREE.Object3D | ModellingMesh, animationLoop: AnimationLoop) {

  const data = rootObj.toJSON();

  const animationJSON: Array<AnimationObjectJSON> = [];
  const animationUUIDS: Array<string> = [];
  rootObj.traverse((obj) => {
    if (obj.userData.animationObject !== undefined) animationUUIDS.push(obj.userData.animationObject);
  });

  animationUUIDS.forEach((uuid) => {
    const obj = animationLoop.findAnimationObjectByID(uuid);
    if (obj !== null) animationJSON.push(obj.getJSON());
  });

  if (animationJSON.length !== 0)
    //@ts-expect-error dynamic property, hard to combine custom type with metaJSON
    data.animation = animationJSON;


  return data;
}
