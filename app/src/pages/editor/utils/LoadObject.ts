import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { AnimationObject } from "./objects/AnimationObject";
import { ModellingObjectLoader } from "./objects/Custom/ModellingObjectLoader";
import { Object3D, ObjectLoader } from "three/webgpu";
import type { AnimationObjectJSON } from "./Types";
import { QuaternionArrayFromNumberArray, Vector3ArrayFromNumberArray } from "./utils";
import type { AnimationLoop } from "./AnimationLoop";

export function LoadObject(file: string): Object3D | null {

  const loader = new ObjectLoader();
  const jsonData = JSON.parse(file);
  let object;

  if (!("object" in jsonData)) {
    editorEventBus.emit(EDITOR_EVENT.SendWarningLog, "Error uploading a file. Please upload json of type Object3d.");
    return null;
  }

  if (jsonData.object.type === "ModellingMesh") {
    const modellingLoader = new ModellingObjectLoader(loader);
    object = modellingLoader.parse(jsonData);
  } else {
    object = loader.parse(jsonData);
  }

  object?.position.set(0, 0, 0);
  return object;
}

export function LoadAnimationObject(file: string, loop: AnimationLoop): AnimationObject | Object3D | null {

  const jsonData = JSON.parse(file);
  const object = LoadObject(file);

  if (object === null) return null;
  if (jsonData.animation === undefined) return object;

  const animationObjects: Array<AnimationObject> = [];

  object.traverse((obj) => {

    if (obj.userData.animationObject !== undefined) {

      jsonData.animation.forEach((data: AnimationObjectJSON) => {
        if (data.uuid === obj.userData.animationObject) {
          const animationData = parseAnimationData(data);
          const animationObj = new AnimationObject(obj, loop.getFps());
          animationObj.setFromJSON(animationData);
          animationObj.startPlaying();
          animationObjects.push(animationObj);
          loop.addAnimationObject(animationObj);
        }
      });

    }

  });

  return animationObjects[0];
}

// TODO ugly types
function parseAnimationData(json: AnimationObjectJSON): AnimationObjectJSON {

  const data: AnimationObjectJSON = {
    uuid: json.uuid,
    loop: true,
    positionAnimation: { keyframes: [], values: [], interpolations: [] },
    scaleAnimation: { keyframes: [], values: [], interpolations: [] },
    rotationAnimation: { keyframes: [], values: [], interpolations: [] },
  };

  if (json.loop !== undefined) data.loop = json.loop;

  if (json.positionAnimation !== undefined) {
    data.positionAnimation.keyframes = json.positionAnimation.keyframes;
    data.positionAnimation.values = Vector3ArrayFromNumberArray(json.positionAnimation.values as number[][]);
    data.positionAnimation.interpolations = json.positionAnimation.interpolations;
  }

  if (json.scaleAnimation !== undefined) {
    data.scaleAnimation.keyframes = json.scaleAnimation.keyframes;
    data.scaleAnimation.values = Vector3ArrayFromNumberArray(json.scaleAnimation.values as number[][]);
    data.scaleAnimation.interpolations = json.scaleAnimation.interpolations;
  }

  if (json.rotationAnimation !== undefined) {
    data.rotationAnimation.keyframes = json.rotationAnimation.keyframes;
    data.rotationAnimation.values = QuaternionArrayFromNumberArray(json.rotationAnimation.values as number[][]);
    data.rotationAnimation.interpolations = json.rotationAnimation.interpolations;
  }

  return data;
}

