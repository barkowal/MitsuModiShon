import { removeObjectFromScene } from "../utils/utils";
import type { Command } from "./CommandInterface";
import { Scene, Object3D } from "three/webgpu";

export class AddLightCommand implements Command {
  private scene: Scene;
  private light: Object3D;

  constructor(scene: Scene, light: Object3D) {
    this.scene = scene;
    this.light = light;
  }

  execute() {
    this.scene.add(this.light);
  }

  undo() {
    this.scene.remove(this.light);
  }

  destroy(): void {

    removeObjectFromScene(this.scene, this.light);

  }

}
