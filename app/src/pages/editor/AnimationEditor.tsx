import { useEffect, type KeyboardEvent } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { AddMeshCommand } from "./commands/AddMeshCommand";
import { CommandHistory } from "@/lib/CommandHistory";
import { UiController } from "./utils/UiController";
import { EDITOR_EVENT, editorEventBus } from "./utils/EditorEvents";
import * as THREE from "three/webgpu";
import { HandleKeyboardPress } from "./utils/KeyboardShortcuts";
import { AttachObjectCommand } from "./commands/AttachObjectCommand";
import { EditorUtils } from "./utils/EditorUtils";
import { AddObjectsCommand } from "./commands/AddObjectsCommand";
import ToolbarPanel from "./ui/ToolbarPanel";
import { ObjectModeHandler } from "./utils/ObjectModeHandler";
import WarningLogPanel from "./ui/WarningLogPanel";
import { CreateMesh } from "./utils/CreateMesh";
import AnimationTopBar from "./ui/AnimationTopBar";
import { PlaybackPanel } from "./ui/Playback/PlaybackPanel";
import { AnimationLoop } from "./utils/AnimationLoop";
import { AnimationModeHandler } from "./utils/AnimationModeHandler";
import { InitRenderer } from "./utils/InitRenderer";
import AnimationPanel from "./ui/AnimationPanel";
import { GetAnimationSceneJSON, getObjectsJSON } from "./utils/GetJSON";
import type { UploadableAnimationSceneData, UploadableObjectData } from "./utils/Types";
import { CreateLight } from "./utils/CreateLight";
import { AddLightCommand } from "./commands/AddLightCommand";

function AnimationEditor() {
  const { canvasRef, rendererController, selectionController } = InitRenderer();

  useEffect(() => {
    const scene = rendererController.getScene();

    const commandHistory = new CommandHistory();
    const editorUtils = new EditorUtils(scene);
    const uiController = new UiController(scene);
    const loop = new AnimationLoop(rendererController);

    const objectModeHandler = new ObjectModeHandler(commandHistory, uiController, selectionController, scene);
    const animationModeHandler = new AnimationModeHandler(commandHistory, loop, uiController, selectionController, scene);

    objectModeHandler.initEventHandlers();
    animationModeHandler.initEventHandlers();
    uiController.setRendererInfo(rendererController.getRenderInfo()); // Only for testing if objects are disposed correctly
    uiController.refreshPanel();

    const handleAddMesh = (meshData: Array<number>) => {
      const mesh = CreateMesh(meshData);
      commandHistory.addCommand(new AddMeshCommand(scene, mesh));
      uiController.refreshTree();
    };

    const handleAddLight = (lightData: Array<number>) => {
      const light = CreateLight(lightData);

      commandHistory.addCommand(new AddLightCommand(scene, light));

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

    const handleUploadToServer = () => {
      const imgData: string = rendererController.getRenderImageData();

      const selection = selectionController.getCurrentSelection();
      if (selection && selection instanceof THREE.Mesh) {


        if (selection === null) {
          editorEventBus.emit(EDITOR_EVENT.SendWarningLog, "WarningLogSelectObject");
          return;
        }

        const animationObjectJSON = getObjectsJSON(selection, loop);

        const data: UploadableObjectData = {
          imgData: imgData,
          objectData: JSON.stringify(animationObjectJSON),
          objectName: selection.name,
          animationObject: true,
        };

        editorEventBus.emit(EDITOR_EVENT.UploadObjectToServer, data);
      }

    };

    const handlePrepareAnimationScene = () => {
      const imgData: string = rendererController.getRenderImageData();

      const sceneJSON = GetAnimationSceneJSON(scene, loop);

      const data: UploadableAnimationSceneData = {
        imgData: imgData,
        sceneData: JSON.stringify(sceneJSON),
        sceneName: "scene",
        duration: loop.getSettings().duration,
      };

      editorEventBus.emit(EDITOR_EVENT.UploadAnimationSceneToServer, data);
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
    editorEventBus.on(EDITOR_EVENT.AddLight, handleAddLight);
    editorEventBus.on(EDITOR_EVENT.SelectObject, handleSelectObject);
    editorEventBus.on(EDITOR_EVENT.AddSelection, handleAddSelection);
    editorEventBus.on(EDITOR_EVENT.AttachToObject, handleAttachToObject);
    editorEventBus.on(EDITOR_EVENT.ClearSelections, handleClearSelections);
    editorEventBus.on(EDITOR_EVENT.ChangeObjectName, handleChangeObjectName);
    editorEventBus.on(EDITOR_EVENT.ChangeSceneColor, handleChangeSceneColor);
    editorEventBus.on(EDITOR_EVENT.PrepareObjectDataForUpload, handleUploadToServer);
    editorEventBus.on(EDITOR_EVENT.PrepareSceneDataForUpload, handlePrepareAnimationScene);

    editorEventBus.on(EDITOR_EVENT.COPY, handleCopy);
    editorEventBus.on(EDITOR_EVENT.PASTE, handlePaste);
    editorEventBus.on(EDITOR_EVENT.UNDO, handleUndo);
    editorEventBus.on(EDITOR_EVENT.REDO, handleRedo);

    return () => {
      editorEventBus.off(EDITOR_EVENT.AddMesh, handleAddMesh);
      editorEventBus.off(EDITOR_EVENT.AddLight, handleAddLight);
      editorEventBus.off(EDITOR_EVENT.SelectObject, handleSelectObject);
      editorEventBus.off(EDITOR_EVENT.AddSelection, handleAddSelection);
      editorEventBus.off(EDITOR_EVENT.AttachToObject, handleAttachToObject);
      editorEventBus.off(EDITOR_EVENT.ClearSelections, handleClearSelections);
      editorEventBus.off(EDITOR_EVENT.ChangeObjectName, handleChangeObjectName);
      editorEventBus.off(EDITOR_EVENT.ChangeSceneColor, handleChangeSceneColor);
      editorEventBus.off(EDITOR_EVENT.PrepareObjectDataForUpload, handleUploadToServer);
      editorEventBus.off(EDITOR_EVENT.PrepareSceneDataForUpload, handlePrepareAnimationScene);

      editorEventBus.off(EDITOR_EVENT.COPY, handleCopy);
      editorEventBus.off(EDITOR_EVENT.PASTE, handlePaste);
      editorEventBus.off(EDITOR_EVENT.UNDO, handleUndo);
      editorEventBus.off(EDITOR_EVENT.REDO, handleRedo);

      objectModeHandler.disposeEventHandlers();
      animationModeHandler.disposeEventHandlers();
      loop.dispose();

      // TODO find a better solution
      // Reloading for flushing everything 
      window.location.reload();
    };
  }, [rendererController, selectionController]);

  return (
    <>

      <div className="w-full h-full flex justify-center overflow-auto">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <div className="flex-col inline-flex w-full h-full bg-background">
              <div className="flex-auto bg-card ">
                <AnimationTopBar />
              </div>
              <div
                ref={canvasRef}
                tabIndex={1}
                onKeyDown={(event: KeyboardEvent) => { HandleKeyboardPress(event); }}
                onMouseOver={(e) => { e.currentTarget.focus(); }}
                className="flex-auto focus:outline-none" >
              </div>
              <ToolbarPanel />
              <WarningLogPanel bottomMargin={100} />
              <PlaybackPanel />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel maxSize={38} minSize={26} className="bg-card ">
            <AnimationPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div >
    </>
  );
}

export default AnimationEditor;
