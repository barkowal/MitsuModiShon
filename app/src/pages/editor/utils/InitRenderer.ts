import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";
import { pass, uniform } from "three/tsl";
import OutlineNode, { outline } from "three/examples/jsm/tsl/display/OutlineNode.js";
import { OrbitControls, TransformControls } from "three/examples/jsm/Addons.js";
import { SelectionController } from "@/pages/editor/utils/SelectionController";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { convertTVector3ToVec3 } from "./utils";
import type { Vec3 } from "./Types";
import { DEFAULT_SCENE_COLOR } from "./Global";
import { AddListener, RemoveAllListeners } from "./AddListener";

const InitRenderer = () => {

    const canvasRef = useRef<HTMLDivElement | null>(null);
    const renderer = new THREE.WebGPURenderer({ antialias: true });
    const scene = new THREE.Scene();
    const selectionController = new SelectionController();

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

        selectionController.onSelect((obj: THREE.Object3D) => {
            control.attach(obj);
        });
        selectionController.onDeselect(() => {
            control.detach();
        });

        const gizmo = control.getHelper();
        scene.add(gizmo);

        const resizeObserver = handleResizing(renderer, camera, canvas);
        handlePicking(canvas, scene, camera, selectionController);

        const outlinePass = createOutlinePass(scene, camera, selectionController);
        const postProcessing = createPostProcessingOutline(renderer, scene, camera, outlinePass);

        const renderScene = (time: number) => {
            if (renderer) {
                time *= 0.01;
                renderer.clearAsync();
                postProcessing.renderAsync();

            }
        };

        renderer.setAnimationLoop(renderScene);

        return () => {
            renderer?.setAnimationLoop(null);
            resizeObserver.disconnect();
            selectionController.destroy();
            RemoveAllListeners();

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
    control.addEventListener("mouseDown", (e) => {
        if (e.mode === "translate") {
            oldPos = convertTVector3ToVec3(control.object.position);
        }
    });
    control.addEventListener("mouseUp", (e) => {
        if (e.mode === "translate") {
            const pos = convertTVector3ToVec3(control.object.position);
            control.object.position.set(oldPos.x, oldPos.y, oldPos.z);
            editorEventBus.emit(EDITOR_EVENT.ChangePosition, pos);
        }
    });

    control.addEventListener("dragging-changed", function(event) {
        controls.enabled = !event.value;
    });

    return control;
}

function handleResizing(renderer: THREE.Renderer, camera: THREE.PerspectiveCamera, canvas: HTMLElement): ResizeObserver {
    const observer = new ResizeObserver((entries) => {
        entries.forEach(() => {
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
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

function createPostProcessingOutline(renderer: THREE.Renderer, scene: THREE.Scene, camera: THREE.Camera,
    outlinePass: THREE.TSL.ShaderNodeObject<OutlineNode>) {
    const edgeStrength = uniform(4.0);
    const visibleEdgeColor = uniform(new THREE.Color(0xffffff));
    const hiddenEdgeColor = uniform(new THREE.Color(0x4e3636));

    const { visibleEdge, hiddenEdge } = outlinePass;

    const outlineColor = visibleEdge.mul(visibleEdgeColor).add(hiddenEdge.mul(hiddenEdgeColor)).mul(edgeStrength);

    const scenePass = pass(scene, camera);

    const postProcessing = new THREE.PostProcessing(renderer);
    postProcessing.outputNode = outlineColor.add(scenePass);

    return postProcessing;
}
