import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";
import { OrbitControls, TransformControls } from "three/examples/jsm/Addons.js";
import { SelectionController } from "@/pages/editor/utils/SelectionController";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { convertTVector3ToVec3 } from "./utils";
import type { Vec3 } from "./Types";

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

        scene.background = new THREE.Color(0x050505);

        const axesHelper = new THREE.AxesHelper(10);
        scene.add(axesHelper);

        const size = 20;
        const divisions = 40;
        const gridHelper = new THREE.GridHelper(size, divisions);
        scene.add(gridHelper);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.setZ(5);
        scene.add(camera);

        const controls = new OrbitControls(camera, renderer.domElement);

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
                control.object.position.set(oldPos.x, oldPos.y, oldPos.z)
                editorEventBus.emit(EDITOR_EVENT.ChangePosition, pos);
            }
        });

        control.addEventListener('dragging-changed', function(event) {
            controls.enabled = !event.value;
        });

        selectionController.setTransformController(control);

        const gizmo = control.getHelper();
        scene.add(gizmo);

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                renderer.setSize(canvas.clientWidth, canvas.clientHeight);
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            }
        });
        observer.observe(canvas);

        const mouse = new THREE.Vector2();

        const clearMouse = () => {
            mouse.x = -100000;
            mouse.y = -100000;
        };

        window.addEventListener("resize", () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        });

        window.addEventListener("click", (e) => {
            const offsetX = canvas.offsetLeft;
            const offsetY = canvas.offsetTop;
            mouse.x = ((e.clientX - offsetX) / canvas.clientWidth) * 2 - 1;
            mouse.y = -((e.clientY - offsetY) / canvas.clientHeight) * 2 + 1;
            selectionController.select(mouse, scene, camera);
        });

        window.addEventListener('mouseout', clearMouse);
        window.addEventListener('mouseleave', clearMouse);

        const renderScene = (time: number) => {
            if (renderer) {
                time *= 0.01;
                renderer.clearAsync()
                renderer.renderAsync(scene, camera)
            }
        };

        renderer.setAnimationLoop(renderScene);

        return () => {

            renderer?.setAnimationLoop(null);
            observer.disconnect();

        };
    }, [renderer, scene]);

    return { canvasRef, renderer, scene, selectionController };
};
export default InitRenderer;
