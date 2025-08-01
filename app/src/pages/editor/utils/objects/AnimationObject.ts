import * as THREE from "three/webgpu";
import { ANIMATION_PROPERTY, type AnimationObjectData, type KeyframeSequence } from "../Types";
import { insertSort } from "@/lib/utils";

export class AnimationObject {
  private rootObject: THREE.Object3D;
  private mixer: THREE.AnimationMixer;
  private actions: Array<THREE.AnimationAction | null>;
  private animationSequences: Array<KeyframeSequence>;
  private fps: number;
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

  getRootObject() {
    return this.rootObject;
  }

  getRootObjectID() {
    return this.rootObject.id;
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

  private updateAnimation(property: number) {
    const animationKeyframes = this.animationSequences[property].keyframes;
    const animationValues = this.animationSequences[property].values;
    // const animationInterpolations = this.animationSequences[property].interpolations; TODO

    const times = animationKeyframes.map((val) => this.keyframeToTime(val));
    const values: Array<number> = [];

    if (property === ANIMATION_PROPERTY.Rotation) {
      animationValues.forEach((val) => {
        if (val instanceof THREE.Quaternion)
          values.push(val.x, val.y, val.z, val.w);
      });
    } else {
      animationValues.forEach((val) => values.push(val.x, val.y, val.z));
    }

    this.createClip(times, values, property);
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

}
