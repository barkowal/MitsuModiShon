import * as THREE from "three/webgpu";
import { CommandHistory } from "@/lib/CommandHistory";
import type { UiController } from "./UiController";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { type EventHandlerType, type Vec3 } from "./Types";
import type { ModellingHelper } from "./ModellingHelper";
import ModellingMesh from "./objects/ModellingMesh";
import { calculateVec3Difference, convertTVector3ToVec3 } from "./utils";

export class EditModeHandler {
  eventHandlers: Array<EventHandlerType>;
  commandHistory: CommandHistory;
  modellingHelper: ModellingHelper;
  uiController: UiController;
  scene: THREE.Scene;

  constructor(commandHistory: CommandHistory, uiController: UiController, modellingHelper: ModellingHelper, scene: THREE.Scene) {
    this.eventHandlers = [];
    this.commandHistory = commandHistory;
    this.modellingHelper = modellingHelper;
    this.uiController = uiController;
    this.scene = scene;
  }

  initEventHandlers() {
    if (this.eventHandlers.length > 0) this.disposeEventHandlers();

    this.handleChangePosition();
    this.handleMovePosition();
  }

  disposeEventHandlers() {
    this.eventHandlers.forEach((handler) => {
      editorEventBus.off(handler.event, handler.callback);
    });
  }


  //TODO
  private handleChangePosition() {
    const handle = (pos: Array<Vec3>) => {
      console.log("Handle Change Pos");
    };
    editorEventBus.on(EDITOR_EVENT.ChangePosition, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.ChangePosition, callback: handle });
  }

  private handleMovePosition() {
    const handle = (pos: Vec3) => {
      const obj = this.modellingHelper.getCurrentObject();
      if (obj instanceof ModellingMesh) {
        const transform = obj.getTransformHelper();
        if (!transform) return;
        const distance = calculateVec3Difference(convertTVector3ToVec3(transform.position), pos);
        obj.translateIntersection(distance);
      }
    };
    editorEventBus.on(EDITOR_EVENT.MoveObject, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.MoveObject, callback: handle });
  }

}
