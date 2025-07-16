import * as THREE from "three/webgpu";
import { CommandHistory } from "@/lib/CommandHistory";
import type { UiController } from "./UiController";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { PAINTING_MODE, PAINTING_SETTINGS, type EventHandlerType, type Vec3 } from "./Types";
import { AddListener, RemoveListener } from "./AddListener";
import ModellingMesh from "./objects/ModellingMesh";
import { PaintVerticesCommand } from "../commands/PaintVerticesCommand";
import type { PaintingHelper } from "./PaintingHelper";
import { convertHexColorToVec3, convertVec3ToHexColor } from "./utils";
import { DrawLineCommand } from "../commands/DrawLineCommand";
import { DEFAULT_LINE_WIDTH } from "./Global";
import { CreateModellingOutlineCommand } from "../commands/CreateModellingOutlineCommand";

export class PaintModeHandler {
  eventHandlers: Array<EventHandlerType>;
  commandHistory: CommandHistory;
  paintingHelper: PaintingHelper;
  uiController: UiController;
  scene: THREE.Scene;

  private listenerHandlers: Array<number>;
  private oldVerticesColors: Map<number, Vec3>;
  private lineWidth: number;

  constructor(commandHistory: CommandHistory, uiController: UiController, paintingHelper: PaintingHelper, scene: THREE.Scene) {
    this.eventHandlers = [];
    this.commandHistory = commandHistory;
    this.paintingHelper = paintingHelper;
    this.uiController = uiController;
    this.scene = scene;
    this.listenerHandlers = [];
    this.oldVerticesColors = new Map();
    this.lineWidth = DEFAULT_LINE_WIDTH;
  }

  initEventHandlers() {
    if (this.eventHandlers.length > 0) this.disposeEventHandlers();

    this.handleChangePaintingMode();
    this.handleChangePaintingSettings();
    this.saveOldPaint();
    this.addPaintCommand();
    this.addLineCommand();

  }

  disposeEventHandlers() {

    // Create outline command when leaving the paint mode 
    this.addOutlineCommand();

    this.eventHandlers.forEach((handler) => {
      editorEventBus.off(handler.event, handler.callback);
    });
    this.listenerHandlers.forEach((id) => {
      RemoveListener(id);
    });
  }

  private handleChangePaintingMode() {
    const handle = (mode: number) => {
      this.paintingHelper.setPaintingMode(mode);

      if (mode !== PAINTING_MODE.DrawOutline) {
        // Create outline command when leaving the draw outline
        this.addOutlineCommand();
      }

      // Sending settings to the ui
      if (mode === PAINTING_MODE.DrawOutline) {

        this.lineWidth = this.paintingHelper.getOutlineWidth();
        const color = convertVec3ToHexColor(this.paintingHelper.getBrushColor());
        this.paintingHelper.setShouldClearLines(false);

        const settings = [
          color,
          this.lineWidth,
          this.paintingHelper.getLineOffset(),
          0,
        ];

        editorEventBus.emit(EDITOR_EVENT.RefreshPaintingSettings, settings);

      }

    };
    editorEventBus.on(EDITOR_EVENT.ChangePaintingMode, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.ChangePaintingMode, callback: handle });
  }

  private handleChangePaintingSettings() {
    const handle = (settings: Array<number>) => {

      const hexColor = settings[PAINTING_SETTINGS.HexColor];
      const lineWidth = settings[PAINTING_SETTINGS.LineWidth];
      const lineOffset = settings[PAINTING_SETTINGS.LineOffset];
      const shouldClearLines = settings[PAINTING_SETTINGS.ClearLine] === 0 ? false : true;

      this.paintingHelper.setBrushColor(convertHexColorToVec3(hexColor));
      this.paintingHelper.setLineOffset(lineOffset);
      this.paintingHelper.setOutlineWidth(lineWidth);
      this.paintingHelper.setShouldClearLines(shouldClearLines);
      this.lineWidth = lineWidth;

    };
    editorEventBus.on(EDITOR_EVENT.ChangePaintingSettings, handle);
    this.eventHandlers.push({ event: EDITOR_EVENT.ChangePaintingSettings, callback: handle });
  }

  private saveOldPaint() {

    const handle = (e: Event) => {
      if (this.paintingHelper.getPaintingMode() !== PAINTING_MODE.VertexColor) return;

      if (!(e instanceof MouseEvent)) {
        return;
      }
      const obj = this.paintingHelper.getCurrentObject();
      if (!(obj instanceof ModellingMesh)) return;

      this.oldVerticesColors = new Map(obj.getCurrentVerticesColors());

    };
    this.listenerHandlers.push(AddListener(window, "mousedown", handle));
  }

  private addPaintCommand() {
    const handle = (e: Event) => {
      if (this.paintingHelper.getPaintingMode() !== PAINTING_MODE.VertexColor) return;

      if (!(e instanceof MouseEvent)) {
        return;
      }

      const obj = this.paintingHelper.getCurrentObject();
      if (!(obj instanceof ModellingMesh)) return;

      const coloredVertices = this.paintingHelper.getColoredVertices();
      const uniqueVertices = Array.from(new Set(coloredVertices));

      if (uniqueVertices.length === 0) return;

      this.commandHistory.addCommand(
        new PaintVerticesCommand(obj, uniqueVertices, this.paintingHelper.getBrushColor(), this.oldVerticesColors),
        false);

      this.paintingHelper.resetColoredVertices();
    };

    this.listenerHandlers.push(AddListener(window, "mouseup", handle));
  }

  private addLineCommand() {
    const handle = (e: Event) => {
      if (this.paintingHelper.getPaintingMode() !== PAINTING_MODE.DrawLine) return;

      if (!(e instanceof MouseEvent)) {
        return;
      }

      const obj = this.paintingHelper.getCurrentObject();
      if (!(obj instanceof ModellingMesh)) return;

      const linePoints = this.paintingHelper.getLinePoints();
      if (linePoints.length === 0) return;

      const hexColor = convertVec3ToHexColor(this.paintingHelper.getBrushColor());

      this.commandHistory.addCommand(new DrawLineCommand(obj, linePoints, hexColor, this.lineWidth));

      this.paintingHelper.resetLinePoints();

    };

    this.listenerHandlers.push(AddListener(window, "mouseup", handle));
  }

  private addOutlineCommand() {
    const obj = this.paintingHelper.getCurrentObject();
    if (!obj) return;

    const outlineObj = obj.getModellingOutline();
    if (!outlineObj) return;

    if (!outlineObj.shouldOutlineBeCreated()) return;

    this.commandHistory.addCommand(new CreateModellingOutlineCommand(outlineObj));
  }

}
