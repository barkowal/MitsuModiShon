import { Clock } from "three/webgpu";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import type { RendererController } from "./RendererController";
import type { AnimationObject } from "./objects/AnimationObject";
import { DEFAULT_FPS, DEFAULT_KEYFRAME_DURATION, DEFAULT_LOOP_SETTING } from "./Global";

export class AnimationLoop {
  private clock: Clock;
  private fps: number;
  private duration: number;
  private loop: boolean;
  private keyframe;
  private rendererController: RendererController;
  private timeID: NodeJS.Timeout | null;
  private animationObjects: Array<AnimationObject>;

  constructor(rendererController: RendererController) {
    this.clock = new Clock();
    this.fps = DEFAULT_FPS;
    this.duration = DEFAULT_KEYFRAME_DURATION;
    this.loop = DEFAULT_LOOP_SETTING;
    this.animationObjects = [];
    this.keyframe = 0;
    this.rendererController = rendererController;
    this.timeID = null;
  }

  start() {

    if (this.keyframe >= this.duration) return;

    this.clock.start();

    this.timeID = setInterval(() => {
      this.step();
      this.rendererController.render();
    }, 1000 / this.fps);

  }

  stop() {
    if (this.timeID)
      clearInterval(this.timeID);

    this.timeID = null;
    this.clock.stop();
  }

  step() {
    const delta = this.clock.getDelta();
    this.keyframe += this.timeToKeyframes(delta);

    editorEventBus.emit(EDITOR_EVENT.RefreshAnimationPanel, Math.floor(this.keyframe));

    for (const object of this.animationObjects) {
      object.step(delta);
    }

    if ((this.keyframe) > this.duration) {
      this.endAnimation();
    }

  }

  endAnimation() {
    if (this.loop) {
      this.setKeyframe(0);
      return;
    }


    this.stop();
    editorEventBus.emit(EDITOR_EVENT.StopPlayback);
  }

  setKeyframe(keyframe: number) {

    for (const object of this.animationObjects) {
      object.setTime(this.keyframeToTime(keyframe));
    }

    this.keyframe = keyframe;

  }

  setDuration(duration: number) {
    this.duration = duration;
  }

  setFps(fps: number) {
    this.fps = fps;
  }

  setLoop(loop: boolean) {
    this.loop = loop;
  }

  addAnimationObject(obj: AnimationObject) {
    this.animationObjects.push(obj);
  }

  findAnimationObjectByID(id: number): AnimationObject | null {
    const obj = this.animationObjects.find((obj) => { return obj.getRootObjectID() === id; });
    if (obj) return obj;
    return null;
  }


  private timeToKeyframes(seconds: number) {
    return (seconds * this.fps);
  }

  private keyframeToTime(keyframe: number) {
    return keyframe / this.fps;
  }

}

