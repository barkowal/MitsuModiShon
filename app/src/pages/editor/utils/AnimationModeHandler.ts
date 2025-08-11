import type { CommandHistory } from "@/lib/CommandHistory";
import { ANIMATION_PROPERTY, InterpolationArrayData, SetKeyframeArrayData, type EventHandlerType } from "./Types";
import type { UiController } from "./UiController";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import type { AnimationLoop } from "./AnimationLoop";
import { SelectionController } from "./SelectionController";
import { AnimationObject } from "./objects/AnimationObject";
import { Mesh, Scene, type Object3D, type Quaternion, type Vector3 } from "three/webgpu";
import { DownloadVideo } from "@/lib/DownloadVideo";
import { DownloadJSON } from "@/lib/DownloadJSON";
import { LoadAnimationObject, LoadAnimationScene } from "./LoadObject";
import { AddMeshCommand } from "../commands/AddMeshCommand";
import { GetAnimationSceneJSON, getObjectsJSON } from "./GetJSON";
import { BACKGROUND_LAYER } from "./Global";
import { disposeMesh } from "./utils";

export class AnimationModeHandler {
  private eventHandlers: Array<EventHandlerType>;
  private commandHistory: CommandHistory;
  private animationLoop: AnimationLoop;
  private uiController: UiController;
  private selectionController: SelectionController;
  private currentAnimationObject: AnimationObject | null;
  private scene: Scene;


  constructor(commandHistory: CommandHistory, animationLoop: AnimationLoop, uiController: UiController, selectionController: SelectionController, scene: Scene) {
    this.eventHandlers = [];
    this.commandHistory = commandHistory;
    this.animationLoop = animationLoop;
    this.uiController = uiController;
    this.selectionController = selectionController;
    this.scene = scene;

    this.currentAnimationObject = null;

  }

  initEventHandlers() {
    if (this.eventHandlers.length > 0) this.disposeEventHandlers();

    this.handlePlay();
    this.handleSetKeyframe();
    this.handleStop();
    this.handleSetKeyframeDuration();
    this.handleSetFps();
    this.handleSetLooping();
    this.handleAnimationRender();
    this.handleCancelRenderingAnimation();

    this.handleAnimateKeyframe();
    this.handleRemovingKeyframe();
    this.handleAnimationPlaying();
    this.handleAnimationLooping();
    this.handleChangingFrameInterpolation();

    this.handleMakeAnimationObject();

    this.handleSaveAnimationObject();
    this.handleUploadAnimationObject();

    this.handleSaveAnimationScene();
    this.handleLoadAnimationScene();

    this.handleSelectionChange();
  }

  disposeEventHandlers() {
    this.eventHandlers.forEach((handler) => {
      editorEventBus.off(handler.event, handler.callback);
    });
  }

  private handlePlay() {

    const handle = (keyframe: number) => {

      this.animationLoop.start();

    };
    editorEventBus.on(EDITOR_EVENT.PlayAnimation, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.PlayAnimation, callback: handle });

  }

  private handleStop() {

    const handle = () => {

      this.animationLoop.stop();

    };
    editorEventBus.on(EDITOR_EVENT.StopAnimation, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.StopAnimation, callback: handle });

  }

  private handleSetKeyframe() {

    const handle = (keyframe: number) => {
      this.animationLoop.setKeyframe(keyframe);
    };
    editorEventBus.on(EDITOR_EVENT.SetKeyframe, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.SetKeyframe, callback: handle });

  }

  private handleSetKeyframeDuration() {

    const handle = (duration: number) => {
      this.animationLoop.setDuration(duration);
    };
    editorEventBus.on(EDITOR_EVENT.SetKeyframeDuration, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.SetKeyframeDuration, callback: handle });

  }

  private handleSetFps() {
    const handle = (fps: number) => {
      this.animationLoop.setFps(fps);
    };
    editorEventBus.on(EDITOR_EVENT.SetAnimationFps, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.SetAnimationFps, callback: handle });
  }

  private handleSetLooping() {
    const handle = (isLooping: boolean) => {
      this.animationLoop.setLoop(isLooping);
    };
    editorEventBus.on(EDITOR_EVENT.SetAnimationLooping, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.SetAnimationLooping, callback: handle });
  }

  private handleChangingFrameInterpolation() {
    const handle = (interpolationData: Array<number>) => {

      if (this.currentAnimationObject === null) return;

      this.currentAnimationObject.changeKeyframeInterpolation(
        interpolationData[InterpolationArrayData.Keyframe],
        interpolationData[InterpolationArrayData.Property],
        interpolationData[InterpolationArrayData.Method]);


    };
    editorEventBus.on(EDITOR_EVENT.ChangeKeyframeInterpolation, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.ChangeKeyframeInterpolation, callback: handle });
  }

  // TODO create and clear listeners on selectioncontroller
  private handleSelectionChange() {

    this.selectionController.onSelect((obj: Object3D) => {
      this.currentAnimationObject = this.animationLoop.findAnimationObjectByID(obj.userData.animationObject);
      this.uiController.refreshAnimationPanel(this.currentAnimationObject);
    });

  }

  // TODO should this be a command?
  private handleAnimateKeyframe() {

    const handle = (animateData: Array<number>) => {

      if (this.currentAnimationObject === null) return;

      const value = this.getAnimationObjectsProperty(animateData[SetKeyframeArrayData.Property]);
      if (value === null) return;

      this.currentAnimationObject.addKeyframe(animateData[SetKeyframeArrayData.Data], value, 0, animateData[SetKeyframeArrayData.Property]);

    };
    editorEventBus.on(EDITOR_EVENT.AddAnimationKeyframe, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.AddAnimationKeyframe, callback: handle });

  }

  private handleRemovingKeyframe() {

    const handle = (removeData: Array<number>) => {
      if (this.currentAnimationObject === null) return;

      this.currentAnimationObject.removeKeyframe(removeData[SetKeyframeArrayData.Property], removeData[SetKeyframeArrayData.Data]);

    };

    editorEventBus.on(EDITOR_EVENT.RemoveAnimationKeyframe, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.RemoveAnimationKeyframe, callback: handle });
  }

  private handleAnimationPlaying() {

    const handle = (shouldPlay: boolean) => {
      if (this.currentAnimationObject === null) return;

      if (shouldPlay)
        this.currentAnimationObject.startPlaying();
      else
        this.currentAnimationObject.stopPlaying();

      const animationTime = this.animationLoop.getCurrentAnimationTime();
      this.currentAnimationObject.setTime(animationTime);
    };

    editorEventBus.on(EDITOR_EVENT.SetAnimationObjectPlaying, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.SetAnimationObjectPlaying, callback: handle });

  }

  private handleAnimationLooping() {

    const handle = (shouldLoop: boolean) => {
      if (this.currentAnimationObject === null) return;

      this.currentAnimationObject.setLooping(shouldLoop);

      const animationTime = this.animationLoop.getCurrentAnimationTime();
      this.currentAnimationObject.setTime(animationTime);

    };

    editorEventBus.on(EDITOR_EVENT.SetAnimationObjectLooping, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.SetAnimationObjectLooping, callback: handle });
  }

  private handleMakeAnimationObject() {

    const handle = () => {

      if (this.currentAnimationObject !== null) return;

      const selection = this.selectionController.getCurrentSelection();
      if (selection === null) return;

      const animationObj = new AnimationObject(selection, this.animationLoop.getFps());
      this.animationLoop.addAnimationObject(animationObj);
      this.currentAnimationObject = animationObj;

      this.uiController.refreshAnimationPanel(animationObj);

    };

    editorEventBus.on(EDITOR_EVENT.MakeAnimationObject, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.MakeAnimationObject, callback: handle });
  }

  private handleAnimationRender() {

    const handle = (renderSettings: Array<number>) => {
      editorEventBus.emit(EDITOR_EVENT.IsRenderingSignal, true);
      this.animationLoop.stop();

      this.getRenderedFrames(renderSettings).then((frames: Array<string>) => {
        DownloadVideo(frames)
          .then(() => {
            editorEventBus.emit(EDITOR_EVENT.IsRenderingSignal, false);
          })
          .catch((error) => {
            editorEventBus.emit(EDITOR_EVENT.IsRenderingSignal, false);
            console.warn(error);
          });
      }).catch((error) => {
        editorEventBus.emit(EDITOR_EVENT.IsRenderingSignal, false);
        console.warn(error);
      });
    };

    editorEventBus.on(EDITOR_EVENT.RenderAnimation, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.RenderAnimation, callback: handle });

  }

  private getRenderedFrames(renderSettings: Array<number>): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      const attempt = (n: number) => {
        this.animationLoop.renderAnimationFrames(renderSettings, n).then(resolve)
          .catch((error) => {
            if (n === 3) {
              reject(error);
            } else if (error !== "Long Render") {
              reject(error);
            } else {
              setTimeout(() => attempt(n + 1));
            }
          });
      };
      attempt(1);
    });
  }


  private handleCancelRenderingAnimation() {

    const handle = () => {

      this.animationLoop.endRenderingAnimationFrames();
      editorEventBus.emit(EDITOR_EVENT.IsRenderingSignal, false);

    };

    editorEventBus.on(EDITOR_EVENT.CancelRenderingAnimation, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.CancelRenderingAnimation, callback: handle });
  }

  private handleSaveAnimationObject() {

    const handle = () => {

      const obj = this.selectionController.getCurrentSelection();

      if (obj === null) {
        editorEventBus.emit(EDITOR_EVENT.SendWarningLog, "Please select an object.");
        return;
      }

      const json = getObjectsJSON(obj, this.animationLoop);

      DownloadJSON(json, obj.name);

    };

    editorEventBus.on(EDITOR_EVENT.SaveAnimationObject, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.SaveAnimationObject, callback: handle });
  }

  private handleUploadAnimationObject() {

    const handle = (file: string) => {

      const loadedObject = LoadAnimationObject(file, this.animationLoop);

      if (loadedObject) {

        let rootObject = loadedObject;

        if (loadedObject instanceof AnimationObject) {
          rootObject = loadedObject.getRootObject();
        }

        if (rootObject instanceof Mesh) {
          this.commandHistory.addCommand(new AddMeshCommand(this.scene, rootObject));
          this.uiController.refreshTree();
        }

      }
    };

    editorEventBus.on(EDITOR_EVENT.UploadAnimationObject, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.UploadAnimationObject, callback: handle });
  }

  private handleSaveAnimationScene() {

    const handle = () => {

      const json = GetAnimationSceneJSON(this.scene, this.animationLoop);
      DownloadJSON(json, "scene");

    };

    editorEventBus.on(EDITOR_EVENT.SaveAnimationScene, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.SaveAnimationScene, callback: handle });
  }

  private handleLoadAnimationScene() {

    const handle = (file: string) => {

      this.resetScene();
      const [settings, sceneObjects] = LoadAnimationScene(file, this.scene, this.animationLoop);

      sceneObjects.forEach((obj) => {
        if (obj instanceof Mesh) {
          this.scene.add(obj);
        }
      });

      this.uiController.refreshTree();
      this.uiController.refreshAnimationPlayback(settings);

    };

    editorEventBus.on(EDITOR_EVENT.LoadAnimationScene, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.LoadAnimationScene, callback: handle });
  }


  private getAnimationObjectsProperty(property: number) {
    if (this.currentAnimationObject === null) return null;

    let value: Vector3 | Quaternion;

    switch (property) {
      case ANIMATION_PROPERTY.Position: {
        value = this.currentAnimationObject.getRootObject().position.clone();
        break;
      }
      case ANIMATION_PROPERTY.Scale: {
        value = this.currentAnimationObject.getRootObject().scale.clone();
        break;
      }
      case ANIMATION_PROPERTY.Rotation: {
        value = this.currentAnimationObject.getRootObject().quaternion.clone();
        break;
      }
      default: {
        value = this.currentAnimationObject.getRootObject().position.clone();
      }
    }

    return value;
  }

  private resetScene() {
    this.commandHistory.clearHistory();
    this.selectionController.clearAllSelections();

    const cameraBox = this.animationLoop.getCameraBox();
    const sceneObjects = this.scene.children.filter((obj) => !obj.layers.isEnabled(BACKGROUND_LAYER) && obj.id !== cameraBox.id);

    sceneObjects.forEach((obj) => {
      this.scene.remove(obj);
      disposeMesh(this.scene, obj);
    });

    cameraBox.position.set(0, 0, 0);
    cameraBox.scale.set(1, 1, 1);
    cameraBox.rotation.set(0, 0, 0, "XYZ");
  }

}
