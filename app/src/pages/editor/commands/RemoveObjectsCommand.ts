import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { removeObjectFromScene } from "../utils/utils";
import type { Command } from "./CommandInterface";
import { Scene, Object3D } from "three/webgpu";

export class RemoveObjectsCommand implements Command {
  private scene: Scene;
  private objects: Array<Object3D>;
  private parentsId: Array<number>;

  constructor(scene: Scene, objects: Array<Object3D>) {
    this.scene = scene;
    this.objects = objects;
    this.parentsId = [];
  }

  execute() {
    this.objects.forEach((object: Object3D, i: number) => {

      if (object.userData.removable === false) {
        editorEventBus.emit(EDITOR_EVENT.SendWarningLog, "WarningLogCannotRemoveObject");
        return;
      }

      const parent = object.parent;
      object.removeFromParent();
      if (parent && parent.id != this.scene.id) {
        this.parentsId[i] = parent.id;
      } else {
        this.parentsId[i] = -1;
      }
    });
  }

  undo() {
    this.objects.forEach((object: Object3D, i: number) => {
      if (this.parentsId[i] == -1) {
        this.scene.add(object);
        return;
      } else {
        const parent = this.scene.getObjectById(this.parentsId[i]);
        if (parent) {
          parent.add(object);
        }
      }
    });
  }

  destroy(): void {

    this.objects.forEach((object: Object3D) => {

      removeObjectFromScene(this.scene, object);

    });

  }

}
