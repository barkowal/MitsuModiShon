import * as THREE from "three/webgpu";

export class AnimationObject {
  private rootObject: THREE.Object3D;
  private mixer: THREE.AnimationMixer;
  private actions: Array<THREE.AnimationAction>;

  constructor(object: THREE.Object3D) {
    this.rootObject = object;
    this.mixer = new THREE.AnimationMixer(object);
    this.actions = [];
  }

  step(delta: number) {

    this.mixer.update(delta);

  }

  setTime(second: number) {
    this.mixer.setTime(second);
    this.mixer.update(0.0001);
  }

  addClip(clip: THREE.AnimationClip) {
    const action = this.mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce, 0);
    this.actions.push(action);
  }

  stopPlaying() {

    this.actions.forEach((action) => {
      action.stop();
    });

  }

  startPlaying(second: number = 0) {

    this.mixer.setTime(second);
    this.actions.forEach((action) => {
      action.play();
    });

  }

  getRootObjectID() {
    return this.rootObject.id;
  }

}
