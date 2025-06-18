import { useEffect } from "react";
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
import { RemoveMeshCommand } from "./commands/RemoveMeshCommand";


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
      const selectedMesh = selectionController.getCurrentMesh();
      if (selectedMesh) {
        commandHistory.addCommand(new RemoveMeshCommand(scene, selectedMesh));
        uiController.refreshTree();
      }
    };

    const handleSelectObject = (id: number) => {
      selectionController.changeSelection(scene, id);
      uiController.setSelectedMeshId(id);
    };

    const handleChangePosition = (pos: Vec3) => {
      const selectedMesh = selectionController.getCurrentMesh();
      if (selectedMesh) {
        commandHistory.addCommand(new SetMeshPositionCommand(selectedMesh, pos));
      }
    };

    const handleChangeScale = (scale: Vec3) => {
      const selectedMesh = selectionController.getCurrentMesh();
      if (selectedMesh) {
        commandHistory.addCommand(new SetMeshScaleCommand(selectedMesh, scale));
      }
    };

    const handleChangeRotation = (rotation: Vec3) => {
      const selectedMesh = selectionController.getCurrentMesh();
      if (selectedMesh) {
        commandHistory.addCommand(new SetMeshRotationCommand(selectedMesh, rotation));
      }
    };

    const handleChangeMeshColor = (color: number) => {
      const meshColor = new THREE.Color(color);
      const selectedMesh = selectionController.getCurrentMesh();
      if (selectedMesh) {
        commandHistory.addCommand(new SetMeshColorCommand(selectedMesh, meshColor));
      }
    };

    const handleChangeSceneColor = (color: number) => {
      const background = new THREE.Color(color);
      scene.background = background;
    };

    const handleUndo = () => {
      commandHistory.undo();
      uiController.refreshPanel();
    };

    const handleRedo = () => {
      commandHistory.redo();
      uiController.refreshPanel();
    };

    editorEventBus.on(EDITOR_EVENT.AddMesh, handleAddMesh);
    editorEventBus.on(EDITOR_EVENT.RemoveMesh, handleRemoveMesh);
    editorEventBus.on(EDITOR_EVENT.SelectObject, handleSelectObject);
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
            <div className="flex-col inline-flex w-full h-full bg-background">
              <div className="flex-auto bg-card border border-b-card-foreground">
                <EditorTopBar />
              </div>
              <div ref={canvasRef} className="flex-auto">
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
