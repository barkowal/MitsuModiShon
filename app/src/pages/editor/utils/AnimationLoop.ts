import { Clock } from "three/webgpu";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import type { RendererController } from "./RendererController";
import type { AnimationObject } from "./objects/AnimationObject";
import { DEFAULT_FPS, DEFAULT_KEYFRAME_DURATION, DEFAULT_LOOP_SETTING } from "./Global";
import { RenderSettings } from "./Types";

export class AnimationLoop {
  private clock: Clock;
  private fps: number;
  private duration: number;
  private loop: boolean;
  private keyframe;
  private rendererController: RendererController;
  private timeID: NodeJS.Timeout | null;
  private animationObjects: Array<AnimationObject>;
  private renderTimeID: NodeJS.Timeout | null;

  constructor(rendererController: RendererController) {
    this.clock = new Clock();
    this.fps = DEFAULT_FPS;
    this.duration = DEFAULT_KEYFRAME_DURATION;
    this.loop = DEFAULT_LOOP_SETTING;
    this.animationObjects = [];
    this.keyframe = 0;
    this.rendererController = rendererController;
    this.timeID = null;
    this.renderTimeID = null;
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

  getFps() {
    return this.fps;
  }

  getCurrentKeyframe() {
    return this.keyframe;
  }

  getCurrentAnimationTime() {
    return this.keyframeToTime(this.keyframe);
  }

  setLoop(loop: boolean) {
    this.loop = loop;
  }

  addAnimationObject(obj: AnimationObject) {
    this.animationObjects.push(obj);
  }

  findAnimationObjectByID(uuid: string): AnimationObject | null {
    const obj = this.animationObjects.find((obj) => { return obj.getUUID() === uuid; });
    if (obj) return obj;
    return null;
  }

  // TODO check if correct
  dispose() {
    this.stop();
    this.animationObjects.forEach((obj) => {
      obj.dispose();
    });
    this.animationObjects = [];
  }

  renderAnimationFrames(renderSettings: Array<number>, retries: number): Promise<Array<string>> {
    const frames: Array<string> = [];
    const intervalTime = this.getEstimatedRenderTime(retries);

    const width = renderSettings[RenderSettings.RenderWidth];
    const height = renderSettings[RenderSettings.RenderHeight];
    this.rendererController.setRendererSize(width, height);

    for (const object of this.animationObjects) {
      object.setTime(this.keyframeToTime(0));
      object.startPlaying();
    }

    this.renderTimeID = setInterval(() => {
      this.setRendererSize(width, height);
      this.renderFrame(frames);

    }, intervalTime);

    return new Promise((resolve, reject) => {
      setTimeout(() => {

        if (this.renderTimeID === null) {
          reject("Render canceled");
          return;
        }

        if (frames.length >= this.duration - 1) {
          this.endRenderingAnimationFrames();
          resolve(frames);
        }
        else {
          this.endRenderingAnimationFrames();
          reject("Long Render");
        }
      }, intervalTime * this.duration);
    });

  }

  endRenderingAnimationFrames() {
    if (this.renderTimeID === null) return;

    clearInterval(this.renderTimeID);
    for (const object of this.animationObjects) {
      object.setTime(this.keyframe);
    }

  }

  private getEstimatedRenderTime(retries: number) {
    const startTime = performance.now();
    this.rendererController.render();
    const estimation = (performance.now() - startTime) * 4 + 30 * retries;
    return estimation;
  }

  private renderFrame(frames: Array<string>) {
    for (const object of this.animationObjects) {
      object.step(1 / this.fps);
    }

    const imgData = this.rendererController.getRenderImageData();
    frames.push(imgData);
  }

  private setRendererSize(width: number, height: number) {
    const size = this.rendererController.getRendererSize();
    if (size.width != width || size.height != height)
      this.rendererController.setRendererSize(width, height);
  }

  private timeToKeyframes(seconds: number) {
    return (seconds * this.fps);
  }

  private keyframeToTime(keyframe: number) {
    return keyframe / this.fps;
  }

}

