import type { CommandHistory } from "@/lib/CommandHistory";
import type { EventHandlerType } from "./Types";
import type { UiController } from "./UiController";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import type { AnimationLoop } from "./AnimationLoop";
import { SelectionController } from "./SelectionController";
import type { AnimationObject } from "./objects/AnimationObject";
import type { Object3D } from "three";

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

}
