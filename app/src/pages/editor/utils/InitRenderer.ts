import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { pass, uniform, mix, step } from "three/tsl";
import OutlineNode, { outline } from "three/examples/jsm/tsl/display/OutlineNode.js";
import { OrbitControls, TransformControls, type TransformControlsMode } from "three/examples/jsm/Addons.js";
import { SelectionController } from "@/pages/editor/utils/SelectionController";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { convertEulerToVec3Degrees, convertTVector3ToVec3 } from "./utils";
import type { Vec3 } from "./Types";
import { DEFAULT_SCENE_COLOR } from "./Global";
import { AddListener, RemoveAllListeners } from "./AddListener";
import { ViewHelper } from "./objects/ViewHelper";

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
        scene.add(axesHelper);

        addGridHelper(scene);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.setZ(5);
        scene.add(camera);

        const orbitControls = new OrbitControls(camera, renderer.domElement);
        const control = createTransformControl(camera, renderer, orbitControls);
        const handleControlMode = (mode: TransformControlsMode) => {
            control.setMode(mode);
        };

        selectionController.onSelect((obj: THREE.Object3D) => {
            control.attach(obj);
        });
        selectionController.onDeselect(() => {
            control.detach();
        });

        const gizmo = control.getHelper();
        scene.add(gizmo);

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

        const renderScene = () => {
            renderRequested = false;
            startTime = performance.now();
            if (renderer) {

                renderer.clearAsync();

                viewhelper.render(renderer);

                postProcessing.renderAsync();

            }
            renderTime = performance.now() - startTime;
            editorEventBus.emit(EDITOR_EVENT.SendRenderTime, renderTime);
        };

        // Rendering on demand instead of animation loop
        let renderRequested = false;
        const requestRenderIfNotRequested = () => {
            if (!renderRequested) {
                renderRequested = true;
                requestAnimationFrame(renderScene);
            }
            return true;
        };
        orbitControls.addEventListener("change", requestRenderIfNotRequested);
        control.addEventListener("change", requestRenderIfNotRequested);
        AddListener(window, "keyup", requestRenderIfNotRequested);
        AddListener(window, "click", requestRenderIfNotRequested);

        const resizeObserver = handleResizing(renderer, camera, canvas, requestRenderIfNotRequested);
        handlePicking(canvas, scene, camera, selectionController);

        editorEventBus.on(EDITOR_EVENT.SetControlMode, handleControlMode);

        return () => {
            viewhelper.dispose();
            renderer?.setAnimationLoop(null);
            resizeObserver.disconnect();
            selectionController.destroy();
            RemoveAllListeners();
            editorEventBus.off(EDITOR_EVENT.SetControlMode, handleControlMode);
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
    scene.add(gridHelper);
}

function createTransformControl(camera: THREE.Camera, renderer: THREE.Renderer, controls: OrbitControls): TransformControls {
    const control = new TransformControls(camera, renderer.domElement);
    control.setTranslationSnap(0.001);
    control.setScaleSnap(0.001);
    control.setRotationSnap(0.001);

    // Not great, Command is responsible for moving
    // I move the object with transformcontrol, then set it back and move with command
    let oldPos: Vec3;
    let oldScale: Vec3;
    let oldRotation: THREE.Euler;
    control.addEventListener("mouseDown", (e) => {
        if (e.mode === "translate") {
            oldPos = convertTVector3ToVec3(control.object.position);
        }
        if (e.mode === "scale") {
            oldScale = convertTVector3ToVec3(control.object.scale);
        }
        if (e.mode === "rotate") {
            oldRotation = control.object.rotation.clone();
        }
    });
    control.addEventListener("mouseUp", (e) => {
        if (e.mode === "translate") {
            const pos = convertTVector3ToVec3(control.object.position);
            control.object.position.set(oldPos.x, oldPos.y, oldPos.z);
            editorEventBus.emit(EDITOR_EVENT.ChangePosition, pos);
        }
        if (e.mode === "scale") {
            const scale = convertTVector3ToVec3(control.object.scale);
            control.object.scale.set(oldScale.x, oldScale.y, oldScale.z);
            editorEventBus.emit(EDITOR_EVENT.ChangeScale, scale);
        }
        if (e.mode === "rotate") {
            const rotation = convertEulerToVec3Degrees(control.object.rotation);
            control.object.rotation.set(oldRotation.x, oldRotation.y, oldRotation.z);
            editorEventBus.emit(EDITOR_EVENT.ChangeRotation, rotation);
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

    const clearMouse = () => {
        mouse.x = -100000;
        mouse.y = -100000;
    };

    const handleMouseDown = (e: Event) => {
        if (!(e instanceof MouseEvent)) {
            return;
        }
        mouseDownTime = Date.now();
    };

    const handlePickEvent = (e: Event) => {
        // Only fast click will allow selecting objects
        if ((Date.now() - mouseDownTime > 100)) {
            return;
        }
        if (!(e instanceof MouseEvent)) {
            return;
        }
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

    AddListener(window, "mousedown", handleMouseDown);
    AddListener(window, "mouseup", handlePickEvent);
    AddListener(window, "mouseout", clearMouse);
    AddListener(window, "mouseleave", clearMouse);

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
