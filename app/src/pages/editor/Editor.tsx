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
import { EDITOR_MODE } from "./utils/Types";
import * as THREE from "three/webgpu";
import { HandleKeyboardPress } from "./utils/KeyboardShortcuts";
import { RemoveObjectsCommand } from "./commands/RemoveObjectsCommand";
import { isArrayOfMeshes } from "./utils/utils";
import { SetMeshesColorCommand } from "./commands/SetMeshesColorCommand";
import { AttachObjectCommand } from "./commands/AttachObjectCommand";
import { EditorUtils } from "./utils/EditorUtils";
import { AddObjectsCommand } from "./commands/AddObjectsCommand";
import RenderInfoPanel from "./ui/RenderInfoPanel";
import ToolbarPanel from "./ui/ToolbarPanel";
import { EditModeHandler } from "./utils/EditModeHandler";
import { ObjectModeHandler } from "./utils/ObjectModeHandler";
import ModellingMesh from "./utils/objects/ModellingMesh";
import { ModellingHelper } from "./utils/ModellingHelper";


function Editor() {
  const { canvasRef, renderer, scene, selectionController } = InitRenderer();

  useEffect(() => {
    const commandHistory = new CommandHistory();
    const editorUtils = new EditorUtils(scene);
    const uiController = new UiController(scene);
    const modellingHelper = new ModellingHelper();
    const editModeHandler = new EditModeHandler(commandHistory, uiController, modellingHelper, scene);
    const objectModeHandler = new ObjectModeHandler(commandHistory, uiController, selectionController, scene);

    selectionController.onEditSelect((intersection: THREE.Intersection) => { modellingHelper.handleIntersectionChange(intersection); });
    objectModeHandler.initEventHandlers();
    uiController.setRendererInfo(renderer.info.memory); // Only for testing if objects are disposed correctly

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

    const handleChangeEditorMode = (mode: string) => {
      if (mode === EDITOR_MODE.ObjectMode) {
        editModeHandler.disposeEventHandlers();
        objectModeHandler.initEventHandlers();
        modellingHelper.clearObject();
        selectionController.setEditMode(false);
      }
      if (mode === EDITOR_MODE.EditMode) {
        objectModeHandler.disposeEventHandlers();
        editModeHandler.initEventHandlers();
        const selection = selectionController.getCurrentSelection();
        if (selection instanceof ModellingMesh) {
          modellingHelper.setCurrentObject(selection);
        }
        selectionController.setEditMode(true);
      }
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
    editorEventBus.on(EDITOR_EVENT.ChangeObjectName, handleChangeObjectName);
    editorEventBus.on(EDITOR_EVENT.ChangeMeshColor, handleChangeMeshColor);
    editorEventBus.on(EDITOR_EVENT.ChangeSceneColor, handleChangeSceneColor);
    editorEventBus.on(EDITOR_EVENT.ChangeEditorMode, handleChangeEditorMode);
    editorEventBus.on(EDITOR_EVENT.COPY, handleCopy);
    editorEventBus.on(EDITOR_EVENT.PASTE, handlePaste);
    editorEventBus.on(EDITOR_EVENT.UNDO, handleUndo);
    editorEventBus.on(EDITOR_EVENT.REDO, handleRedo);

    return () => {
      editorEventBus.off(EDITOR_EVENT.AddMesh, handleAddMesh);
      editorEventBus.off(EDITOR_EVENT.RemoveMesh, handleRemoveMesh);
      editorEventBus.off(EDITOR_EVENT.SelectObject, handleSelectObject);
      editorEventBus.off(EDITOR_EVENT.AddSelection, handleAddSelection);
      editorEventBus.off(EDITOR_EVENT.AttachToObject, handleAttachToObject);
      editorEventBus.off(EDITOR_EVENT.ClearSelections, handleClearSelections);
      editorEventBus.off(EDITOR_EVENT.ChangeMeshColor, handleChangeMeshColor);
      editorEventBus.off(EDITOR_EVENT.ChangeObjectName, handleChangeObjectName);
      editorEventBus.off(EDITOR_EVENT.ChangeSceneColor, handleChangeSceneColor);
      editorEventBus.off(EDITOR_EVENT.ChangeEditorMode, handleChangeEditorMode);
      editorEventBus.off(EDITOR_EVENT.COPY, handleCopy);
      editorEventBus.off(EDITOR_EVENT.PASTE, handlePaste);
      editorEventBus.off(EDITOR_EVENT.UNDO, handleUndo);
      editorEventBus.off(EDITOR_EVENT.REDO, handleRedo);

      editModeHandler.disposeEventHandlers();
      objectModeHandler.disposeEventHandlers();
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
