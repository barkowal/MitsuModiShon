import * as THREE from "three/webgpu";
import { CommandHistory } from "@/lib/CommandHistory";
import type { UiController } from "./UiController";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { TRANSFORM_CHANGE, type EventHandlerType, type Vec3 } from "./Types";
import type { SelectionController } from "./SelectionController";
import { calculateVec3Difference, compareVec3, convertEulerToVec3Degrees, convertTVector3ToVec3 } from "./utils";
import { TranslateObjectsCommand } from "../commands/TranslateObjectsCommand";
import { ScaleObjectsCommand } from "../commands/ScaleObjectsCommand";
import { RotateObjectsCommand } from "../commands/RotateObjectsCommand";

export class ObjectModeHandler {
  eventHandlers: Array<EventHandlerType>;
  commandHistory: CommandHistory;
  uiController: UiController;
  selectionController: SelectionController;
  scene: THREE.Scene;

  constructor(commandHistory: CommandHistory, uiController: UiController, selectionController: SelectionController, scene: THREE.Scene) {
    this.eventHandlers = [];
    this.commandHistory = commandHistory;
    this.uiController = uiController;
    this.selectionController = selectionController;
    this.scene = scene;
  }

  initEventHandlers() {
    if (this.eventHandlers.length > 0) this.disposeEventHandlers();

    this.handleChangePosition();
    this.handleMoveObject();
    this.handleChangeScale();
    this.handleScaleObject();
    this.handleChangeRotation();
    this.handleRotateObject();
  }

  disposeEventHandlers() {
    this.eventHandlers.forEach((handler) => {
      editorEventBus.off(handler.event, handler.callback);
    });
  }

  private handleChangePosition() {
    const handle = (pos: Array<Vec3>) => {

      const selectedMesh = this.selectionController.getCurrentSelection();
      if (selectedMesh) {
        const allSelections = this.selectionController.getSelectedObjects();

        // Position is already changed, command should provide undo without executing at creation
        if (compareVec3(pos[TRANSFORM_CHANGE.New], convertTVector3ToVec3(selectedMesh.position))) {
          const difference = calculateVec3Difference(convertTVector3ToVec3(selectedMesh.position), pos[TRANSFORM_CHANGE.Old]);
          this.commandHistory.addCommand(new TranslateObjectsCommand(allSelections, difference), false);
        }
        // Command should execute position change at creation
        else {
          const difference = calculateVec3Difference(pos[TRANSFORM_CHANGE.New], convertTVector3ToVec3(selectedMesh.position));
          this.commandHistory.addCommand(new TranslateObjectsCommand(allSelections, difference));
        }
      }

    };
    editorEventBus.on(EDITOR_EVENT.ChangePosition, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.ChangePosition, callback: handle });
  }


  private handleMoveObject() {

    const handle = (pos: Vec3) => {
      const selectedMesh = this.selectionController.getCurrentSelection();
      if (selectedMesh) {
        const distance = calculateVec3Difference(convertTVector3ToVec3(selectedMesh.position), pos);
        const allSelections = this.selectionController.getSelectedObjects();
        const sel = allSelections.filter(selection => selection != selectedMesh);

        sel.forEach((object: THREE.Object3D) => {
          const currentRotation = object.rotation.clone();
          object.rotation.set(0, 0, 0);
          object.translateX(distance.x);
          object.translateY(distance.y);
          object.translateZ(distance.z);
          object.setRotationFromEuler(currentRotation);
        });
      }
    };

    editorEventBus.on(EDITOR_EVENT.MoveObject, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.MoveObject, callback: handle });

  }

  private handleScaleObject() {

    const handle = (scale: Vec3) => {
      const selectedMesh = this.selectionController.getCurrentSelection();
      if (selectedMesh) {
        const difference = calculateVec3Difference(convertTVector3ToVec3(selectedMesh.scale), scale);
        const allSelections = this.selectionController.getSelectedObjects();
        const otherMeshes = allSelections.filter(selection => selection != selectedMesh);

        otherMeshes.forEach((object: THREE.Object3D) => {
          object.scale.setX(object.scale.x + difference.x);
          object.scale.setY(object.scale.y + difference.y);
          object.scale.setZ(object.scale.z + difference.z);
        });
      }
    };

    editorEventBus.on(EDITOR_EVENT.ScaleObject, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.ScaleObject, callback: handle });

  }

  private handleChangeScale() {

    const handle = (scales: Array<Vec3>) => {
      const selection = this.selectionController.getCurrentSelection();
      if (selection) {

        if (compareVec3(scales[TRANSFORM_CHANGE.New], convertTVector3ToVec3(selection.scale))) {
          const difference = calculateVec3Difference(convertTVector3ToVec3(selection.scale), scales[TRANSFORM_CHANGE.Old]);
          const allSelections = this.selectionController.getSelectedObjects();
          this.commandHistory.addCommand(new ScaleObjectsCommand(allSelections, difference), false);
        }
        else {
          const difference = calculateVec3Difference(scales[TRANSFORM_CHANGE.New], convertTVector3ToVec3(selection.scale));
          const allSelections = this.selectionController.getSelectedObjects();
          this.commandHistory.addCommand(new ScaleObjectsCommand(allSelections, difference));
        }

      }
    };

    editorEventBus.on(EDITOR_EVENT.ChangeScale, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.ChangeScale, callback: handle });
  }

  private handleChangeRotation() {
    const handle = (rotation: Array<Vec3>) => {
      const selection = this.selectionController.getCurrentSelection();
      if (selection) {

        if (compareVec3(rotation[TRANSFORM_CHANGE.New], convertEulerToVec3Degrees(selection.rotation))) {
          const difference = calculateVec3Difference(convertEulerToVec3Degrees(selection.rotation), rotation[TRANSFORM_CHANGE.Old]);
          const allSelections = this.selectionController.getSelectedObjects();
          this.commandHistory.addCommand(new RotateObjectsCommand(allSelections, difference), false);
        }
        else {
          const difference = calculateVec3Difference(rotation[TRANSFORM_CHANGE.New], convertEulerToVec3Degrees(selection.rotation));
          const allSelections = this.selectionController.getSelectedObjects();
          this.commandHistory.addCommand(new RotateObjectsCommand(allSelections, difference));

        }
      }
    };

    editorEventBus.on(EDITOR_EVENT.ChangeRotation, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.ChangeRotation, callback: handle });
  }


  private handleRotateObject() {

    const handle = (rotation: Vec3) => {
      const selectedMesh = this.selectionController.getCurrentSelection();
      if (selectedMesh) {
        const difference = calculateVec3Difference(convertEulerToVec3Degrees(selectedMesh.rotation), rotation);
        const allSelections = this.selectionController.getSelectedObjects();
        const otherMeshes = allSelections.filter(selection => selection != selectedMesh);

        otherMeshes.forEach((object: THREE.Object3D) => {
          object.rotation.set(
            object.rotation.x + difference.x * (Math.PI / 180),
            object.rotation.y + difference.y * (Math.PI / 180),
            object.rotation.z + difference.z * (Math.PI / 180),
          );
        });

      }
    };

    editorEventBus.on(EDITOR_EVENT.RotateObject, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.RotateObject, callback: handle });

  }

}
