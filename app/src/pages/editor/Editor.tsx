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
import { SetMeshPositionCommand } from "./commands/SetMeshPositionCommand";
import { SetMeshScaleCommand } from "./commands/SetMeshScaleCommand";
import { SetMeshRotationCommand } from "./commands/SetMeshRotationCommand";
import * as THREE from "three/webgpu";
import { SetMeshColorCommand } from "./commands/SetMeshColorCommand";
import { HandleKeyboardPress } from "./utils/KeyboardShortcuts";
import { RemoveObjectsCommand } from "./commands/RemoveObjectsCommand";


function Editor() {
  const { canvasRef, renderer, scene, selectionController } = InitRenderer();

  useEffect(() => {
    const commandHistory = new CommandHistory();
    const uiController = new UiController(scene);

    const handleAddMesh = (meshType: MeshType) => {
      const mesh = GetMesh(meshType);
      commandHistory.addCommand(new AddMeshCommand(scene, mesh));
      uiController.refreshTree();
    };

    const handleRemoveMesh = () => {
      const selections = selectionController.getSelectedObjects();
      commandHistory.addCommand(new RemoveObjectsCommand(scene, selections));
      uiController.refreshTree();
      selectionController.checkIfSelectionExists(scene); // Only for now. In the future add something to reduce repeating, maybe event for refreshing?
    };

    const handleSelectObject = (id: number) => {
      selectionController.changeSelection(scene, id);
      uiController.setSelectedMeshId(id);
    };

    const handleAddSelection = (id: number) => {
      selectionController.addSelection(scene, id);
      uiController.setSelectedMeshId(id);
    };

    const handleClearSelections = () => {
      selectionController.clearAllSelections();
    };

    const handleChangePosition = (pos: Vec3) => {
      const selectedMesh = selectionController.getCurrentSelection();
      if (selectedMesh && selectedMesh instanceof THREE.Mesh) {
        commandHistory.addCommand(new SetMeshPositionCommand(selectedMesh, pos));
      }
    };

    const handleChangeScale = (scale: Vec3) => {
      const selection = selectionController.getCurrentSelection();
      if (selection && selection instanceof THREE.Mesh) {
        commandHistory.addCommand(new SetMeshScaleCommand(selection, scale));
      }
    };

    const handleChangeRotation = (rotation: Vec3) => {
      const selection = selectionController.getCurrentSelection();
      if (selection && selection instanceof THREE.Mesh) {
        commandHistory.addCommand(new SetMeshRotationCommand(selection, rotation));
      }
    };

    const handleChangeMeshColor = (color: number) => {
      const meshColor = new THREE.Color(color);
      const selection = selectionController.getCurrentSelection();
      if (selection && selection instanceof THREE.Mesh) {
        commandHistory.addCommand(new SetMeshColorCommand(selection, meshColor));
      }
    };

    const handleChangeSceneColor = (color: number) => {
      const background = new THREE.Color(color);
      scene.background = background;
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
    editorEventBus.on(EDITOR_EVENT.ClearSelections, handleClearSelections);
    editorEventBus.on(EDITOR_EVENT.ChangePosition, handleChangePosition);
    editorEventBus.on(EDITOR_EVENT.ChangeScale, handleChangeScale);
    editorEventBus.on(EDITOR_EVENT.ChangeRotation, handleChangeRotation);
    editorEventBus.on(EDITOR_EVENT.ChangeMeshColor, handleChangeMeshColor);
    editorEventBus.on(EDITOR_EVENT.ChangeSceneColor, handleChangeSceneColor);
    editorEventBus.on(EDITOR_EVENT.UNDO, handleUndo);
    editorEventBus.on(EDITOR_EVENT.REDO, handleRedo);

    return () => {
      editorEventBus.off(EDITOR_EVENT.AddMesh, handleAddMesh);
      editorEventBus.off(EDITOR_EVENT.SelectObject, handleSelectObject);
      editorEventBus.off(EDITOR_EVENT.AddSelection, handleAddSelection);
      editorEventBus.off(EDITOR_EVENT.ClearSelections, handleClearSelections);
      editorEventBus.off(EDITOR_EVENT.ChangePosition, handleChangePosition);
      editorEventBus.off(EDITOR_EVENT.ChangeScale, handleChangeScale);
      editorEventBus.off(EDITOR_EVENT.ChangeRotation, handleChangeRotation);
      editorEventBus.off(EDITOR_EVENT.ChangeMeshColor, handleChangeMeshColor);
      editorEventBus.off(EDITOR_EVENT.ChangeSceneColor, handleChangeSceneColor);
      editorEventBus.off(EDITOR_EVENT.UNDO, handleUndo);
      editorEventBus.off(EDITOR_EVENT.REDO, handleRedo);
    };
  }, [scene]);

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
