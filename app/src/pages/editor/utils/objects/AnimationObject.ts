import * as THREE from "three/webgpu";
import { ANIMATION_PROPERTY, type AnimationObjectData, type AnimationObjectJSON, type KeyframeSequence } from "../Types";
import { insertSort } from "@/lib/utils";
import { GetEasing } from "../GetEasing";
import { generateUUID } from "three/src/math/MathUtils.js";
import { KeyframeSequenctToJSON } from "../utils";

export class AnimationObject {
  private rootObject: THREE.Object3D;
  private uuid: string;
  private mixer: THREE.AnimationMixer;
  private actions: Array<THREE.AnimationAction | null>;
  private animationSequences: Array<KeyframeSequence>;
  private fps: number;  // TODO this shouldn't be here
  private isPlaying: boolean;
  private isLooping: boolean;

  constructor(object: THREE.Object3D, fps: number) {
    this.rootObject = object;
    this.mixer = new THREE.AnimationMixer(object);

    this.actions = [null, null, null];
    this.animationSequences = [];

    for (let i = 0; i < 3; i++) {
      this.animationSequences.push({
        keyframes: [],
        values: [],
        interpolations: [],
      });
    }

    this.fps = fps;
    this.isPlaying = false;
    this.isLooping = true;

    this.uuid = generateUUID();
    object.userData.animationObject = this.uuid;

  }

  step(delta: number) {

    this.mixer.update(delta);

  }

  setTime(second: number) {
    this.mixer.setTime(second);
    this.mixer.update(0.0001);
  }

  getAnimationData() {

    const animationData: AnimationObjectData = {
      enabled: this.isPlaying,
      loop: this.isLooping,
      animationKeyframes: this.animationSequences,
    };

    return animationData;

  }

  getRootObject(): THREE.Object3D {
    return this.rootObject;
  }

  getRootObjectID(): number {
    return this.rootObject.id;
  }

  getName(): string {
    return this.rootObject.name;
  }

  getUUID(): string {
    return this.uuid;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getIsLooping(): boolean {
    return this.isLooping;
  }

  setFps(fps: number) {
    this.fps = fps;
  }

  resetAnimation() {
    this.animationSequences.forEach((sequence) => {
      sequence.keyframes = [];
      sequence.values = [];
      sequence.interpolations = [];
    });

    for (let i = 0; i < this.actions.length; i++) {
      const action = this.actions[i];

      if (action !== null) {
        action.stop();
        this.mixer.uncacheAction(action.getClip());
      }

      this.actions[i] = null;
    }

  }

  setLooping(enableLooping: boolean) {

    this.isLooping = enableLooping;
    const loop = enableLooping ? THREE.LoopRepeat : THREE.LoopOnce;
    const nb = enableLooping ? Infinity : 1;

    this.actions.forEach((action) => {

      action?.setLoop(loop, nb);

      if (this.isPlaying) {
        action?.stop();
        action?.play();
      }

    });

  }

  stopPlaying() {

    this.actions.forEach((action) => {
      if (action !== null)
        action.stop();
    });

    this.isPlaying = false;
  }

  startPlaying(second: number = 0) {

    this.mixer.setTime(second);
    this.actions.forEach((action) => {
      if (action !== null)
        action.play();
    });

    this.isPlaying = true;

  }

  removeKeyframe(index: number, property: number) {
    const animationKeyframes = this.animationSequences[property].keyframes;
    const animationValues = this.animationSequences[property].values;
    const animationInterpolations = this.animationSequences[property].interpolations;

    if (index > animationKeyframes.length - 1) return;

    animationKeyframes.splice(index, 1);
    animationValues.splice(index, 1);
    animationInterpolations.splice(index, 1);

    this.updateAnimation(property);

  }

  addKeyframe(keyframe: number, value: THREE.Vector3 | THREE.Quaternion, interpolation: number, property: number) {
    const animationKeyframes = this.animationSequences[property].keyframes;
    const animationValues = this.animationSequences[property].values;
    const animationInterpolations = this.animationSequences[property].interpolations;

    const index = insertSort(animationKeyframes, keyframe);

    if (index > animationValues.length - 1)
      animationValues.push(value);
    else
      animationValues.splice(index, 0, value);

    if (index > animationInterpolations.length - 1)
      animationInterpolations.push(interpolation);
    else
      animationInterpolations.splice(index, 0, interpolation);

    this.updateAnimation(property);
  }

  changeKeyframeInterpolation(keyframeIndex: number, property: number, interpolation: number) {
    const animationInterpolations = this.animationSequences[property].interpolations;
    if (keyframeIndex > animationInterpolations.length - 1) return;

    animationInterpolations[keyframeIndex] = interpolation;
    this.updateAnimation(property);
  }

  dispose() {
    for (let i = 0; i < this.actions.length; i++) {
      const action = this.actions[i];

      if (action !== null) {
        action.stop();
        this.mixer.uncacheAction(action.getClip());
      }

      this.actions[i] = null;
    }
  }

  isAnimationObject() {
    return true;
  }

  getJSON() {
    const data = {
      uuid: this.uuid,
      loop: this.isLooping,
      positionAnimation: KeyframeSequenctToJSON(this.animationSequences[ANIMATION_PROPERTY.Position]),
      scaleAnimation: KeyframeSequenctToJSON(this.animationSequences[ANIMATION_PROPERTY.Scale]),
      rotationAnimation: KeyframeSequenctToJSON(this.animationSequences[ANIMATION_PROPERTY.Rotation]),
    };
    return data;
  }

  setFromJSON(json: AnimationObjectJSON) {
    this.setLooping(json.loop);
    this.resetAnimation();
    if (json.positionAnimation.keyframes.length !== 0) {
      this.animationSequences[ANIMATION_PROPERTY.Position] = json.positionAnimation as KeyframeSequence;
      this.updateAnimation(ANIMATION_PROPERTY.Position);
    }
    if (json.scaleAnimation.keyframes.length !== 0) {
      this.animationSequences[ANIMATION_PROPERTY.Scale] = json.scaleAnimation as KeyframeSequence;
      this.updateAnimation(ANIMATION_PROPERTY.Scale);
    }
    if (json.rotationAnimation.keyframes.length !== 0) {
      this.animationSequences[ANIMATION_PROPERTY.Rotation] = json.rotationAnimation as KeyframeSequence;
      this.updateAnimation(ANIMATION_PROPERTY.Rotation);
    }
  }

  // TODO instead of making new arrays all the time,
  // implement changing only the updated values
  private updateAnimation(property: number) {
    const animationKeyframes = this.animationSequences[property].keyframes;
    const animationValues = this.animationSequences[property].values;
    const animationInterpolations = this.animationSequences[property].interpolations;

    const times = animationKeyframes.map((val) => this.keyframeToTime(val));
    const values: Array<number> = [];

    if (property === ANIMATION_PROPERTY.Rotation) {

      animationValues.forEach((val) => {
        if (val instanceof THREE.Quaternion)
          values.push(val.x, val.y, val.z, val.w);
      });

      this.createClip(times, values, property);
      return;
    }

    animationValues.forEach((val) => values.push(val.x, val.y, val.z));

    const containsNonLinearInterpolation = animationInterpolations.some(num => num !== 0);

    if (containsNonLinearInterpolation) {
      this.applyInterpolation(times, values, property);
      return;
    } else {
      this.createClip(times, values, property);
    }
  }

  private applyInterpolation(times: Array<number>, values: Array<number>, property: number) {
    const animationInterpolations = this.animationSequences[property].interpolations;
    const animationKeyframes = this.animationSequences[property].keyframes;

    const interpolatedTime: Array<number> = [];
    const interpolatedValues: Array<number> = [];

    animationInterpolations.forEach((method, i) => {
      if (i === 0) {
        interpolatedTime.push(times[i]);
        interpolatedValues.push(values[i], values[i + 1], values[i + 2]);
        return;
      }
      if (method === 0) {
        interpolatedTime.push(times[i]);
        interpolatedValues.push(values[i * 3], values[i * 3 + 1], values[i * 3 + 2]);
        return;
      }
      const count = this.populateInterpolatedTime(animationKeyframes[i - 1], animationKeyframes[i], interpolatedTime);
      this.populateInterpolatedValues(interpolatedValues, method, [values[i * 3 - 3], values[i * 3 - 2], values[i * 3 - 1]],
        [values[i * 3], values[i * 3 + 1], values[i * 3 + 2]], count);

    });

    this.createClip(interpolatedTime, interpolatedValues, property);
  }

  private populateInterpolatedTime(start: number, end: number, arr: Array<number>) {
    let count = 0;
    const step = this.getIterationStep(end - start);
    for (let i = start; i < end; i += step) {
      arr.push(this.keyframeToTime(i));
      count++;
    }
    return count;
  }

  private populateInterpolatedValues(values: Array<number>, method: number, start: Array<number>, end: Array<number>, count: number) {
    const x = GetEasing(method, start[0], end[0], count);
    const y = GetEasing(method, start[1], end[1], count);
    const z = GetEasing(method, start[2], end[2], count);

    for (let i = 0; i < count; i++) {
      values.push(x[i], y[i], z[i]);
    }
  }

  private addClip(clip: THREE.AnimationClip, property: number) {
    if (this.actions[property] != null) {
      this.actions[property].stop();
      this.mixer.uncacheAction(this.actions[property].getClip());
      this.actions[property] = null;
    }
    const action = this.mixer.clipAction(clip);
    this.actions[property] = action;

    const loop = this.isLooping ? THREE.LoopRepeat : THREE.LoopOnce;
    action.setLoop(loop, Infinity);

    if (this.isPlaying) {
      action.play();
    }

  }

  private createClip(times: Array<number>, values: Array<number>, property: number) {
    let track;
    let name;
    switch (property) {
      case ANIMATION_PROPERTY.Position: {
        track = new THREE.VectorKeyframeTrack(".position", times, values);
        name = "Movement";
        break;
      }

      case ANIMATION_PROPERTY.Scale: {
        track = new THREE.VectorKeyframeTrack(".scale", times, values);
        name = "Scale";
        break;
      }

      case ANIMATION_PROPERTY.Rotation: {
        track = new THREE.QuaternionKeyframeTrack(".quaternion", times, values,);
        name = "rotation";
        break;
      }

      default: {
        track = new THREE.VectorKeyframeTrack(".position", times, values);
        name = "Movement";
        break;
      }
    }

    const clip = new THREE.AnimationClip(name, -1, [track]);
    this.addClip(clip, property);
  }

  private timeToKeyframes(seconds: number) {
    return (seconds * this.fps);
  }

  private keyframeToTime(keyframe: number) {
    return keyframe / this.fps;
  }

  private getIterationStep(number: number): number {
    if (number < 100) {
      return 2;
    } else if (number < 200) {
      return 4;
    } else if (number < 400) {
      return 6;
    } else if (number < 800) {
      return 8;
    } else {
      return 10;
    }
  }

}
