import * as THREE from "three/webgpu";
import { CommandHistory } from "@/lib/CommandHistory";
import type { UiController } from "./UiController";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { type EventHandlerType } from "./Types";
import type { ModellingHelper } from "./ModellingHelper";

export class PaintModeHandler {
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

    this.handleBrushColorChange();

  }

  disposeEventHandlers() {
    this.eventHandlers.forEach((handler) => {
      editorEventBus.off(handler.event, handler.callback);
    });
  }

  handleBrushColorChange() {

    const handle = (hexColor: number) => {

      const r = ((hexColor >> 16) & 255) / 255;
      const g = ((hexColor >> 8) & 255) / 255;
      const b = (hexColor & 255) / 255;

      const vec3Color = { x: r, y: g, z: b };
      this.modellingHelper.setBrushColor(vec3Color);
    };

    editorEventBus.on(EDITOR_EVENT.ChangeBrushColor, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.ChangeBrushColor, callback: handle });

  }


}
