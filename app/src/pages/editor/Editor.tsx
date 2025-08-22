import { useEffect, type KeyboardEvent } from "react";
import EditorPanel from "./ui/EditorPanel";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import EditorTopBar from "./ui/EditorTopBar";
import { AddMeshCommand } from "./commands/AddMeshCommand";
import { CommandHistory } from "@/lib/CommandHistory";
import { UiController } from "./utils/UiController";
import { EDITOR_EVENT, editorEventBus } from "./utils/EditorEvents";
import { EDITOR_MODE } from "./utils/Types";
import * as THREE from "three/webgpu";
import { HandleKeyboardPress } from "./utils/KeyboardShortcuts";
import { AttachObjectCommand } from "./commands/AttachObjectCommand";
import { EditorUtils } from "./utils/EditorUtils";
import { AddObjectsCommand } from "./commands/AddObjectsCommand";
import RenderInfoPanel from "./ui/RenderInfoPanel";
import ToolbarPanel from "./ui/ToolbarPanel";
import { EditModeHandler } from "./utils/EditModeHandler";
import { ObjectModeHandler } from "./utils/ObjectModeHandler";
import ModellingMesh from "./utils/objects/ModellingMesh";
import { ModellingHelper } from "./utils/ModellingHelper";
import WarningLogPanel from "./ui/WarningLogPanel";
import { PaintModeHandler } from "./utils/PaintModeHandler";
import { PaintingHelper } from "./utils/PaintingHelper";
import { CreateMesh } from "./utils/CreateMesh";
import { InitRenderer } from "./utils/InitRenderer";


function Editor() {
  const { canvasRef, rendererController, selectionController } = InitRenderer();

  useEffect(() => {
    const scene = rendererController.getScene();
    const commandHistory = new CommandHistory();
    const editorUtils = new EditorUtils(scene);
    const uiController = new UiController(scene);
    const modellingHelper = new ModellingHelper();
    const paintingHelper = new PaintingHelper();

    const objectModeHandler = new ObjectModeHandler(commandHistory, uiController, selectionController, scene);
    const editModeHandler = new EditModeHandler(commandHistory, uiController, modellingHelper, scene);
    const paintModeHandler = new PaintModeHandler(commandHistory, uiController, paintingHelper, scene);

    selectionController.onEditSelect((intersections: Array<THREE.Intersection>) => { modellingHelper.handleIntersectionChange(intersections); });
    selectionController.onPaintSelect((intersection: THREE.Intersection) => { paintingHelper.handleIntersectionChange(intersection); });

    objectModeHandler.initEventHandlers();
    uiController.setRendererInfo(rendererController.getRenderInfo()); // Only for testing if objects are disposed correctly
    uiController.refreshPanel();

    const handleAddMesh = (meshData: Array<number>) => {
      const mesh = CreateMesh(meshData);
      commandHistory.addCommand(new AddMeshCommand(scene, mesh));
      uiController.refreshTree();
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

    const handleChangeSceneColor = (color: number) => {
      const background = new THREE.Color(color);
      scene.background = background;
    };

    const handleChangeEditorMode = (mode: string) => {
      if (mode === EDITOR_MODE.ObjectMode) {
        editModeHandler.disposeEventHandlers();
        paintModeHandler.disposeEventHandlers();
        objectModeHandler.initEventHandlers();
        modellingHelper.clearObject();
        paintingHelper.clearObject();
        selectionController.setEditorMode(EDITOR_MODE.ObjectMode);
      }
      if (mode === EDITOR_MODE.EditMode) {
        objectModeHandler.disposeEventHandlers();
        paintModeHandler.disposeEventHandlers();
        editModeHandler.initEventHandlers();
        const selection = selectionController.getCurrentSelection();
        if (selection instanceof ModellingMesh) {
          modellingHelper.setCurrentObjectToEditMode(selection);
        } else {
          editorEventBus.emit(EDITOR_EVENT.SendWarningLog, "Please select a modelling object in object mode before editing.");

        }
        selectionController.setEditorMode(EDITOR_MODE.EditMode);
      }
      if (mode === EDITOR_MODE.PaintMode) {
        objectModeHandler.disposeEventHandlers();
        editModeHandler.disposeEventHandlers();
        paintModeHandler.initEventHandlers();
        const selection = selectionController.getCurrentSelection();
        if (selection instanceof ModellingMesh) {
          paintingHelper.setCurrentObjectToPaintMode(selection);
        } else {
          editorEventBus.emit(EDITOR_EVENT.SendWarningLog, "Please select a modelling object in object mode before painting.");
        }
        selectionController.setEditorMode(EDITOR_MODE.PaintMode);
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
    editorEventBus.on(EDITOR_EVENT.SelectObject, handleSelectObject);
    editorEventBus.on(EDITOR_EVENT.AddSelection, handleAddSelection);
    editorEventBus.on(EDITOR_EVENT.AttachToObject, handleAttachToObject);
    editorEventBus.on(EDITOR_EVENT.ClearSelections, handleClearSelections);
    editorEventBus.on(EDITOR_EVENT.ChangeObjectName, handleChangeObjectName);
    editorEventBus.on(EDITOR_EVENT.ChangeSceneColor, handleChangeSceneColor);
    editorEventBus.on(EDITOR_EVENT.ChangeEditorMode, handleChangeEditorMode);
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
      editorEventBus.off(EDITOR_EVENT.ChangeObjectName, handleChangeObjectName);
      editorEventBus.off(EDITOR_EVENT.ChangeSceneColor, handleChangeSceneColor);
      editorEventBus.off(EDITOR_EVENT.ChangeEditorMode, handleChangeEditorMode);
      editorEventBus.off(EDITOR_EVENT.COPY, handleCopy);
      editorEventBus.off(EDITOR_EVENT.PASTE, handlePaste);
      editorEventBus.off(EDITOR_EVENT.UNDO, handleUndo);
      editorEventBus.off(EDITOR_EVENT.REDO, handleRedo);

      editModeHandler.disposeEventHandlers();
      paintModeHandler.disposeEventHandlers();
      objectModeHandler.disposeEventHandlers();
    };
  }, [rendererController, selectionController,]);

  return (
    <>

      <div className="w-full h-full flex justify-center overflow-auto">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <div className="flex-col inline-flex w-full h-full bg-background" >
              <div className="flex-auto bg-card border border-b-card-foreground">
                <EditorTopBar />
              </div>
              <div
                ref={canvasRef}
                tabIndex={1}
                onKeyDown={(event: KeyboardEvent) => { HandleKeyboardPress(event); }}
                onMouseOver={(e) => { e.currentTarget.focus(); }}
                className="flex-auto" >
              </div>
              <ToolbarPanel />
              <RenderInfoPanel />
              <WarningLogPanel />
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
