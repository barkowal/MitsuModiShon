import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { pass, uniform, mix, step } from "three/tsl";
import OutlineNode, { outline } from "three/examples/jsm/tsl/display/OutlineNode.js";
import { OrbitControls, TransformControls, type TransformControlsMode } from "three/examples/jsm/Addons.js";
import { SelectionController } from "@/pages/editor/utils/SelectionController";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { compareVec3, convertEulerToVec3Degrees, convertTVector3ToVec3 } from "./utils";
import { EDITOR_MODE, ORBITCONTROLS_MODE, type Vec3 } from "./Types";
import { BACKGROUND_LAYER, DEFAULT_SCENE_COLOR, EDITOR_LAYER, INTERSECTION_LAYER, RENDER_LAYER } from "./Global";
import { AddListener, RemoveAllListeners, RemoveListener } from "./AddListener";
import { ViewHelper } from "./objects/ViewHelper";
import ModellingMesh from "./objects/ModellingMesh";
import { GetCurrentEditorMode } from "../ui/EditorModeMenu/ChangeModeDropdown";
import { DownloadImage } from "@/lib/DownloadImage";

const InitRenderer = () => {
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const renderer = useMemo(() => { return new THREE.WebGPURenderer({ antialias: true }); }, []);
    const scene = useMemo(() => { return new THREE.Scene(); }, []);
    const selectionController = useMemo(() => { return new SelectionController(); }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        renderer.setSize(canvas.clientWidth, canvas.clientHeight);

        canvas.appendChild(renderer.domElement);

        const defaultBg = Number("0x" + DEFAULT_SCENE_COLOR.slice(1));
        scene.background = new THREE.Color(defaultBg);

        const axesHelper = new THREE.AxesHelper(10);
        axesHelper.layers.enable(BACKGROUND_LAYER);
        scene.add(axesHelper);

        addGridHelper(scene);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.setZ(5);
        camera.layers.enable(BACKGROUND_LAYER);
        scene.add(camera);

        const secondCamera = addSecondCamera(scene);
        let isRenderingView = false;

        // Setting up orbit controls
        const orbitControls = new OrbitControls(camera, renderer.domElement);
        const control = createTransformControl(camera, renderer, orbitControls);

        const handleControlMode = (mode: TransformControlsMode) => {
            control.setMode(mode);
        };

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
            isRenderingView = isRendering;
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
            renderer.render(scene, secondCamera);
            const imgData = renderer.domElement.toDataURL("image/png");
            DownloadImage(imgData);
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

        const gizmo = control.getHelper();
        gizmo.layers.enable(BACKGROUND_LAYER);
        scene.add(gizmo);

        //TODO temporary light, make adding light in the editor
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.AmbientLight(color, intensity);
        light.layers.enable(BACKGROUND_LAYER);
        scene.add(light);

        // Posprocessing outline and viewhelper
        const outlinePass = createOutlinePass(scene, camera, selectionController);
        const pass = createOutlineColor(scene, camera, outlinePass);

        const viewhelper = new ViewHelper(camera, renderer.domElement);
        const postProcessing = new THREE.PostProcessing(renderer);
        const gizmoNode = viewhelper.getTexture();

        postProcessing.outputNode = mix(pass, gizmoNode, step(0.000001, gizmoNode));
        AddListener(window, "click", (event: Event) => {
            viewhelper.handleClick(event);
        });

        // Rendering
        let startTime = 0;
        let renderTime = 0;

        renderer.clearAsync();

        const renderScene = () => {
            renderRequested = false;
            startTime = performance.now();
            if (renderer) {

                if (isRenderingView) {

                    renderer.clear();
                    renderer.render(scene, secondCamera);

                } else {

                    // renderer.clearAsync();
                    renderer.clear();
                    // renderer.renderAsync(scene, camera);

                    viewhelper.render(renderer);

                    // postProcessing.renderAsync();
                    postProcessing.render();

                }
            }
            renderTime = performance.now() - startTime;
            editorEventBus.emit(EDITOR_EVENT.SendRenderTime, renderTime);
        };

        // Rendering on demand instead of animation loop
        let renderRequested = false;
        const requestRenderIfNotRequested = () => {
            if (!renderer.hasInitialized()) return;
            if (!renderRequested) {
                renderRequested = true;
                requestAnimationFrame(renderScene);
            }
            return true;
        };

        orbitControls.addEventListener("change", requestRenderIfNotRequested);
        control.addEventListener("change", requestRenderIfNotRequested);
        selectionController.onPaintSelect(requestRenderIfNotRequested);

        AddListener(window, "keyup", requestRenderIfNotRequested);
        AddListener(window, "click", requestRenderIfNotRequested);

        const resizeObserver = handleResizing(renderer, camera, canvas, requestRenderIfNotRequested);
        handlePicking(canvas, scene, camera, selectionController);

        editorEventBus.on(EDITOR_EVENT.SetControlMode, handleControlMode);
        editorEventBus.on(EDITOR_EVENT.ChangeEditorMode, handleEditorModeChange);
        editorEventBus.on(EDITOR_EVENT.SwitchRendering, handleRenderingSwitch);
        editorEventBus.on(EDITOR_EVENT.RenderImage, handleRenderImage);


        return () => {
            viewhelper.dispose();
            renderer?.setAnimationLoop(null);
            resizeObserver.disconnect();
            selectionController.destroy();
            RemoveAllListeners();
            editorEventBus.off(EDITOR_EVENT.SetControlMode, handleControlMode);
            editorEventBus.off(EDITOR_EVENT.ChangeEditorMode, handleEditorModeChange);
            editorEventBus.off(EDITOR_EVENT.SwitchRendering, handleRenderingSwitch);
            editorEventBus.off(EDITOR_EVENT.RenderImage, handleRenderImage);
            renderer.dispose();

        };
    }, [renderer, scene, selectionController]);

    return { canvasRef, renderer, scene, selectionController };
};
export default InitRenderer;

function addGridHelper(scene: THREE.Scene) {
    const size = 20;
    const divisions = 40;
    const gridHelper = new THREE.GridHelper(size, divisions);
    gridHelper.layers.enable(BACKGROUND_LAYER);
    scene.add(gridHelper);
}


function addSecondCamera(scene: THREE.Scene) {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.name = "Renderer";
    camera.layers.disable(EDITOR_LAYER);
    camera.layers.enable(RENDER_LAYER);
    camera.userData.removable = false;
    camera.userData.attachable = false;
    camera.userData.changeableLayers = false;

    const cameraHelper = new THREE.CameraHelper(camera);
    cameraHelper.userData.removable = false;
    cameraHelper.userData.attachable = false;
    cameraHelper.name = "Visualizer";
    cameraHelper.matrix = new THREE.Matrix4();
    cameraHelper.layers.disable(EDITOR_LAYER);

    const cameraBox = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: 0x44aa44, wireframe: true }));
    scene.add(cameraBox);
    cameraBox.layers.enable(INTERSECTION_LAYER);
    cameraBox.layers.disable(EDITOR_LAYER);
    cameraBox.name = "Camera";
    cameraBox.scale.setScalar(0.4);
    cameraBox.userData.removable = false;
    cameraBox.userData.attachable = false;

    cameraBox.add(camera);
    cameraBox.add(cameraHelper);

    return camera;
}


function createTransformControl(camera: THREE.Camera, renderer: THREE.Renderer, controls: OrbitControls): TransformControls {
    const control = new TransformControls(camera, renderer.domElement);
    control.setTranslationSnap(0.001);
    control.setScaleSnap(0.001);
    control.setRotationSnap(0.001);

    let oldPos: Vec3;
    let movePos: Vec3;
    let oldScale: Vec3;
    let moveScale: Vec3;
    let oldRotation: Vec3;
    let moveRotation: Vec3;
    control.addEventListener("mouseDown", (e) => {
        if (e.mode === "translate") {
            oldPos = convertTVector3ToVec3(control.object.position);
        }
        if (e.mode === "scale") {
            oldScale = convertTVector3ToVec3(control.object.scale);
        }
        if (e.mode === "rotate") {
            oldRotation = convertEulerToVec3Degrees(control.object.rotation);
        }
    });
    control.addEventListener("axis-changed", () => {
        if (control.object) {
            movePos = convertTVector3ToVec3(control.object.position);
            moveScale = convertTVector3ToVec3(control.object.scale);
            moveRotation = convertEulerToVec3Degrees(control.object.rotation);
        }
    });
    control.addEventListener("object-changed", () => {
        if (control.object) {
            movePos = convertTVector3ToVec3(control.object.position);
            moveScale = convertTVector3ToVec3(control.object.scale);
            moveRotation = convertEulerToVec3Degrees(control.object.rotation);
        }
    });
    control.addEventListener("change", () => {
        if (!control.object)
            return;

        if (!control.dragging)
            return;

        const objectPosition = control.object.position;
        const objectScale = control.object.scale;
        const objectRotation = convertEulerToVec3Degrees(control.object.rotation);

        if (movePos && (!compareVec3(objectPosition, movePos))) {
            editorEventBus.emit(EDITOR_EVENT.MoveObject, movePos);
            movePos = convertTVector3ToVec3(control.object.position);
        }

        if (moveScale && (!compareVec3(objectScale, moveScale))) {
            editorEventBus.emit(EDITOR_EVENT.ScaleObject, moveScale);
            moveScale = convertTVector3ToVec3(control.object.scale);
        }

        if (moveRotation && (!compareVec3(objectRotation, moveRotation))) {
            editorEventBus.emit(EDITOR_EVENT.RotateObject, moveRotation);
            moveRotation = convertEulerToVec3Degrees(control.object.rotation);
        }
    });
    control.addEventListener("mouseUp", (e) => {
        if (e.mode === "translate") {
            const pos = convertTVector3ToVec3(control.object.position);
            editorEventBus.emit(EDITOR_EVENT.ChangePosition, [oldPos, pos]);
        }
        if (e.mode === "scale") {
            const scale = convertTVector3ToVec3(control.object.scale);
            editorEventBus.emit(EDITOR_EVENT.ChangeScale, [oldScale, scale]);
        }
        if (e.mode === "rotate") {
            const rotation = convertEulerToVec3Degrees(control.object.rotation);
            editorEventBus.emit(EDITOR_EVENT.ChangeRotation, [oldRotation, rotation]);
        }
    });

    control.addEventListener("dragging-changed", function(event) {
        controls.enabled = !event.value;
    });

    return control;
}

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

function createOutlinePass(scene: THREE.Scene, camera: THREE.Camera, selectionController: SelectionController) {
    const edgeGlow = uniform(0);
    const edgeThickness = uniform(2.0);
    const outlinePass = outline(scene, camera, {
        edgeGlow,
        edgeThickness
    });

    selectionController.onSelect((object: THREE.Object3D) => {
        outlinePass.selectedObjects.push(object);
    });
    selectionController.onClear(() => {
        outlinePass.selectedObjects = [];
    });

    return outlinePass;
}

function createOutlineColor(scene: THREE.Scene, camera: THREE.Camera,
    outlinePass: THREE.TSL.ShaderNodeObject<OutlineNode>) {
    const edgeStrength = uniform(4.0);
    const visibleEdgeColor = uniform(new THREE.Color(0xffffff));
    const hiddenEdgeColor = uniform(new THREE.Color(0x4e3636));

    const { visibleEdge, hiddenEdge } = outlinePass;

    const outlineColor = visibleEdge.mul(visibleEdgeColor).add(hiddenEdge.mul(hiddenEdgeColor)).mul(edgeStrength);

    const scenePass = pass(scene, camera);

    return outlineColor.add(scenePass);
}
