import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { AnimationObject } from "./objects/AnimationObject";
import { ModellingObjectLoader } from "./objects/Custom/ModellingObjectLoader";
import { Color, Matrix4, Object3D, ObjectLoader, Scene, type Object3DJSON } from "three/webgpu";
import type { AnimationObjectJSON, AnimationSceneJSON, CameraSettings } from "./Types";
import { QuaternionArrayFromNumberArray, Vector3ArrayFromNumberArray } from "./utils";
import type { AnimationLoop } from "./AnimationLoop";

export function LoadObject(file: string): Object3D | null {

  const loader = new ObjectLoader();
  const jsonData = JSON.parse(file);
  let object;

  if (!("object" in jsonData)) {
    editorEventBus.emit(EDITOR_EVENT.SendWarningLog, "WarningLogImportWrongObjectFile");
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

  return object;
}

export function LoadAnimationScene(file: string, scene: Scene, loop: AnimationLoop) {
  const jsonData: AnimationSceneJSON = JSON.parse(file);

  scene.background = new Color(jsonData.sceneColor);
  loop.setSettings(jsonData.animationLoopSettings);

  const cameraBox = loop.getCameraBox();
  loadCameraBox(cameraBox, loop, jsonData.cameraObject);

  const objects = jsonData.sceneObjects;
  const sceneObjects = loadSceneObjects(objects, loop);

  return [jsonData.animationLoopSettings, sceneObjects] as const;
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

function loadCameraBox(cameraBox: Object3D, loop: AnimationLoop, cameraData: CameraSettings) {
  const cameraMatrix = new Matrix4().fromArray(cameraData.matrix.elements);
  cameraBox.position.setFromMatrixPosition(cameraMatrix);
  cameraBox.scale.setFromMatrixScale(cameraMatrix);
  cameraBox.rotation.setFromRotationMatrix(cameraMatrix);

  if (cameraData.animation !== undefined) {
    let cameraAnimation = loop.getAnimationObjects().find(obj => (obj.getRootObjectID() === cameraBox.id));
    if (!cameraAnimation) {
      cameraAnimation = new AnimationObject(cameraBox, loop.getFps());
      loop.addAnimationObject(cameraAnimation);
    }
    cameraAnimation.setFromJSON(parseAnimationData(cameraData.animation));
  }
}

function loadSceneObjects(objects: Array<Object3DJSON>, loop: AnimationLoop) {
  const sceneObjects: Array<Object3D> = [];

  objects.forEach((obj) => {

    const data = JSON.stringify(obj);
    const loadedObject = LoadAnimationObject(data, loop);

    if (loadedObject) {
      const transformMatrix = new Matrix4().fromArray(obj.object.matrix);
      let rootObj;

      if (loadedObject instanceof AnimationObject) {
        rootObj = loadedObject.getRootObject();
      } else {
        rootObj = loadedObject;
      }
      rootObj.position.setFromMatrixPosition(transformMatrix);

      sceneObjects.push(rootObj);
    }
  });

  return sceneObjects;
}

