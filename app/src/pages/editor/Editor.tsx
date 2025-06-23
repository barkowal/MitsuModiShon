import { useEffect, type KeyboardEvent } from "react";
import EditorPanel from "./ui/EditorPanel";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import EditorTopBar from "./ui/EditorTopBar";
import { AddMeshCommand } from "./commands/AddMeshCommand";
import { CommandHistory } from "@/lib/CommandHistory";
import { GetMesh, type MeshType } from "./utils/GetMesh";
import InitRenderer from "./utils/InitRenderer";
import { UiController } from "./utils/UiController";
import { EDITOR_EVENT, editorEventBus } from "./utils/EditorEvents";
import type { Vec3 } from "./utils/Types";
import * as THREE from "three/webgpu";
import { HandleKeyboardPress } from "./utils/KeyboardShortcuts";
import { RemoveObjectsCommand } from "./commands/RemoveObjectsCommand";
import { TranslateObjectsCommand } from "./commands/TranslateObjectsCommand";
import { calculateVec3Difference, convertEulerToVec3Degrees, convertTVector3ToVec3, isArrayOfMeshes } from "./utils/utils";
import { ScaleObjectsCommand } from "./commands/ScaleObjectsCommand";
import { RotateObjectsCommand } from "./commands/RotateObjectsCommand";
import { SetMeshesColorCommand } from "./commands/SetMeshesColorCommand";
import { AttachObjectCommand } from "./commands/AttachObjectCommand";
import { EditorUtils } from "./utils/EditorUtils";
import { AddObjectsCommand } from "./commands/AddObjectsCommand";
import RenderInfoPanel from "./ui/RenderInfoPanel";
import ToolbarPanel from "./ui/ToolbarPanel";


function Editor() {
  const { canvasRef, renderer, scene, selectionController } = InitRenderer();

  useEffect(() => {
    const commandHistory = new CommandHistory();
    const editorUtils = new EditorUtils(scene);
    const uiController = new UiController(scene);
    uiController.setRendererInfo(renderer.info.memory); // Only for testing if objects are dispatched correctly

    const handleAddMesh = (meshType: MeshType) => {
      const mesh = GetMesh(meshType);
      commandHistory.addCommand(new AddMeshCommand(scene, mesh));
      uiController.refreshTree();
    };

    const handleRemoveMesh = () => {
      const selections = selectionController.getSelectedObjects();
      commandHistory.addCommand(new RemoveObjectsCommand(scene, selections));
      uiController.refreshTree();
      selectionController.checkIfSelectionExists(scene); // Only for now -_o . In the future add something to reduce repeating, maybe event for refreshing?
    };

    const handleSelectObject = (id: number) => {
      selectionController.changeSelection(scene, id);
      uiController.setSelectedMeshId(id);
    };

    const handleAddSelection = (id: number) => {
      selectionController.addSelection(scene, id);
      uiController.setSelectedMeshId(id);
    };

    const handleAttachToObject = (ids: Array<number>) => {
      commandHistory.addCommand(new AttachObjectCommand(scene, ids[0], ids[1]));
      uiController.refreshTree();
    };

    const handleClearSelections = () => {
      selectionController.clearAllSelections();
    };

    const handleChangePosition = (pos: Vec3) => {
      const selectedMesh = selectionController.getCurrentSelection();
      if (selectedMesh) {
        const difference = calculateVec3Difference(pos, convertTVector3ToVec3(selectedMesh.position));
        const allSelections = selectionController.getSelectedObjects();
        commandHistory.addCommand(new TranslateObjectsCommand(allSelections, difference));
      }
    };

    const handleChangeScale = (scale: Vec3) => {
      const selection = selectionController.getCurrentSelection();
      if (selection) {
        const difference = calculateVec3Difference(scale, convertTVector3ToVec3(selection.scale));
        const allSelections = selectionController.getSelectedObjects();
        commandHistory.addCommand(new ScaleObjectsCommand(allSelections, difference));
      }
    };

    const handleChangeRotation = (rotation: Vec3) => {
      const selection = selectionController.getCurrentSelection();
      if (selection) {
        const difference = calculateVec3Difference(rotation, convertEulerToVec3Degrees(selection.rotation));
        const allSelections = selectionController.getSelectedObjects();
        commandHistory.addCommand(new RotateObjectsCommand(allSelections, difference));
      }
    };

    const handleChangeObjectName = (name: string) => {
      const selection = selectionController.getCurrentSelection();
      if (selection) {
        selection.name = name;
      }
      uiController.refreshTree();
    };


    const handleChangeMeshColor = (color: number) => {
      const meshColor = new THREE.Color(color);
      const selection = selectionController.getSelectedObjects();
      if (isArrayOfMeshes(selection)) {
        //@ts-expect-error Checked for meshes
        commandHistory.addCommand(new SetMeshesColorCommand(selection, meshColor));
      }
    };

    const handleChangeSceneColor = (color: number) => {
      const background = new THREE.Color(color);
      scene.background = background;
    };

    const handleCopy = () => {
      const selections = selectionController.getSelectedObjects();
      editorUtils.setCopiedObjects(selections);
    };

    const handlePaste = () => {
      const copies = editorUtils.getCopiedObjects();
      commandHistory.addCommand(new AddObjectsCommand(scene, copies));
      uiController.refreshTree();
    };

    const handleUndo = () => {
      commandHistory.undo();
      uiController.refreshPanel();
      selectionController.checkIfSelectionExists(scene);
    };

    const handleRedo = () => {
      commandHistory.redo();
      uiController.refreshPanel();
      selectionController.checkIfSelectionExists(scene);
    };

    editorEventBus.on(EDITOR_EVENT.AddMesh, handleAddMesh);
    editorEventBus.on(EDITOR_EVENT.RemoveMesh, handleRemoveMesh);
    editorEventBus.on(EDITOR_EVENT.SelectObject, handleSelectObject);
    editorEventBus.on(EDITOR_EVENT.AddSelection, handleAddSelection);
    editorEventBus.on(EDITOR_EVENT.AttachToObject, handleAttachToObject);
    editorEventBus.on(EDITOR_EVENT.ClearSelections, handleClearSelections);
    editorEventBus.on(EDITOR_EVENT.ChangePosition, handleChangePosition);
    editorEventBus.on(EDITOR_EVENT.ChangeScale, handleChangeScale);
    editorEventBus.on(EDITOR_EVENT.ChangeRotation, handleChangeRotation);
    editorEventBus.on(EDITOR_EVENT.ChangeObjectName, handleChangeObjectName);
    editorEventBus.on(EDITOR_EVENT.ChangeMeshColor, handleChangeMeshColor);
    editorEventBus.on(EDITOR_EVENT.ChangeSceneColor, handleChangeSceneColor);
    editorEventBus.on(EDITOR_EVENT.COPY, handleCopy);
    editorEventBus.on(EDITOR_EVENT.PASTE, handlePaste);
    editorEventBus.on(EDITOR_EVENT.UNDO, handleUndo);
    editorEventBus.on(EDITOR_EVENT.REDO, handleRedo);

    return () => {
      editorEventBus.off(EDITOR_EVENT.AddMesh, handleAddMesh);
      editorEventBus.off(EDITOR_EVENT.SelectObject, handleSelectObject);
      editorEventBus.off(EDITOR_EVENT.AddSelection, handleAddSelection);
      editorEventBus.off(EDITOR_EVENT.AttachToObject, handleAttachToObject);
      editorEventBus.off(EDITOR_EVENT.ClearSelections, handleClearSelections);
      editorEventBus.off(EDITOR_EVENT.ChangePosition, handleChangePosition);
      editorEventBus.off(EDITOR_EVENT.ChangeScale, handleChangeScale);
      editorEventBus.off(EDITOR_EVENT.ChangeRotation, handleChangeRotation);
      editorEventBus.off(EDITOR_EVENT.ChangeMeshColor, handleChangeMeshColor);
      editorEventBus.off(EDITOR_EVENT.ChangeObjectName, handleChangeObjectName);
      editorEventBus.off(EDITOR_EVENT.ChangeSceneColor, handleChangeSceneColor);
      editorEventBus.off(EDITOR_EVENT.COPY, handleCopy);
      editorEventBus.off(EDITOR_EVENT.PASTE, handlePaste);
      editorEventBus.off(EDITOR_EVENT.UNDO, handleUndo);
      editorEventBus.off(EDITOR_EVENT.REDO, handleRedo);
    };
  }, [scene, selectionController, renderer]);

  return (
    <>

      <div className="w-full h-full flex justify-center overflow-auto">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <div tabIndex={1} onKeyDown={(event: KeyboardEvent) => { HandleKeyboardPress(event); }}
              className="flex-col inline-flex w-full h-full bg-background">
              <div className="flex-auto bg-card border border-b-card-foreground">
                <EditorTopBar />
              </div>
              <div ref={canvasRef} className="flex-auto" >
              </div>
              <ToolbarPanel />
              <RenderInfoPanel />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel maxSize={38} minSize={26} className="bg-card border border-l-card-foreground">
            <EditorPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div >
    </>
  );
}

export default Editor;
