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
import { EDITOR_LAYER, INTERSECTION_LAYER, RENDER_LAYER } from "./utils/Global";
import { AnimationLoop } from "./utils/AnimationLoop";
import { AnimationObject } from "./utils/objects/AnimationObject";
import { AnimationModeHandler } from "./utils/AnimationModeHandler";
import { InitRenderer } from "./utils/InitRenderer";
import AnimationPanel from "./ui/AnimationPanel";


function AnimationEditor() {
  const { canvasRef, rendererController, selectionController } = InitRenderer();

  useEffect(() => {
    const scene = rendererController.getScene();

    const commandHistory = new CommandHistory();
    const editorUtils = new EditorUtils(scene);
    const uiController = new UiController(scene);
    const loop = new AnimationLoop(rendererController);

    const objectModeHandler = new ObjectModeHandler(commandHistory, uiController, selectionController, scene);
    const animationModeHandler = new AnimationModeHandler(commandHistory, loop, uiController, selectionController);

    objectModeHandler.initEventHandlers();
    animationModeHandler.initEventHandlers();
    uiController.setRendererInfo(rendererController.getRenderInfo()); // Only for testing if objects are disposed correctly
    uiController.refreshPanel();


    // Static object TEST

    const positionKF = new THREE.VectorKeyframeTrack(
      ".position",
      [0, 1, 2, 3, 4],
      [
        0, 0, 0,
        1, 1, 0,
        2, 2, 0,
        3, 3, 0,
        4, 4, 0]
    );

    const boxbox = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: 0x77ffaa }));
    boxbox.layers.enable(EDITOR_LAYER);
    boxbox.layers.enable(RENDER_LAYER);
    boxbox.layers.enable(INTERSECTION_LAYER);
    scene.add(boxbox);

    const animationBoxBox = new AnimationObject(boxbox);
    const clip = new THREE.AnimationClip("move", 4, [positionKF]);
    animationBoxBox.addClip(clip);
    animationBoxBox.startPlaying();
    loop.addAnimationObject(animationBoxBox);

    // Static object TEST




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

      editorEventBus.off(EDITOR_EVENT.COPY, handleCopy);
      editorEventBus.off(EDITOR_EVENT.PASTE, handlePaste);
      editorEventBus.off(EDITOR_EVENT.UNDO, handleUndo);
      editorEventBus.off(EDITOR_EVENT.REDO, handleRedo);

      objectModeHandler.disposeEventHandlers();
      animationModeHandler.disposeEventHandlers();
    };
  }, [rendererController, selectionController]);

  return (
    <>

      <div className="w-full h-full flex justify-center overflow-auto">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <div tabIndex={1} onKeyDown={(event: KeyboardEvent) => { HandleKeyboardPress(event); }}
              className="flex-col inline-flex w-full h-full bg-background">
              <div className="flex-auto bg-card border border-b-card-foreground">
                <AnimationTopBar />
              </div>
              <div ref={canvasRef} className="flex-auto" >
              </div>
              <ToolbarPanel />
              <WarningLogPanel />
              <PlaybackPanel />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel maxSize={38} minSize={26} className="bg-card border border-l-card-foreground">
            <AnimationPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div >
    </>
  );
}

export default AnimationEditor;
