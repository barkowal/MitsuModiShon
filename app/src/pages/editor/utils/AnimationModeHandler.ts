import type { CommandHistory } from "@/lib/CommandHistory";
import { ANIMATION_PROPERTY, SetKeyframeArrayData, type EventHandlerType } from "./Types";
import type { UiController } from "./UiController";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import type { AnimationLoop } from "./AnimationLoop";
import { SelectionController } from "./SelectionController";
import { AnimationObject } from "./objects/AnimationObject";
import type { Object3D, Quaternion, Vector3 } from "three/webgpu";

export class AnimationModeHandler {
  private eventHandlers: Array<EventHandlerType>;
  private commandHistory: CommandHistory;
  private animationLoop: AnimationLoop;
  private uiController: UiController;
  private selectionController: SelectionController;
  private currentAnimationObject: AnimationObject | null;


  constructor(commandHistory: CommandHistory, animationLoop: AnimationLoop, uiController: UiController, selectionController: SelectionController) {
    this.eventHandlers = [];
    this.commandHistory = commandHistory;
    this.animationLoop = animationLoop;
    this.uiController = uiController;
    this.selectionController = selectionController;

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

    this.handleAnimateKeyframe();
    this.handleRemovingKeyframe();
    this.handleAnimationPlaying();
    this.handleAnimationLooping();

    this.handleMakeAnimationObject();

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

  // TODO create and clear listeners on selectioncontroller
  private handleSelectionChange() {

    this.selectionController.onSelect((obj: Object3D) => {
      this.currentAnimationObject = this.animationLoop.findAnimationObjectByID(obj.id);
      this.uiController.refreshAnimationPanel(this.currentAnimationObject);
    });

  }

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
}
