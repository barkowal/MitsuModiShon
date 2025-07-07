import * as THREE from "three/webgpu";
import { CommandHistory } from "@/lib/CommandHistory";
import type { UiController } from "./UiController";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { TRANSFORM_CHANGE, type EventHandlerType, type Vec3 } from "./Types";
import type { ModellingHelper } from "./ModellingHelper";
import ModellingMesh from "./objects/ModellingMesh";
import { calculateVec3Difference, compareVec3, convertTVector3ToVec3 } from "./utils";
import { TranslateModellingVertices } from "../commands/TranslateModellingVertices";
import { ScaleModellingVertices } from "../commands/ScaleModellingVertices";

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
    this.handleChangeEditingMode();
    this.handleChangeScale();
    this.handleScaleObject();
    this.handleRemoveMesh();
    this.handleChangeRotation();
  }

  disposeEventHandlers() {
    this.eventHandlers.forEach((handler) => {
      editorEventBus.off(handler.event, handler.callback);
    });
  }


  private handleChangePosition() {
    const handle = (pos: Array<Vec3>) => {
      const obj = this.modellingHelper.getCurrentObject();
      if (obj instanceof ModellingMesh) {

        const indices = obj.getHighlightedIndices();
        const transform = obj.getTransformHelper();
        if (!transform) return;

        // Position is already changed, command should provide undo without executing at creation
        if (compareVec3(pos[TRANSFORM_CHANGE.New], convertTVector3ToVec3(transform.position))) {
          const difference = calculateVec3Difference(convertTVector3ToVec3(transform.position), pos[TRANSFORM_CHANGE.Old]);
          this.commandHistory.addCommand(new TranslateModellingVertices(obj, difference, indices), false);
        }
        // Command should execute position change at creation
        else {
          const difference = calculateVec3Difference(pos[TRANSFORM_CHANGE.New], convertTVector3ToVec3(transform.position));
          this.commandHistory.addCommand(new TranslateModellingVertices(obj, difference, indices));
        }
      }
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
        obj.translateVertices(distance);
      }
    };
    editorEventBus.on(EDITOR_EVENT.MoveObject, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.MoveObject, callback: handle });
  }

  private handleChangeEditingMode() {
    const handle = (mode: number) => {
      this.modellingHelper.setEditingMode(mode);
    };
    editorEventBus.on(EDITOR_EVENT.ChangeEditingMode, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.ChangeEditingMode, callback: handle });
  }


  private handleScaleObject() {

    const handle = (scale: Vec3) => {

      const obj = this.modellingHelper.getCurrentObject();
      if (obj instanceof ModellingMesh) {
        const transform = obj.getTransformHelper();
        if (!transform) return;
        const difference = calculateVec3Difference(convertTVector3ToVec3(transform.scale), scale);
        obj.scaleVertices(difference);
      }

    };

    editorEventBus.on(EDITOR_EVENT.ScaleObject, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.ScaleObject, callback: handle });

  }

  private handleChangeScale() {

    const handle = (scales: Array<Vec3>) => {
      const obj = this.modellingHelper.getCurrentObject();

      if (obj instanceof ModellingMesh) {

        const indices = obj.getHighlightedIndices();
        const transform = obj.getTransformHelper();
        if (!transform) return;

        if (compareVec3(scales[TRANSFORM_CHANGE.New], convertTVector3ToVec3(transform.scale))) {
          const difference = calculateVec3Difference(convertTVector3ToVec3(transform.scale), scales[TRANSFORM_CHANGE.Old]);
          this.commandHistory.addCommand(new ScaleModellingVertices(obj, difference, indices), false);
        }
        else {
          const difference = calculateVec3Difference(scales[TRANSFORM_CHANGE.New], convertTVector3ToVec3(transform.scale));
          this.commandHistory.addCommand(new ScaleModellingVertices(obj, difference, indices));
          transform.scale.set(transform.scale.x + difference.x,
            transform.scale.y + difference.y,
            transform.scale.z + difference.z);
        }
      }
    };

    editorEventBus.on(EDITOR_EVENT.ChangeScale, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.ChangeScale, callback: handle });
  }

  private handleRemoveMesh() {
    const handle = () => {
      editorEventBus.emit(EDITOR_EVENT.SendWarningLog, "You cannot delete vertices.");
    };

    editorEventBus.on(EDITOR_EVENT.RemoveMesh, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.RemoveMesh, callback: handle });
  }

  private handleChangeRotation() {
    const handle = () => {
      editorEventBus.emit(EDITOR_EVENT.SendWarningLog, "There is no rotation in edit mode.");
      const obj = this.modellingHelper.getCurrentObject();
      if (obj instanceof ModellingMesh) {
        const transform = obj.getTransformHelper();
        if (!transform) return;
        transform.rotation.set(0, 0, 0);
      }
    };

    editorEventBus.on(EDITOR_EVENT.ChangeRotation, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.ChangeRotation, callback: handle });
  }

}
