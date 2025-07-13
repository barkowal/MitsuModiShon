import * as THREE from "three/webgpu";
import { CommandHistory } from "@/lib/CommandHistory";
import type { UiController } from "./UiController";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { type EventHandlerType, type Vec3 } from "./Types";
import type { ModellingHelper } from "./ModellingHelper";
import { AddListener, RemoveListener } from "./AddListener";
import ModellingMesh from "./objects/ModellingMesh";
import { PaintVerticesCommand } from "../commands/PaintVerticesCommand";

export class PaintModeHandler {
  eventHandlers: Array<EventHandlerType>;
  commandHistory: CommandHistory;
  modellingHelper: ModellingHelper;
  uiController: UiController;
  scene: THREE.Scene;

  private listenerHandlers: Array<number>;
  private oldVerticesColors: Map<number, Vec3>;

  constructor(commandHistory: CommandHistory, uiController: UiController, modellingHelper: ModellingHelper, scene: THREE.Scene) {
    this.eventHandlers = [];
    this.commandHistory = commandHistory;
    this.modellingHelper = modellingHelper;
    this.uiController = uiController;
    this.scene = scene;
    this.listenerHandlers = [];
    this.oldVerticesColors = new Map();
  }

  initEventHandlers() {
    if (this.eventHandlers.length > 0) this.disposeEventHandlers();

    this.handleBrushColorChange();
    this.saveOldPaint();
    this.addPaintCommand();

  }

  disposeEventHandlers() {
    this.eventHandlers.forEach((handler) => {
      editorEventBus.off(handler.event, handler.callback);
    });
    this.listenerHandlers.forEach((id) => {
      RemoveListener(id);
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

  private saveOldPaint() {

    const handle = (e: Event) => {
      if (!(e instanceof MouseEvent)) {
        return;
      }
      const obj = this.modellingHelper.getCurrentObject();
      if (!(obj instanceof ModellingMesh)) return;

      this.oldVerticesColors = new Map(obj.getCurrentVerticesColors());

    };
    this.listenerHandlers.push(AddListener(window, "mousedown", handle));
  }

  addPaintCommand() {
    const handle = (e: Event) => {
      if (!(e instanceof MouseEvent)) {
        return;
      }

      const obj = this.modellingHelper.getCurrentObject();
      if (!(obj instanceof ModellingMesh)) return;

      const coloredVertices = this.modellingHelper.getColoredVertices();
      const uniqueVertices = Array.from(new Set(coloredVertices));

      if (uniqueVertices.length === 0) return;

      this.commandHistory.addCommand(
        new PaintVerticesCommand(obj, uniqueVertices, this.modellingHelper.getBrushColor(), this.oldVerticesColors),
        false);

      this.modellingHelper.resetColoredVertices();
    };

    this.listenerHandlers.push(AddListener(window, "mouseup", handle));
  }


}
