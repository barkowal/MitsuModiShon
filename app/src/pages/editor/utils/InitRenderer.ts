import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { OrbitControls, type TransformControlsMode } from "three/examples/jsm/Addons.js";
import { SelectionController } from "@/pages/editor/utils/SelectionController";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { EDITOR_MODE, ORBITCONTROLS_MODE, } from "./Types";
import { EDITOR_LAYER, INTERSECTION_LAYER } from "./Global";
import { AddListener, RemoveAllListeners, RemoveListener } from "./AddListener";
import ModellingMesh from "./objects/ModellingMesh";
import { GetCurrentEditorMode } from "../ui/EditorModeMenu/ChangeModeDropdown";
import { DownloadImage } from "@/lib/DownloadImage";
import { RendererController } from "./RendererController";

export const InitRenderer = () => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const rendererController = useMemo(() => { return new RendererController(); }, []);
  const selectionController = useMemo(() => { return new SelectionController(); }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    rendererController.appendRenderer(canvas);

    const renderer = rendererController.getRenderer();
    const control = rendererController.getControl();
    const orbitControls = rendererController.getOrbitControls();

    const handleEditorModeChange = (mode: string) => {
      if (mode === EDITOR_MODE.PaintMode) {
        resetOrbitControls(orbitControls, ORBITCONTROLS_MODE.SELECTION);
        const obj = selectionController.getCurrentSelection();
        if (obj) {
          orbitControls.target.copy(obj.position);
        }
      } else {
        resetOrbitControls(orbitControls, ORBITCONTROLS_MODE.DEFAULT);
      }
    };

    const handleRenderingSwitch = (isRendering: boolean) => {
      rendererController.setIsRenderingView(isRendering);
      selectionController.clearAllSelections();
      if (isRendering) {
        control.enabled = false;
        selectionController.disable();
        resetOrbitControls(orbitControls, ORBITCONTROLS_MODE.DISABLED);
      } else {
        control.enabled = true;
        selectionController.enable();
        resetOrbitControls(orbitControls, ORBITCONTROLS_MODE.DEFAULT);
      }
    };

    const handleRenderImage = () => {
      const imgData = rendererController.getRenderImageData();
      DownloadImage(imgData);
    };

    const handleUploadToServer = () => {
      const imgData: string = rendererController.getRenderImageData();

      const selection = selectionController.getCurrentSelection();
      if (selection && selection instanceof THREE.Mesh) {

        const data = {
          imgData: imgData,
          objectData: JSON.stringify(selection.toJSON()),
          objectName: selection.name,
        };

        editorEventBus.emit(EDITOR_EVENT.UploadObjectToServer, data);

      }

    };

    selectionController.onSelect((obj: THREE.Object3D) => {
      if (!obj.layers.isEnabled(INTERSECTION_LAYER)) return;
      if (!obj.layers.isEnabled(EDITOR_LAYER)) return;
      control.attach(obj);
    });
    selectionController.onEditSelect((obj: Array<THREE.Intersection>) => {
      const lastIndex = obj.length - 1;
      if (obj[lastIndex].object instanceof ModellingMesh) {
        const helper = obj[lastIndex].object.getTransformHelper();
        if (helper)
          control.attach(helper);
      }
    });
    selectionController.onClear(() => {
      control.detach();
    });
    const handleControlMode = (mode: TransformControlsMode) => {
      control.setMode(mode);
    };
    selectionController.onSelect((object: THREE.Object3D) => {
      rendererController.outlineObject(object);
    });
    selectionController.onClear(() => {
      rendererController.clearOutlines();
    });

    selectionController.onPaintSelect(() => { rendererController.render(); });

    AddListener(window, "keyup", () => { rendererController.render(); });
    AddListener(window, "click", () => { rendererController.render(); });

    const resizeObserver = handleResizing(renderer, rendererController.getEditorCamera(), canvas, () => { rendererController.render(); });
    handlePicking(canvas, rendererController.getScene(), rendererController.getEditorCamera(), selectionController);

    editorEventBus.on(EDITOR_EVENT.SetControlMode, handleControlMode);
    editorEventBus.on(EDITOR_EVENT.ChangeEditorMode, handleEditorModeChange);
    editorEventBus.on(EDITOR_EVENT.SwitchRendering, handleRenderingSwitch);
    editorEventBus.on(EDITOR_EVENT.RenderImage, handleRenderImage);
    editorEventBus.on(EDITOR_EVENT.PrepareObjectDataForUpload, handleUploadToServer);


    return () => {
      resizeObserver.disconnect();
      selectionController.destroy();
      RemoveAllListeners();
      editorEventBus.off(EDITOR_EVENT.SetControlMode, handleControlMode);
      editorEventBus.off(EDITOR_EVENT.ChangeEditorMode, handleEditorModeChange);
      editorEventBus.off(EDITOR_EVENT.SwitchRendering, handleRenderingSwitch);
      editorEventBus.off(EDITOR_EVENT.RenderImage, handleRenderImage);
      editorEventBus.off(EDITOR_EVENT.PrepareObjectDataForUpload, handleUploadToServer);
      rendererController.dispose();
    };
  }, [rendererController, selectionController]);
  return { canvasRef, rendererController, selectionController };
};

function handleResizing(renderer: THREE.Renderer, camera: THREE.PerspectiveCamera, canvas: HTMLElement, requestRender: CallableFunction): ResizeObserver {
  const observer = new ResizeObserver((entries) => {
    entries.forEach(() => {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      requestRender();
    });
  });
  observer.observe(canvas);

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  };

  AddListener(window, "resize", handleResize);

  return observer;
}

function handlePicking(canvas: HTMLElement, scene: THREE.Scene, camera: THREE.Camera, selectionController: SelectionController) {
  const mouse = new THREE.Vector2();
  let mouseDownTime = 0;
  let mouseMoveID = -1;

  const clearMouse = () => {
    mouse.x = -100000;
    mouse.y = -100000;
  };

  const emitSelect = (e: MouseEvent) => {
    const offsetX = canvas.offsetLeft;
    const offsetY = canvas.offsetTop;
    mouse.x = ((e.clientX - offsetX) / canvas.clientWidth) * 2 - 1;
    mouse.y = -((e.clientY - offsetY) / canvas.clientHeight) * 2 + 1;

    if (e.shiftKey) {
      selectionController.select(mouse, scene, camera, true);
    } else {
      selectionController.select(mouse, scene, camera);
    }
  };

  const handleMouseDown = (e: Event) => {
    if (!(e instanceof MouseEvent)) {
      return;
    }
    if (e.buttons !== 1) {
      return;
    }
    mouseDownTime = Date.now();

    if (GetCurrentEditorMode() === EDITOR_MODE.PaintMode)
      mouseMoveID = AddListener(window, "mousemove", handleMouseMove);
  };

  const handleMouseMove = (e: Event) => {
    if (!(e instanceof MouseEvent)) {
      return;
    }
    emitSelect(e);
  };

  const handlePickEvent = (e: Event) => {
    if (mouseMoveID != -1) {
      RemoveListener(mouseMoveID);
      mouseMoveID = -1;
    }

    // Only fast click will allow selecting objects
    if ((Date.now() - mouseDownTime > 100)) {
      return;
    }
    if (!(e instanceof MouseEvent)) {
      return;
    }
    emitSelect(e);
  };

  AddListener(canvas, "mousedown", handleMouseDown);
  AddListener(canvas, "mouseup", handlePickEvent);
  AddListener(canvas, "mouseout", clearMouse);
  AddListener(canvas, "mouseleave", clearMouse);

}

function resetOrbitControls(orbitControls: OrbitControls, mode: number) {

  switch (mode) {
    case ORBITCONTROLS_MODE.DEFAULT: {
      orbitControls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
      orbitControls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
      orbitControls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
      break;
    }
    case ORBITCONTROLS_MODE.DISABLED: {
      orbitControls.mouseButtons.LEFT = null;
      orbitControls.mouseButtons.MIDDLE = null;
      orbitControls.mouseButtons.RIGHT = null;
      break;
    }
    case ORBITCONTROLS_MODE.SELECTION: {
      orbitControls.mouseButtons.LEFT = null;
      orbitControls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
      orbitControls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
      break;
    }
  };
}
